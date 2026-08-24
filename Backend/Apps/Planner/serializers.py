from rest_framework import serializers
from .models import MilestoneCountdown, PersonalStudyTask, TimetableSlot

class MilestoneCountdownSerializer(serializers.ModelSerializer):
    class Meta:
        model = MilestoneCountdown
        fields = [
            "id",
            "title",
            "target_date",
            "category",
            "semester",
            "tag",
            "is_active",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

class TimetableSlotSerializer(serializers.ModelSerializer):
    subject_code = serializers.CharField(source="subject.code", read_only=True)

    class Meta:
        model = TimetableSlot
        fields = [
            "id",
            "semester",
            "section",
            "day_of_week",
            "start_time",
            "end_time",
            "title",
            "subject",
            "subject_code",
            "room_number",
            "faculty_name",
            "meta_info",
            "event_type",
            "tone",
        ]

class PersonalStudyTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = PersonalStudyTask
        fields = [
            "id",
            "title",
            "date",
            "time",
            "is_completed",
            "priority",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]
