from rest_framework import serializers
from .models import StudentAssignment
from Apps.Academic.models import Subject

class StudentAssignmentSerializer(serializers.ModelSerializer):
    subject_code = serializers.CharField(source="subject.code", read_only=True)
    subject_name = serializers.CharField(source="subject.name", read_only=True)

    class Meta:
        model = StudentAssignment
        fields = [
            "id",
            "subject",
            "subject_code",
            "subject_name",
            "title",
            "description",
            "due_date",
            "total_marks",
            "obtained_marks",
            "status",
            "ai_outline_json",
            "citation_format",
            "citations_list",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
