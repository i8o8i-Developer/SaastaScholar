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
        cache_key = f"planner:timetable:{user.semester}:{user.section}:{day or 'all'}"
        
        def _fetch():
            qs = TimetableSlot.objects.filter(semester=user.semester, section=user.section)
            if day:
                qs = qs.filter(day_of_week=day)
            serializer = TimetableSlotSerializer(qs, many=True)
            return {
                "semester": user.semester,
                "section": user.section,
                "day": day or "All",
                "slots": serializer.data,
            }

        data = get_or_set_redis_cache(cache_key, _fetch, timeout=600)
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

class AdminTimetableSlotDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = TimetableSlot.objects.all()
    serializer_class = TimetableSlotSerializer
    permission_classes = [permissions.IsAdminUser]
