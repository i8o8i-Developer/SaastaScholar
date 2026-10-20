import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone

class MaterialType(models.TextChoices):
    NOTES = "NOTES", "Handwritten Unit Notes"
    SOLVED_PYQ = "SOLVED_PYQ", "Solved PYQ Paper (2020-2025)"
    FORMULA_SHEET = "FORMULA_SHEET", "Master Formula Sheet"
    LAB_MANUAL = "LAB_MANUAL", "Verified Lab Manual"
    VIVA_BANK = "VIVA_BANK", "Viva Voce Question Bank"
    SYLLABUS = "SYLLABUS", "University Curriculum Breakdown"
    FACULTY = "FACULTY", "Faculty Handouts & Materials"

class Department(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    head_of_department = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.name} ({self.code})"

class ProgramSpecialization(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name="programs")
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, unique=True)
    degree_level = models.CharField(max_length=50, default="Undergraduate")
    duration_years = models.PositiveSmallIntegerField(default=4)
    total_semesters = models.PositiveSmallIntegerField(default=8)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ["department", "name"]

    def __str__(self):
        return f"{self.name} ({self.code})"

class SectionBatch(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    program = models.ForeignKey(ProgramSpecialization, on_delete=models.CASCADE, related_name="sections", null=True, blank=True)
    semester = models.PositiveSmallIntegerField(default=1)
    section_name = models.CharField(max_length=10, default="A")
    batch_code = models.CharField(max_length=50, default="2026-2027 Batch")
    academic_year = models.CharField(max_length=20, default="2026-2027")
    max_capacity = models.PositiveIntegerField(default=60)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ["semester", "section_name"]
        unique_together = ("program", "semester", "section_name", "batch_code")

    def __str__(self):
        prog_name = self.program.name if self.program else "General"
        return f"{prog_name} - Sem {self.semester} ({self.section_name}) - {self.batch_code}"

class Subject(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name="subjects")
    programs = models.ManyToManyField(ProgramSpecialization, blank=True, related_name="subjects")
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, unique=True)
    short_name = models.CharField(max_length=50, blank=True, default="")
    semester = models.PositiveSmallIntegerField(default=1, db_index=True)
    credits = models.PositiveSmallIntegerField(default=4)
    faculty_name = models.CharField(max_length=255, blank=True)
    icon_name = models.CharField(max_length=50, default="BookOpen")
    color_accent = models.CharField(max_length=50, default="emerald")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["semester", "code"]

    def __str__(self):
        return f"{self.code}: {self.name} (Sem {self.semester})"

class SubjectUnit(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name="units")
    unit_number = models.PositiveSmallIntegerField(default=1)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    topics = models.JSONField(default=list, blank=True)
    marks_weightage = models.PositiveSmallIntegerField(default=15)
    estimated_hours = models.PositiveSmallIntegerField(default=10)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["subject", "unit_number"]
        unique_together = ("subject", "unit_number")

    def __str__(self):
        return f"[{self.subject.code}] Unit {self.unit_number}: {self.title}"

class AcademicMaterial(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name="materials")
    title = models.CharField(max_length=255)
    material_type = models.CharField(max_length=40, choices=MaterialType.choices, default=MaterialType.NOTES, db_index=True)
    academic_year = models.CharField(max_length=20, default="2026-2027", db_index=True)
    unit_number = models.PositiveSmallIntegerField(null=True, blank=True, db_index=True)
    summary = models.TextField(blank=True)
    page_count = models.PositiveIntegerField(default=1)
    preview_pages_count = models.PositiveIntegerField(default=3)
    is_free = models.BooleanField(default=False)
    is_topper_verified = models.BooleanField(default=True)
    file = models.FileField(upload_to="academic_materials/", null=True, blank=True)
    tags = models.JSONField(default=list, blank=True)
    views_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["subject__semester", "subject__code", "unit_number", "title"]

    def __str__(self):
        return f"[{self.subject.code}] {self.title}"

class MaterialPage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    material = models.ForeignKey(AcademicMaterial, on_delete=models.CASCADE, related_name="pages")
    page_number = models.PositiveIntegerField()
    page_title = models.CharField(max_length=255, blank=True)
    content_html = models.TextField(help_text="Encrypted vector/html payload rendered strictly inside DRM canvas")
    diagram_svg = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["page_number"]
        unique_together = ("material", "page_number")

