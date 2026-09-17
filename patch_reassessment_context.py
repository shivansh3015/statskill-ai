from pathlib import Path
import shutil
import re
import sys


ROOT = Path(r"E:\statskill_ai")

MAIN_PY = ROOT / "backend" / "main.py"

COURSES_PAGE = (
    ROOT
    / "frontend"
    / "src"
    / "app"
    / "courses"
    / "page.tsx"
)

ASSESSMENT_PAGE = (
    ROOT
    / "frontend"
    / "src"
    / "app"
    / "ai-assessment"
    / "components"
    / "AssessmentPageClient.tsx"
)


def fail(message: str):
    print()
    print("ERROR:")
    print(message)
    print()
    sys.exit(1)


def backup_file(path: Path):
    backup = path.with_suffix(
        path.suffix + ".reassessment-backup"
    )

    shutil.copy2(
        path,
        backup,
    )

    print(
        f"Backup created: {backup}"
    )


def replace_once(
    text: str,
    old: str,
    new: str,
    description: str,
):
    count = text.count(old)

    if count == 0:
        fail(
            f"Could not find section:\n"
            f"{description}\n\n"
            f"No files were intentionally overwritten "
            f"after this failure point."
        )

    if count > 1:
        fail(
            f"Found {count} matches for:\n"
            f"{description}\n\n"
            f"Expected exactly one."
        )

    print(
        f"Updating: {description}"
    )

    return text.replace(
        old,
        new,
        1,
    )


def add_after_once(
    text: str,
    marker: str,
    addition: str,
    description: str,
):
    if addition.strip() in text:
        print(
            f"Already present: {description}"
        )

        return text

    count = text.count(marker)

    if count != 1:
        fail(
            f"Expected one marker for:\n"
            f"{description}\n"
            f"Found: {count}"
        )

    print(
        f"Adding: {description}"
    )

    return text.replace(
        marker,
        marker + addition,
        1,
    )


# ============================================================
# CHECK FILES
# ============================================================

for file_path in [
    MAIN_PY,
    COURSES_PAGE,
    ASSESSMENT_PAGE,
]:
    if not file_path.exists():
        fail(
            f"File not found:\n{file_path}"
        )


print()
print(
    "StatSkill AI - Post-Course Reassessment Patch"
)
print(
    "=" * 55
)
print()


# ============================================================
# BACKUPS
# ============================================================

backup_file(
    MAIN_PY
)

backup_file(
    COURSES_PAGE
)

backup_file(
    ASSESSMENT_PAGE
)


# ============================================================
# BACKEND
# ============================================================

print()
print(
    "Updating backend/main.py..."
)
print()


main_text = MAIN_PY.read_text(
    encoding="utf-8"
)


# ------------------------------------------------------------
# 1. REQUEST MODEL
# ------------------------------------------------------------

old_model = """class AIAssessmentStart(BaseModel):
    user_id: int
    skills: list[str] | None = None
    max_questions: int = 8
"""

new_model = """class AIAssessmentStart(BaseModel):
    user_id: int
    skills: list[str] | None = None
    max_questions: int = 8
    assessment_type: str = "AI Assessment"
    source_course_id: int | None = None
"""


if (
    'source_course_id: int | None = None'
    not in main_text
):
    main_text = replace_once(
        main_text,
        old_model,
        new_model,
        "AIAssessmentStart model",
    )
else:
    print(
        "Already present: AIAssessmentStart metadata"
    )


# ------------------------------------------------------------
# 2. PERMANENT DATABASE MIGRATIONS
# ------------------------------------------------------------

migration_marker = """    ensure_column(connection, "ai_assessment_sessions", "selected_skills_json", "TEXT")
    ensure_column(connection, "ai_assessment_sessions", "completed_at", "TEXT")
"""

migration_addition = """

    ensure_column(
        connection,
        "ai_assessment_sessions",
        "assessment_type",
        "TEXT DEFAULT 'AI Assessment'",
    )

    ensure_column(
        connection,
        "ai_assessment_sessions",
        "source_course_id",
        "INTEGER",
    )

    ensure_column(
        connection,
        "competency_history",
        "source_course_id",
        "INTEGER",
    )
"""


