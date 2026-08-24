from django.contrib import admin
from .models import (
    AcademicMaterial,
    Department,
    DepartmentNotice,
    LabExperiment,
    MaterialPage,
    Subject,
    UserBookmark,
)

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ("name", "code")

@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ("code", "name", "semester", "credits", "faculty_name")
    list_filter = ("semester", "department")
    search_fields = ("code", "name")

class MaterialPageInline(admin.StackedInline):
    model = MaterialPage
    extra = 1

@admin.register(AcademicMaterial)
class AcademicMaterialAdmin(admin.ModelAdmin):
    list_display = ("title", "subject", "material_type", "unit_number", "page_count", "is_topper_verified")
    list_filter = ("material_type", "subject__semester", "is_free", "is_topper_verified")
    search_fields = ("title", "summary")
    inlines = [MaterialPageInline]

@admin.register(LabExperiment)
class LabExperimentAdmin(admin.ModelAdmin):
    list_display = ("experiment_number", "title", "subject")
    list_filter = ("subject",)

admin.site.register(DepartmentNotice)
admin.site.register(UserBookmark)
