from datetime import timedelta
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import StudentUser, SecuritySession, AdminAuditLog, ActionType
from .serializers import (
    CustomTokenObtainPairSerializer,
    RegisterSerializer,
    StudentUserSerializer,
    AdminAuditLogSerializer,
)

def get_client_ip(request):
    raw_ip = request.META.get("HTTP_X_FORWARDED_FOR")
    if raw_ip:
        ip = raw_ip.split(",")[0].strip()
    else:
        ip = request.META.get("REMOTE_ADDR")
    if ip and ":" in ip and "." in ip:
        ip = ip.split(":")[-1]
    return ip or "127.0.0.1"

class CustomLoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            try:
                user = StudentUser.objects.filter(email=request.data.get("email")).first()
                if user:
                    ip = get_client_ip(request)
                    ua = request.META.get("HTTP_USER_AGENT", "")[:255]
                    SecuritySession.objects.create(user=user, ip_address=ip, user_agent=ua)
            except Exception:
                pass
        return response

class RegisterView(generics.CreateAPIView):
    queryset = StudentUser.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "user": StudentUserSerializer(user).data,
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "message": "Student Account Registered Successfully.",
            },
            status=status.HTTP_201_CREATED,
        )

class CurrentUserView(generics.RetrieveUpdateAPIView):
    serializer_class = StudentUserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        user = self.request.user
        if user.is_drm_blocked and any(x in (user.block_reason or "") for x in ["MOBILE_HARDWARE_SCREENSHOT", "IOS_SCREENSHOT_DETECTED", "WINDOW_FOCUS_LOST", "MOBILE_BACKGROUND_CAPTURE", "PAGE_HIDE_CAPTURE_TRIGGER"]):
            user.is_drm_blocked = False
            user.block_reason = ""
            user.security_warning_note = ""
            user.cooldown_until = None
            user.save(update_fields=["is_drm_blocked", "block_reason", "security_warning_note", "cooldown_until"])
        return user

class AcknowledgeWarningView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        user.security_warning_note = ""
        user.is_drm_blocked = False
        user.block_reason = ""
        user.cooldown_until = None
        user.save(update_fields=["security_warning_note", "is_drm_blocked", "block_reason", "cooldown_until"])
        return Response({"message": "Disciplinary Warning Acknowledged And Cleared."})

class SecuritySessionsView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        sessions = SecuritySession.objects.filter(user=request.user, is_revoked=False)[:10]
        data = [
            {
                "id": str(s.id),
                "ip_address": s.ip_address,
                "user_agent": s.user_agent,
                "last_active": s.last_active,
            }
            for s in sessions
        ]
        return Response(data)

class AvatarUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        avatar_file = request.FILES.get("avatar")
        if not avatar_file:
            return Response({"error": "No Avatar Image File Provided."}, status=status.HTTP_400_BAD_REQUEST)
        
        user.avatar_image = avatar_file
        user.avatar_url = user.avatar_image.url if hasattr(user.avatar_image, "url") else f"/media/avatars/{avatar_file.name}"
        user.save()
        
        return Response({
            "message": "Avatar Photo Updated Successfully.",
            "avatar_url": user.avatar_url,
            "user": StudentUserSerializer(user).data,
        })

class DashboardSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        from Apps.Academic.models import AcademicMaterial, Subject, LabExperiment
        from Apps.Assignments.models import StudentAssignment
        from Apps.Planner.models import TimetableSlot

        enrolled_subjects_count = Subject.objects.filter(semester=user.semester).count()
        if enrolled_subjects_count == 0:
            enrolled_subjects_count = Subject.objects.count()

        notes_count = AcademicMaterial.objects.filter(material_type="NOTES").count()
        pyqs_count = AcademicMaterial.objects.filter(material_type="SOLVED_PYQ").count()
        labs_count = LabExperiment.objects.count()
        
        pending_assignments = StudentAssignment.objects.filter(user=user, status__in=["PENDING", "IN_PROGRESS"]).count()
        completed_assignments = StudentAssignment.objects.filter(user=user, status__in=["SUBMITTED", "EVALUATED"]).count()

        # Real Next Lecture
        next_slot = TimetableSlot.objects.filter(semester=user.semester, section=user.section).first()
        next_lecture_data = None
        if next_slot:
            next_lecture_data = {
                "title": next_slot.title,
                "time": f"{next_slot.start_time} - {next_slot.end_time}",
                "room": next_slot.room_number or "LT-01",
                "faculty": next_slot.faculty_name or "Faculty Department",
                "topic": next_slot.meta_info or f"{next_slot.event_type} Session",
            }

        # Auto-recover false-positive automated focus blocks
        if user.is_drm_blocked and any(x in (user.block_reason or "") for x in ["MOBILE_HARDWARE_SCREENSHOT", "IOS_SCREENSHOT_DETECTED", "WINDOW_FOCUS_LOST", "MOBILE_BACKGROUND_CAPTURE", "PAGE_HIDE_CAPTURE_TRIGGER"]):
            user.is_drm_blocked = False
            user.block_reason = ""
            user.security_warning_note = ""
            user.cooldown_until = None
            user.save(update_fields=["is_drm_blocked", "block_reason", "security_warning_note", "cooldown_until"])

        return Response({
            "user_name": user.full_name or user.username,
            "roll_number": user.roll_number,
            "program": user.program,
            "semester": user.semester,
            "section": user.section,
            "access_tier": user.access_tier,
            "target_cgpa": float(user.target_cgpa or 10.0),
            "avatar_url": user.avatar_url or "",
            "is_drm_blocked": user.is_drm_blocked,
            "is_login_blocked": user.is_login_blocked,
            "cooldown_until": user.cooldown_until,
            "block_reason": user.block_reason,
            "security_warning_note": user.security_warning_note,
            "metrics": {
                "enrolled_subjects": enrolled_subjects_count,
                "total_notes_available": notes_count,
                "solved_pyqs_count": pyqs_count,
                "lab_manuals_count": labs_count,
                "completed_assignments": completed_assignments,
                "pending_assignments": pending_assignments,
                "viva_questions_bank": labs_count * 4,
            },
            "next_lecture": next_lecture_data,
            "recent_materials": [],
            "notices": [],
        })

# ==============================================================================
# ADMIN STUDENT MANAGEMENT, DRM DISCIPLINARY & AUDIT LOG CONTROLLERS
# ==============================================================================