class LabExperiment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name="experiments")
    experiment_number = models.PositiveSmallIntegerField()
    title = models.CharField(max_length=255)
    aim = models.TextField()
    apparatus_required = models.TextField(blank=True)
    theory = models.TextField(blank=True)
    procedure_steps = models.JSONField(default=list)
    code_snippets = models.JSONField(default=dict, help_text="Multi-language implementations: python, cpp, java, sql")
    output_sample = models.TextField(blank=True)
    viva_questions = models.JSONField(default=list, help_text="Array of {q, a} flashcard questions")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["subject", "experiment_number"]

class UserBookmark(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="bookmarks")
    material = models.ForeignKey(AcademicMaterial, on_delete=models.CASCADE, related_name="bookmarked_by")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "material")

class DepartmentNotice(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name="notices", null=True, blank=True)
    program = models.ForeignKey(ProgramSpecialization, on_delete=models.CASCADE, related_name="notices", null=True, blank=True)
    title = models.CharField(max_length=255)
    content = models.TextField()
    category = models.CharField(max_length=50, default="Examination")
    priority = models.CharField(max_length=20, default="HIGH")
    tag = models.CharField(max_length=50, default="Exam Cell")
    target_semester = models.PositiveSmallIntegerField(null=True, blank=True, help_text="Target Semester or null for All")
    target_section = models.CharField(max_length=10, blank=True, help_text="Target Section or blank for All")
    is_broadcast_all = models.BooleanField(default=True)
    reference_number = models.CharField(max_length=100, blank=True)
    published_by = models.CharField(max_length=255, default="Academic Dean & Controller Of Examinations")
    published_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-published_at"]

    def __str__(self):
        return f"{self.title} ({self.category})"


class NoticeReadReceipt(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="read_notices")
    notice = models.ForeignKey(DepartmentNotice, on_delete=models.CASCADE, related_name="read_receipts")
    read_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Notice Read Receipt"
        verbose_name_plural = "Notice Read Receipts"
        unique_together = ("user", "notice")

    def __str__(self):
        return f"{self.user} read {self.notice.title}"


class SidebarBadgeConfig(models.Model):
    id = models.CharField(primary_key=True, max_length=50) # e.g. "notes", "pyqs", "labs", "assignments", "planner", "notices"
    label = models.CharField(max_length=100) # e.g. "Handwritten Notes"
    badge_text = models.CharField(max_length=50, blank=True, default="")
    badge_variant = models.CharField(max_length=30, default="emerald")
    is_active = models.BooleanField(default=True)
    display_order = models.PositiveSmallIntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["display_order", "id"]

    def __str__(self):
        return f"{self.label}: [{self.badge_text}] ({'Active' if self.is_active else 'Disabled'})"


class BannerVariant(models.TextChoices):
    EMERALD = "emerald", "Emerald Glow"
    AMBER = "amber", "Amber Warning"
    ROSE = "rose", "Rose Urgent"
    PURPLE = "purple", "Purple Event"
    CYAN = "cyan", "Cyan Info"
    GRADIENT = "gradient", "Multi-Color Rainbow"


class BannerTarget(models.TextChoices):
    ALL = "ALL", "Everywhere (Dashboard + Landing Page)"
    DASHBOARD = "DASHBOARD", "Student Dashboard Only"
    WEBSITE = "WEBSITE", "Landing Page / Website Only"


class SiteBanner(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    message = models.TextField(help_text="Banner Markdown Message Or Announcement Details")
    tag = models.CharField(max_length=50, default="Announcement", help_text="Badge Text e.g. 'NEW', 'URGENT', 'SIH 2026'")
    variant = models.CharField(max_length=30, choices=BannerVariant.choices, default=BannerVariant.EMERALD)
    target = models.CharField(max_length=30, choices=BannerTarget.choices, default=BannerTarget.ALL)
    link_url = models.CharField(max_length=500, blank=True, default="", help_text="Destination Link (e.g. https://... or /dashboard?tab=notices)")
    link_text = models.CharField(max_length=100, blank=True, default="Learn More", help_text="Button Text")
    is_active = models.BooleanField(default=True, db_index=True)
    is_dismissible = models.BooleanField(default=True, help_text="Allow Students To Close The Banner")
    priority = models.PositiveSmallIntegerField(default=1, help_text="Higher Priority Shows First")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-priority", "-created_at"]

    def __str__(self):
        return f"[{self.tag}] {self.title} ({'Active' if self.is_active else 'Inactive'})"

