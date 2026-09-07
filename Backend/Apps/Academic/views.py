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
    SiteBanner,
    Subject,
    UserBookmark,
)
from .serializers import (
    AcademicMaterialListSerializer,
    AcademicMaterialSerializer,
    DepartmentNoticeSerializer,
    DepartmentSerializer,
    LabExperimentSerializer,
    ProgramSpecializationSerializer,
    SectionBatchSerializer,
    SidebarBadgeConfigSerializer,
    SiteBannerSerializer,
    SubjectSerializer,
)
from Apps.Accounts.models import StudentUser
from Apps.Accounts.models import StudentUser
from Apps.Accounts.serializers import StudentUserSerializer
from .cache_utils import get_or_set_redis_cache, make_cache_key, invalidate_redis_pattern

class DepartmentListView(generics.ListAPIView):
    queryset = Department.objects.prefetch_related("programs", "subjects").all()
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None

    def list(self, request, *args, **kwargs):
        cache_key = "academic:departments:list:all"
        def _fetch():
            response = super(DepartmentListView, self).list(request, *args, **kwargs)
            return response.data
        data = get_or_set_redis_cache(cache_key, _fetch, timeout=900)
        return Response(data)

class ProgramSpecializationListView(generics.ListAPIView):
    queryset = ProgramSpecialization.objects.select_related("department").all()
    serializer_class = ProgramSpecializationSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None

    def list(self, request, *args, **kwargs):
        cache_key = "academic:programs:list:all"
        def _fetch():
            response = super(ProgramSpecializationListView, self).list(request, *args, **kwargs)
            return response.data
        data = get_or_set_redis_cache(cache_key, _fetch, timeout=900)
        return Response(data)

class SectionBatchListView(generics.ListAPIView):
    queryset = SectionBatch.objects.select_related("program").all()
    serializer_class = SectionBatchSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None

    def list(self, request, *args, **kwargs):
        cache_key = "academic:sections:list:all"
        def _fetch():
            response = super(SectionBatchListView, self).list(request, *args, **kwargs)
            return response.data
        data = get_or_set_redis_cache(cache_key, _fetch, timeout=900)
        return Response(data)

def build_student_academic_filter(user, subject_prefix=""):
    if not user or not user.is_authenticated or getattr(user, "is_staff", False) or getattr(user, "is_superuser", False):
        return Q()

    user_prog = (getattr(user, "program", "") or "").strip()
    user_dept = (getattr(user, "department", "") or "").strip()
    user_sem = getattr(user, "semester", None)

    q = Q()
    prefix = f"{subject_prefix}__" if subject_prefix else ""

    if user_prog or user_dept:
        prog_dept_q = Q()
        if user_prog:
            prog_dept_q |= Q(**{f"{prefix}programs__name__iexact": user_prog})
            prog_dept_q |= Q(**{f"{prefix}programs__code__iexact": user_prog})
            prog_dept_q |= Q(**{f"{prefix}programs__name__icontains": user_prog})
        if user_dept:
            prog_dept_q |= Q(**{f"{prefix}department__name__iexact": user_dept})
            prog_dept_q |= Q(**{f"{prefix}department__code__iexact": user_dept})
            prog_dept_q |= Q(**{f"{prefix}department__name__icontains": user_dept})

        prog_dept_q |= Q(**{f"{prefix}programs__isnull": True})
        q &= prog_dept_q

    if user_sem:
        q &= Q(**{f"{prefix}semester": user_sem})

    return q

class SubjectListView(generics.ListAPIView):
    serializer_class = SubjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Subject.objects.prefetch_related("programs").annotate(
            materials_count=Count("materials", distinct=True),
            experiments_count=Count("experiments", distinct=True),
        )
        user = self.request.user
        semester = self.request.query_params.get("semester")
        department = self.request.query_params.get("department")
        program = self.request.query_params.get("program")
        if semester:
            qs = qs.filter(semester=semester)
        if department:
            qs = qs.filter(department__code=department)
        if program:
            qs = qs.filter(Q(programs__id=program) | Q(programs__code=program) | Q(programs__isnull=True)).distinct()

        if user.is_authenticated and not user.is_staff and not user.is_superuser:
            if not department and not program:
                student_filter = build_student_academic_filter(user)
                qs = qs.filter(student_filter).distinct()
        return qs

    def list(self, request, *args, **kwargs):
        user = request.user
        cache_key = make_cache_key(
            f"academic:subjects:{getattr(user, 'id', 'anon')}:{getattr(user, 'program', '')}:{getattr(user, 'semester', '')}",
            **request.query_params.dict()
        )
        def _fetch():
            response = super(SubjectListView, self).list(request, *args, **kwargs)
            return response.data
        data = get_or_set_redis_cache(cache_key, _fetch, timeout=600)
        return Response(data)

class AcademicMaterialListView(generics.ListAPIView):
    serializer_class = AcademicMaterialListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = AcademicMaterial.objects.select_related("subject", "subject__department")
        user = self.request.user
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

        if user.is_authenticated and not user.is_staff and not user.is_superuser:
            student_filter = build_student_academic_filter(user, subject_prefix="subject")
            qs = qs.filter(student_filter).distinct()
        return qs

    def list(self, request, *args, **kwargs):
        user = request.user
        cache_key = make_cache_key(
            f"academic:materials:{getattr(user, 'id', 'anon')}:{getattr(user, 'program', '')}:{getattr(user, 'semester', '')}",
            **request.query_params.dict()
        )
        def _fetch():
            response = super(AcademicMaterialListView, self).list(request, *args, **kwargs)
            return response.data
        data = get_or_set_redis_cache(cache_key, _fetch, timeout=600)
        return Response(data)

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
        user = self.request.user
        subject_code = self.request.query_params.get("subject_code")
        if subject_code:
            qs = qs.filter(subject__code=subject_code)

        if user.is_authenticated and not user.is_staff and not user.is_superuser:
            student_filter = build_student_academic_filter(user, subject_prefix="subject")
            qs = qs.filter(student_filter).distinct()
        return qs

