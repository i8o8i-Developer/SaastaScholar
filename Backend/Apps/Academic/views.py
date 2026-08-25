from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Count, Q
from django.shortcuts import get_object_or_404

from .models import (
    AcademicMaterial,
    Department,
    DepartmentNotice,
    LabExperiment,
    MaterialPage,
    ProgramSpecialization,
    SectionBatch,
    SidebarBadgeConfig,
    Subject,
    UserBookmark,
)
from .serializers import (
    AcademicMaterialSerializer,
    DepartmentNoticeSerializer,
    DepartmentSerializer,
    LabExperimentSerializer,
    ProgramSpecializationSerializer,
    SectionBatchSerializer,
    SidebarBadgeConfigSerializer,
    SubjectSerializer,
)
from Apps.Accounts.models import StudentUser
from Apps.Accounts.serializers import StudentUserSerializer

class DepartmentListView(generics.ListAPIView):
    queryset = Department.objects.prefetch_related("programs", "subjects").all()
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None

class ProgramSpecializationListView(generics.ListAPIView):
    queryset = ProgramSpecialization.objects.select_related("department").all()
    serializer_class = ProgramSpecializationSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None

class SectionBatchListView(generics.ListAPIView):
    queryset = SectionBatch.objects.select_related("program").all()
    serializer_class = SectionBatchSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None

class SubjectListView(generics.ListAPIView):
    serializer_class = SubjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Subject.objects.prefetch_related("programs").annotate(
            materials_count=Count("materials", distinct=True),
            experiments_count=Count("experiments", distinct=True),
        )
        semester = self.request.query_params.get("semester")
        department = self.request.query_params.get("department")
        program = self.request.query_params.get("program")
        if semester:
            qs = qs.filter(semester=semester)
        if department:
            qs = qs.filter(department__code=department)
        if program:
            qs = qs.filter(Q(programs__id=program) | Q(programs__code=program) | Q(programs__isnull=True)).distinct()
        return qs

class AcademicMaterialListView(generics.ListAPIView):
    serializer_class = AcademicMaterialSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = AcademicMaterial.objects.select_related("subject", "subject__department")
        mat_type = self.request.query_params.get("type")
        subject_id = self.request.query_params.get("subject")
        subject_code = self.request.query_params.get("subject_code")
        semester = self.request.query_params.get("semester")
        unit = self.request.query_params.get("unit")
        search = self.request.query_params.get("search")

        if mat_type:
            qs = qs.filter(material_type=mat_type)
        if subject_id:
            qs = qs.filter(subject_id=subject_id)
        if subject_code:
            qs = qs.filter(subject__code=subject_code)
        if semester:
            qs = qs.filter(subject__semester=semester)
        if unit:
            qs = qs.filter(unit_number=unit)
        if search:
            qs = qs.filter(
                Q(title__icontains=search)
                | Q(summary__icontains=search)
                | Q(subject__name__icontains=search)
                | Q(subject__code__icontains=search)
            )
        return qs

class AcademicMaterialDetailView(generics.RetrieveAPIView):
    queryset = AcademicMaterial.objects.select_related("subject")
    serializer_class = AcademicMaterialSerializer
    permission_classes = [permissions.IsAuthenticated]

class BookmarkToggleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, material_id):
        material = get_object_or_404(AcademicMaterial, id=material_id)
        bookmark, created = UserBookmark.objects.get_or_create(user=request.user, material=material)
        if not created:
            bookmark.delete()
            return Response({"bookmarked": False, "message": "Bookmark Removed."})
        return Response({"bookmarked": True, "message": "Bookmarked For Quick Revision."})

class LabExperimentListView(generics.ListAPIView):
    serializer_class = LabExperimentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = LabExperiment.objects.select_related("subject")
        subject_code = self.request.query_params.get("subject_code")
        if subject_code:
            qs = qs.filter(subject__code=subject_code)
        return qs

class LabExperimentDetailView(generics.RetrieveAPIView):
    queryset = LabExperiment.objects.select_related("subject")
    serializer_class = LabExperimentSerializer
    permission_classes = [permissions.IsAuthenticated]

class DepartmentNoticeListView(generics.ListAPIView):
    queryset = DepartmentNotice.objects.all()
    serializer_class = DepartmentNoticeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = DepartmentNotice.objects.all()
        # Filter by user's department/semester/section if applicable, or broadcast
        if user and user.is_authenticated:
            qs = qs.filter(
                Q(is_broadcast_all=True)
                | Q(target_semester__isnull=True)
                | Q(target_semester=user.semester)
            )
        return qs

# ==============================================================================
# ADMIN PORTAL CONTROLLERS: DEPARTMENTS, SPECIALIZATIONS, SECTIONS & NOTICES
# ==============================================================================

class AdminDepartmentListCreateView(generics.ListCreateAPIView):
    queryset = Department.objects.prefetch_related("programs", "subjects").all()
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.IsAdminUser]
    pagination_class = None

class AdminDepartmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.IsAdminUser]

class AdminProgramListCreateView(generics.ListCreateAPIView):
    queryset = ProgramSpecialization.objects.select_related("department").all()
    serializer_class = ProgramSpecializationSerializer
    permission_classes = [permissions.IsAdminUser]
    pagination_class = None

class AdminProgramDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ProgramSpecialization.objects.all()
    serializer_class = ProgramSpecializationSerializer
    permission_classes = [permissions.IsAdminUser]

class AdminSectionListCreateView(generics.ListCreateAPIView):
    queryset = SectionBatch.objects.select_related("program").all()
    serializer_class = SectionBatchSerializer
    permission_classes = [permissions.IsAdminUser]
    pagination_class = None

class AdminSectionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = SectionBatch.objects.all()
    serializer_class = SectionBatchSerializer
    permission_classes = [permissions.IsAdminUser]

class AdminNoticeListCreateView(generics.ListCreateAPIView):
    queryset = DepartmentNotice.objects.select_related("department", "program").all()
    serializer_class = DepartmentNoticeSerializer
    permission_classes = [permissions.IsAdminUser]
    pagination_class = None

class AdminNoticeDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = DepartmentNotice.objects.all()
    serializer_class = DepartmentNoticeSerializer
    permission_classes = [permissions.IsAdminUser]

class AdminSubjectListCreateView(generics.ListCreateAPIView):
    queryset = Subject.objects.select_related("department").prefetch_related("programs").all()
    serializer_class = SubjectSerializer
    permission_classes = [permissions.IsAdminUser]
    pagination_class = None

class AdminSubjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Subject.objects.select_related("department").prefetch_related("programs").all()
    serializer_class = SubjectSerializer
    permission_classes = [permissions.IsAdminUser]

class AdminMaterialListCreateView(generics.ListCreateAPIView):
    queryset = AcademicMaterial.objects.select_related("subject").all()
    serializer_class = AcademicMaterialSerializer
    permission_classes = [permissions.IsAdminUser]
    pagination_class = None

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        return super().post(request, *args, **kwargs)

class AdminMaterialDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = AcademicMaterial.objects.all()
    serializer_class = AcademicMaterialSerializer
    permission_classes = [permissions.IsAdminUser]

class AdminLabListCreateView(generics.ListCreateAPIView):
    queryset = LabExperiment.objects.select_related("subject").all()
    serializer_class = LabExperimentSerializer
    permission_classes = [permissions.IsAdminUser]
    pagination_class = None

class AdminLabDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = LabExperiment.objects.all()
    serializer_class = LabExperimentSerializer
    permission_classes = [permissions.IsAdminUser]

class AdminStudentsListView(generics.ListAPIView):
    queryset = StudentUser.objects.all().order_by("-created_at")
    serializer_class = StudentUserSerializer
    permission_classes = [permissions.IsAdminUser]
    pagination_class = None

class AdminStudentDetailView(generics.RetrieveUpdateAPIView):
    queryset = StudentUser.objects.all()
    serializer_class = StudentUserSerializer
    permission_classes = [permissions.IsAdminUser]

DEFAULT_BADGES = [
    {"id": "notes", "label": "Handwritten Notes", "badge_text": "Topper", "badge_variant": "emerald", "is_active": True, "display_order": 1},
    {"id": "pyqs", "label": "Solved PYQs", "badge_text": "2020–25", "badge_variant": "emerald", "is_active": True, "display_order": 2},
    {"id": "faculty", "label": "Faculty Resources", "badge_text": "Uploads", "badge_variant": "blue", "is_active": True, "display_order": 3},
    {"id": "labs", "label": "Labs & Viva Voce", "badge_text": "50+ Q&A", "badge_variant": "emerald", "is_active": True, "display_order": 4},
    {"id": "assignments", "label": "Assignment Tracker", "badge_text": "AI Tool", "badge_variant": "emerald", "is_active": True, "display_order": 5},
    {"id": "planner", "label": "Timetable & Planner", "badge_text": "Live", "badge_variant": "emerald", "is_active": True, "display_order": 6},
    {"id": "notices", "label": "Department Notices", "badge_text": "New", "badge_variant": "emerald", "is_active": True, "display_order": 7},
    {"id": "community-forum", "label": "Community Forum", "badge_text": "Active", "badge_variant": "purple", "is_active": True, "display_order": 8},
    {"id": "student-desk", "label": "Student Support Desk", "badge_text": "Help", "badge_variant": "cyan", "is_active": True, "display_order": 9},
    {"id": "profile", "label": "Academic Profile", "badge_text": "", "badge_variant": "emerald", "is_active": False, "display_order": 10},
]

class SidebarBadgeListView(generics.ListAPIView):
    serializer_class = SidebarBadgeConfigSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None

    def get_queryset(self):
        for b in DEFAULT_BADGES:
            SidebarBadgeConfig.objects.get_or_create(id=b["id"], defaults=b)
        return SidebarBadgeConfig.objects.all().order_by("display_order")

class AdminSidebarBadgeListCreateView(generics.ListCreateAPIView):
    serializer_class = SidebarBadgeConfigSerializer
    permission_classes = [permissions.IsAdminUser]
    pagination_class = None

    def get_queryset(self):
        for b in DEFAULT_BADGES:
            SidebarBadgeConfig.objects.get_or_create(id=b["id"], defaults=b)
        return SidebarBadgeConfig.objects.all().order_by("display_order")

class AdminSidebarBadgeDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = SidebarBadgeConfig.objects.all()
    serializer_class = SidebarBadgeConfigSerializer
    permission_classes = [permissions.IsAdminUser]

