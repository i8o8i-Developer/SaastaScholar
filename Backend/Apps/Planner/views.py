from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404

from .models import PersonalStudyTask, TimetableSlot
from .serializers import PersonalStudyTaskSerializer, TimetableSlotSerializer

from Apps.Academic.cache_utils import get_or_set_redis_cache, make_cache_key

class TimetableScheduleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        day = request.query_params.get("day")
        cache_key = f"planner:timetable:{user.program}:{user.semester}:{user.section}:{day or 'all'}"
        
        def _fetch():
            from django.db.models import Q
            qs = TimetableSlot.objects.filter(semester=user.semester)
            if user.section:
                qs = qs.filter(section__iexact=user.section)

            if user.program or user.department:
                prog_q = Q()
                if user.program:
                    prog_q |= Q(subject__programs__name__iexact=user.program)
                    prog_q |= Q(subject__programs__code__iexact=user.program)
                    prog_q |= Q(subject__programs__name__icontains=user.program)
                    prog_q |= Q(title__icontains=user.program)
                if user.department:
                    prog_q |= Q(subject__department__name__iexact=user.department)
                    prog_q |= Q(subject__department__code__iexact=user.department)
                    prog_q |= Q(subject__department__name__icontains=user.department)
                
                prog_q |= Q(subject__programs__isnull=True)

                matching_qs = qs.filter(prog_q).distinct()
                if matching_qs.exists():
                    qs = matching_qs
                else:
                    # Do not show other programs' timetables!
                    qs = TimetableSlot.objects.none()

            if day and day != "All":
                qs = qs.filter(day_of_week__iexact=day)

            serializer = TimetableSlotSerializer(qs.order_by("start_time"), many=True)
            return {
                "semester": user.semester,
                "section": user.section,
                "day": day or "All",
                "slots": serializer.data,
            }

        data = get_or_set_redis_cache(cache_key, _fetch, timeout=60)
        return Response(data)

class PersonalStudyTaskListCreateView(generics.ListCreateAPIView):
    serializer_class = PersonalStudyTaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PersonalStudyTask.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class PersonalStudyTaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PersonalStudyTaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PersonalStudyTask.objects.filter(user=self.request.user)

class PersonalStudyTaskToggleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        task = get_object_or_404(PersonalStudyTask, id=pk, user=request.user)
        task.is_completed = not task.is_completed
        task.save()
        return Response(PersonalStudyTaskSerializer(task).data)

from .models import MilestoneCountdown, PersonalStudyTask, TimetableSlot
from .serializers import (
    MilestoneCountdownSerializer,
    PersonalStudyTaskSerializer,
    TimetableSlotSerializer,
)

class MilestoneCountdownListView(generics.ListAPIView):
    serializer_class = MilestoneCountdownSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        user = self.request.user
        return MilestoneCountdown.objects.filter(is_active=True, semester=user.semester)

    def list(self, request, *args, **kwargs):
        user = request.user
        cache_key = f"planner:milestones:{user.semester}"
        def _fetch():
            response = super(MilestoneCountdownListView, self).list(request, *args, **kwargs)
            return response.data
        data = get_or_set_redis_cache(cache_key, _fetch, timeout=600)
        return Response(data)

class AdminMilestoneListCreateView(generics.ListCreateAPIView):
    queryset = MilestoneCountdown.objects.all()
    serializer_class = MilestoneCountdownSerializer
    permission_classes = [permissions.IsAdminUser]
    pagination_class = None

class AdminMilestoneDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = MilestoneCountdown.objects.all()
    serializer_class = MilestoneCountdownSerializer
    permission_classes = [permissions.IsAdminUser]

class AdminTimetableSlotListCreateView(generics.ListCreateAPIView):
    queryset = TimetableSlot.objects.select_related("subject").all()
    serializer_class = TimetableSlotSerializer
    permission_classes = [permissions.IsAdminUser]
    pagination_class = None

    def delete(self, request, *args, **kwargs):
        return perform_bulk_delete_timetable(request)

class AdminTimetableSlotDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = TimetableSlot.objects.all()
    serializer_class = TimetableSlotSerializer
    permission_classes = [permissions.IsAdminUser]

def perform_bulk_delete_timetable(request):
    from Apps.Academic.cache_utils import invalidate_redis_pattern
    purge_all = request.data.get("purge_all") if hasattr(request, "data") else None
    if purge_all is None:
        purge_all = request.query_params.get("purge_all")

    if str(purge_all).lower() in ("true", "1", "yes"):
        count, _ = TimetableSlot.objects.all().delete()
        invalidate_redis_pattern("planner")
        return Response({
            "detail": f"Successfully Purged All {count} Timetable Slots.",
            "deleted_count": count,
        }, status=status.HTTP_200_OK)

    ids = request.data.get("ids") if hasattr(request, "data") else None
    if not ids:
        ids = request.query_params.getlist("ids")
    if ids:
        count, _ = TimetableSlot.objects.filter(id__in=ids).delete()
        invalidate_redis_pattern("planner")
        return Response({
            "detail": f"Successfully Deleted {count} Timetable Slots.",
            "deleted_count": count,
        }, status=status.HTTP_200_OK)

    qs = TimetableSlot.objects.all()
    semester = request.data.get("semester") if hasattr(request, "data") else None
    if semester is None:
        semester = request.query_params.get("semester")
    section = request.data.get("section") if hasattr(request, "data") else None
    if section is None:
        section = request.query_params.get("section")
    day_of_week = request.data.get("day_of_week") if hasattr(request, "data") else None
    if day_of_week is None:
        day_of_week = request.query_params.get("day_of_week")

    filtered = False
    if semester is not None and str(semester).strip() != "":
        try:
            qs = qs.filter(semester=int(semester))
            filtered = True
        except ValueError:
            pass
    if section and str(section).strip() != "":
        qs = qs.filter(section__iexact=str(section).strip())
        filtered = True
    if day_of_week and str(day_of_week).strip() != "" and day_of_week != "All":
        qs = qs.filter(day_of_week__iexact=str(day_of_week).strip())
        filtered = True

    if not filtered:
        return Response({
            "error": "Please Specify Filters (Semester, Section, Day_Of_Week) Or Purge_All=True."
        }, status=status.HTTP_400_BAD_REQUEST)

    count, _ = qs.delete()
    invalidate_redis_pattern("planner")
    return Response({
        "detail": f"Successfully Deleted {count} Timetable Slots.",
        "deleted_count": count,
    }, status=status.HTTP_200_OK)

class AdminTimetableBulkDeleteView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        return perform_bulk_delete_timetable(request)

    def delete(self, request):
        return perform_bulk_delete_timetable(request)

