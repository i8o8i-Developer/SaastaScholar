import uuid
from django.db import models
from django.conf import settings
from Apps.Academic.models import AcademicMaterial

class DrmSession(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="drm_sessions")
    material = models.ForeignKey(AcademicMaterial, on_delete=models.CASCADE, related_name="drm_sessions")
    session_token = models.CharField(max_length=255, unique=True)
    ip_address = models.CharField(max_length=255, blank=True, default="127.0.0.1")
    user_agent = models.TextField(blank=True)
    watermark_signature = models.TextField()
    is_active = models.BooleanField(default=True)
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"DRM Session [{self.user.email}] - {self.material.title}"

class DrmSecurityIncident(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    material = models.ForeignKey(AcademicMaterial, on_delete=models.SET_NULL, null=True, blank=True)
    event_type = models.CharField(max_length=50)  # e.g. PRINT_BLOCKED, DEVTOOLS_DETECTED, BLUR_PROTECTION
    client_ip = models.CharField(max_length=255, blank=True, default="127.0.0.1")
    details = models.JSONField(default=dict)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-timestamp"]

    def __str__(self):
        return f"Security Alert: {self.event_type} by {self.user}"
