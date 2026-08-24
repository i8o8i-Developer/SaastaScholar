import uuid
from django.db import models
from django.conf import settings
from Apps.Academic.models import Subject

class DayOfWeek(models.TextChoices):
    MON = "Mon", "Monday"
    TUE = "Tue", "Tuesday"
    WED = "Wed", "Wednesday"
    THU = "Thu", "Thursday"
    FRI = "Fri", "Friday"
    SAT = "Sat", "Saturday"
    SUN = "Sun", "Sunday"

class EventType(models.TextChoices):
    CLASS = "Class", "Theory Class"
    PRACTICAL = "Practical", "Lab Practical"
    TASK = "Task", "Study Block"
    DEADLINE = "Deadline", "Submission Deadline"
    PROJECT = "Project", "Project Milestone"

class TimetableSlot(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    semester = models.PositiveSmallIntegerField(default=1)
    section = models.CharField(max_length=10, default="A")
    day_of_week = models.CharField(max_length=10, choices=DayOfWeek.choices)
    start_time = models.CharField(max_length=10)  # e.g. "09:00"
    end_time = models.CharField(max_length=10)    # e.g. "10:30"
    title = models.CharField(max_length=255)
    subject = models.ForeignKey(Subject, on_delete=models.SET_NULL, null=True, blank=True, related_name="timetable_slots")
    room_number = models.CharField(max_length=100, blank=True, default="LT-01")
    faculty_name = models.CharField(max_length=255, blank=True)
    meta_info = models.CharField(max_length=255, blank=True)
    event_type = models.CharField(max_length=20, choices=EventType.choices, default=EventType.CLASS)
    tone = models.CharField(max_length=20, default="green")

    class Meta:
        ordering = ["day_of_week", "start_time"]

    def __str__(self):
        return f"{self.day_of_week} {self.start_time}-{self.end_time}: {self.title}"

class PersonalStudyTask(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="study_tasks")
    title = models.CharField(max_length=255)
    date = models.DateField()
    time = models.CharField(max_length=10, blank=True, default="18:30")
    is_completed = models.BooleanField(default=False)
    priority = models.CharField(max_length=20, default="MEDIUM")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["date", "time"]

    def __str__(self):
        return f"{self.title} ({self.date})"

class MilestoneCountdown(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    target_date = models.DateField()
    category = models.CharField(max_length=100, default="Examination")
    semester = models.PositiveSmallIntegerField(default=1)
    tag = models.CharField(max_length=50, default="Term 1")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["target_date"]

    def __str__(self):
        return f"{self.title} ({self.target_date})"
