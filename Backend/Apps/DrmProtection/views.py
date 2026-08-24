import hashlib
import hmac
import time
import uuid
from datetime import datetime, timedelta

from django.conf import settings
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import permissions, status, generics
from rest_framework.response import Response
from rest_framework.views import APIView

from Apps.Academic.models import AcademicMaterial, MaterialPage
from .models import DrmSecurityIncident, DrmSession
from .serializers import DrmSecurityIncidentSerializer

def get_client_ip(request):
    raw_ip = request.META.get("HTTP_X_FORWARDED_FOR")
    if raw_ip:
        ip = raw_ip.split(",")[0].strip()
    else:
        ip = request.META.get("REMOTE_ADDR")
    if ip and ":" in ip and "." in ip:
        ip = ip.split(":")[-1]
    return ip or "127.0.0.1"

class DrmSessionInitView(APIView):
    """
    Creates an ephemeral DRM viewing session with dynamic forensic watermark parameters.
    Guarded against blocked accounts and active cooldowns.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, material_id):
        user = request.user

        # 1. Check DRM Access Block
        if user.is_drm_blocked:
            reason = user.block_reason or "Your DRM Content Access Has Been Suspended By University Administration."
            return Response(
                {"detail": f"DRM Access Suspended: {reason}"},
                status=status.HTTP_403_FORBIDDEN,
            )

        # 2. Check Security Cooldown
        if user.cooldown_until and user.cooldown_until > timezone.now():
            diff = user.cooldown_until - timezone.now()
            hours = int(diff.total_seconds() // 3600)
            minutes = int((diff.total_seconds() % 3600) // 60)
            return Response(
                {"detail": f"Security Cooldown Active ({hours}h {minutes}m Remaining) Until {user.cooldown_until.strftime('%Y-%m-%d %H:%M:%S UTC')}."},
                status=status.HTTP_403_FORBIDDEN,
            )

        material = get_object_or_404(AcademicMaterial, id=material_id)

        # Generate unique ephemeral token
        raw = f"{user.id}:{material.id}:{time.time()}:{settings.SECRET_KEY}"
        token = hashlib.sha256(raw.encode()).hexdigest()
        
        client_ip = get_client_ip(request)
        now_str = timezone.now().strftime("%Y-%m-%d %H:%M:%S UTC")
        session_hash = f"SEC-{uuid.uuid4().hex[:6].upper()}-NIMS"

        watermark_data = {
            "student_name": user.full_name or user.username,
            "roll_number": user.roll_number or "24BCSE102",
            "enrollment_no": user.enrollment_no or "NIMS2026-CS-8942",
            "ip_address": client_ip,
            "timestamp": now_str,
            "session_hash": session_hash,
        }

        # Store session in DB
        DrmSession.objects.create(
            user=user,
            material=material,
            session_token=token,
            ip_address=client_ip,
            user_agent=request.META.get("HTTP_USER_AGENT", "")[:255],
            watermark_signature=str(watermark_data),
            expires_at=timezone.now() + timedelta(hours=1),
        )

        file_url = material.file.url if material.file else None
        file_name = material.file.name.split("/")[-1] if material.file else None
        file_ext = file_name.split(".")[-1].lower() if file_name and "." in file_name else None

        if material.file and material.pages.count() == 0:
            from Apps.Academic.document_processor import extract_and_populate_pages
            extract_and_populate_pages(material)

        total_pages = material.pages.count() or material.page_count or 1

        return Response({
            "session_token": token,
            "material_id": str(material.id),
            "title": material.title,
            "subject_code": material.subject.code,
            "subject_name": material.subject.name,
            "total_pages": total_pages,
            "access_tier": user.access_tier,
            "watermark": watermark_data,
            "file_url": file_url,
            "file_name": file_name,
            "file_ext": file_ext,
        })

class DrmPageView(APIView):
    """
    Returns single encrypted vector canvas page.
    Guarded against blocked accounts and active cooldowns.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, material_id, page_number):
        user = request.user

        # 1. Check DRM Access Block
        if user.is_drm_blocked:
            reason = user.block_reason or "Your DRM Content Access Has Been Suspended By University Administration."
            return Response(
                {"detail": f"DRM Access Suspended: {reason}"},
                status=status.HTTP_403_FORBIDDEN,
            )

        # 2. Check Security Cooldown
        if user.cooldown_until and user.cooldown_until > timezone.now():
            return Response(
                {"detail": f"Security Cooldown Active Until {user.cooldown_until.strftime('%Y-%m-%d %H:%M:%S UTC')}."},
                status=status.HTTP_403_FORBIDDEN,
            )

        material = get_object_or_404(AcademicMaterial, id=material_id)
        
        file_url = material.file.url if material.file else None
        file_name = material.file.name.split("/")[-1] if material.file else None
        file_ext = file_name.split(".")[-1].lower() if file_name and "." in file_name else None

        page = MaterialPage.objects.filter(material=material, page_number=page_number).first()

        if not page and material.file:
            from Apps.Academic.document_processor import extract_and_populate_pages
            extract_and_populate_pages(material)
            page = MaterialPage.objects.filter(material=material, page_number=page_number).first()

        if not page:
            from Apps.Academic.document_processor import parse_markdown_to_html
            content = parse_markdown_to_html(
                raw_text=material.summary or "Verified Reference Material",
                subject_code=material.subject.code if material.subject else "NIMS",
                unit_number=material.unit_number or 1,
                page_number=page_number,
                total_pages=material.page_count or 1,
                title=material.title,
            )
            return Response({
                "page_number": page_number,
                "page_title": f"Page {page_number}: {material.title}",
                "content_html": content,
                "file_url": file_url,
                "file_name": file_name,
                "file_ext": file_ext,
            })

        content = page.content_html or ""
        if not ("<div" in content or "<p" in content or "<h1" in content or "<h2" in content):
            from Apps.Academic.document_processor import parse_markdown_to_html
            content = parse_markdown_to_html(
                raw_text=content,
                subject_code=material.subject.code if material.subject else "NIMS",
                unit_number=material.unit_number or 1,
                page_number=page.page_number,
                total_pages=material.page_count or 1,
                title=page.page_title or material.title,
            )

        return Response({
            "page_number": page.page_number,
            "page_title": page.page_title or f"Page {page.page_number}",
            "content_html": content,
            "diagram_svg": page.diagram_svg,
            "file_url": file_url,
            "file_name": file_name,
            "file_ext": file_ext,
        })

