import os
import sys
import django

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "Core.settings")
django.setup()

from Apps.Accounts.models import AccessTier, StudentUser
from Apps.Academic.models import (
    AcademicMaterial,
    Department,
    DepartmentNotice,
    LabExperiment,
    MaterialPage,
    ProgramSpecialization,
    SectionBatch,
    Subject,
    UserBookmark,
)
from Apps.Assignments.models import StudentAssignment
from Apps.Planner.models import MilestoneCountdown, PersonalStudyTask, TimetableSlot
from Apps.Subscriptions.models import SubscriptionPlan

def reset_to_clean_slate():
    print("=== Purging All Dummy Data & Resetting To 100% Clean Slate ===")

    # 1. Clear Academic Materials, Labs, Notices, Bookmarks
    print("-> Wiping Academic Materials & Pages...")
    MaterialPage.objects.all().delete()
    UserBookmark.objects.all().delete()
    AcademicMaterial.objects.all().delete()

    print("-> Wiping Lab Experiments & Notices...")
    LabExperiment.objects.all().delete()
    DepartmentNotice.objects.all().delete()

    print("-> Wiping Assignments, Milestones & Timetables...")
    StudentAssignment.objects.all().delete()
    PersonalStudyTask.objects.all().delete()
    TimetableSlot.objects.all().delete()
    MilestoneCountdown.objects.all().delete()

    print("-> Wiping Subjects, Sections, Programs, Departments...")
    Subject.objects.all().delete()
    SectionBatch.objects.all().delete()
    ProgramSpecialization.objects.all().delete()
    Department.objects.all().delete()

    # 2. Delete All Non-Admin Users
    print("-> Deleting Demo Students & Keeping Only Master Administrator...")
    StudentUser.objects.filter(is_superuser=False).delete()

    # 3. Create or Reset Master Admin
    admin_email = "admin@nims.edu.in"
    admin_user, _ = StudentUser.objects.get_or_create(
        email=admin_email,
        defaults={
            "username": "admin",
            "full_name": "Institutional Administrator",
            "university": "NIMS University",
            "department": "",
            "program": "",
            "semester": 1,
            "section": "",
            "access_tier": AccessTier.FREE,
            "target_cgpa": 0.0,
            "current_cgpa": 0.0,
            "is_verified": True,
            "is_staff": True,
            "is_superuser": True,
        },
    )
    admin_user.is_staff = True
    admin_user.is_superuser = True
    admin_user.set_password("Admin@123")
    admin_user.save()

    print(f"Master Admin Ready: {admin_email} / Admin@123")
    print(">>> 100% Pure Clean Database Slate Initialized Successfully! <<<")

if __name__ == "__main__":
    reset_to_clean_slate()
