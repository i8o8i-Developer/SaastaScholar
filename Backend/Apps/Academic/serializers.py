import json
from rest_framework import serializers
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
)

class SafeJSONField(serializers.Field):
    def to_representation(self, value):
        if value is None:
            return []
        if isinstance(value, str):
            try:
                return json.loads(value)
            except Exception:
                return [t.strip() for t in value.split(",") if t.strip()]
        return value

    def to_internal_value(self, data):
        if data is None or data == "" or data == "null":
            return []
        if isinstance(data, (list, dict)):
            return data
        if isinstance(data, str):
            try:
                return json.loads(data)
            except Exception:
                return [t.strip() for t in data.split(",") if t.strip()]
        return data

class ProgramSpecializationSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source="department.name", read_only=True)
    department_code = serializers.CharField(source="department.code", read_only=True)

    class Meta:
        model = ProgramSpecialization
        fields = [
            "id",
            "department",
            "department_name",
            "department_code",
            "name",
            "code",
            "degree_level",
            "duration_years",
            "total_semesters",
            "created_at",
        ]

class SectionBatchSerializer(serializers.ModelSerializer):
    program_name = serializers.CharField(source="program.name", read_only=True)
    program_code = serializers.CharField(source="program.code", read_only=True)
    section = serializers.SerializerMethodField()

    class Meta:
        model = SectionBatch
        fields = [
            "id",
            "program",
            "program_name",
            "program_code",
            "semester",
            "section",
            "section_name",
            "batch_code",
            "academic_year",
            "max_capacity",
            "created_at",
        ]
        extra_kwargs = {
            "section_name": {"required": False},
            "batch_code": {"required": False},
        }

    def get_section(self, obj):
        return obj.section_name

    def to_internal_value(self, data):
        data = data.copy() if hasattr(data, "copy") else dict(data)
        if not data.get("program"):
            first_prog = ProgramSpecialization.objects.first()
            if first_prog:
                data["program"] = str(first_prog.id)
        if "section" in data and not data.get("section_name"):
            data["section_name"] = str(data["section"]).strip().upper()
        if "section_name" in data and data.get("section_name"):
            data["section_name"] = str(data["section_name"]).strip().upper()
        if not data.get("section_name"):
            data["section_name"] = "A"
        if not data.get("batch_code") and data.get("academic_year"):
            data["batch_code"] = f"{data['academic_year']} Batch"
        elif not data.get("batch_code"):
            data["batch_code"] = "2025-2026 Batch"
        return super().to_internal_value(data)

class DepartmentSerializer(serializers.ModelSerializer):
    programs = ProgramSpecializationSerializer(many=True, read_only=True)
    subjects_count = serializers.IntegerField(source="subjects.count", read_only=True)

    class Meta:
        model = Department
        fields = ["id", "name", "code", "description", "head_of_department", "programs", "subjects_count", "created_at"]

class SubjectSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source="department.name", read_only=True)
    department_code = serializers.CharField(source="department.code", read_only=True)
    materials_count = serializers.IntegerField(read_only=True, default=0)
    experiments_count = serializers.IntegerField(read_only=True, default=0)
    units_count = serializers.IntegerField(source="units.count", read_only=True)
    program = serializers.UUIDField(write_only=True, required=False)
    programs = serializers.PrimaryKeyRelatedField(
        queryset=ProgramSpecialization.objects.all(),
        many=True,
        required=False
    )
    program_ids = serializers.SerializerMethodField()
    program_names = serializers.SerializerMethodField()
    program_codes = serializers.SerializerMethodField()

    class Meta:
        model = Subject
        fields = [
            "id",
            "department",
            "department_name",
            "department_code",
            "program",
            "programs",
            "program_ids",
            "program_names",
            "program_codes",
            "name",
            "code",
            "short_name",
            "semester",
            "credits",
            "faculty_name",
            "icon_name",
            "color_accent",
            "materials_count",
            "experiments_count",
            "units_count",
        ]

