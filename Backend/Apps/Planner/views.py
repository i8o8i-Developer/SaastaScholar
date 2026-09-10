import json
import os
import re
import urllib.request
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.conf import settings
from django.shortcuts import get_object_or_404

from .models import PersonalStudyTask, TimetableSlot
from .serializers import PersonalStudyTaskSerializer, TimetableSlotSerializer

from Apps.Academic.cache_utils import get_or_set_redis_cache, make_cache_key

class TimetableScheduleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        day = request.query_params.get("day")
        cache_key = f"planner:timetable:{user.program}:{user.semester}:{user.section}:{day or 'all'}"
        
        def _fetch():
            from django.db.models import Q
            qs = TimetableSlot.objects.filter(semester=user.semester)
            if user.section:
                qs = qs.filter(section__iexact=user.section)

            if user.program or user.department:
                prog_q = Q()
                if user.program:
                    prog_q |= Q(subject__programs__name__iexact=user.program)
                    prog_q |= Q(subject__programs__code__iexact=user.program)
                    prog_q |= Q(subject__programs__name__icontains=user.program)
                    prog_q |= Q(title__icontains=user.program)
                if user.department:
                    prog_q |= Q(subject__department__name__iexact=user.department)
                    prog_q |= Q(subject__department__code__iexact=user.department)
                    prog_q |= Q(subject__department__name__icontains=user.department)
                
                prog_q |= Q(subject__programs__isnull=True)

                matching_qs = qs.filter(prog_q).distinct()
                if matching_qs.exists():
                    qs = matching_qs
                else:
                    # Do not show other programs' timetables!
                    qs = TimetableSlot.objects.none()

            if day and day != "All":
                qs = qs.filter(day_of_week__iexact=day)

            serializer = TimetableSlotSerializer(qs.order_by("start_time"), many=True)
            return {
                "semester": user.semester,
                "section": user.section,
                "day": day or "All",
                "slots": serializer.data,
            }

        data = get_or_set_redis_cache(cache_key, _fetch, timeout=60)
        return Response(data)

class PersonalStudyTaskListCreateView(generics.ListCreateAPIView):
    serializer_class = PersonalStudyTaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PersonalStudyTask.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class PersonalStudyTaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PersonalStudyTaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PersonalStudyTask.objects.filter(user=self.request.user)

class PersonalStudyTaskToggleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        task = get_object_or_404(PersonalStudyTask, id=pk, user=request.user)
        task.is_completed = not task.is_completed
        task.save()
        return Response(PersonalStudyTaskSerializer(task).data)

from .models import MilestoneCountdown, PersonalStudyTask, TimetableSlot
from .serializers import (
    MilestoneCountdownSerializer,
    PersonalStudyTaskSerializer,
    TimetableSlotSerializer,
)

class MilestoneCountdownListView(generics.ListAPIView):
    serializer_class = MilestoneCountdownSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        user = self.request.user
        return MilestoneCountdown.objects.filter(is_active=True, semester=user.semester)

    def list(self, request, *args, **kwargs):
        user = request.user
        cache_key = f"planner:milestones:{user.semester}"
        def _fetch():
            response = super(MilestoneCountdownListView, self).list(request, *args, **kwargs)
            return response.data
        data = get_or_set_redis_cache(cache_key, _fetch, timeout=600)
        return Response(data)

class AdminMilestoneListCreateView(generics.ListCreateAPIView):
    queryset = MilestoneCountdown.objects.all()
    serializer_class = MilestoneCountdownSerializer
    permission_classes = [permissions.IsAdminUser]
    pagination_class = None

class AdminMilestoneDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = MilestoneCountdown.objects.all()
    serializer_class = MilestoneCountdownSerializer
    permission_classes = [permissions.IsAdminUser]

class AdminTimetableSlotListCreateView(generics.ListCreateAPIView):
    queryset = TimetableSlot.objects.select_related("subject").all()
    serializer_class = TimetableSlotSerializer
    permission_classes = [permissions.IsAdminUser]
    pagination_class = None

    def delete(self, request, *args, **kwargs):
        return perform_bulk_delete_timetable(request)

class AdminTimetableSlotDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = TimetableSlot.objects.all()
    serializer_class = TimetableSlotSerializer
    permission_classes = [permissions.IsAdminUser]

