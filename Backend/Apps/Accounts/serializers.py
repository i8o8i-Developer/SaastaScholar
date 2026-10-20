from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from .models import StudentUser, SecuritySession, AdminAuditLog

class StudentUserSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()
    active_sessions_count = serializers.SerializerMethodField()
    program_code = serializers.SerializerMethodField()

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
            "is_drm_blocked",
            "is_login_blocked",
            "cooldown_until",
            "block_reason",
            "security_warning_note",
            "drm_violations_count",
            "active_sessions_count",
            "created_at",
        ]
        read_only_fields = ["id", "is_verified", "is_staff", "is_superuser", "created_at"]

    def get_avatar_url(self, obj):
        if obj.avatar_image:
            return obj.avatar_image.url
        if obj.avatar_url:
            if "/media/" in obj.avatar_url:
                return "/media/" + obj.avatar_url.split("/media/", 1)[1]
            return obj.avatar_url
        return None

    def get_active_sessions_count(self, obj):
        return obj.security_sessions.filter(is_revoked=False).count()

    def get_program_code(self, obj):
        if not obj.program:
            return "Academic"
        p = obj.program.strip()
        try:
            from Apps.Academic.models import ProgramSpecialization
            from django.db.models import Q
            
            prog = ProgramSpecialization.objects.filter(Q(name__iexact=p) | Q(code__iexact=p)).first()
            if not prog:
                prog = ProgramSpecialization.objects.filter(Q(name__icontains=p) | Q(code__icontains=p)).first()
            if not prog:
                #
                p_lower = p.lower()
                for candidate in ProgramSpecialization.objects.all():
                    c_name = candidate.name.lower()
                    c_code = candidate.code.lower()
                    if c_name in p_lower or p_lower in c_name or c_code in p_lower:
                        prog = candidate
                        break
            if prog and prog.code:
                return prog.code
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
        data = super().validate(attrs)
        
        # Enforce Strict Portal / Role Context Segregation
        portal = str(self.initial_data.get("portal") or attrs.get("portal") or "").strip().lower()
        is_admin_user = bool(
            self.user.is_staff or 
            self.user.is_superuser or 
            getattr(self.user, "email", "") == "admin@nims.edu.in"
        )

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
