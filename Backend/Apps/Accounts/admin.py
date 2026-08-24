from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import StudentUser, SecuritySession

@admin.register(StudentUser)
class StudentUserAdmin(UserAdmin):
    list_display = ("email", "full_name", "program", "semester", "section", "roll_number", "access_tier")
    list_filter = ("access_tier", "program", "semester", "section")
    search_fields = ("email", "full_name", "roll_number", "enrollment_no")

admin.site.register(SecuritySession)
