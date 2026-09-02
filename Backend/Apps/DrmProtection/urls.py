from django.urls import path
from .views import (
    DrmPageView,
    DrmSecurityReportView,
    DrmSessionInitView,
    DrmDocumentStreamView,
    AdminDrmIncidentListView,
    AdminDrmIncidentClearView,
    GlobalDrmConfigView,
)

urlpatterns = [
    path("config/", GlobalDrmConfigView.as_view(), name="drm-global-config"),
    path("session/<uuid:material_id>/", DrmSessionInitView.as_view(), name="drm-session-init"),
    path("stream/<uuid:material_id>/", DrmDocumentStreamView.as_view(), name="drm-document-stream"),
    path("material/<uuid:material_id>/page/<int:page_number>/", DrmPageView.as_view(), name="drm-page-view"),
    path("security-report/", DrmSecurityReportView.as_view(), name="drm-security-report"),
    path("admin/incidents/", AdminDrmIncidentListView.as_view(), name="drm-admin-incidents"),
    path("admin/incidents/clear/", AdminDrmIncidentClearView.as_view(), name="drm-admin-incidents-clear"),
]