class SubjectUnitSerializer(serializers.ModelSerializer):
    subject_code = serializers.CharField(source="subject.code", read_only=True)
    subject_name = serializers.CharField(source="subject.name", read_only=True)
    department_name = serializers.CharField(source="subject.department.name", read_only=True)
    semester = serializers.IntegerField(source="subject.semester", read_only=True)
    topics = SafeJSONField(required=False)

    class Meta:
        model = SubjectUnit
        fields = [
            "id",
            "subject",
            "subject_code",
            "subject_name",
            "department_name",
            "semester",
            "unit_number",
            "title",
            "description",
            "topics",
            "marks_weightage",
            "estimated_hours",
            "created_at",
            "updated_at",
        ]
        extra_kwargs = {
            "department": {"required": False},
        }

    def get_program_ids(self, obj):
        return [str(p.id) for p in obj.programs.all()]

    def get_program_names(self, obj):
        return [p.name for p in obj.programs.all()]

    def get_program_codes(self, obj):
        return [p.code for p in obj.programs.all()]

    def to_internal_value(self, data):
        data = data.copy() if hasattr(data, "copy") else dict(data)
        
        prog_ids = []
        if "programs" in data and isinstance(data["programs"], list):
            prog_ids = [pid for pid in data["programs"] if pid]
        elif "program" in data and data["program"]:
            prog_ids = [data["program"]]

        if prog_ids and not data.get("department"):
            try:
                first_prog = ProgramSpecialization.objects.filter(id__in=prog_ids).first()
                if first_prog:
                    data["department"] = first_prog.department.id
            except Exception:
                pass

        if not data.get("department"):
            first_dept = Department.objects.first()
            if first_dept:
                data["department"] = first_dept.id

        return super().to_internal_value(data)

    def create(self, validated_data):
        programs = validated_data.pop("programs", [])
        validated_data.pop("program", None)
        subject = super().create(validated_data)
        if programs:
            subject.programs.set(programs)
        return subject

    def update(self, instance, validated_data):
        programs = validated_data.pop("programs", None)
        validated_data.pop("program", None)
        subject = super().update(instance, validated_data)
        if programs is not None:
            subject.programs.set(programs)
        return subject

import json

class MaterialPageSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaterialPage
        fields = ["id", "page_number", "page_title", "content_html", "diagram_svg"]