if (
    '"competency_history",\n'
    '        "source_course_id"'
    not in main_text
):
    main_text = add_after_once(
        main_text,
        migration_marker,
        migration_addition,
        "reassessment database migrations",
    )
else:
    print(
        "Already present: reassessment migrations"
    )


# ------------------------------------------------------------
# 3. START ASSESSMENT SESSION
# ------------------------------------------------------------

old_start_insert = """        cursor.execute(
            \"\"\"
            INSERT INTO ai_assessment_sessions (
                user_id,
                status,
                current_skill,
                current_level,
                question_count,
                max_questions,
                selected_skills_json
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            \"\"\",
            (
                data.user_id,
                "In Progress",
                skills[0],
                "Beginner",
                0,
                max_questions,
                json.dumps(skills),
            ),
        )
"""

new_start_insert = """        assessment_type = "AI Assessment"
        source_course_id = None

        if data.source_course_id is not None:
            cursor.execute(
                \"\"\"
                SELECT
                    ce.status,
                    ce.progress,
                    c.id AS course_id
                FROM course_enrollments ce
                JOIN courses c
                  ON c.id = ce.course_id
                WHERE ce.user_id = ?
                  AND ce.course_id = ?
                \"\"\",
                (
                    data.user_id,
                    data.source_course_id,
                ),
            )

            course_enrollment = cursor.fetchone()

            if not course_enrollment:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        "Course enrollment not found "
                        "for reassessment."
                    ),
                )

            course_completed = (
                str(
                    course_enrollment["status"]
                    or ""
                ).lower()
                == "completed"
                or int(
                    course_enrollment["progress"]
                    or 0
                )
                >= 100
            )

            if not course_completed:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        "Course must be completed "
                        "before reassessment."
                    ),
                )

            assessment_type = (
                "Post-Course Reassessment"
            )

            source_course_id = (
                data.source_course_id
            )

        cursor.execute(
            \"\"\"
            INSERT INTO ai_assessment_sessions (
                user_id,
                status,
                current_skill,
                current_level,
                question_count,
                max_questions,
                selected_skills_json,
                assessment_type,
                source_course_id
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            \"\"\",
            (
                data.user_id,
                "In Progress",
                skills[0],
                "Beginner",
                0,
                max_questions,
                json.dumps(skills),
                assessment_type,
                source_course_id,
            ),
        )
"""


if (
    'INSERT INTO ai_assessment_sessions'
    in main_text
    and
    'selected_skills_json,\n'
    '                assessment_type,\n'
    '                source_course_id'
    not in main_text
):
    main_text = replace_once(
        main_text,
        old_start_insert,
        new_start_insert,
        "AI assessment session creation",
    )
else:
    print(
        "Already present: assessment session metadata insert"
    )


# ------------------------------------------------------------
# 4. START ENDPOINT RESPONSE
# ------------------------------------------------------------

old_start_response = """            "current_skill": skills[0],
            "current_level": "Beginner",
        }
"""

new_start_response = """            "current_skill": skills[0],
            "current_level": "Beginner",
            "assessment_type": assessment_type,
            "source_course_id": source_course_id,
        }
"""


if (
    '"assessment_type": assessment_type'
    not in main_text
):
    main_text = replace_once(
        main_text,
        old_start_response,
        new_start_response,
        "AI assessment start response metadata",
    )
else:
    print(
        "Already present: start response metadata"
    )


# ------------------------------------------------------------
# 5. AI COMPETENCY HISTORY
# ------------------------------------------------------------

old_history = """                cursor.execute(
                    \"\"\"
                    INSERT INTO competency_history (
                        user_id,
                        skill_name,
                        previous_score,
                        new_score,
                        improvement,
                        improvement_percentage,
                        previous_level,
                        new_level,
                        source
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    \"\"\",
                    (
                        session["user_id"],
                        skill_name,
                        previous_score,
                        skill_score,
                        improvement,
                        improvement_percentage,
                        previous_level,
                        new_level,
                        "AI Assessment",
                    ),
                )
"""

