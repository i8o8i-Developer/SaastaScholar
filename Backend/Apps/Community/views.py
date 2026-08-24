from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import SupportTicket, TicketMessage, ForumPost, ForumComment
from .serializers import SupportTicketSerializer, TicketMessageSerializer, ForumPostSerializer, ForumCommentSerializer

class SupportTicketViewSet(viewsets.ModelViewSet):
    serializer_class = SupportTicketSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff or self.request.user.is_superuser:
            return SupportTicket.objects.all().select_related('user').prefetch_related('messages__sender')
        return SupportTicket.objects.filter(user=self.request.user).select_related('user').prefetch_related('messages__sender')

    def perform_create(self, serializer):
        category = self.request.data.get('category', 'GENERAL')
        priority = self.request.data.get('priority', 'MEDIUM')
        serializer.save(user=self.request.user, category=category, priority=priority)

    @action(detail=True, methods=['post'])
    def message(self, request, pk=None):
        ticket = self.get_object()
        # Verify access: only ticket owner or staff can message
        if not (request.user.is_staff or request.user.is_superuser or ticket.user == request.user):
            return Response({"error": "You Do Not Have Permission To Reply On This Ticket."}, status=status.HTTP_403_FORBIDDEN)
        
        msg_text = request.data.get('message', '').strip()
        if not msg_text:
            return Response({"error": "Message Content Cannot Be Empty."}, status=status.HTTP_400_BAD_REQUEST)
        
        is_staff_reply = bool(request.user.is_staff or request.user.is_superuser)
        msg = TicketMessage.objects.create(
            ticket=ticket,
            sender=request.user,
            message=msg_text,
            is_staff_reply=is_staff_reply
        )

        # Automatically adjust ticket status
        if is_staff_reply and ticket.status == "OPEN":
            ticket.status = "IN_PROGRESS"
            ticket.save(update_fields=['status', 'updated_at'])
        elif not is_staff_reply and ticket.status == "RESOLVED":
            ticket.status = "IN_PROGRESS"
            ticket.save(update_fields=['status', 'updated_at'])

        return Response(TicketMessageSerializer(msg).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['patch'], permission_classes=[permissions.IsAdminUser])
    def resolve(self, request, pk=None):
        ticket = self.get_object()
        admin_response = request.data.get('admin_response', '').strip()
        admin_notes = request.data.get('admin_notes', '').strip()
        ticket_status = request.data.get('status', 'RESOLVED')
        
        if admin_response:
            ticket.admin_response = admin_response
            # Also create an official message entry in the thread
            TicketMessage.objects.create(
                ticket=ticket,
                sender=request.user,
                message=f"[Official Resolution]: {admin_response}",
                is_staff_reply=True
            )
        
        if admin_notes:
            ticket.admin_notes = admin_notes
            
        ticket.status = ticket_status
        ticket.save()
        
        return Response(self.get_serializer(ticket).data)

    @action(detail=True, methods=['patch'])
    def status_update(self, request, pk=None):
        ticket = self.get_object()
        if not (request.user.is_staff or request.user.is_superuser or ticket.user == request.user):
            return Response({"error": "You Do Not Have Permission To Update This Ticket."}, status=status.HTTP_403_FORBIDDEN)

        raw_status = request.data.get('status', '')
        new_status = str(raw_status).strip().upper().replace(" ", "_")
        valid_statuses = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]
        if new_status in valid_statuses:
            ticket.status = new_status
            ticket.save(update_fields=['status', 'updated_at'])
            return Response(self.get_serializer(ticket).data)
        return Response({"error": f"Invalid Status Value '{raw_status}'. Allowed Statuses: {valid_statuses}"}, status=status.HTTP_400_BAD_REQUEST)

    def partial_update(self, request, *args, **kwargs):
        ticket = self.get_object()
        if not (request.user.is_staff or request.user.is_superuser or ticket.user == request.user):
            return Response({"error": "You Do Not Have Permission To Update This Ticket."}, status=status.HTTP_403_FORBIDDEN)

        raw_status = request.data.get('status')
        if raw_status:
            new_status = str(raw_status).strip().upper().replace(" ", "_")
            if new_status in ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]:
                ticket.status = new_status
        if request.user.is_staff or request.user.is_superuser:
            admin_response = request.data.get('admin_response')
            if admin_response is not None:
                ticket.admin_response = admin_response
            admin_notes = request.data.get('admin_notes')
            if admin_notes is not None:
                ticket.admin_notes = admin_notes
        ticket.save()
        return Response(self.get_serializer(ticket).data)

class ForumPostViewSet(viewsets.ModelViewSet):
    serializer_class = ForumPostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    queryset = ForumPost.objects.all().select_related('author').prefetch_related('comments__author', 'comments__replies__author', 'upvoted_by')

    def perform_create(self, serializer):
        category = self.request.data.get('category', 'General')
        tags = self.request.data.get('tags', '')
        serializer.save(author=self.request.user, category=category, tags=tags)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def upvote(self, request, pk=None):
        post = self.get_object()
        user = request.user
        if post.upvoted_by.filter(id=user.id).exists():
            post.upvoted_by.remove(user)
            if post.upvotes > 0:
                post.upvotes -= 1
            has_upvoted = False
        else:
            post.upvoted_by.add(user)
            post.upvotes += 1
            has_upvoted = True
        post.save(update_fields=['upvotes'])
        return Response({'status': 'success', 'upvotes': post.upvotes, 'has_upvoted': has_upvoted})

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def comment(self, request, pk=None):
        post = self.get_object()
        if post.is_locked and not (request.user.is_staff or request.user.is_superuser):
            return Response({'error': 'This Thread Is Locked By Administration.'}, status=status.HTTP_403_FORBIDDEN)
        
        content = request.data.get('content', '').strip()
        parent_id = request.data.get('parent_comment')
        
        if not content:
            return Response({'error': 'Comment Cannot Be Empty.'}, status=status.HTTP_400_BAD_REQUEST)
        
        parent = None
        if parent_id:
            try:
                parent = ForumComment.objects.get(id=parent_id, post=post)
            except ForumComment.DoesNotExist:
                parent = None

        comment = ForumComment.objects.create(
            post=post,
            author=request.user,
            content=content,
            parent_comment=parent
        )
        return Response(ForumCommentSerializer(comment).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def pin(self, request, pk=None):
        post = self.get_object()
        post.is_pinned = not post.is_pinned
        post.save(update_fields=['is_pinned'])
        return Response({'status': 'success', 'is_pinned': post.is_pinned})

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def lock(self, request, pk=None):
        post = self.get_object()
        post.is_locked = not post.is_locked
        post.save(update_fields=['is_locked'])
        return Response({'status': 'success', 'is_locked': post.is_locked})

    # Allow post author or staff to delete post
    def destroy(self, request, *args, **kwargs):
        post = self.get_object()
        if not (request.user.is_staff or request.user.is_superuser or post.author == request.user):
            return Response({"error": "Unauthorized To Delete This Post."}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)

class ForumCommentViewSet(viewsets.ModelViewSet):
    serializer_class = ForumCommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    queryset = ForumComment.objects.all().select_related('author', 'post')

    def destroy(self, request, *args, **kwargs):
        comment = self.get_object()
        if not (request.user.is_staff or request.user.is_superuser or comment.author == request.user):
            return Response({"error": "Unauthorized To Delete This Comment."}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)