class LabExperimentDetailView(generics.RetrieveAPIView):
    queryset = LabExperiment.objects.select_related("subject")
    serializer_class = LabExperimentSerializer
    permission_classes = [permissions.IsAuthenticated]

class DepartmentNoticeListView(generics.ListAPIView):
    serializer_class = DepartmentNoticeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = DepartmentNotice.objects.select_related("department", "program").all()
        if not user or not user.is_authenticated:
            return qs.filter(is_broadcast_all=True)

        user_dept = (getattr(user, "department", "") or "").strip()
        user_prog = (getattr(user, "program", "") or "").strip()
        user_sem = getattr(user, "semester", None)
        user_sec = (getattr(user, "section", "") or "").strip()

        # 
        campus_filter = Q(is_broadcast_all=True) & (
            Q(target_semester__isnull=True) | Q(target_semester=user_sem)
        )

        # 
        dept_filter = Q()
        if user_dept:
            dept_match = (
                Q(department__name__iexact=user_dept)
                | Q(department__code__iexact=user_dept)
                | Q(department__name__icontains=user_dept)
            )
            prog_match = Q()
            if user_prog:
                prog_match = (
                    Q(program__name__iexact=user_prog)
                    | Q(program__code__iexact=user_prog)
                    | Q(program__name__icontains=user_prog)
                )

            dept_filter = dept_match & (
                Q(program__isnull=True) | prog_match
            ) & (
                Q(target_semester__isnull=True) | Q(target_semester=user_sem)
            ) & (
                Q(target_section="") | Q(target_section__isnull=True) | Q(target_section__iexact=user_sec)
            )

        # 3. Direct Program/Specialization scoping
        prog_filter = Q()
        if user_prog:
            prog_direct = (
                Q(program__name__iexact=user_prog)
                | Q(program__code__iexact=user_prog)
                | Q(program__name__icontains=user_prog)
            )
            prog_filter = prog_direct & (
                Q(target_semester__isnull=True) | Q(target_semester=user_sem)
            ) & (
                Q(target_section="") | Q(target_section__isnull=True) | Q(target_section__iexact=user_sec)
            )

        return qs.filter(campus_filter | dept_filter | prog_filter).distinct()

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
    serializer_class = DepartmentNoticeSerializer
    permission_classes = [permissions.IsAdminUser]
    pagination_class = None

    def get_queryset(self):
        qs = DepartmentNotice.objects.select_related("department", "program").all()
        dept = self.request.query_params.get("department")
        prog = self.request.query_params.get("program")
        sem = self.request.query_params.get("semester")
        show_all = self.request.query_params.get("all", "").lower() == "true"

        if show_all:
            return qs
        if dept:
            qs = qs.filter(Q(department_id=dept) | Q(department__code=dept) | Q(is_broadcast_all=True))
        if prog:
            qs = qs.filter(Q(program_id=prog) | Q(program__code=prog) | Q(program__isnull=True) | Q(is_broadcast_all=True))
        if sem:
            qs = qs.filter(Q(target_semester=sem) | Q(target_semester__isnull=True))
        return qs

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
    permission_classes = [permissions.IsAdminUser]
    pagination_class = None

    def get_serializer_class(self):
        if self.request.method == "POST":
            return AcademicMaterialSerializer
        return AcademicMaterialListSerializer

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

class AdminStudentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = StudentUser.objects.all()
    serializer_class = StudentUserSerializer
    permission_classes = [permissions.IsAdminUser]

    def perform_destroy(self, instance):
        from Apps.Accounts.models import AdminAuditLog, ActionType
        AdminAuditLog.objects.create(
            actor=self.request.user,
            target_user=None,
            target_email=instance.email,
            target_name=instance.full_name or instance.username,
            action_type=ActionType.HARD_DELETE_USER,
            reason="Permanent User Account Hard Delete Executed By Administrator.",
            metadata={
                "deleted_user_id": str(instance.id),
                "roll_number": instance.roll_number,
                "email": instance.email,
                "drm_status_lost": True,
            },
            ip_address=self.request.META.get("REMOTE_ADDR", "127.0.0.1"),
        )
        instance.delete()

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


DEFAULT_BANNERS = [
    {
        "title": "Smart India Hackathon 2026",
        "message": "Internal Registrations Are Open For All Engineering Branches. Register Your Team Before Deadline!",
        "tag": "SIH 2026",
        "variant": "emerald",
        "target": "ALL",
        "link_url": "https://www.sih.gov.in/",
        "link_text": "Register Team",
        "is_active": True,
        "is_dismissible": True,
        "priority": 10,
    }
]


class SiteBannerListView(generics.ListAPIView):
    serializer_class = SiteBannerSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None

    def get_queryset(self):
        target = self.request.query_params.get("target")
        qs = SiteBanner.objects.filter(is_active=True)
        if target and target.upper() != "ALL":
            qs = qs.filter(Q(target__iexact=target) | Q(target__iexact="ALL") | Q(target="") | Q(target__isnull=True))
        return qs.order_by("-priority", "-created_at")


class AdminSiteBannerListCreateView(generics.ListCreateAPIView):
    serializer_class = SiteBannerSerializer
    permission_classes = [permissions.IsAdminUser]
    pagination_class = None

    def get_queryset(self):
        return SiteBanner.objects.all().order_by("-priority", "-created_at")


class AdminSiteBannerDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = SiteBanner.objects.all()
    serializer_class = SiteBannerSerializer
    permission_classes = [permissions.IsAdminUser]