new_history = """                history_source = (
                    row_value(
                        session,
                        "assessment_type",
                        default="AI Assessment",
                    )
                    or "AI Assessment"
                )

                history_source_course_id = (
                    row_value(
                        session,
                        "source_course_id",
                        default=None,
                    )
                )

                cursor.execute(
                    \"\"\"
                    INSERT INTO competency_history (
                        user_id,
                        skill_name,
                        previous_score,
                        new_score,
                        improvement,
                        improvement_percentage,
                        previous_level,
                        new_level,
                        source,
                        source_course_id
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    \"\"\",
                    (
                        session["user_id"],
                        skill_name,
                        previous_score,
                        skill_score,
                        improvement,
                        improvement_percentage,
                        previous_level,
                        new_level,
                        history_source,
                        history_source_course_id,
                    ),
                )
"""


if (
    'history_source_course_id'
    not in main_text
):
    main_text = replace_once(
        main_text,
        old_history,
        new_history,
        "AI competency history source",
    )
else:
    print(
        "Already present: competency history metadata"
    )


# ------------------------------------------------------------
# 6. RESULT ENDPOINT
# ------------------------------------------------------------

old_result_section = """            "session_id": session["id"],
            "user_id": user_id,
            "status": session["status"],
            "question_count": session["question_count"],
            "max_questions": session["max_questions"],
            "selected_skills": (
"""

new_result_section = """            "session_id": session["id"],
            "user_id": user_id,
            "status": session["status"],
            "question_count": session["question_count"],
            "max_questions": session["max_questions"],
            "assessment_type": row_value(
                session,
                "assessment_type",
                default="AI Assessment",
            ),
            "source_course_id": row_value(
                session,
                "source_course_id",
                default=None,
            ),
            "selected_skills": (
"""


if (
    '"assessment_type": row_value('
    not in main_text
):
    main_text = replace_once(
        main_text,
        old_result_section,
        new_result_section,
        "assessment result metadata",
    )
else:
    print(
        "Already present: result metadata"
    )


MAIN_PY.write_text(
    main_text,
    encoding="utf-8",
)

print()
print(
    "backend/main.py updated successfully."
)


# ============================================================
# COURSES PAGE
# ============================================================

print()
print(
    "Updating frontend courses/page.tsx..."
)
print()


courses_text = COURSES_PAGE.read_text(
    encoding="utf-8"
)


old_courses_route = """      router.push(
        `/ai-assessment?reassessment=1&skills=${encodeURIComponent(
          skillParameter
        )}`
      );
"""

new_courses_route = """      router.push(
        `/ai-assessment?reassessment=1&skills=${encodeURIComponent(
          skillParameter
        )}&course_id=${courseId}`
      );
"""


if (
    '&course_id=${courseId}'
    not in courses_text
):
    courses_text = replace_once(
        courses_text,
        old_courses_route,
        new_courses_route,
        "course reassessment URL",
    )
else:
    print(
        "Already present: course_id in reassessment URL"
    )


COURSES_PAGE.write_text(
    courses_text,
    encoding="utf-8",
)

print()
print(
    "courses/page.tsx updated successfully."
)


# ============================================================
# ASSESSMENT PAGE
# ============================================================

print()
print(
    "Updating AssessmentPageClient.tsx..."
)
print()


assessment_text = (
    ASSESSMENT_PAGE.read_text(
        encoding="utf-8"
    )
)


# ------------------------------------------------------------
# 7. HANDLE START SIGNATURE
# ------------------------------------------------------------

old_signature = """  async function handleStartAssessment(
    skills: string[],
    maxQuestions: number
  ) {
"""

new_signature = """  async function handleStartAssessment(
    skills: string[],
    maxQuestions: number,
    assessmentType = 'AI Assessment',
    sourceCourseId: number | null = null
  ) {
"""


