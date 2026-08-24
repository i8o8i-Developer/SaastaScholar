from django.contrib import admin
from .models import DrmSecurityIncident, DrmSession

@admin.register(DrmSession)
class DrmSessionAdmin(admin.ModelAdmin):
    list_display = ("user", "material", "ip_address", "is_active", "expires_at")
    list_filter = ("is_active",)

@admin.register(DrmSecurityIncident)
class DrmSecurityIncidentAdmin(admin.ModelAdmin):
    list_display = ("event_type", "user", "client_ip", "timestamp")
    list_filter = ("event_type",)
