from django.urls import path
from .views import (
    AdminMilestoneDetailView,
    AdminMilestoneListCreateView,
    AdminTimetableBulkCreateView,
    AdminTimetableBulkDeleteView,
    AdminTimetableEnrichFullNamesView,
    AdminTimetablePhotoConsumeView,
    AdminTimetableSlotDetailView,
    AdminTimetableSlotListCreateView,
    MilestoneCountdownListView,
    PersonalStudyTaskDetailView,
    PersonalStudyTaskListCreateView,
    PersonalStudyTaskToggleView,
    TimetableScheduleView,
)

urlpatterns = [
    path("timetable/", TimetableScheduleView.as_view(), name="planner-timetable"),
    path("milestones/", MilestoneCountdownListView.as_view(), name="planner-milestones"),
    path("tasks/", PersonalStudyTaskListCreateView.as_view(), name="planner-tasks-list-create"),
    path("tasks/<uuid:pk>/", PersonalStudyTaskDetailView.as_view(), name="planner-task-detail"),
    path("tasks/<uuid:pk>/toggle/", PersonalStudyTaskToggleView.as_view(), name="planner-task-toggle"),
    path("admin/timetable/", AdminTimetableSlotListCreateView.as_view(), name="admin-timetable"),
    path("admin/timetable/ai-photo-consume/", AdminTimetablePhotoConsumeView.as_view(), name="admin-timetable-ai-consume"),
    path("admin/timetable/bulk-create/", AdminTimetableBulkCreateView.as_view(), name="admin-timetable-bulk-create"),
    path("admin/timetable/bulk-delete/", AdminTimetableBulkDeleteView.as_view(), name="admin-timetable-bulk-delete"),
    path("admin/timetable/enrich-full-names/", AdminTimetableEnrichFullNamesView.as_view(), name="admin-timetable-enrich-full-names"),
    path("admin/timetable/<uuid:pk>/", AdminTimetableSlotDetailView.as_view(), name="admin-timetable-detail"),
    path("admin/milestones/", AdminMilestoneListCreateView.as_view(), name="admin-milestones"),
    path("admin/milestones/<uuid:pk>/", AdminMilestoneDetailView.as_view(), name="admin-milestones-detail"),
]