class AdminStudentSecurityActionView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        try:
            target_user = StudentUser.objects.get(id=pk)
        except StudentUser.DoesNotExist:
            return Response({"error": "Student User Record Not Found."}, status=status.HTTP_404_NOT_FOUND)

        action_type = request.data.get("action_type")
        reason = request.data.get("reason", "").strip()
        cooldown_hours = request.data.get("cooldown_hours")
        warning_message = request.data.get("warning_message", "").strip()
        access_tier = request.data.get("access_tier")

        if not reason:
            return Response({"error": "Administrative Reason Is Mandatory For Security Actions."}, status=status.HTTP_400_BAD_REQUEST)

        meta_info = {}

        if action_type == ActionType.BLOCK_DRM:
            target_user.is_drm_blocked = True
            target_user.block_reason = reason
            target_user.save(update_fields=["is_drm_blocked", "block_reason", "updated_at"])
            meta_info["status"] = "DRM Content Access Blocked"

        elif action_type == ActionType.UNBLOCK_DRM:
            target_user.is_drm_blocked = False
            if target_user.block_reason == reason:
                target_user.block_reason = ""
            target_user.save(update_fields=["is_drm_blocked", "block_reason", "updated_at"])
            meta_info["status"] = "DRM Content Access Restored"

        elif action_type == ActionType.SUSPEND_LOGIN:
            target_user.is_login_blocked = True
            target_user.is_active = False
            target_user.block_reason = reason
            target_user.save(update_fields=["is_login_blocked", "is_active", "block_reason", "updated_at"])
            meta_info["status"] = "Student Account Login Suspended"

        elif action_type == ActionType.UNBAN_LOGIN:
            target_user.is_login_blocked = False
            target_user.is_active = True
            target_user.block_reason = ""
            target_user.save(update_fields=["is_login_blocked", "is_active", "block_reason", "updated_at"])
            meta_info["status"] = "Student Account Login Reactivated"

        elif action_type == ActionType.SET_COOLDOWN:
            try:
                hrs = float(cooldown_hours) if cooldown_hours else 24.0
            except (ValueError, TypeError):
                hrs = 24.0
            cooldown_time = timezone.now() + timedelta(hours=hrs)
            target_user.cooldown_until = cooldown_time
            target_user.block_reason = reason
            target_user.save(update_fields=["cooldown_until", "block_reason", "updated_at"])
            meta_info["cooldown_hours"] = hrs
            meta_info["cooldown_until"] = cooldown_time.isoformat()

        elif action_type == ActionType.REMOVE_COOLDOWN:
            target_user.cooldown_until = None
            target_user.save(update_fields=["cooldown_until", "updated_at"])
            meta_info["status"] = "Security Cooldown Lifted"

        elif action_type == ActionType.DISPATCH_WARNING:
            target_user.security_warning_note = warning_message or reason
            target_user.save(update_fields=["security_warning_note", "updated_at"])
            meta_info["warning_note"] = target_user.security_warning_note

        elif action_type == ActionType.CLEAR_WARNING:
            target_user.security_warning_note = ""
            target_user.save(update_fields=["security_warning_note", "updated_at"])
            meta_info["status"] = "Warning Notice Cleared"

        elif action_type == ActionType.REVOKE_SESSIONS:
            count = SecuritySession.objects.filter(user=target_user, is_revoked=False).update(is_revoked=True)
            meta_info["revoked_sessions_count"] = count

        elif action_type == ActionType.RESET_VIOLATIONS:
            target_user.drm_violations_count = 0
            target_user.save(update_fields=["drm_violations_count", "updated_at"])
            meta_info["status"] = "Violations Counter Reset to Zero"

        elif action_type == ActionType.CHANGE_TIER:
            if access_tier in ["FREE", "SEMESTER_TOPPER", "VIP"]:
                target_user.access_tier = access_tier
                target_user.save(update_fields=["access_tier", "updated_at"])
                meta_info["new_tier"] = access_tier
            else:
                return Response({"error": "Invalid Access Tier Selected."}, status=status.HTTP_400_BAD_REQUEST)

        elif action_type == ActionType.HARD_DELETE_USER or action_type == "HARD_DELETE_USER":
            target_email = target_user.email
            target_name = target_user.full_name or target_user.username
            target_id_str = str(target_user.id)
            meta_info["status"] = "Student Account And All Associated DRM Records Permanently Deleted"
            meta_info["deleted_email"] = target_email
            meta_info["deleted_user_id"] = target_id_str

            client_ip = get_client_ip(request)
            AdminAuditLog.objects.create(
                actor=request.user,
                target_user=None,
                target_email=target_email,
                target_name=target_name,
                action_type=ActionType.HARD_DELETE_USER,
                reason=reason or "Permanent Account Hard Delete Executed By Administrator.",
                metadata=meta_info,
                ip_address=client_ip,
            )

            # Permanent Hard Delete Purge
            target_user.delete()

            return Response({
                "message": f"Student Account '{target_name}' ({target_email}) And All Associated DRM Records Have Been Permanently Hard Deleted.",
                "deleted_id": target_id_str,
                "metadata": meta_info,
            })
        else:
            return Response({"error": f"Unknown Security Action Type '{action_type}'."}, status=status.HTTP_400_BAD_REQUEST)

        # Log Immutable Audit Record
        client_ip = get_client_ip(request)
        AdminAuditLog.objects.create(
            actor=request.user,
            target_user=target_user,
            action_type=action_type,
            reason=reason,
            metadata=meta_info,
            ip_address=client_ip,
        )

        action_display = action_type.replace("_", " ").title()
        return Response({
            "message": f"Security Action '{action_display}' Executed Successfully.",
            "user": StudentUserSerializer(target_user).data,
            "metadata": meta_info,
        })

class AdminAuditLogListView(generics.ListAPIView):
    queryset = AdminAuditLog.objects.select_related("actor", "target_user").all()
    serializer_class = AdminAuditLogSerializer
    permission_classes = [permissions.IsAdminUser]
    pagination_class = None

    def get_queryset(self):
        qs = AdminAuditLog.objects.select_related("actor", "target_user").all()
        action = self.request.query_params.get("action")
        target_id = self.request.query_params.get("target_id")
        search = self.request.query_params.get("search")

        if action:
            qs = qs.filter(action_type=action)
        if target_id:
            qs = qs.filter(target_user_id=target_id)
        if search:
            from django.db.models import Q
            qs = qs.filter(
                Q(target_email__icontains=search)
                | Q(target_name__icontains=search)
                | Q(actor_email__icontains=search)
                | Q(reason__icontains=search)
            )
        return qs
