from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from .models import StudentUser, SecuritySession, AdminAuditLog, AdminRole

class AdminRoleSerializer(serializers.ModelSerializer):
    users_count = serializers.SerializerMethodField()

    class Meta:
        model = AdminRole
        fields = [
            "id",
            "name",
            "description",
            "is_system_role",
            "permissions",
            "users_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "is_system_role", "created_at", "updated_at"]

    def get_users_count(self, obj):
        return obj.admin_users.count()

class AdminStaffUserSerializer(serializers.ModelSerializer):
    admin_role_name = serializers.CharField(source="admin_role.name", read_only=True)
    admin_permissions = serializers.SerializerMethodField()

    class Meta:
        model = StudentUser
        fields = [
            "id",
            "email",
            "username",
            "full_name",
            "phone_number",
            "is_staff",
            "is_superuser",
            "is_active",
            "admin_role",
            "admin_role_name",
            "admin_permissions",
            "created_at",
            "last_login",
        ]
        read_only_fields = ["id", "created_at", "last_login", "admin_role_name", "admin_permissions"]

    def get_admin_permissions(self, obj):
        if obj.is_superuser:
            return {"*": {"view": True, "manage": True, "delete": True, "security": True}}
        if obj.admin_role:
            return obj.admin_role.permissions
        return {}

class StudentUserSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()
    active_sessions_count = serializers.SerializerMethodField()
    program_code = serializers.SerializerMethodField()
    admin_role_name = serializers.CharField(source="admin_role.name", read_only=True)
    admin_permissions = serializers.SerializerMethodField()

    class Meta:
        model = StudentUser
        fields = [
            "id",
            "email",
            "username",
            "full_name",
            "phone_number",
            "bio",
            "academic_focus",
            "career_goal",
            "university",
            "department",
            "program",
            "program_code",
            "semester",
            "section",
            "roll_number",
            "enrollment_no",
            "avatar_url",
            "access_tier",
            "target_cgpa",
            "current_cgpa",
            "is_verified",
            "is_staff",
            "is_superuser",
            "is_active",
            "admin_role",
            "admin_role_name",
            "admin_permissions",
            "is_drm_blocked",
            "is_login_blocked",
            "cooldown_until",
            "block_reason",
            "security_warning_note",
            "drm_violations_count",
            "active_sessions_count",
            "created_at",
        ]
        read_only_fields = ["id", "is_verified", "is_staff", "is_superuser", "created_at", "admin_role_name", "admin_permissions"]

    def get_admin_permissions(self, obj):
        if obj.is_superuser:
            return {"*": {"view": True, "manage": True, "delete": True, "security": True}}
        if obj.admin_role:
            return obj.admin_role.permissions
        return {}

    def get_avatar_url(self, obj):
        if obj.avatar_image:
            return obj.avatar_image.url
        if obj.avatar_url:
            if "/media/" in obj.avatar_url:
                return "/media/" + obj.avatar_url.split("/media/", 1)[1]
            return obj.avatar_url
        return None

    def get_active_sessions_count(self, obj):
        annotated = getattr(obj, "active_sessions_annotated", None)
        if annotated is not None:
            return annotated
        return obj.security_sessions.filter(is_revoked=False).count()

    def _get_program_lookup(self):
        cached_local = getattr(self, "_cached_programs_list", None)
        if cached_local is not None:
            return cached_local
        try:
            from django.core.cache import cache
            cached = cache.get("accounts:program_code_lookup")
            if cached is not None:
                self._cached_programs_list = cached
                return cached
        except Exception:
            pass
        try:
            from Apps.Academic.models import ProgramSpecialization
            items = list(ProgramSpecialization.objects.values_list("name", "code"))
            self._cached_programs_list = items
            try:
                from django.core.cache import cache
                cache.set("accounts:program_code_lookup", items, timeout=120)
            except Exception:
                pass
            return items
        except Exception:
            self._cached_programs_list = []
            return []

    def get_program_code(self, obj):
        if not obj.program:
            return "Academic"
        p = obj.program.strip()
        p_lower = p.lower()
        try:
            programs = self._get_program_lookup()
            for name, code in programs:
                if (name and name.lower() == p_lower) or (code and code.lower() == p_lower):
                    if code:
                        return code
            for name, code in programs:
                c_name = (name or "").lower()
                c_code = (code or "").lower()
                if (c_name and (c_name in p_lower or p_lower in c_name)) or (c_code and c_code in p_lower):
                    if code:
                        return code
        except Exception:
            pass

        import re
        tokens = re.findall(r'[A-Za-z0-9]+', p)
        substantive = [t for t in tokens if t.lower() not in ["in", "and", "of", "the", "hons", "honours"]]
        if substantive:
            if len(substantive) == 1:
                return substantive[0].upper()[:8]
            prefix = substantive[0].upper()
            suffix = "".join(t[0].upper() for t in substantive[1:])
            return f"{prefix}-{suffix}" if suffix else prefix
        return p[:10].upper()

    def validate_email(self, value):
        if not value:
            raise serializers.ValidationError("Student Email Address Is Required.")
        email_clean = str(value).strip().lower()
        
        #
        domain = email_clean.split("@")[-1] if "@" in email_clean else ""
        typo_domains = [
            "student.nimsuniversity.org",
        ]
        
        if domain in typo_domains or "nims" in domain:
            prefix = email_clean.split("@")[0]
            email_clean = f"{prefix}@student.nimsuniversity.org"
            
        instance = getattr(self, "instance", None)
        existing = StudentUser.objects.filter(email__iexact=email_clean)
        if instance:
            existing = existing.exclude(id=instance.id)
        if existing.exists():
            raise serializers.ValidationError(f"The Email Address '{email_clean}' Is Already Registered.")
            
        return email_clean

    def update(self, instance, validated_data):
        if "email" in validated_data:
            instance.username = validated_data["email"]
        return super().update(instance, validated_data)


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    target_cgpa = serializers.DecimalField(max_digits=4, decimal_places=2, required=False, allow_null=True)
    current_cgpa = serializers.DecimalField(max_digits=4, decimal_places=2, required=False, allow_null=True)

    class Meta:
        model = StudentUser
        fields = [
            "email",
            "password",
            "full_name",
            "phone_number",
            "department",
            "program",
            "semester",
            "section",
            "roll_number",
            "enrollment_no",
            "target_cgpa",
            "current_cgpa",
            "access_tier",
        ]

    def validate_full_name(self, value):
        if not value:
            raise serializers.ValidationError("Student Full Name Is Required.")
        name_clean = str(value).strip()
        dummy_names = ["test", "fake", "dummy", "sample", "tester", "temp", "asdf", "testing", "demo"]
        name_lower = name_clean.lower()
        words = name_lower.split()
        if any(dk in words for dk in dummy_names) or name_lower in dummy_names:
            raise serializers.ValidationError("Real Student Name Required. Dummy Or Test Names (e.g., 'test', 'fake', 'dummy') Are Strictly Prohibited.")
        return name_clean

    def validate_email(self, value):
        if not value:
            raise serializers.ValidationError("Student Email Address Is Required.")
        email_clean = str(value).strip().lower()
        
        prefix = email_clean.split("@")[0] if "@" in email_clean else ""
        domain = email_clean.split("@")[-1] if "@" in email_clean else ""

        typo_domains = [
            "student.nimsuniversity.org",
        ]
        
        if domain in typo_domains or "nims" in domain:
            email_clean = f"{prefix}@student.nimsuniversity.org"
            domain = "student.nimsuniversity.org"

        allowed_exact_domains = ["gmail.com", "student.nimsuniversity.org"]
        if domain not in allowed_exact_domains:
            raise serializers.ValidationError(
                "Registration Is Strictly Permitted Only For @student.nimsuniversity.org Or Verified @gmail.com Email Addresses."
            )

        # Every @gmail.com email address is permitted (verified via 6-digit OTP passcode)
        # For institutional emails (@student.nimsuniversity.org), strictly prohibit dummy student prefixes
        if domain != "gmail.com":
            dummy_keywords = ["test", "fake", "dummy", "temp", "testing", "asdf", "sample", "null", "admin", "tester", "demo"]
            prefix_lower = prefix.lower()
            if prefix_lower in dummy_keywords or any(prefix.startswith(f"{dk}.") or prefix.startswith(f"{dk}_") or prefix.startswith(f"{dk}-") for dk in dummy_keywords):
                raise serializers.ValidationError("Dummy, Test, And Fake Student Identifiers Are Strictly Prohibited On Institutional Accounts.")
            
        if StudentUser.objects.filter(email__iexact=email_clean).exists():
            raise serializers.ValidationError(f"An Account With Email '{email_clean}' Already Exists. Please Sign In Directly Instead.")
            
        return email_clean

    def create(self, validated_data):
        password = validated_data.pop("password")
        email = validated_data.get("email")
        validated_data["username"] = email
        # Security Policy: All Newly Registered Scholars Must Begin At FREE Tier
        # Plan Upgrades Occur Strictly Upon Real Verified Razorpay Payment Capture
        validated_data["access_tier"] = "FREE"
        user = StudentUser(**validated_data)
        user.set_password(password)
        user.save()
        return user

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    portal = serializers.CharField(required=False, allow_blank=True, write_only=True)

    def validate(self, attrs):
        raw_email = str(attrs.get(self.username_field) or "").strip()
        if raw_email:
            matched_user = StudentUser.objects.filter(email__iexact=raw_email).first()
            if matched_user:
                attrs[self.username_field] = matched_user.email
            else:
                attrs[self.username_field] = raw_email.lower()

        data = super().validate(attrs)
        
        # Enforce Strict Portal / Role Context Segregation
        portal = str(self.initial_data.get("portal") or attrs.get("portal") or "").strip().lower()
        is_admin_user = bool(
            self.user.is_staff or 
            self.user.is_superuser or 
            getattr(self.user, "admin_role_id", None) is not None or
            getattr(self.user, "email", "").lower() in ("admin@nims.edu.in", "admin@saastascholar.in")
        )
        if is_admin_user and getattr(self.user, "admin_role_id", None) is not None and not self.user.is_staff:
            self.user.is_staff = True
            self.user.save(update_fields=["is_staff"])

        if portal == "student":
            if is_admin_user:
                raise serializers.ValidationError({
                    "detail": "Access Denied: Administrator Credentials Detected. Administrator Accounts Must Sign In Exclusively Through The Admin Portal."
                })
        elif portal == "admin":
            if not is_admin_user:
                raise serializers.ValidationError({
                    "detail": "Access Denied: Administrative Clearance Required. Student Scholars Must Sign In Exclusively Through The Student Portal."
                })

        # Check login block
        if self.user.is_login_blocked or not self.user.is_active:
            reason = self.user.block_reason or "Account Suspended Due To Disciplinary/Security Violation."
            raise serializers.ValidationError({"detail": f"Account Suspended: {reason}"})

        # Check cooldown
        from django.utils import timezone
        if self.user.cooldown_until and self.user.cooldown_until > timezone.now():
            diff = self.user.cooldown_until - timezone.now()
            hours = int(diff.total_seconds() // 3600)
            minutes = int((diff.total_seconds() % 3600) // 60)
            raise serializers.ValidationError({
                "detail": f"Account In Security Cooldown Period ({hours}h {minutes}m Remaining) Until {self.user.cooldown_until.strftime('%Y-%m-%d %H:%M:%S UTC')}."
            })

        data["user"] = StudentUserSerializer(self.user).data
        return data

class AdminAuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminAuditLog
        fields = [
            "id",
            "actor",
            "actor_email",
            "actor_name",
            "target_user",
            "target_email",
            "target_name",
            "action_type",
            "reason",
            "metadata",
            "ip_address",
            "timestamp",
        ]
        read_only_fields = ["id", "timestamp"]
