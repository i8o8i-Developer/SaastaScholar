from django.urls import path
from .views import (
    AIOutlineGeneratorView,
    AdminAssignmentDetailView,
    AdminAssignmentListCreateView,
    AssignmentStatusToggleView,
    StudentAssignmentDetailView,
    StudentAssignmentListCreateView,
)

urlpatterns = [
    path("", StudentAssignmentListCreateView.as_view(), name="assignments-list-create"),
    path("assignments/", StudentAssignmentListCreateView.as_view(), name="assignments-list-create-alias"),
    path("<uuid:pk>/", StudentAssignmentDetailView.as_view(), name="assignments-detail"),
    path("<uuid:pk>/status/", AssignmentStatusToggleView.as_view(), name="assignments-status"),
    path("<uuid:pk>/toggle-status/", AssignmentStatusToggleView.as_view(), name="assignments-toggle-status"),
    path("generate-outline/", AIOutlineGeneratorView.as_view(), name="assignments-generate-outline"),
    path("ai-outline/", AIOutlineGeneratorView.as_view(), name="assignments-ai-outline"),
    path("admin/assignments/", AdminAssignmentListCreateView.as_view(), name="admin-assignments"),
    path("admin/assignments/<uuid:pk>/", AdminAssignmentDetailView.as_view(), name="admin-assignment-detail"),
]