def perform_bulk_delete_timetable(request):
    from Apps.Academic.cache_utils import invalidate_redis_pattern
    purge_all = request.data.get("purge_all") if hasattr(request, "data") else None
    if purge_all is None:
        purge_all = request.query_params.get("purge_all")

    if str(purge_all).lower() in ("true", "1", "yes"):
        count, _ = TimetableSlot.objects.all().delete()
        invalidate_redis_pattern("planner")
        return Response({
            "detail": f"Successfully Purged All {count} Timetable Slots.",
            "deleted_count": count,
        }, status=status.HTTP_200_OK)

    ids = request.data.get("ids") if hasattr(request, "data") else None
    if not ids:
        ids = request.query_params.getlist("ids")
    if ids:
        count, _ = TimetableSlot.objects.filter(id__in=ids).delete()
        invalidate_redis_pattern("planner")
        return Response({
            "detail": f"Successfully Deleted {count} Timetable Slots.",
            "deleted_count": count,
        }, status=status.HTTP_200_OK)

    qs = TimetableSlot.objects.all()
    semester = request.data.get("semester") if hasattr(request, "data") else None
    if semester is None:
        semester = request.query_params.get("semester")
    section = request.data.get("section") if hasattr(request, "data") else None
    if section is None:
        section = request.query_params.get("section")
    day_of_week = request.data.get("day_of_week") if hasattr(request, "data") else None
    if day_of_week is None:
        day_of_week = request.query_params.get("day_of_week")

    filtered = False
    if semester is not None and str(semester).strip() != "":
        try:
            qs = qs.filter(semester=int(semester))
            filtered = True
        except ValueError:
            pass
    if section and str(section).strip() != "":
        qs = qs.filter(section__iexact=str(section).strip())
        filtered = True
    if day_of_week and str(day_of_week).strip() != "" and day_of_week != "All":
        qs = qs.filter(day_of_week__iexact=str(day_of_week).strip())
        filtered = True

    if not filtered:
        return Response({
            "error": "Please Specify Filters (Semester, Section, Day_Of_Week) Or Purge_All=True."
        }, status=status.HTTP_400_BAD_REQUEST)

    count, _ = qs.delete()
    invalidate_redis_pattern("planner")
    return Response({
        "detail": f"Successfully Deleted {count} Timetable Slots.",
        "deleted_count": count,
    }, status=status.HTTP_200_OK)

class AdminTimetableBulkDeleteView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        return perform_bulk_delete_timetable(request)

    def delete(self, request):
        return perform_bulk_delete_timetable(request)

