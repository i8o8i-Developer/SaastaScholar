import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models

class AccessTier(models.TextChoices):
    FREE = "FREE", "Free"
    BASIC = "BASIC", "Basic"
    PREMIUM = "PREMIUM", "Premium"
    ELITE = "ELITE", "Elite"
    # Legacy backwards compatibility
    STARTER = "STARTER", "Free"
    SCHOLAR = "SCHOLAR", "Basic"
    ACHIEVER = "ACHIEVER", "Premium"
    ELITE_PLUS = "ELITE_PLUS", "Elite"
    SEMESTER_TOPPER = "SEMESTER_TOPPER", "Premium"
    VIP = "VIP", "Elite"


class StudentUser(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255, blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    bio = models.TextField(blank=True, default="")
    academic_focus = models.CharField(max_length=255, blank=True, default="")
    career_goal = models.CharField(max_length=255, blank=True, default="")
    
    # Institutional University Details
    university = models.CharField(max_length=255, default="NIMS University, Rajasthan")
    department = models.CharField(max_length=255, default="Department Of Computer Science & Engineering")
    program = models.CharField(max_length=255, default="B.Tech AI & ML")
    semester = models.PositiveSmallIntegerField(default=1, db_index=True)
    section = models.CharField(max_length=10, default="A", db_index=True)
    roll_number = models.CharField(max_length=50, blank=True, default="24BCSE102", db_index=True)
    enrollment_no = models.CharField(max_length=50, blank=True, default="NIMS2026-CS-8942", db_index=True)
    avatar_url = models.CharField(max_length=500, blank=True, null=True)
    avatar_image = models.FileField(upload_to="avatars/", null=True, blank=True)
    
    # Subscriptions & Security
    access_tier = models.CharField(
        max_length=30,
        choices=AccessTier.choices,
        default=AccessTier.STARTER,
        db_index=True,
    )
    is_verified = models.BooleanField(default=True)
    target_cgpa = models.DecimalField(max_digits=4, decimal_places=2, default=9.50)
    current_cgpa = models.DecimalField(max_digits=4, decimal_places=2, default=9.12)

    # DRM Security & Disciplinary Controls
    is_drm_blocked = models.BooleanField(default=False, db_index=True, help_text="Restricts student from reading DRM-protected materials")
    is_login_blocked = models.BooleanField(default=False, db_index=True, help_text="Completely prevents authentication")
    cooldown_until = models.DateTimeField(null=True, blank=True, db_index=True, help_text="Temporary time-lock expiration timestamp")
    block_reason = models.TextField(blank=True, help_text="Mandatory administrative justification for block/suspension")
    security_warning_note = models.TextField(blank=True, help_text="Official disciplinary warning notice displayed to student")
    drm_violations_count = models.PositiveIntegerField(default=0, help_text="Aggregated security triggers counter")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    class Meta:
        verbose_name = "Student User"
        verbose_name_plural = "Student Users"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.full_name or self.username} ({self.roll_number})"

