from django.contrib import admin
from .models import StudentAssignment

@admin.register(StudentAssignment)
class StudentAssignmentAdmin(admin.ModelAdmin):
    list_display = ("title", "subject", "user", "due_date", "total_marks", "status")
    list_filter = ("status", "subject")
    search_fields = ("title", "description")