class AdminTimetablePhotoConsumeView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        image_data = request.data.get("image", "").strip()
        if not image_data:
            return Response(
                {"error": "Please Provide An Image Of The Timetable (base64 Or Data URL)."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        mime_type = request.data.get("mime_type", "image/jpeg")
        if image_data.startswith("data:"):
            try:
                header, encoded = image_data.split(";base64,", 1)
                mime_type = header.split("data:")[1]
                raw_base64 = encoded
            except Exception:
                raw_base64 = image_data
        else:
            raw_base64 = image_data

        fallback_semester = request.data.get("semester", 1)
        try:
            fallback_semester = int(fallback_semester)
        except (ValueError, TypeError):
            fallback_semester = 1

        fallback_section = str(request.data.get("section", "A")).strip().upper() or "A"
        custom_key = request.data.get("gemini_api_key", "").strip()
        gemini_api_key = (
            custom_key
            or os.environ.get("GEMINI_API_KEY", "").strip()
            or getattr(settings, "GEMINI_API_KEY", "").strip()
        )

        if not gemini_api_key:
            return Response(
                {
                    "error": "Google Gemini API Key Is Required To Scan Timetable Photos. Please Input Your Gemini API Key In The Scanner Modal Or Configure GEMINI_API_KEY On The Server."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        prompt_text = (
            "You Are An Expert Academic Schedule OCR And Timetable Analysis Assistant. "
            "Analyze The Provided Timetable Image (Photo Of Notice Board, Printed Chart, Syllabus Timetable Grid, Or Screenshot). "
            "Extract All Individual Scheduled Periods, Lecture Slots, And Lab Sessions. "
            "Normalize Days Of The Week Strictly To One Of: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']. "
            "Ensure start_time And end_time Are In 24-Hour HH:MM Format (e.g. '09:00', '10:30', '11:45', '14:00', '15:30'). "
            f"If Semester Is Not Specified In The Image, Default To {fallback_semester}. "
            f"If Section Is Not Specified In The Image, Default To '{fallback_section}'. "
            "For Event_Type, Use 'Class' For Regular Theory Classes/Lectures, Or 'Practical' For Lab Sessions. "
            "Tone Should Be 'cyan' For Practical/Labs, And 'green' For Theory Classes. "
            "Return STRICTLY A valid JSON Object Matching This Exact Schema Without Commentary:\n"
            "{\n"
            '  "slots": [\n'
            "    {\n"
            '      "day_of_week": "Mon",\n'
            '      "start_time": "09:00",\n'
            '      "end_time": "10:30",\n'
            '      "title": "Full Subject or Lecture Title",\n'
            '      "subject_code": "Optional Course Code If Visible",\n'
            '      "room_number": "LT-01",\n'
            '      "faculty_name": "Faculty Instructor Name If Visible",\n'
            '      "event_type": "Class",\n'
            f'      "semester": {fallback_semester},\n'
            f'      "section": "{fallback_section}",\n'
            '      "tone": "green"\n'
            "    }\n"
            "  ],\n"
            '  "confidence": "high",\n'
            '  "summary": "Extracted X Lecture And Lab Slots Across The Weekly Schedule."\n'
            "}"
        )

        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={gemini_api_key}"
            payload = {
                "contents": [
                    {
                        "parts": [
                            {"text": prompt_text},
                            {
                                "inline_data": {
                                    "mime_type": mime_type,
                                    "data": raw_base64,
                                }
                            },
                        ]
                    }
                ],
                "generationConfig": {
                    "temperature": 0.15,
                    "responseMimeType": "application/json",
                },
            }

            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"},
                method="POST",
            )

            with urllib.request.urlopen(req, timeout=30) as resp:
                raw_data = resp.read().decode("utf-8")
                result_json = json.loads(raw_data)
                candidate_text = result_json["candidates"][0]["content"]["parts"][0]["text"].strip()

                if candidate_text.startswith("```json"):
                    candidate_text = candidate_text[7:]
                elif candidate_text.startswith("```"):
                    candidate_text = candidate_text[3:]
                if candidate_text.endswith("```"):
                    candidate_text = candidate_text[:-3]
                candidate_text = candidate_text.strip()

                parsed = json.loads(candidate_text)
                extracted_slots = parsed.get("slots", [])

                from Apps.Academic.models import Subject
                db_subjects = list(Subject.objects.all().values("id", "name", "code", "short_name"))

                for slot in extracted_slots:
                    title_lower = (slot.get("title") or "").lower()
                    code_lower = (slot.get("subject_code") or "").lower()
                    matched_sub = None

                    for sub in db_subjects:
                        s_code = (sub.get("code") or "").lower()
                        s_name = (sub.get("name") or "").lower()
                        s_short = (sub.get("short_name") or "").lower()

                        if (code_lower and s_code and code_lower == s_code) or \
                           (s_code and s_code in title_lower) or \
                           (s_short and s_short in title_lower) or \
                           (s_name and s_name in title_lower):
                            matched_sub = sub
                            break

                    if matched_sub:
                        slot["subject_id"] = str(matched_sub["id"])
                        slot["matched_subject_name"] = matched_sub["name"]
                        slot["matched_subject_code"] = matched_sub["code"]
                    else:
                        slot["subject_id"] = None

                return Response({
                    "success": True,
                    "model_used": "Gemini 1.5 Flash (Multimodal OCR)",
                    "slots": extracted_slots,
                    "count": len(extracted_slots),
                    "confidence": parsed.get("confidence", "high"),
                    "summary": parsed.get("summary", f"Extracted {len(extracted_slots)} period slots from timetable photo."),
                }, status=status.HTTP_200_OK)

        except urllib.error.HTTPError as http_err:
            try:
                err_body = http_err.read().decode("utf-8")
                err_json = json.loads(err_body)
                error_msg = err_json.get("error", {}).get("message", str(http_err))
            except Exception:
                error_msg = str(http_err)
            return Response(
                {"error": f"Gemini API Error: {error_msg}"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            return Response(
                {"error": f"Failed To Consume Timetable Photo With Gemini AI: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

class AdminTimetableBulkCreateView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        slots_data = request.data.get("slots", [])
        if not isinstance(slots_data, list) or len(slots_data) == 0:
            return Response(
                {"error": "Please Provide A Non-Empty List Of Slots To Create."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        from Apps.Academic.cache_utils import invalidate_redis_pattern
        created_slots = []
        valid_days = {"Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"}

        for item in slots_data:
            day = item.get("day_of_week") or "Mon"
            if day not in valid_days:
                day = "Mon"

            sem = item.get("semester", 1)
            try:
                sem = int(sem)
            except (ValueError, TypeError):
                sem = 1

            sec = str(item.get("section", "A")).strip().upper() or "A"
            title = str(item.get("title", "Lecture Slot")).strip() or "Lecture Slot"
            start_time = str(item.get("start_time", "09:00")).strip()
            end_time = str(item.get("end_time", "10:30")).strip()
            room = str(item.get("room_number", "LT-01")).strip() or "LT-01"
            faculty = str(item.get("faculty_name", "")).strip()
            event_type = item.get("event_type") or "Class"
            if event_type not in ["Class", "Practical", "Task", "Deadline", "Project"]:
                event_type = "Class"
            tone = item.get("tone") or ("cyan" if event_type == "Practical" else "green")
            sub_id = item.get("subject_id") or item.get("subject") or None

            slot = TimetableSlot(
                semester=sem,
                section=sec,
                day_of_week=day,
                start_time=start_time,
                end_time=end_time,
                title=title,
                subject_id=sub_id,
                room_number=room,
                faculty_name=faculty,
                event_type=event_type,
                tone=tone,
            )
            created_slots.append(slot)

        TimetableSlot.objects.bulk_create(created_slots)
        invalidate_redis_pattern("planner")

        return Response({
            "success": True,
            "detail": f"Successfully Created {len(created_slots)} Timetable Slots.",
            "created_count": len(created_slots),
        }, status=status.HTTP_201_CREATED)