class SecuritySession(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(StudentUser, on_delete=models.CASCADE, related_name="security_sessions")
    ip_address = models.CharField(max_length=255, blank=True, default="127.0.0.1")
    user_agent = models.TextField(blank=True)
    device_fingerprint = models.CharField(max_length=255, blank=True)
    last_active = models.DateTimeField(auto_now=True)
    is_revoked = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-last_active"]

class ActionType(models.TextChoices):
    BLOCK_DRM = "BLOCK_DRM", "Block DRM Content Access"
    UNBLOCK_DRM = "UNBLOCK_DRM", "Unblock DRM Content Access"
    SUSPEND_LOGIN = "SUSPEND_LOGIN", "Suspend User Login"
    UNBAN_LOGIN = "UNBAN_LOGIN", "Reactivate User Login"
    SET_COOLDOWN = "SET_COOLDOWN", "Set Security Cooldown"
    REMOVE_COOLDOWN = "REMOVE_COOLDOWN", "Remove Security Cooldown"
    DISPATCH_WARNING = "DISPATCH_WARNING", "Dispatch Disciplinary Warning"
    CLEAR_WARNING = "CLEAR_WARNING", "Clear Disciplinary Warning"
    REVOKE_SESSIONS = "REVOKE_SESSIONS", "Revoke All Security Sessions"
    RESET_VIOLATIONS = "RESET_VIOLATIONS", "Reset Violations Counter"
    CHANGE_TIER = "CHANGE_TIER", "Change Access Tier"
    UPGRADE_TIER = "UPGRADE_TIER", "Upgrade Subscription Tier"
    DOWNGRADE_TIER = "DOWNGRADE_TIER", "Downgrade Subscription Tier"
    CHANGE_SECTION = "CHANGE_SECTION", "Change Class Section"
    BLOCK_STUDENT = "BLOCK_STUDENT", "Block Student Account"
    UNBLOCK_STUDENT = "UNBLOCK_STUDENT", "Unblock Student Account"
    RESET_PASSWORD = "RESET_PASSWORD", "Reset Student Password"
    REGISTER_STUDENT = "REGISTER_STUDENT", "Register Student Account"
    SEMESTER_UPGRADE = "SEMESTER_UPGRADE", "Semester Level Upgrade"
    SEMESTER_UPGRADE_BULK = "SEMESTER_UPGRADE_BULK", "Bulk Semester Level Upgrade"
    HARD_DELETE_USER = "HARD_DELETE_USER", "Hard Delete User Account"
    RESET_FRESH_USER = "RESET_FRESH_USER", "Reset User to Fresh Slate"
    GLOBAL_BULK_RESET = "GLOBAL_BULK_RESET", "Global Reset of All Security Locks"

class AdminAuditLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    actor = models.ForeignKey(StudentUser, on_delete=models.SET_NULL, null=True, related_name="actions_performed")
    actor_email = models.EmailField(blank=True)
    actor_name = models.CharField(max_length=255, blank=True)
    target_user = models.ForeignKey(StudentUser, on_delete=models.CASCADE, null=True, blank=True, related_name="audit_logs")
    target_email = models.EmailField(blank=True)
    target_name = models.CharField(max_length=255, blank=True)
    action_type = models.CharField(max_length=50, choices=ActionType.choices, db_index=True)
    reason = models.TextField(help_text="Administrative justification for the action")
    metadata = models.JSONField(default=dict, blank=True)
    ip_address = models.CharField(max_length=255, blank=True, default="127.0.0.1")
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-timestamp"]

    def save(self, *args, **kwargs):
        if self.actor:
            self.actor_email = self.actor.email
            self.actor_name = self.actor.full_name or self.actor.username
        if self.target_user:
            self.target_email = self.target_user.email
            self.target_name = self.target_user.full_name or self.target_user.username
        super().save(*args, **kwargs)

    def __str__(self):
        return f"[{self.timestamp}] {self.actor_email} -> {self.action_type} -> {self.target_email}"


class PasswordResetToken(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(db_index=True)
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    class Meta:
        ordering = ["-created_at"]

    def is_valid(self):
        from datetime import timedelta
        from django.utils import timezone
        return (not self.is_used) and (timezone.now() - self.created_at < timedelta(minutes=15))

    def __str__(self):
        return f"Reset OTP For {self.email} (Used: {self.is_used})"


class SignupVerificationToken(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(db_index=True)
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False)
    is_used = models.BooleanField(default=False)

    class Meta:
        ordering = ["-created_at"]

    def is_valid(self):
        from datetime import timedelta
        from django.utils import timezone
        return (not self.is_used) and (timezone.now() - self.created_at < timedelta(minutes=15))

    def __str__(self):
        return f"Signup OTP For {self.email} (Verified: {self.is_verified}, Used: {self.is_used})"