class AcademicMaterialListSerializer(serializers.ModelSerializer):
    subject_code = serializers.CharField(source="subject.code", read_only=True)
    subject_name = serializers.CharField(source="subject.name", read_only=True)
    semester = serializers.IntegerField(source="subject.semester", read_only=True)
    is_bookmarked = serializers.SerializerMethodField()
    tags = SafeJSONField(required=False, default=list)

    class Meta:
        model = AcademicMaterial
        fields = [
            "id",
            "subject",
            "subject_code",
            "subject_name",
            "semester",
            "title",
            "material_type",
            "academic_year",
            "unit_number",
            "summary",
            "page_count",
            "preview_pages_count",
            "is_free",
            "is_topper_verified",
            "file",
            "tags",
            "views_count",
            "is_bookmarked",
            "created_at",
        ]

    def get_is_bookmarked(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return UserBookmark.objects.filter(user=request.user, material=obj).exists()
        return False

class AcademicMaterialSerializer(serializers.ModelSerializer):
    subject_code = serializers.CharField(source="subject.code", read_only=True)
    subject_name = serializers.CharField(source="subject.name", read_only=True)
    semester = serializers.IntegerField(source="subject.semester", read_only=True)
    is_bookmarked = serializers.SerializerMethodField()
    pages = MaterialPageSerializer(many=True, read_only=True)
    pages_input = serializers.CharField(write_only=True, required=False, allow_blank=True)
    tags = SafeJSONField(required=False, default=list)

    class Meta:
        model = AcademicMaterial
        fields = [
            "id",
            "subject",
            "subject_code",
            "subject_name",
            "semester",
            "title",
            "material_type",
            "academic_year",
            "unit_number",
            "summary",
            "page_count",
            "preview_pages_count",
            "is_free",
            "is_topper_verified",
            "file",
            "tags",
            "views_count",
            "is_bookmarked",
            "pages",
            "pages_input",
            "created_at",
        ]

    def to_internal_value(self, data):
        data = data.copy() if hasattr(data, "copy") else dict(data)

        if not data.get("subject"):
            first_sub = Subject.objects.first()
            if first_sub:
                data["subject"] = str(first_sub.id)

        if not data.get("material_type"):
            data["material_type"] = "NOTES"

        if not data.get("academic_year"):
            data["academic_year"] = "2026-2027"

        # Handle FormData string conversions  

        if "is_free" in data:
            val = str(data["is_free"]).lower()
            data["is_free"] = val in ["true", "1", "yes"]

        if "is_topper_verified" in data:
            val = str(data["is_topper_verified"]).lower()
            data["is_topper_verified"] = val in ["true", "1", "yes"]

        if "unit_number" in data:
            try:
                data["unit_number"] = int(data["unit_number"]) if data["unit_number"] not in [None, "", "null"] else None
            except (ValueError, TypeError):
                data["unit_number"] = 1

        if "page_count" in data:
            try:
                data["page_count"] = int(data["page_count"]) if data["page_count"] not in [None, "", "null"] else 1
            except (ValueError, TypeError):
                data["page_count"] = 1

        if "tags" in data:
            tags_val = data["tags"]
            if isinstance(tags_val, str):
                try:
                    parsed = json.loads(tags_val)
                    data["tags"] = parsed if isinstance(parsed, list) else [str(parsed)]
                except Exception:
                    data["tags"] = [t.strip() for t in tags_val.split(",") if t.strip()]

        return super().to_internal_value(data)

    def create(self, validated_data):
        pages_input = validated_data.pop("pages_input", None)
        pages_list = []
        if pages_input:
            if isinstance(pages_input, str):
                try:
                    pages_list = json.loads(pages_input)
                except Exception:
                    pages_list = []
            elif isinstance(pages_input, list):
                pages_list = pages_input

        if pages_list:
            validated_data["page_count"] = len(pages_list)

        material = super().create(validated_data)
        
        pages_list = None
        if pages_input:
            if isinstance(pages_input, str):
                try:
                    pages_list = json.loads(pages_input)
                except Exception:
                    pages_list = []
            elif isinstance(pages_input, list):
                pages_list = pages_input

        if material.file:
            from Apps.Academic.document_processor import extract_and_populate_pages
            extract_and_populate_pages(material)
        elif pages_list:
            for p in pages_list:
                p_num = p.get("page_number") or 1
                p_title = p.get("page_title") or f"Page {p_num}"
                p_content = p.get("content_html") or p.get("content") or ""
                MaterialPage.objects.create(
                    material=material,
                    page_number=p_num,
                    page_title=p_title,
                    content_html=p_content,
                )
        return material

    def update(self, instance, validated_data):
        pages_input = validated_data.pop("pages_input", None)
        material = super().update(instance, validated_data)

        if material.file and not pages_input:
            from Apps.Academic.document_processor import extract_and_populate_pages
            extract_and_populate_pages(material)
            return material

        pages_list = None
        if pages_input is not None:
            if isinstance(pages_input, str):
                try:
                    pages_list = json.loads(pages_input)
                except Exception:
                    pages_list = []
            elif isinstance(pages_input, list):
                pages_list = pages_input

        if pages_list is not None and len(pages_list) > 0:
            MaterialPage.objects.filter(material=material).delete()
            for p in pages_list:
                p_num = p.get("page_number") or 1
                p_title = p.get("page_title") or f"Page {p_num}"
                p_content = p.get("content_html") or p.get("content") or ""
                MaterialPage.objects.create(
                    material=material,
                    page_number=p_num,
                    page_title=p_title,
                    content_html=p_content,
                )
            material.page_count = len(pages_list) or 1
            material.save(update_fields=["page_count"])
        elif material.file:
            from Apps.Academic.document_processor import extract_and_populate_pages
            extract_and_populate_pages(material)

        return material

    def get_is_bookmarked(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return UserBookmark.objects.filter(user=request.user, material=obj).exists()
        return False

class LabExperimentSerializer(serializers.ModelSerializer):
    subject_code = serializers.CharField(source="subject.code", read_only=True)
    subject_name = serializers.CharField(source="subject.name", read_only=True)
    procedure_steps = SafeJSONField(required=False, default=list)
    code_snippets = SafeJSONField(required=False, default=dict)
    viva_questions = SafeJSONField(required=False, default=list)

    class Meta:
        model = LabExperiment
        fields = [
            "id",
            "subject",
            "subject_code",
            "subject_name",
            "experiment_number",
            "title",
            "aim",
            "apparatus_required",
            "theory",
            "procedure_steps",
            "code_snippets",
            "output_sample",
            "viva_questions",
        ]

class DepartmentNoticeSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source="department.name", read_only=True)
    department_code = serializers.CharField(source="department.code", read_only=True)
    program_name = serializers.CharField(source="program.name", read_only=True)
    program_code = serializers.CharField(source="program.code", read_only=True)
    is_read = serializers.SerializerMethodField()

    def get_is_read(self, obj):
        request = self.context.get("request")
        if request and request.user and request.user.is_authenticated:
            return NoticeReadReceipt.objects.filter(user=request.user, notice=obj).exists()
        return False

    class Meta:
        model = DepartmentNotice
        fields = [
            "id",
            "department",
            "department_name",
            "department_code",
            "program",
            "program_name",
            "program_code",
            "title",
            "content",
            "category",
            "priority",
            "tag",
            "target_semester",
            "target_section",
            "is_broadcast_all",
            "reference_number",
            "published_by",
            "published_at",
            "is_read",
        ]


class SidebarBadgeConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = SidebarBadgeConfig
        fields = [
            "id",
            "label",
            "badge_text",
            "badge_variant",
            "is_active",
            "display_order",
            "updated_at",
        ]


class SiteBannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteBanner
        fields = [
            "id",
            "title",
            "message",
            "tag",
            "variant",
            "target",
            "link_url",
            "link_text",
            "is_active",
            "is_dismissible",
            "priority",
            "created_at",
            "updated_at",
        ]


class NewsletterSubscriberSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsletterSubscriber
        fields = [
            "id",
            "email",
            "is_active",
            "source",
            "subscribed_at",
            "unsubscribed_at",
        ]


class MarketingBroadcastLogSerializer(serializers.ModelSerializer):
    sent_by_name = serializers.SerializerMethodField()

    class Meta:
        model = MarketingBroadcastLog
        fields = [
            "id",
            "subject",
            "preheader",
            "audience",
            "content_html",
            "total_targeted",
            "total_delivered",
            "total_failed",
            "status",
            "sent_by",
            "sent_by_name",
            "created_at",
        ]

    def get_sent_by_name(self, obj):
        if obj.sent_by:
            return getattr(obj.sent_by, "full_name", "") or obj.sent_by.email
        return "Academic System Dispatcher"



