from django.urls import path
from .views import DrmPageView, DrmSecurityReportView, DrmSessionInitView, AdminDrmIncidentListView

urlpatterns = [
    path("session/<uuid:material_id>/", DrmSessionInitView.as_view(), name="drm-session-init"),
    path("material/<uuid:material_id>/page/<int:page_number>/", DrmPageView.as_view(), name="drm-page-view"),
    path("security-report/", DrmSecurityReportView.as_view(), name="drm-security-report"),
    path("admin/incidents/", AdminDrmIncidentListView.as_view(), name="drm-admin-incidents"),
]
