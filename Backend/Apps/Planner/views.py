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
        qs = qs.filter(subject__programs__id=str(program_id).strip())
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
            "CRITICAL INSTRUCTIONS FOR FULL OFFICIAL SUBJECT NAMES (NEVER USE SHORT ABBREVIATIONS IN 'title'):\n"
            "1. University timetables feature a weekly schedule grid on top with abbreviated subject codes (e.g. 'PSC', 'M-1', 'BEEE', 'EPHY', 'IAI', 'PE', 'Anandam', 'EDT Lab', 'PSC Lab', 'EPHY Lab') "
            "AND an explicit legend / subject mapping table at the bottom or side with columns such as: 'Subject Code', 'Subject Name', 'Short Name', 'Theory/Practical', 'Faculty Name'.\n"
            "2. YOU MUST CROSS-REFERENCE EVERY SINGLE CELL IN THE TIMETABLE GRID WITH THIS BOTTOM LEGEND TABLE.\n"
            "3. THE 'title' FIELD IN EVERY SLOT MUST STRICTLY BE POPULATED WITH THE FULL, OFFICIAL EXPANDED SUBJECT NAME FROM THE LEGEND TABLE, NEVER THE SHORT ABBREVIATION!\n"
            "   - When grid cell says 'PSC', look up the legend table: 'Programming for Problem Solving with C'. Set 'title': 'Programming for Problem Solving with C' (DO NOT set 'PSC')!\n"
            "   - When grid cell says 'M-1' or 'M-I', look up the legend table: 'Mathematics-I'. Set 'title': 'Mathematics-I' (DO NOT set 'M-1')!\n"
            "   - When grid cell says 'EPHY', look up the legend table: 'Engineering Physics'. Set 'title': 'Engineering Physics'!\n"
            "   - When grid cell says 'BEEE', look up the legend table: 'Basic Electrical & Electronics Engineering'. Set 'title': 'Basic Electrical & Electronics Engineering'!\n"
            "   - When grid cell says 'IAI', look up the legend table: 'Introduction to AI'. Set 'title': 'Introduction to AI'!\n"
            "   - When grid cell says 'PE', look up the legend table: 'Professional English-I'. Set 'title': 'Professional English-I'!\n"
            "   - When grid cell says 'Anandam', set 'title': 'Anandam Activity'!\n"
            "   - When grid cell says 'EDT Lab (J1) 702/ PSC Lab(J2) (608)', set 'title': 'Emerging & Disruptive Technologies Lab-I (J1) / Programming for Problem Solving with C Lab (J2)', 'room_number': 'Lab 702 / 608', 'event_type': 'Practical'!\n"
            "   - When grid cell says 'PSC Revision', set 'title': 'Programming for Problem Solving with C (Revision)'!\n"
            "4. Also extract 'subject_legend_mapping' capturing all rows from the bottom legend table: { 'PSC': { 'full_name': 'Programming for Problem Solving with C', 'code': 'CSM101B', 'faculty': 'Mr. Rohit Solanki', 'type': 'Theory' }, ... }.\n"
            "\n"
            "CRITICAL INSTRUCTIONS FOR ROOM / FLOOR / LECTURE THEATRE (LT NO.):\n"
            "5. Carefully Inspect The Document Headers, Subtitles, Banners, And Corners For Room, Lecture Theatre, Hall, Or Floor Indicators. "
            "For Example: 'LT No.: Third Floor 306', 'LT No.: First Floor 102', 'Room No: 102', 'LT-102', 'Hall 3', Or Similar Text. "
            "6. When A Global Lecture Theatre / Room / Floor Is Declared At The Top (e.g., 'Third Floor 306'), YOU MUST ASSIGN THIS EXACT ROOM STRING "
            "(e.g., 'Third Floor 306') To Every Theory Lecture Slot Across The Week. "
            "7. For Lab / Practical Cells That Specify Distinct Lab Room Numbers (e.g. 'EDT Lab (J1) 702/ PSC Lab(J2) (608)' Where 702 And 608 Are Lab Rooms), "
            "Set 'room_number' To The Specific Lab Room (e.g. 'Lab 702 / 608'). "
            "8. NEVER Return An Empty String For 'room_number' If Any Floor, Hall, Room, Or LT No. Is Visible In The Image!\n"
            "\n"
            "CRITICAL INSTRUCTIONS FOR FACULTY INSTRUCTOR EXTRACTION:\n"
            "9. Cross-reference The Course In Each Grid Slot With The Legend Table And Populate 'faculty_name' For Every Slot (e.g. 'Mr. Rohit Solanki', 'Dr. Sudheer Kumar Sharma', 'Dr. Karishma', 'Mr. Ankit Sharma', 'Mr. Sandeep', 'Dr. Suman Devi', 'Dr. Alok').\n"
            "\n"
            "TIME SLOTS & DAYS:\n"
            "10. Normalize Days Strictly To One Of: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']. "
            "11. Parse Exact Times From The Column Headers (e.g., '09:10-10:05' -> start_time: '09:10', end_time: '10:05'; '10:05-11:00' -> start_time: '10:05', end_time: '11:00'; '11:05-12:00' -> start_time: '11:05', end_time: '12:00'; '12:55-13:55' -> start_time: '12:55', end_time: '13:55'; '13:55-14:50' -> start_time: '13:55', end_time: '14:50'; '14:55-15:50' -> start_time: '14:55', end_time: '15:50'; '15:50-16:45' -> start_time: '15:50', end_time: '16:45'). "
            "Skip Non-Class Columns Like '11:00-11:05' Break Or '12:05-12:55' Lunch Break Or '14:50-14:55' Break. "
            f"12. If Semester Is Not Stated, Default To {fallback_semester}. If Section Is Not Stated, Default To '{fallback_section}'. "
            "13. Set event_type to 'Practical' For Lab Sessions (Tone: 'cyan') And 'Class' For Theory Lectures (Tone: 'green'). "
            "\n"
            "Return STRICTLY A Valid JSON Object Matching This Exact Structure Without Markdown Fences Or Commentary:\n"
            "{\n"
            '  "detected_metadata": {\n'
            '    "program_name": "B.Tech. (CSE+DATA SCIENCE+IT+IOT&CYBERNETICS+CCVT+HT+ROBOTICS+EVT)",\n'
            f'    "semester": {fallback_semester},\n'
            f'    "section": "{fallback_section}",\n'
            '    "lecture_hall_or_floor": "Third Floor 306",\n'
            '    "academic_session": "2026-2027"\n'
            "  },\n"
            '  "subject_legend_mapping": {\n'
            '    "PSC": {\n'
            '      "full_name": "Programming for Problem Solving with C",\n'
            '      "code": "CSM101B",\n'
            '      "faculty": "Mr. Rohit Solanki",\n'
            '      "type": "Theory"\n'
            '    },\n'
            '    "M-1": {\n'
            '      "full_name": "Mathematics-I",\n'
            '      "code": "MTM101T",\n'
            '      "faculty": "Dr. Sudheer Kumar Sharma",\n'
            '      "type": "Theory"\n'
            '    }\n'
            "  },\n"
            '  "slots": [\n'
            "    {\n"
            '      "day_of_week": "Mon",\n'
            '      "start_time": "09:10",\n'
            '      "end_time": "10:05",\n'
            '      "title": "Programming for Problem Solving with C",\n'
            '      "short_name": "PSC",\n'
            '      "full_subject_name": "Programming for Problem Solving with C",\n'
            '      "subject_code": "CSM101B",\n'
            '      "room_number": "Third Floor 306",\n'
            '      "faculty_name": "Mr. Rohit Solanki",\n'
            '      "event_type": "Class",\n'
            f'      "semester": {fallback_semester},\n'
            f'      "section": "{fallback_section}",\n'
            '      "tone": "green"\n'
            "    }\n"
            "  ],\n"
            '  "confidence": "high",\n'
            '  "summary": "Extracted X lecture and lab periods. Full course names assigned from legend table."\n'
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

            header_room = (
                detected_meta.get("lecture_hall_or_floor")
                or detected_meta.get("room_number")
                or detected_meta.get("lt_no")
                or parsed.get("global_room")
                or fallback_room
                or ""
            ).strip()

            if not header_room:
                for s in extracted_slots:
                    r = (s.get("room_number") or "").strip()
                    if any(w in r.lower() for w in ["floor", "lt", "room", "hall"]):
                        header_room = r
                        break

            #
            full_name_lookup = {}

            faculty_map = parsed.get("faculty_mapping", {}) or {}
            faculty_map_norm = {
                str(k).strip().upper(): str(v).strip()
                for k, v in faculty_map.items()
                if k and v
            }

            # Legend mapping extracted directly from table at the bottom of the photo
            legend_mapping = parsed.get("subject_legend_mapping", {}) or {}
            if isinstance(legend_mapping, dict):
                for k, v in legend_mapping.items():
                    k_clean = str(k).strip().upper()
                    if isinstance(v, dict):
                        f_name = (v.get("full_name") or v.get("name") or "").strip()
                        c_code = (v.get("code") or v.get("subject_code") or "").strip().upper()
                        f_faculty = (v.get("faculty") or v.get("faculty_name") or "").strip()
                        if f_name:
                            full_name_lookup[k_clean] = f_name
                            if c_code:
                                full_name_lookup[c_code] = f_name
                        if f_faculty:
                            faculty_map_norm[k_clean] = f_faculty
                            if c_code:
                                faculty_map_norm[c_code] = f_faculty
                    elif isinstance(v, str) and v.strip():
                        full_name_lookup[k_clean] = v.strip()

            from Apps.Academic.models import Subject
            db_subjects = list(Subject.objects.all().values("id", "name", "code", "short_name"))
            for sub in db_subjects:
                s_name = (sub.get("name") or "").strip()
                s_short = (sub.get("short_name") or "").strip().upper()
                s_code = (sub.get("code") or "").strip().upper()
                if s_name:
                    if s_short:
                        full_name_lookup[s_short] = s_name
                    if s_code:
                        full_name_lookup[s_code] = s_name

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

                curr_faculty = (slot.get("faculty_name") or "").strip()
                title_clean = (slot.get("title") or "").strip().upper()
                code_clean = (slot.get("subject_code") or "").strip().upper()
                short_clean = (slot.get("short_name") or "").strip().upper()

                if not curr_faculty:
                    if title_clean in faculty_map_norm:
                        slot["faculty_name"] = faculty_map_norm[title_clean]
                    elif code_clean in faculty_map_norm:
                        slot["faculty_name"] = faculty_map_norm[code_clean]
                    elif short_clean in faculty_map_norm:
                        slot["faculty_name"] = faculty_map_norm[short_clean]
                    else:
                        for k, v in faculty_map_norm.items():
                            if k in title_clean or title_clean in k or (code_clean and k in code_clean) or (short_clean and k in short_clean):
                                slot["faculty_name"] = v
                                break

                # Database Subject Matching
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

                # FULL COURSE NAME RESOLUTION: Never leave abbreviations as primary title
                raw_title = (slot.get("title") or "").strip()
                slot_full = (slot.get("full_subject_name") or "").strip()
                resolved_full_name = ""

                if slot_full and len(slot_full) > len(raw_title) and len(slot_full) > 4:
                    resolved_full_name = slot_full

                lookup_keys = [raw_title.upper(), short_clean, code_clean]
                if not resolved_full_name:
                    for lk in lookup_keys:
                        if lk and lk in full_name_lookup:
                            resolved_full_name = full_name_lookup[lk]
                            break

                if not resolved_full_name and matched_sub and matched_sub.get("name"):
                    resolved_full_name = matched_sub["name"]

                if not resolved_full_name and "revision" in raw_title.lower():
                    base = raw_title.lower().replace("revision", "").strip().upper()
                    if base in full_name_lookup:
                        resolved_full_name = f"{full_name_lookup[base]} (Revision)"

                if resolved_full_name:
                    slot["title"] = resolved_full_name
                    slot["full_subject_name"] = resolved_full_name
                elif slot_full:
                    slot["title"] = slot_full
                else:
                    slot["full_subject_name"] = slot["title"]

                if not slot.get("short_name") and raw_title != slot["title"]:
                    slot["short_name"] = raw_title

            return Response({
                "success": True,
                "model_used": f"{model_used} (Multimodal OCR)",
                "slots": extracted_slots,
                "count": len(extracted_slots),
                "detected_metadata": detected_meta,
                "header_room": header_room or fallback_room or "Third Floor 306",
                "confidence": parsed.get("confidence", "high"),
                "summary": parsed.get("summary", f"Extracted {len(extracted_slots)} Period Slots with Full Course Names & Lecture Theatre / Floor information."),
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
            full_title = str(item.get("full_subject_name") or "").strip()
            if full_title and len(full_title) > len(title):
                title = full_title

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

class AdminTimetableEnrichFullNamesView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        from Apps.Academic.models import Subject
        from Apps.Academic.cache_utils import invalidate_redis_pattern

        db_subjects = list(Subject.objects.all())
        subject_map = {}
        for s in db_subjects:
            if s.name:
                if s.short_name:
                    subject_map[s.short_name.strip().upper()] = s
                if s.code:
                    subject_map[s.code.strip().upper()] = s
                subject_map[s.name.strip().upper()] = s

        updated_count = 0
        slots = TimetableSlot.objects.all()

        for slot in slots:
            curr_title = (slot.title or "").strip()
            curr_upper = curr_title.upper()
            resolved_title = None
            matched_subject = slot.subject

            # 1. If subject is already linked and has a longer, official name
            if matched_subject and matched_subject.name and len(curr_title) < len(matched_subject.name):
                resolved_title = matched_subject.name

            # 2. If short code or title matches DB subject
            if not resolved_title and curr_upper in subject_map:
                s_obj = subject_map[curr_upper]
                resolved_title = s_obj.name
                if not matched_subject:
                    matched_subject = s_obj

            # 3. If revision suffix (e.g. "PSC Revision")
            if not resolved_title and "revision" in curr_title.lower():
                base_key = curr_title.lower().replace("revision", "").strip().upper()
                if base_key in subject_map:
                    resolved_title = f"{subject_map[base_key].name} (Revision)"

            needs_save = False
            if resolved_title and resolved_title != curr_title:
                slot.title = resolved_title
                needs_save = True

            if matched_subject and slot.subject_id != matched_subject.id:
                slot.subject = matched_subject
                needs_save = True

            if needs_save:
                slot.save()
                updated_count += 1

        invalidate_redis_pattern("planner")
        return Response({
            "success": True,
            "updated_count": updated_count,
            "detail": f"Successfully Expanded {updated_count} Timetable Slots To Full Official Course Names."
        }, status=status.HTTP_200_OK)


