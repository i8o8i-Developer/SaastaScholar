import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone

class SupportTicket(models.Model):
    STATUS_CHOICES = [
        ("OPEN", "Open"),
        ("IN_PROGRESS", "In Progress"),
        ("RESOLVED", "Resolved"),
        ("CLOSED", "Closed"),
    ]

    PRIORITY_CHOICES = [
        ("LOW", "Low"),
        ("MEDIUM", "Medium"),
        ("HIGH", "High"),
        ("URGENT", "Critical / Urgent"),
    ]

    CATEGORY_CHOICES = [
        ("ACADEMIC", "Academic & Notes"),
        ("EXAMS", "Exams & PYQs"),
        ("LABS", "Lab Manuals & Practical"),
        ("TIMETABLE", "Timetable & Slots"),
        ("FEE", "Fee & Subscription"),
        ("TECHNICAL", "Technical & Portal"),
        ("GENERAL", "General Inquiries"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ticket_number = models.CharField(max_length=50, blank=True, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="support_tickets")
    subject = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default="GENERAL", db_index=True)
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default="MEDIUM", db_index=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="OPEN", db_index=True)
    admin_response = models.TextField(blank=True)
    admin_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at", "-created_at"]

    def save(self, *args, **kwargs):
        if not self.ticket_number:
            count = SupportTicket.objects.count() + 1001
            self.ticket_number = f"NW-TKT-{count}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.ticket_number}: {self.subject} ({self.status})"

class TicketMessage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ticket = models.ForeignKey(SupportTicket, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="ticket_messages")
    message = models.TextField()
    is_staff_reply = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"Message by {self.sender} on {self.ticket.ticket_number}"

class ForumPost(models.Model):
    CATEGORY_CHOICES = [
        ("General", "General Discussions"),
        ("Academics", "Course & Notes"),
        ("Examinations", "Exams & Solved PYQs"),
        ("Placements", "Placements & Internships"),
        ("Technical", "Coding & Tech Stack"),
        ("Campus", "Campus & Events"),
        ("Announcements", "Official Announcements"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="forum_posts")
    title = models.CharField(max_length=255)
    content = models.TextField()
    category = models.CharField(max_length=100, default="General", db_index=True)
    is_pinned = models.BooleanField(default=False, db_index=True)
    is_locked = models.BooleanField(default=False)
    upvotes = models.PositiveIntegerField(default=0)
    upvoted_by = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name="upvoted_posts", blank=True)
    tags = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-is_pinned", "-created_at"]

    def __str__(self):
        return f"[{self.category}] {self.title}"

class ForumComment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    post = models.ForeignKey(ForumPost, on_delete=models.CASCADE, related_name="comments")
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="forum_comments")
    parent_comment = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name="replies")
    content = models.TextField()
    upvotes = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"Comment by {self.author} on {self.post.title}"
