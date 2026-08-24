from rest_framework import serializers
from .models import DrmSecurityIncident, DrmSession

class DrmSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = DrmSession
        fields = [
            "id",
            "material",
            "session_token",
            "watermark_signature",
            "expires_at",
            "created_at",
        ]

class DrmSecurityIncidentSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source="user.email", read_only=True)
    user_name = serializers.CharField(source="user.full_name", read_only=True)
    material_title = serializers.CharField(source="material.title", read_only=True)

    class Meta:
        model = DrmSecurityIncident
        fields = [
            "id",
            "user",
            "user_email",
            "user_name",
            "material",
            "material_title",
            "event_type",
            "client_ip",
            "details",
            "timestamp",
        ]
        read_only_fields = ["id", "timestamp"]
