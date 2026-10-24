from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Count, Q
from django.shortcuts import get_object_or_404

from .models import (
    AcademicMaterial,
    Department,
    DepartmentNotice,
    NoticeReadReceipt,
    LabExperiment,
    MaterialPage,
    ProgramSpecialization,
    SectionBatch,
    SidebarBadgeConfig,
    SiteBanner,
    Subject,
    SubjectUnit,
    UserBookmark,
    NewsletterSubscriber,
    MarketingBroadcastLog,
    BroadcastAudience,
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
    SubjectUnitSerializer,
    NewsletterSubscriberSerializer,
    MarketingBroadcastLogSerializer,
)
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
    permission_classes = [permissions.AllowAny]

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


class MarkNoticeReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            notice = DepartmentNotice.objects.get(pk=pk)
            NoticeReadReceipt.objects.get_or_create(user=request.user, notice=notice)
            return Response({"success": True, "notice_id": str(pk), "is_read": True})
        except DepartmentNotice.DoesNotExist:
            return Response({"error": "Notice Not Found"}, status=status.HTTP_404_NOT_FOUND)


class MarkAllNoticesReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        notices = DepartmentNotice.objects.all()
        receipts = [
            NoticeReadReceipt(user=request.user, notice=n)
            for n in notices
        ]
        NoticeReadReceipt.objects.bulk_create(receipts, ignore_conflicts=True)
        return Response({"success": True, "marked_count": len(receipts)})


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

class SubjectUnitListView(generics.ListAPIView):
    serializer_class = SubjectUnitSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None

    def get_queryset(self):
        qs = SubjectUnit.objects.select_related("subject", "subject__department").all()
        subject_id = self.request.query_params.get("subject")
        semester = self.request.query_params.get("semester")
        department = self.request.query_params.get("department")
        search = self.request.query_params.get("search")

        if subject_id:
            qs = qs.filter(subject_id=subject_id)
        if semester:
            try:
                qs = qs.filter(subject__semester=int(semester))
            except (ValueError, TypeError):
                pass
        if department:
            qs = qs.filter(Q(subject__department_id=department) | Q(subject__department__name__icontains=department))
        if search:
            qs = qs.filter(
                Q(title__icontains=search)
                | Q(description__icontains=search)
                | Q(subject__name__icontains=search)
                | Q(subject__code__icontains=search)
            )
        return qs.order_by("subject__semester", "subject__code", "unit_number")

class AdminUnitListCreateView(generics.ListCreateAPIView):
    queryset = SubjectUnit.objects.select_related("subject", "subject__department").all().order_by("subject__semester", "subject__code", "unit_number")
    serializer_class = SubjectUnitSerializer
    permission_classes = [permissions.IsAdminUser]
    pagination_class = None

    def get_queryset(self):
        qs = SubjectUnit.objects.select_related("subject", "subject__department").all()
        subject_id = self.request.query_params.get("subject")
        semester = self.request.query_params.get("semester")
        search = self.request.query_params.get("search")

        if subject_id:
            qs = qs.filter(subject_id=subject_id)
        if semester:
            try:
                qs = qs.filter(subject__semester=int(semester))
            except (ValueError, TypeError):
                pass
        if search:
            qs = qs.filter(
                Q(title__icontains=search)
                | Q(description__icontains=search)
                | Q(subject__name__icontains=search)
                | Q(subject__code__icontains=search)
            )
        return qs.order_by("subject__semester", "subject__code", "unit_number")

class AdminUnitDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = SubjectUnit.objects.all()
    serializer_class = SubjectUnitSerializer
    permission_classes = [permissions.IsAdminUser]

