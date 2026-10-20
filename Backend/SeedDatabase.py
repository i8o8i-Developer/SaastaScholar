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
    print("=== Initializing Pure Real Database Slate for Saasta Scholar ===")

    # 1. Ensure Subscription Plans exist for all 4 Saasta Scholar Tiers
    print("-> Configuring Saasta Scholar 4-Tier Subscription Plans...")
    
    # Tier 1: Free (₹0)
    SubscriptionPlan.objects.update_or_create(
        tier="FREE",
        defaults={
            "name": "Free",
            "tagline": "Syllabus , Time Table , Faculty Materials , Notices , Exam Dates",
            "price_monthly": 0.00,
            "price_semester": 0.00,
            "is_popular": False,
            "badge": "Free Starter",
            "features_list": [
                "Official University Syllabus",
                "Daily Class Timetable",
                "Faculty Materials & Lecture Handouts",
                "Official Notices & Circulars",
                "Exam Dates & Hall Ticket Alerts",
            ],
        },
    )

    # Tier 2: Basic (₹99/mo)
    SubscriptionPlan.objects.update_or_create(
        tier="BASIC",
        defaults={
            "name": "Basic",
            "tagline": "Free + Handwritten Notes",
            "price_monthly": 99.00,
            "price_semester": 499.00,
            "is_popular": False,
            "badge": "Notes Pack",
            "features_list": [
                "Everything In Free Plan",
                "Complete Handwritten Unit Notes",
                "Chapter Formula Sheets & Cheat Decks",
                "High-Speed Mobile & PC Study Reader",
            ],
        },
    )

    # Tier 3: Premium (₹129/mo)
    SubscriptionPlan.objects.update_or_create(
        tier="PREMIUM",
        defaults={
            "name": "Premium",
            "tagline": "Basic + Handwritten Lab Manual And Viva Practice + PYQ Question Papers",
            "price_monthly": 129.00,
            "price_semester": 649.00,
            "is_popular": True,
            "badge": "Best Value · Most Popular",
            "features_list": [
                "Everything In Basic Plan",
                "Handwritten Lab Manuals & Codes",
                "Viva Voce Practice Q&A Bank (Top 50+)",
                "5+ Years Solved PYQ Question Papers",
                "Step-by-Step Model Answers",
            ],
        },
    )

    # Tier 4: Elite (₹159/mo)
    SubscriptionPlan.objects.update_or_create(
        tier="ELITE",
        defaults={
            "name": "Elite",
            "tagline": "Premium + Most Expected Question Paper + Sample Practice Question Papers",
            "price_monthly": 159.00,
            "price_semester": 799.00,
            "is_popular": False,
            "badge": "All-Inclusive VIP",
            "features_list": [
                "Everything In Premium Plan",
                "Most Expected Question Papers",
                "Sample Practice Question Papers & Mocks",
                "1-Click Complete Semester ZIP Download",
                "Priority 24/7 Academic Support",
            ],
        },
    )

    # Backwards Compatibility Aliases
    SubscriptionPlan.objects.update_or_create(tier="STARTER", defaults={"name": "Free", "tagline": "Syllabus , Time Table , Faculty Materials , Notices , Exam Dates", "price_monthly": 0, "price_semester": 0})
    SubscriptionPlan.objects.update_or_create(tier="SCHOLAR", defaults={"name": "Basic", "tagline": "Free + Handwritten Notes", "price_monthly": 99, "price_semester": 499})
    SubscriptionPlan.objects.update_or_create(tier="ACHIEVER", defaults={"name": "Premium", "tagline": "Basic + Handwritten Lab Manual And Viva Practice + PYQ Question Papers", "price_monthly": 129, "price_semester": 649, "is_popular": True})
    SubscriptionPlan.objects.update_or_create(tier="ELITE_PLUS", defaults={"name": "Elite", "tagline": "Premium + Most Expected Question Paper + Sample Practice Question Papers", "price_monthly": 159, "price_semester": 799})
    SubscriptionPlan.objects.get_or_create(tier="SEMESTER_TOPPER", defaults={"name": "Premium", "price_monthly": 129, "price_semester": 649, "is_popular": True})
    SubscriptionPlan.objects.get_or_create(tier="VIP", defaults={"name": "Elite", "price_monthly": 159, "price_semester": 799})

    # 2. Configure Default Navigation Badges
    DEFAULT_BADGES = [
        {"id": "notes", "label": "Handwritten Notes", "badge_text": "Top Notes", "badge_variant": "emerald", "is_active": True, "display_order": 1},
        {"id": "pyqs", "label": "Solved PYQs", "badge_text": "2020–25", "badge_variant": "emerald", "is_active": True, "display_order": 2},
        {"id": "faculty", "label": "Faculty Resources", "badge_text": "Uploads", "badge_variant": "blue", "is_active": True, "display_order": 3},
        {"id": "labs", "label": "Labs & Viva Voce", "badge_text": "50+ Q&A", "badge_variant": "emerald", "is_active": True, "display_order": 4},
        {"id": "assignments", "label": "Assignment Tracker", "badge_text": "AI Tool", "badge_variant": "emerald", "is_active": True, "display_order": 5},
        {"id": "planner", "label": "Timetable & Planner", "badge_text": "Live", "badge_variant": "emerald", "is_active": True, "display_order": 6},
        {"id": "notices", "label": "Department Notices", "badge_text": "", "badge_variant": "emerald", "is_active": True, "display_order": 7},
        {"id": "community-forum", "label": "Community Forum", "badge_text": "Active", "badge_variant": "purple", "is_active": True, "display_order": 8},
        {"id": "student-desk", "label": "Student Support Desk", "badge_text": "Help", "badge_variant": "cyan", "is_active": True, "display_order": 9},
        {"id": "profile", "label": "Academic Profile", "badge_text": "", "badge_variant": "emerald", "is_active": False, "display_order": 10},
    ]
    for b in DEFAULT_BADGES:
        SidebarBadgeConfig.objects.get_or_create(id=b["id"], defaults=b)

    # 3. Master Administrator Account from Environment Variables
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@saastascholar.in").strip().lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "Admin@123")
    admin_name = os.environ.get("ADMIN_NAME", "Saasta Scholar Master Administrator")
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
        admin_user.access_tier = AccessTier.ELITE_PLUS
        admin_user.set_password(admin_password)
        admin_user.save()
        print(f"-> Master Administrator Account '{admin_email}' Synchronized & Ready With Environment Credentials.")
    else:
        admin_user = StudentUser.objects.create(
            email=admin_email,
            username=admin_username,
            full_name=admin_name,
            phone_number=admin_phone,
            university="Saasta Scholar Academic Community",
            department="Office Of Academic Affairs",
            program="Institutional Administration",
            semester=1,
            section="A",
            access_tier=AccessTier.ELITE_PLUS,
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
