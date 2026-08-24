from django.contrib import admin
from .models import PersonalStudyTask, TimetableSlot

@admin.register(TimetableSlot)
class TimetableSlotAdmin(admin.ModelAdmin):
    list_display = ("day_of_week", "start_time", "end_time", "title", "subject", "room_number", "event_type")
    list_filter = ("day_of_week", "semester", "section", "event_type")

@admin.register(PersonalStudyTask)
class PersonalStudyTaskAdmin(admin.ModelAdmin):
    list_display = ("title", "user", "date", "time", "is_completed", "priority")
    list_filter = ("is_completed", "priority")
