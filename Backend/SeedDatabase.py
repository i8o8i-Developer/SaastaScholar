import os
import sys
import django

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "Core.settings")
django.setup()

from Apps.Accounts.models import AccessTier, StudentUser
from Apps.Subscriptions.models import SubscriptionPlan
from Apps.Academic.models import SidebarBadgeConfig

def run_seed():
    print("=== Initializing Pure Real Database Slate for NimsWallah ===")

    # 1. Ensure Subscription Plans exist
    print("-> Configuring Subscription Plans...")
    SubscriptionPlan.objects.get_or_create(
        tier="FREE",
        defaults={
            "name": "Free Starter Plan",
            "tagline": "Explore Official Syllabus Breakdown & Core Starter Notes",
            "price_monthly": 0.00,
            "price_semester": 0.00,
            "is_popular": False,
            "badge": "Free Tier",
            "features_list": [
                "Official NIMS University Syllabus Breakdown",
                "1 Free Subject Solved Previous Year Question Archive Pack",
                "Daily Section A Timetable & Examination Reminders",
                "Verified Department & Examination Circulars Feed",
                "Standard DRM Web Viewer Access (2-Page Preview)",
            ],
        },
    )

    SubscriptionPlan.objects.get_or_create(
        tier="SEMESTER_TOPPER",
        defaults={
            "name": "Semester Topper Plan",
            "tagline": "Everything You Need To Secure A Top CGPA Rank",
            "price_monthly": 149.00,
            "price_semester": 499.00,
            "is_popular": True,
            "badge": "Most Popular",
            "features_list": [
                "All Unit-Wise Handwritten & Typed Topper Notes",
                "5-Year University Solved PYQs (2020–2025)",
                "Full DRM Unlocked PDF & Canvas Viewer",
                "Lab Manuals & Viva-Voce Question Banks",
                "Priority 24/7 Academic Ticket Support",
            ],
        },
    )

    SubscriptionPlan.objects.get_or_create(
        tier="VIP",
        defaults={
            "name": "VIP Academic Pass",
            "tagline": "Unlimited All-Access Pass Across All Departments",
            "price_monthly": 299.00,
            "price_semester": 899.00,
            "is_popular": False,
            "badge": "Institutional Tier",
            "features_list": [
                "All Departments & Programs Complete Access",
                "Interactive Viva Drills & Multi-Language Code Runtimes",
                "Personalized CGPA Target Goal Tracker & Analytics",
                "Direct Faculty Review Submissions",
                "All Future Semester Materials Unlocked",
            ],
        },
    )

    # 2. Configure Default Navigation Badges
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
    for b in DEFAULT_BADGES:
        SidebarBadgeConfig.objects.get_or_create(id=b["id"], defaults=b)

    # 3. Master Institutional Admin Account from Environment Variables
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@nims.edu.in").strip().lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "Admin@123")
    admin_name = os.environ.get("ADMIN_NAME", "Institutional Administrator")
    admin_phone = os.environ.get("ADMIN_PHONE", "+91 9876543210")
    admin_username = os.environ.get("ADMIN_USERNAME", admin_email.split("@")[0])

    print(f"-> Configuring Master Administrator Account ({admin_email})...")
    admin_user = StudentUser.objects.filter(email=admin_email).first()
    if not admin_user:
        admin_user = StudentUser.objects.filter(is_superuser=True).first()

    if admin_user:
        admin_user.email = admin_email
        admin_user.username = admin_username
        admin_user.full_name = admin_name
        admin_user.phone_number = admin_phone
        admin_user.is_staff = True
        admin_user.is_superuser = True
        admin_user.is_active = True
        admin_user.is_verified = True
        admin_user.access_tier = AccessTier.VIP
        admin_user.set_password(admin_password)
        admin_user.save()
        print(f"-> Master Administrator Account '{admin_email}' Synchronized & Ready With Environment Credentials.")
    else:
        admin_user = StudentUser.objects.create(
            email=admin_email,
            username=admin_username,
            full_name=admin_name,
            phone_number=admin_phone,
            university="NIMS University",
            department="Office Of Academic Affairs",
            program="Institutional Administration",
            semester=1,
            section="A",
            access_tier=AccessTier.VIP,
            target_cgpa=10.0,
            current_cgpa=10.0,
            is_verified=True,
            is_staff=True,
            is_superuser=True,
            is_active=True,
        )
        admin_user.set_password(admin_password)
        admin_user.save()
        print(f"-> Master Administrator Account Successfully Created: {admin_email}")

    print("=== Database Ready: Zero Dummy Data, Pure Clean State ===")

if __name__ == "__main__":
    run_seed()
