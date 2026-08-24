import uuid
from django.db import models
from django.conf import settings
from Apps.Academic.models import Subject

class AssignmentStatus(models.TextChoices):
    PENDING = "PENDING", "Pending"
    IN_PROGRESS = "IN_PROGRESS", "In Progress"
    SUBMITTED = "SUBMITTED", "Submitted"
    EVALUATED = "EVALUATED", "Evaluated"

class StudentAssignment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="assignments")
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name="assignments")
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    due_date = models.DateField()
    total_marks = models.PositiveIntegerField(default=20)
    obtained_marks = models.PositiveIntegerField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=AssignmentStatus.choices, default=AssignmentStatus.PENDING)
    ai_outline_json = models.JSONField(default=list, blank=True)
    citation_format = models.CharField(max_length=50, default="IEEE")
    citations_list = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["due_date"]

    def __str__(self):
        return f"{self.title} ({self.subject.code})"