class DrmSecurityReportView(APIView):
    """
    Receives security telemetry from frontend DRM hooks & updates violations counter.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        event_type = request.data.get("event_type", "SECURITY_ALERT")
        client_ip = get_client_ip(request)
        details = request.data.get("details", {})
        material_id = request.data.get("material_id")

        mat = AcademicMaterial.objects.filter(id=material_id).first() if material_id else None

        DrmSecurityIncident.objects.create(
            user=user,
            material=mat,
            event_type=event_type,
            client_ip=client_ip,
            details=details,
        )

        # Increment DRM violation counter
        if event_type in ["DEVTOOLS_DETECTED", "SCREEN_CAPTURE_ATTEMPT", "RAPID_PRINT_ATTEMPT"]:
            user.drm_violations_count += 1
            user.save(update_fields=["drm_violations_count"])

        return Response({"status": "logged", "violations_count": user.drm_violations_count, "timestamp": timezone.now()})

class AdminDrmIncidentListView(generics.ListAPIView):
    queryset = DrmSecurityIncident.objects.select_related("user", "material").all()
    serializer_class = DrmSecurityIncidentSerializer
    permission_classes = [permissions.IsAdminUser]
    pagination_class = None

    def get_queryset(self):
        qs = DrmSecurityIncident.objects.select_related("user", "material").all()
        user_id = self.request.query_params.get("user_id")
        event_type = self.request.query_params.get("event_type")
        if user_id:
            qs = qs.filter(user_id=user_id)
        if event_type:
            qs = qs.filter(event_type=event_type)
        return qs
