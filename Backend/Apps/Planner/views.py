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
    program_id = request.data.get("program_id") or request.data.get("program") if hasattr(request, "data") else None
    if program_id is None:
        program_id = request.query_params.get("program_id") or request.query_params.get("program")
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
    if program_id and str(program_id).strip() != "":
        qs = qs.filter(subject__program_id=str(program_id).strip())
        filtered = True
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
            "error": "Please Specify Filters (Program, Semester, Section, Day_Of_Week) Or Purge_All=True."
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
        fallback_room = str(request.data.get("room_number", "")).strip()
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
            "Analyze The Provided Timetable Image (Photo Of Notice Board, Printed Chart, Syllabus Timetable Grid, Or Screenshot) In Depth. "
            "\n"
            "CRITICAL INSTRUCTIONS FOR ROOM / FLOOR / LECTURE THEATRE (LT NO.):\n"
            "1. Carefully Inspect The Document Headers, Subtitles, Banners, And Corners For Room, Lecture Theatre, Hall, Or Floor Indicators. "
            "For Example: 'LT No.: First Floor 102', 'Room No: 102', 'LT-102', 'First Floor 102', 'Hall 3', Or Similar Text. "
            "2. When A Global Lecture Theatre / Room / Floor Is Declared At The Top (e.g., 'First Floor 102'), YOU MUST ASSIGN THIS EXACT ROOM STRING "
            "(e.g., 'First Floor 102') To Every Theory Lecture Slot Across The Week. "
            "3. For Lab / Practical Cells That Specify Distinct Lab Room Numbers (e.g. 'EDT Lab (B1) 602 / PSC Lab (B2) (604)' Where 602 And 604 Are Lab Rooms), "
            "Set 'room_number' To The Specific Lab Room (e.g. 'Lab 602 / 604' Or 'Room 602'). "
            "4. NEVER Return An Empty String For 'room_number' If Any Floor, Hall, Room, Or LT No. Is Visible In The Image! "
            "\n"
            "CRITICAL INSTRUCTIONS FOR FACULTY INSTRUCTOR EXTRACTION:\n"
            "5. Many University Timetables Include A Legend/Mapping Table At The Bottom Or Side (e.g. Subject Code, Subject Name, Short Name, Faculty Name, e.g. 'Mr. Rohit Solanki', 'Dr Komal Prasad Sharma', 'Prof. Kuldeep Singh Rathore', etc.). "
            "Cross-reference The Abbreviation/Course Title In Each Grid Slot With This Legend Table And Populate 'faculty_name' For Every Slot. "
            "\n"
            "TIME SLOTS & DAYS:\n"
            "6. Normalize Days Strictly To One Of: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']. "
            "7. Parse Exact Times From The Column Headers (e.g., '09:10-10:05' -> start_time: '09:10', end_time: '10:05'; '10:05-11:00' -> start_time: '10:05', end_time: '11:00'; '11:05-12:00' -> start_time: '11:05', end_time: '12:00'; '12:55-13:55' -> start_time: '12:55', end_time: '13:55'; '13:55-14:50' -> start_time: '13:55', end_time: '14:50'). "
            "Skip Non-Class Columns Like '11:00-11:05' Break Or '12:05-12:55' Lunch Break. "
            f"8. If Semester Is Not Stated, Default To {fallback_semester}. If Section Is Not Stated, Default To '{fallback_section}'. "
            "9. Set event_type to 'Practical' For Lab Sessions (Tone: 'cyan') And 'Class' For Theory Lectures (Tone: 'green'). "
            "\n"
            "Return STRICTLY A Valid JSON Object Matching This Exact Structure Without Markdown Fences Or Commentary:\n"
            "{\n"
            '  "detected_metadata": {\n'
            '    "program_name": "B. Tech.(AIML)",\n'
            f'    "semester": {fallback_semester},\n'
            f'    "section": "{fallback_section}",\n'
            '    "lecture_hall_or_floor": "First Floor 102",\n'
            '    "academic_session": "2026-2027"\n'
            "  },\n"
            '  "faculty_mapping": {\n'
            '    "PSC": "Mr. Rohit Solanki",\n'
            '    "M-I": "Dr Komal Prasad Sharma"\n'
            "  },\n"
            '  "slots": [\n'
            "    {\n"
            '      "day_of_week": "Mon",\n'
            '      "start_time": "09:10",\n'
            '      "end_time": "10:05",\n'
            '      "title": "PSC",\n'
            '      "full_subject_name": "Programming For Problem Solving With C",\n'
            '      "subject_code": "CSM101B",\n'
            '      "room_number": "First Floor 102",\n'
            '      "faculty_name": "Mr. Rohit Solanki",\n'
            '      "event_type": "Class",\n'
            f'      "semester": {fallback_semester},\n'
            f'      "section": "{fallback_section}",\n'
            '      "tone": "green"\n'
            "    }\n"
            "  ],\n"
            '  "confidence": "high",\n'
            '  "summary": "Extracted X lecture and lab periods. LT Room: First Floor 102."\n'
            "}"
        )

        try:
            from .gemini_utils import call_gemini_generate_content

            result_json, model_used = call_gemini_generate_content(
                api_key=gemini_api_key,
                prompt_text=prompt_text,
                inline_data={
                    "mime_type": mime_type,
                    "data": raw_base64,
                },
                temperature=0.1,
                response_mime_type="application/json",
            )

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
            detected_meta = parsed.get("detected_metadata", {}) or {}

            #
            header_room = (
                detected_meta.get("lecture_hall_or_floor")
                or detected_meta.get("room_number")
                or detected_meta.get("lt_no")
                or parsed.get("global_room")
                or fallback_room
                or ""
            ).strip()

            # 
            if not header_room:
                for s in extracted_slots:
                    r = (s.get("room_number") or "").strip()
                    if any(w in r.lower() for w in ["floor", "lt", "room", "hall"]):
                        header_room = r
                        break

            faculty_map = parsed.get("faculty_mapping", {}) or {}
            faculty_map_norm = {
                str(k).strip().upper(): str(v).strip()
                for k, v in faculty_map.items()
                if k and v
            }

            from Apps.Academic.models import Subject
            db_subjects = list(Subject.objects.all().values("id", "name", "code", "short_name"))

            for slot in extracted_slots:
                
                current_room = (slot.get("room_number") or "").strip()
                if not current_room or current_room.lower() in ["lt-01", "room", "na", "null", "none"]:
                    if header_room:
                        slot["room_number"] = header_room
                    elif fallback_room:
                        slot["room_number"] = fallback_room
                    else:
                        slot["room_number"] = "First Floor 102"
                else:
                    slot["room_number"] = current_room

                #
                curr_faculty = (slot.get("faculty_name") or "").strip()
                title_clean = (slot.get("title") or "").strip().upper()
                code_clean = (slot.get("subject_code") or "").strip().upper()

                if not curr_faculty:
                    if title_clean in faculty_map_norm:
                        slot["faculty_name"] = faculty_map_norm[title_clean]
                    elif code_clean in faculty_map_norm:
                        slot["faculty_name"] = faculty_map_norm[code_clean]
                    else:
                        for k, v in faculty_map_norm.items():
                            if k in title_clean or title_clean in k or (code_clean and k in code_clean):
                                slot["faculty_name"] = v
                                break

                # 
                title_lower = (slot.get("title") or "").lower()
                code_lower = (slot.get("subject_code") or "").lower()
                full_name_lower = (slot.get("full_subject_name") or "").lower()
                matched_sub = None

                for sub in db_subjects:
                    s_code = (sub.get("code") or "").lower()
                    s_name = (sub.get("name") or "").lower()
                    s_short = (sub.get("short_name") or "").lower()

                    if (code_lower and s_code and code_lower == s_code) or \
                       (s_short and s_short == title_lower) or \
                       (s_code and s_code in title_lower) or \
                       (s_short and s_short in title_lower) or \
                       (s_name and s_name in title_lower) or \
                       (s_name and full_name_lower and (s_name in full_name_lower or full_name_lower in s_name)):
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
                "model_used": f"{model_used} (Multimodal OCR)",
                "slots": extracted_slots,
                "count": len(extracted_slots),
                "detected_metadata": detected_meta,
                "header_room": header_room or fallback_room or "First Floor 102",
                "confidence": parsed.get("confidence", "high"),
                "summary": parsed.get("summary", f"Extracted {len(extracted_slots)} Period Slots with Lecture Theatre / Floor information."),
            }, status=status.HTTP_200_OK)

        except ValueError as val_err:
            return Response(
                {"error": str(val_err)},
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


