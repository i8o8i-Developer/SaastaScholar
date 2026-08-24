from rest_framework import serializers
from .models import SupportTicket, TicketMessage, ForumPost, ForumComment
from django.contrib.auth import get_user_model

User = get_user_model()

class TicketMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()
    sender_email = serializers.CharField(source='sender.email', read_only=True)

    class Meta:
        model = TicketMessage
        fields = ['id', 'ticket', 'sender', 'sender_name', 'sender_email', 'message', 'is_staff_reply', 'created_at']
        read_only_fields = ['id', 'ticket', 'sender', 'is_staff_reply', 'created_at']

    def get_sender_name(self, obj):
        if not obj.sender:
            return "Support Officer"
        if obj.is_staff_reply or obj.sender.is_staff or obj.sender.is_superuser:
            return "University Admin Support"
        return obj.sender.full_name or obj.sender.username or obj.sender.email.split("@")[0]

class SupportTicketSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_program = serializers.CharField(source='user.program', read_only=True)
    user_semester = serializers.IntegerField(source='user.semester', read_only=True)
    user_section = serializers.CharField(source='user.section', read_only=True)
    messages = TicketMessageSerializer(many=True, read_only=True)

    class Meta:
        model = SupportTicket
        fields = [
            'id',
            'ticket_number',
            'user',
            'user_name',
            'user_email',
            'user_program',
            'user_semester',
            'user_section',
            'subject',
            'description',
            'category',
            'priority',
            'status',
            'admin_response',
            'admin_notes',
            'messages',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'ticket_number', 'user', 'admin_response', 'admin_notes', 'created_at', 'updated_at']

    def get_user_name(self, obj):
        if not obj.user:
            return "Scholar"
        return obj.user.full_name or obj.user.username or obj.user.email.split("@")[0]

class ForumCommentReplySerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    author_role = serializers.SerializerMethodField()
    is_staff = serializers.SerializerMethodField()

    class Meta:
        model = ForumComment
        fields = ['id', 'post', 'author', 'author_name', 'author_role', 'is_staff', 'parent_comment', 'content', 'upvotes', 'created_at']
        read_only_fields = ['id', 'author', 'upvotes', 'created_at']

    def get_author_name(self, obj):
        if not obj.author:
            return "Scholar"
        return obj.author.full_name or obj.author.username or obj.author.email.split("@")[0]

    def get_author_role(self, obj):
        if not obj.author:
            return "Student"
        if obj.author.is_staff or obj.author.is_superuser:
            return "Administrator"
        return f"{obj.author.program or 'Student'} (Sem {obj.author.semester or 1})"

    def get_is_staff(self, obj):
        return bool(obj.author and (obj.author.is_staff or obj.author.is_superuser))

class ForumCommentSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    author_role = serializers.SerializerMethodField()
    is_staff = serializers.SerializerMethodField()
    replies = serializers.SerializerMethodField()

    class Meta:
        model = ForumComment
        fields = ['id', 'post', 'author', 'author_name', 'author_role', 'is_staff', 'parent_comment', 'content', 'upvotes', 'replies', 'created_at']
        read_only_fields = ['id', 'author', 'upvotes', 'created_at']

    def get_author_name(self, obj):
        if not obj.author:
            return "Scholar"
        return obj.author.full_name or obj.author.username or obj.author.email.split("@")[0]

    def get_author_role(self, obj):
        if not obj.author:
            return "Student"
        if obj.author.is_staff or obj.author.is_superuser:
            return "Administrator"
        return f"{obj.author.program or 'Student'} (Sem {obj.author.semester or 1})"

    def get_is_staff(self, obj):
        return bool(obj.author and (obj.author.is_staff or obj.author.is_superuser))

    def get_replies(self, obj):
        if obj.parent_comment is not None:
            return []
        replies = obj.replies.all()
        return ForumCommentReplySerializer(replies, many=True).data

class ForumPostSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    author_role = serializers.SerializerMethodField()
    author_program = serializers.CharField(source='author.program', read_only=True)
    author_semester = serializers.IntegerField(source='author.semester', read_only=True)
    author_section = serializers.CharField(source='author.section', read_only=True)
    is_staff = serializers.SerializerMethodField()
    comments = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    has_upvoted = serializers.SerializerMethodField()

    class Meta:
        model = ForumPost
        fields = [
            'id',
            'author',
            'author_name',
            'author_role',
            'author_program',
            'author_semester',
            'author_section',
            'is_staff',
            'title',
            'content',
            'category',
            'is_pinned',
            'is_locked',
            'upvotes',
            'tags',
            'has_upvoted',
            'comments_count',
            'comments',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'author', 'upvotes', 'is_pinned', 'is_locked', 'created_at', 'updated_at']

    def get_author_name(self, obj):
        if not obj.author:
            return "Scholar"
        return obj.author.full_name or obj.author.username or obj.author.email.split("@")[0]

    def get_author_role(self, obj):
        if not obj.author:
            return "Student"
        if obj.author.is_staff or obj.author.is_superuser:
            return "Administrator"
        return f"{obj.author.program or 'B.Tech'} (Sem {obj.author.semester or 1})"

    def get_is_staff(self, obj):
        return bool(obj.author and (obj.author.is_staff or obj.author.is_superuser))

    def get_comments(self, obj):
        top_level = obj.comments.filter(parent_comment__isnull=True)
        return ForumCommentSerializer(top_level, many=True).data

    def get_comments_count(self, obj):
        return obj.comments.count()

    def get_has_upvoted(self, obj):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            return obj.upvoted_by.filter(id=request.user.id).exists()
        return False