if (
    "assessmentType = 'AI Assessment'"
    not in assessment_text
):
    assessment_text = replace_once(
        assessment_text,
        old_signature,
        new_signature,
        "handleStartAssessment parameters",
    )
else:
    print(
        "Already present: reassessment start parameters"
    )


# ------------------------------------------------------------
# 8. START REQUEST BODY
# ------------------------------------------------------------

old_request_body = """          {
            user_id: USER_ID,
            skills,
            max_questions:
              maxQuestions,
          }
"""

new_request_body = """          {
            user_id: USER_ID,
            skills,
            max_questions:
              maxQuestions,
            assessment_type:
              assessmentType,
            source_course_id:
              sourceCourseId,
          }
"""


if (
    'assessment_type:\n'
    '              assessmentType'
    not in assessment_text
):
    assessment_text = replace_once(
        assessment_text,
        old_request_body,
        new_request_body,
        "assessment start request body",
    )
else:
    print(
        "Already present: start request metadata"
    )


# ------------------------------------------------------------
# 9. READ COURSE ID FROM QUERY STRING
# ------------------------------------------------------------

old_skills_parameter = """      const skillsParameter =
        searchParams.get(
          'skills'
        );
"""

new_skills_parameter = """      const skillsParameter =
        searchParams.get(
          'skills'
        );


      const courseIdParameter =
        searchParams.get(
          'course_id'
        );
"""


if (
    'const courseIdParameter'
    not in assessment_text
):
    assessment_text = replace_once(
        assessment_text,
        old_skills_parameter,
        new_skills_parameter,
        "course_id query parameter",
    )
else:
    print(
        "Already present: course_id query parameter"
    )


# ------------------------------------------------------------
# 10. PARSE COURSE ID
# ------------------------------------------------------------

parse_marker = """      const reassessmentSkills =
        skillsParameter
          .split('|')
          .map(
            (skill) =>
              skill.trim()
          )
          .filter(Boolean);
"""

parse_addition = """


      const sourceCourseId =
        courseIdParameter
          ? Number(
              courseIdParameter
            )
          : null;


      const validSourceCourseId =
        sourceCourseId !== null &&
        Number.isInteger(
          sourceCourseId
        ) &&
        sourceCourseId > 0
          ? sourceCourseId
          : null;
"""


if (
    'const validSourceCourseId'
    not in assessment_text
):
    assessment_text = add_after_once(
        assessment_text,
        parse_marker,
        parse_addition,
        "validated reassessment course ID",
    )
else:
    print(
        "Already present: validated reassessment course ID"
    )


# ------------------------------------------------------------
# 11. AUTO START REASSESSMENT
# ------------------------------------------------------------

old_auto_start = """      handleStartAssessment(
        reassessmentSkills,
        5
      );
"""

new_auto_start = """      handleStartAssessment(
        reassessmentSkills,
        5,
        'Post-Course Reassessment',
        validSourceCourseId
      );
"""


if (
    "'Post-Course Reassessment',\n"
    "        validSourceCourseId"
    not in assessment_text
):
    assessment_text = replace_once(
        assessment_text,
        old_auto_start,
        new_auto_start,
        "automatic post-course reassessment start",
    )
else:
    print(
        "Already present: post-course reassessment start"
    )


ASSESSMENT_PAGE.write_text(
    assessment_text,
    encoding="utf-8",
)

print()
print(
    "AssessmentPageClient.tsx updated successfully."
)


# ============================================================
# DONE
# ============================================================

print()
print(
    "=" * 55
)

print(
    "PATCH COMPLETED SUCCESSFULLY"
)

print(
    "=" * 55
)

print()

print(
    "Updated files:"
)

print(
    MAIN_PY
)

print(
    COURSES_PAGE
)

print(
    ASSESSMENT_PAGE
)

print()

print(
    "Backups were created with:"
)

print(
    ".reassessment-backup"
)

print()

print(
    "Next: restart FastAPI and Next.js."
)