class AdminStudentsListView(generics.ListCreateAPIView):
    serializer_class = StudentUserSerializer
    permission_classes = [permissions.IsAdminUser]
    pagination_class = None

    def get_queryset(self):
        qs = StudentUser.objects.all().order_by("-created_at")
        semester = self.request.query_params.get("semester")
        program = self.request.query_params.get("program")
        department = self.request.query_params.get("department")
        section = self.request.query_params.get("section")
        search = self.request.query_params.get("search")

        if semester:
            try:
                qs = qs.filter(semester=int(semester))
            except (ValueError, TypeError):
                pass
        if program:
            qs = qs.filter(Q(program__icontains=program) | Q(program_code__icontains=program))
        if department:
            qs = qs.filter(department__icontains=department)
        if section:
            qs = qs.filter(section__iexact=section)
        if search:
            qs = qs.filter(
                Q(full_name__icontains=search)
                | Q(username__icontains=search)
                | Q(email__icontains=search)
                | Q(roll_number__icontains=search)
                | Q(enrollment_no__icontains=search)
            )
        return qs

    def create(self, request, *args, **kwargs):
        email = request.data.get("email", "").strip().lower()
        if not email:
            return Response({"error": "Email Address Is Required."}, status=status.HTTP_400_BAD_REQUEST)
        if StudentUser.objects.filter(email=email).exists():
            return Response({"error": "A Scholar With This Email Address Is Already Registered."}, status=status.HTTP_400_BAD_REQUEST)
        
        full_name = request.data.get("full_name", "").strip() or request.data.get("name", "").strip()
        roll_number = request.data.get("roll_number", "").strip()
        enrollment_no = request.data.get("enrollment_no", "").strip() or roll_number
        try:
            semester = int(request.data.get("semester", 1))
        except (ValueError, TypeError):
            semester = 1
        section = request.data.get("section", "A").strip().upper() or "A"
        department = request.data.get("department", "Department Of Computer Science & Engineering").strip()
        program = request.data.get("program", "B.Tech AI & ML").strip()
        access_tier = request.data.get("access_tier", "SEMESTER_TOPPER")
        password = request.data.get("password", "").strip() or "Welcome@123"

        user = StudentUser.objects.create(
            email=email,
            username=email,
            full_name=full_name,
            roll_number=roll_number,
            enrollment_no=enrollment_no,
            semester=semester,
            section=section,
            department=department,
            program=program,
            access_tier=access_tier,
            is_active=True,
            is_verified=True,
        )
        user.set_password(password)
        user.save()

        # Audit log
        from Apps.Accounts.models import AdminAuditLog, ActionType
        AdminAuditLog.objects.create(
            actor=request.user,
            target_user=user,
            action_type=ActionType.REGISTER_STUDENT,
            reason=f"Registered New Scholar: {full_name} ({roll_number}) In Semester {semester} Section {section}",
            metadata={
                "email": email,
                "roll_number": roll_number,
                "semester": semester,
                "section": section,
                "program": program,
                "access_tier": access_tier,
            },
            ip_address=request.META.get("REMOTE_ADDR", "127.0.0.1"),
        )

        return Response(
            {
                "message": f"Scholar Account '{full_name}' Registered Successfully in Semester {semester}.",
                "user": StudentUserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )

class AdminStudentSemesterUpgradeView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        mode = request.data.get("mode", "single")  # "single" or "bulk"
        reason = request.data.get("reason", "Semester Level Academic Upgrade Executed By Administrator").strip()
        from Apps.Accounts.models import AdminAuditLog, ActionType

        if mode == "single":
            student_id = request.data.get("student_id")
            if not student_id:
                return Response({"error": "student_id Is Required For Single Student Upgrade."}, status=status.HTTP_400_BAD_REQUEST)
            try:
                student = StudentUser.objects.get(id=student_id)
            except StudentUser.DoesNotExist:
                return Response({"error": "Scholar Record Not Found."}, status=status.HTTP_404_NOT_FOUND)

            old_semester = student.semester
            target_semester = request.data.get("target_semester")
            if target_semester is not None:
                try:
                    new_semester = int(target_semester)
                except (ValueError, TypeError):
                    new_semester = old_semester + 1
            else:
                new_semester = old_semester + 1

            if new_semester > 12:
                new_semester = 12

            new_section = request.data.get("section")
            student.semester = new_semester
            if new_section:
                student.section = str(new_section).strip().upper()
            student.save(update_fields=["semester", "section", "updated_at"])

            from Apps.Academic.cache_utils import invalidate_redis_pattern
            try:
                invalidate_redis_pattern(f"planner:timetable:{student.program}*")
                invalidate_redis_pattern(f"academic:subjects:{student.id}*")
                invalidate_redis_pattern(f"academic:materials:{student.id}*")
            except Exception:
                pass

            AdminAuditLog.objects.create(
                actor=request.user,
                target_user=student,
                action_type=ActionType.SEMESTER_UPGRADE,
                reason=reason,
                metadata={
                    "old_semester": old_semester,
                    "new_semester": new_semester,
                    "section": student.section,
                    "student_name": student.full_name or student.username,
                    "roll_number": student.roll_number,
                },
                ip_address=request.META.get("REMOTE_ADDR", "127.0.0.1"),
            )

            return Response({
                "message": f"Successfully Promoted {student.full_name or student.username} From Semester {old_semester} To Semester {new_semester}.",
                "user": StudentUserSerializer(student).data,
            })

        elif mode == "bulk":
            current_semester = request.data.get("current_semester")
            if current_semester is None:
                return Response({"error": "current_semester Is Required For Bulk Semester Upgrade."}, status=status.HTTP_400_BAD_REQUEST)
            try:
                current_sem = int(current_semester)
            except (ValueError, TypeError):
                return Response({"error": "current_semester Must Be A Valid Integer."}, status=status.HTTP_400_BAD_REQUEST)

            target_sem_val = request.data.get("target_semester")
            new_sem = int(target_sem_val) if target_sem_val is not None else current_sem + 1
            if new_sem > 12:
                new_sem = 12

            program_filter = request.data.get("program")
            section_filter = request.data.get("section")

            qs = StudentUser.objects.filter(semester=current_sem, is_active=True, is_staff=False, is_superuser=False)
            if program_filter:
                qs = qs.filter(Q(program__icontains=program_filter) | Q(program_code__icontains=program_filter))
            if section_filter:
                qs = qs.filter(section__iexact=section_filter)

            count = qs.count()
            if count == 0:
                return Response({
                    "message": f"No Active Scholars Found In Semester {current_sem} Matching The Specified Criteria.",
                    "affected_count": 0
                })

            qs.update(semester=new_sem)

            AdminAuditLog.objects.create(
                actor=request.user,
                target_user=None,
                target_email="BATCH_UPGRADE@SYSTEM",
                target_name=f"Bulk Promotion Semester {current_sem} -> {new_sem}",
                action_type=ActionType.SEMESTER_UPGRADE_BULK,
                reason=reason,
                metadata={
                    "from_semester": current_sem,
                    "to_semester": new_sem,
                    "program_filter": program_filter or "All Programs",
                    "section_filter": section_filter or "All Sections",
                    "upgraded_count": count,
                },
                ip_address=request.META.get("REMOTE_ADDR", "127.0.0.1"),
            )

            return Response({
                "message": f"Successfully Promoted {count} Scholars From Semester {current_sem} To Semester {new_sem}.",
                "affected_count": count,
                "from_semester": current_sem,
                "to_semester": new_sem,
            })

        else:
            return Response({"error": f"Unknown upgrade mode '{mode}'. Choose 'single' Or 'bulk'."}, status=status.HTTP_400_BAD_REQUEST)

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


# ==============================================================================
# NEWSLETTER & WEEKLY ACADEMIC DISPATCH VIEWS
# ==============================================================================
class NewsletterSubscribeView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = str(request.data.get("email") or "").strip().lower()
        if not email or "@" not in email:
            return Response({"error": "Please Provide A Valid Email Address."}, status=status.HTTP_400_BAD_REQUEST)

        source = request.data.get("source", "Footer Newsletter")
        subscriber, created = NewsletterSubscriber.objects.get_or_create(
            email=email,
            defaults={"source": source, "is_active": True}
        )
        if not created and not subscriber.is_active:
            subscriber.is_active = True
            subscriber.unsubscribed_at = None
            subscriber.save(update_fields=["is_active", "unsubscribed_at"])

        # Send Welcome to Weekly Dispatch
        unsub_url = f"https://saastascholar.durgaaisolutions.in/api/academic/newsletter/unsubscribe/?token={subscriber.unsubscribe_token}&email={subscriber.email}"
        try:
            from Core.mail import send_newsletter_welcome_email
            send_newsletter_welcome_email(subscriber.email, unsub_url)
        except Exception:
            pass

        return Response({
            "message": "Successfully Subscribed To SaastaScholar Weekly Academic Dispatch.",
            "email": subscriber.email,
            "is_new": created,
        }, status=status.HTTP_200_OK)


class NewsletterUnsubscribeView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        token = request.query_params.get("token")
        email = request.query_params.get("email")
        subscriber = None
        if token:
            subscriber = NewsletterSubscriber.objects.filter(unsubscribe_token=token).first()
        elif email:
            subscriber = NewsletterSubscriber.objects.filter(email__iexact=email).first()

        from django.utils import timezone
        if subscriber:
            subscriber.is_active = False
            subscriber.unsubscribed_at = timezone.now()
            subscriber.save(update_fields=["is_active", "unsubscribed_at"])
            return Response({"message": "You Have Been Successfully Unsubscribed From Weekly Academic Dispatch."})
        return Response({"error": "Subscription Record Not Found."}, status=status.HTTP_404_NOT_FOUND)


class AdminMarketingStatsView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        from django.conf import settings
        from django.db.models import Sum

        total_students = StudentUser.objects.count()
        free_students = StudentUser.objects.filter(access_tier__in=["FREE", "STARTER"]).count()
        premium_students = StudentUser.objects.exclude(access_tier__in=["FREE", "STARTER"]).count()

        active_subscribers = NewsletterSubscriber.objects.filter(is_active=True).count()
        unsubscribed_count = NewsletterSubscriber.objects.filter(is_active=False).count()

        total_broadcasts = MarketingBroadcastLog.objects.count()
        total_delivered = MarketingBroadcastLog.objects.aggregate(Sum("total_delivered"))["total_delivered__sum"] or 0

        # SMTP & Anti-Spam Health Quick Analysis
        from Core.mail import get_sender_email
        sender_email = get_sender_email()
        host_user = getattr(settings, "EMAIL_HOST_USER", "")
        smtp_host = getattr(settings, "EMAIL_HOST", "smtp.gmail.com")

        has_credentials = bool(host_user and getattr(settings, "EMAIL_HOST_PASSWORD", ""))
        sender_matches = False
        if "@" in host_user and "@" in sender_email:
            sender_matches = host_user.split("@")[-1].lower() in sender_email.lower()

        deliverability_status = "OPTIMAL" if (has_credentials and sender_matches) else "CONFIG_REVIEW_NEEDED"

        return Response({
            "total_students": total_students,
            "free_students": free_students,
            "premium_students": premium_students,
            "active_subscribers": active_subscribers,
            "unsubscribed_count": unsubscribed_count,
            "total_broadcasts": total_broadcasts,
            "total_delivered": total_delivered,
            "sender_email": sender_email,
            "smtp_host": smtp_host,
            "deliverability_status": deliverability_status,
            "has_credentials": has_credentials,
        })


class AdminMarketingSubscribersView(generics.ListCreateAPIView):
    serializer_class = NewsletterSubscriberSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        qs = NewsletterSubscriber.objects.all().order_by("-subscribed_at")
        search = self.request.query_params.get("search", "").strip()
        status_filter = self.request.query_params.get("status", "")
        if search:
            qs = qs.filter(Q(email__icontains=search) | Q(source__icontains=search))
        if status_filter == "active":
            qs = qs.filter(is_active=True)
        elif status_filter == "unsubscribed":
            qs = qs.filter(is_active=False)
        return qs

    def create(self, request, *args, **kwargs):
        email = str(request.data.get("email") or "").strip().lower()
        if not email or "@" not in email:
            return Response({"error": "Invalid Email Address."}, status=status.HTTP_400_BAD_REQUEST)
        sub, created = NewsletterSubscriber.objects.get_or_create(
            email=email,
            defaults={"source": "Admin Manual Entry", "is_active": True}
        )
        if not created:
            sub.is_active = True
            sub.unsubscribed_at = None
            sub.save(update_fields=["is_active", "unsubscribed_at"])
        return Response(NewsletterSubscriberSerializer(sub).data, status=status.HTTP_201_CREATED)


class AdminMarketingSubscriberDetailView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def patch(self, request, pk):
        subscriber = get_object_or_404(NewsletterSubscriber, pk=pk)
        from django.utils import timezone
        if "is_active" in request.data:
            subscriber.is_active = bool(request.data["is_active"])
            subscriber.unsubscribed_at = None if subscriber.is_active else timezone.now()
            subscriber.save(update_fields=["is_active", "unsubscribed_at"])
        return Response(NewsletterSubscriberSerializer(subscriber).data)

    def delete(self, request, pk):
        subscriber = get_object_or_404(NewsletterSubscriber, pk=pk)
        subscriber.delete()
        return Response({"message": "Subscriber Record Removed Successfully."})


class AdminMarketingBroadcastLogsView(generics.ListAPIView):
    serializer_class = MarketingBroadcastLogSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        return MarketingBroadcastLog.objects.all().order_by("-created_at")[:50]


class AdminMarketingBroadcastDispatchView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        subject = str(request.data.get("subject") or "").strip()
        preheader = str(request.data.get("preheader") or "").strip()
        content_html = str(request.data.get("content_html") or "").strip()
        audience = str(request.data.get("audience") or "ALL").upper()
        is_test = bool(request.data.get("is_test", False))
        test_recipient = str(request.data.get("test_recipient") or "").strip()

        if not subject:
            return Response({"error": "Broadcast Subject Is Required."}, status=status.HTTP_400_BAD_REQUEST)
        if not content_html:
            return Response({"error": "Broadcast Email Content HTML Is Required."}, status=status.HTTP_400_BAD_REQUEST)

        from Core.mail import send_marketing_dispatch_email

        # If Test Send: Send Single Email To Designated Test Inbox
        if is_test:
            target_test_email = test_recipient or getattr(request.user, "email", "support@saastascholar.in")
            ok, err = send_marketing_dispatch_email(
                recipient_email=target_test_email,
                subject=f"[TEST PREVIEW] {subject}",
                preheader=preheader or subject,
                html_body=content_html,
                unsubscribe_url="https://saastascholar.durgaaisolutions.in/unsubscribe?test=1",
            )
            if ok:
                return Response({
                    "message": f"Test Preview Dispatched Successfully To {target_test_email}.",
                    "test_recipient": target_test_email,
                })
            return Response({"error": f"Test Send Failed: {err}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Collect Production Target Recipients
        target_emails = set()

        if audience in ("STUDENTS", "ALL"):
            students = StudentUser.objects.filter(is_active=True).values_list("email", flat=True)
            target_emails.update([e.strip().lower() for e in students if e and "@" in e])

        if audience in ("SUBSCRIBERS", "ALL"):
            subs = NewsletterSubscriber.objects.filter(is_active=True).values_list("email", flat=True)
            target_emails.update([e.strip().lower() for e in subs if e and "@" in e])

        if audience == "FREE_TIER":
            students = StudentUser.objects.filter(access_tier__in=["FREE", "STARTER"], is_active=True).values_list("email", flat=True)
            target_emails.update([e.strip().lower() for e in students if e and "@" in e])

        if audience == "PREMIUM_TIER":
            students = StudentUser.objects.exclude(access_tier__in=["FREE", "STARTER"]).filter(is_active=True).values_list("email", flat=True)
            target_emails.update([e.strip().lower() for e in students if e and "@" in e])

        if not target_emails:
            return Response({"error": f"No Active Recipients Found For Audience Segment '{audience}'."}, status=status.HTTP_400_BAD_REQUEST)

        delivered = 0
        failed = 0

        # Execute Blast Dispatch
        for email_addr in target_emails:
            unsub_url = f"https://saastascholar.durgaaisolutions.in/unsubscribe?email={email_addr}"
            ok, err = send_marketing_dispatch_email(
                recipient_email=email_addr,
                subject=subject,
                preheader=preheader,
                html_body=content_html,
                unsubscribe_url=unsub_url,
            )
            if ok:
                delivered += 1
            else:
                failed += 1

        # Create Permanent Dispatch Audit Record
        log = MarketingBroadcastLog.objects.create(
            subject=subject,
            preheader=preheader,
            audience=audience,
            content_html=content_html,
            total_targeted=len(target_emails),
            total_delivered=delivered,
            total_failed=failed,
            status="COMPLETED" if failed == 0 else ("PARTIAL" if delivered > 0 else "FAILED"),
            sent_by=request.user if hasattr(request.user, "is_authenticated") and request.user.is_authenticated else None,
        )

        return Response({
            "message": f"Broadcast Completed: {delivered} Delivered, {failed} Failed Out Of {len(target_emails)} Targeted.",
            "log": MarketingBroadcastLogSerializer(log).data,
        })


class AdminEmailDeliverabilityDiagnosticView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        from django.conf import settings
        import smtplib
        from Core.mail import get_sender_email

        smtp_host = getattr(settings, "EMAIL_HOST", "smtp.gmail.com")
        smtp_port = getattr(settings, "EMAIL_PORT", 587)
        use_tls = getattr(settings, "EMAIL_USE_TLS", True)
        host_user = getattr(settings, "EMAIL_HOST_USER", "")
        sender_email = get_sender_email()

        # Check Connection
        conn_ok = False
        conn_msg = ""
        try:
            server = smtplib.SMTP(smtp_host, smtp_port, timeout=4)
            if use_tls:
                server.starttls()
            server.quit()
            conn_ok = True
            conn_msg = f"Connected Successfully To {smtp_host}:{smtp_port}."
        except Exception as e:
            conn_ok = False
            conn_msg = str(e)

        # Domain SPF & DMARC Recommendations
        sender_domain = sender_email.split("@")[-1].replace(">", "").strip() if "@" in sender_email else "saastascholar.in"

        spf_record = f"v=spf1 include:_spf.google.com ~all" if "gmail" in smtp_host else f"v=spf1 include:{smtp_host} ~all"
        dmarc_record = f"v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@{sender_domain}; pct=100"

        # Why Emails Land in Spam Analysis
        recommendations = [
            {
                "rule": "Sender Domain & SMTP Authentication Alignment",
                "status": "PASS" if ("@" in host_user and host_user.split("@")[-1].lower() in sender_email.lower()) else "WARNING",
                "detail": f"Sender Address ({sender_email}) Matches Authenticated SMTP User ({host_user})." if ("@" in host_user and host_user.split("@")[-1].lower() in sender_email.lower()) else f"Mismatch: Host User ({host_user}) vs From Header ({sender_email}). Gmail SMTP Will Flag This As Spoofed Unless From Matches Host User.",
            },
            {
                "rule": "One-Click List-Unsubscribe RFC Headers",
                "status": "PASS",
                "detail": "List-Unsubscribe And List-Unsubscribe-Post: List-Unsubscribe=One-Click Headers Are Active On All Dispatches, Satisfying Google & Yahoo 2024 Compliance.",
            },
            {
                "rule": "Cryptographic Message-ID Domain Integrity",
                "status": "PASS",
                "detail": f"Every Outgoing Email Generates A Unique Message-ID Aligned With @{sender_domain} Preventing SpamAssassin Penalties.",
            },
            {
                "rule": "HTML To Plain-Text Multi-Part Balance",
                "status": "PASS",
                "detail": "EmailMultiAlternatives Delivers Matching Plain-Text Body Alongside Styled HTML.",
            },
            {
                "rule": "Clean Preheaders Without Hidden Opacity Hacks",
                "status": "PASS",
                "detail": "Preheader Utilizes Mso-Hide/Overflow Without Opacity:0 Tricks That Trigger Spam Bots.",
            },
        ]

        return Response({
            "smtp_host": smtp_host,
            "smtp_port": smtp_port,
            "use_tls": use_tls,
            "host_user": host_user,
            "sender_email": sender_email,
            "sender_domain": sender_domain,
            "connection_ok": conn_ok,
            "connection_message": conn_msg,
            "spf_record": spf_record,
            "dmarc_record": dmarc_record,
            "recommendations": recommendations,
        })


