from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from Apps.Academic.views import AdminStudentsListView, AdminStudentDetailView, AdminStudentSemesterUpgradeView
from .views import (
    AvatarUploadView,
    CurrentUserView,
    CustomLoginView,
    DashboardSummaryView,
    RegisterView,
    SecuritySessionsView,
    AcknowledgeWarningView,
    AdminStudentSecurityActionView,
    AdminAuditLogListView,
    AdminAuditLogClearView,
    AdminBulkResetSecurityView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
    EmailTestView,
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="auth-register"),
    path("login/", CustomLoginView.as_view(), name="auth-login"),
    path("refresh/", TokenRefreshView.as_view(), name="auth-refresh"),
    path("me/", CurrentUserView.as_view(), name="auth-me"),
    path("avatar/", AvatarUploadView.as_view(), name="auth-avatar"),
    path("profile/avatar/", AvatarUploadView.as_view(), name="auth-profile-avatar"),
    path("sessions/", SecuritySessionsView.as_view(), name="auth-sessions"),
    path("dashboard-summary/", DashboardSummaryView.as_view(), name="dashboard-summary"),
    path("acknowledge-warning/", AcknowledgeWarningView.as_view(), name="auth-acknowledge-warning"),
    path("password-reset/", PasswordResetRequestView.as_view(), name="auth-password-reset-request"),
    path("password-reset-confirm/", PasswordResetConfirmView.as_view(), name="auth-password-reset-confirm"),
    
    # Admin Student Registry & Security Center
    path("admin/users/", AdminStudentsListView.as_view(), name="auth-admin-users"),
    path("admin/users/semester-upgrade/", AdminStudentSemesterUpgradeView.as_view(), name="auth-admin-student-semester-upgrade"),
    path("admin/users/bulk-reset-security/", AdminBulkResetSecurityView.as_view(), name="auth-admin-bulk-reset-security"),
    path("admin/users/<uuid:pk>/", AdminStudentDetailView.as_view(), name="auth-admin-user-detail"),
    path("admin/users/<uuid:pk>/security-action/", AdminStudentSecurityActionView.as_view(), name="auth-admin-student-security"),
    path("admin/audit-logs/", AdminAuditLogListView.as_view(), name="auth-admin-audit-logs"),
    path("admin/audit-logs/clear/", AdminAuditLogClearView.as_view(), name="auth-admin-audit-logs-clear"),
    path("admin/email/test/", EmailTestView.as_view(), name="auth-admin-email-test"),
]
