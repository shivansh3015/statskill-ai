from __future__ import annotations

import json
import os
import sqlite3
from datetime import datetime
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from ai.question_generator import generate_question
from ai.answer_evaluator import evaluate_answer
from ai.adaptive_engine import get_next_question_strategy


# ============================================================
# PATHS / ENVIRONMENT
# ============================================================

BACKEND_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BACKEND_DIR.parent
DATABASE_PATH = PROJECT_ROOT / "database" / "statmentor.db"
UPLOAD_DIR = BACKEND_DIR / "uploads"

DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

load_dotenv(PROJECT_ROOT / ".env")


# ============================================================
# FASTAPI APP
# ============================================================

app = FastAPI(
    title="StatSkill AI / StatMentor AI",
    version="1.0.0",
    description="AI-powered adaptive competency assessment and learning platform.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4028",
        "http://127.0.0.1:4028",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://statskill-ai-weld.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# DATABASE HELPERS
# ============================================================

def get_connection() -> sqlite3.Connection:
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


def table_exists(connection: sqlite3.Connection, table_name: str) -> bool:
    row = connection.execute(
        """
        SELECT name
        FROM sqlite_master
        WHERE type = 'table' AND name = ?
        """,
        (table_name,),
    ).fetchone()
    return row is not None


def table_columns(connection: sqlite3.Connection, table_name: str) -> set[str]:
    if not table_exists(connection, table_name):
        return set()
    return {
        row["name"]
        for row in connection.execute(f"PRAGMA table_info({table_name})").fetchall()
    }


def ensure_column(
    connection: sqlite3.Connection,
    table_name: str,
    column_name: str,
    column_definition: str,
) -> None:
    columns = table_columns(connection, table_name)
    if column_name not in columns:
        connection.execute(
            f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_definition}"
        )


def row_value(row: sqlite3.Row | dict | None, *names: str, default: Any = None) -> Any:
    if row is None:
        return default

    keys = set(row.keys()) if hasattr(row, "keys") else set(row)

    for name in names:
        if name in keys:
            value = row[name]
            if value is not None:
                return value

    return default


def init_db() -> None:
    connection = get_connection()
    cursor = connection.cursor()

    cursor.executescript(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE,
            role TEXT,
            department TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS competencies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            skill_name TEXT NOT NULL,
            score INTEGER DEFAULT 0,
            level TEXT DEFAULT 'Beginner',
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS learning_materials (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            title TEXT,
            file_name TEXT,
            file_path TEXT,
            extracted_text TEXT,
            uploaded_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS quizzes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            title TEXT,
            score INTEGER,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS quiz_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            quiz_id INTEGER,
            score INTEGER,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
        );

        CREATE TABLE IF NOT EXISTS courses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category TEXT,
            description TEXT,
            difficulty TEXT DEFAULT 'Beginner',
            duration_hours REAL DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS course_competencies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            course_id INTEGER NOT NULL,
            skill_name TEXT NOT NULL,
            FOREIGN KEY (course_id) REFERENCES courses(id)
        );

        CREATE TABLE IF NOT EXISTS assessment_questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            skill_name TEXT,
            difficulty TEXT,
            question TEXT NOT NULL,
            options_json TEXT,
            correct_answer TEXT,
            explanation TEXT
        );

        CREATE TABLE IF NOT EXISTS assessment_answers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            question_id INTEGER,
            answer TEXT,
            score INTEGER DEFAULT 0,
            is_correct INTEGER DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (question_id) REFERENCES assessment_questions(id)
        );

        CREATE TABLE IF NOT EXISTS course_enrollments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            course_id INTEGER NOT NULL,
            progress INTEGER DEFAULT 0,
            status TEXT DEFAULT 'In Progress',
            enrolled_at TEXT DEFAULT CURRENT_TIMESTAMP,
            completed_at TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (course_id) REFERENCES courses(id)
        );

        CREATE TABLE IF NOT EXISTS course_quiz_questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            course_id INTEGER NOT NULL,
            question TEXT NOT NULL,
            options_json TEXT,
            correct_answer TEXT,
            explanation TEXT,
            skill_name TEXT,
            FOREIGN KEY (course_id) REFERENCES courses(id)
        );

        CREATE TABLE IF NOT EXISTS competency_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            skill_name TEXT NOT NULL,
            previous_score INTEGER DEFAULT 0,
            new_score INTEGER DEFAULT 0,
            improvement INTEGER DEFAULT 0,
            improvement_percentage REAL DEFAULT 0,
            previous_level TEXT DEFAULT 'Beginner',
            new_level TEXT DEFAULT 'Beginner',
            source TEXT,
            source_course_id INTEGER,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (source_course_id) REFERENCES courses(id)
        );

        CREATE TABLE IF NOT EXISTS ai_assessment_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            status TEXT DEFAULT 'In Progress',
            current_skill TEXT,
            current_level TEXT DEFAULT 'Beginner',
            question_count INTEGER DEFAULT 0,
            max_questions INTEGER DEFAULT 8,
            selected_skills_json TEXT,
            assessment_type TEXT DEFAULT 'AI Assessment',
            source_course_id INTEGER,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            completed_at TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (source_course_id) REFERENCES courses(id)
        );

        CREATE TABLE IF NOT EXISTS ai_assessment_questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id INTEGER NOT NULL,
            sequence_number INTEGER NOT NULL,
            skill_name TEXT,
            question_type TEXT,
            difficulty TEXT,
            question TEXT NOT NULL,
            options_json TEXT,
            correct_answer TEXT,
            explanation TEXT,
            answered INTEGER DEFAULT 0,
            evaluation_score INTEGER,
            evaluation_feedback TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (session_id) REFERENCES ai_assessment_sessions(id)
        );

        CREATE TABLE IF NOT EXISTS ai_assessment_answers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question_id INTEGER NOT NULL,
            session_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            answer TEXT,
            score INTEGER DEFAULT 0,
            is_correct INTEGER DEFAULT 0,
            feedback TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (question_id) REFERENCES ai_assessment_questions(id),
            FOREIGN KEY (session_id) REFERENCES ai_assessment_sessions(id),
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
        """
    )

    # Migrations for an already-existing database.
    ensure_column(connection, "ai_assessment_sessions", "selected_skills_json", "TEXT")
    ensure_column(connection, "ai_assessment_sessions", "completed_at", "TEXT")
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
    ensure_column(
        connection,
        "competencies",
        "updated_at",
        "TEXT DEFAULT CURRENT_TIMESTAMP",
    )

    ensure_column(connection, "ai_assessment_questions", "answered", "INTEGER DEFAULT 0")
    ensure_column(connection, "ai_assessment_questions", "evaluation_score", "INTEGER")
    ensure_column(connection, "ai_assessment_questions", "evaluation_feedback", "TEXT")

    ensure_column(connection, "course_enrollments", "progress", "INTEGER DEFAULT 0")
    ensure_column(
        connection,
        "course_enrollments",
        "status",
        "TEXT DEFAULT 'In Progress'",
    )
    ensure_column(
        connection,
        "course_enrollments",
        "enrolled_at",
        "TEXT DEFAULT CURRENT_TIMESTAMP",
    )
    ensure_column(connection, "course_enrollments", "completed_at", "TEXT")

    # Your project already cleaned duplicate competencies. If a duplicate still
    # exists, do not prevent the server from starting.
    try:
        cursor.execute(
            """
            CREATE UNIQUE INDEX IF NOT EXISTS
            idx_competencies_user_skill
            ON competencies(user_id, skill_name)
            """
        )
    except sqlite3.IntegrityError:
        pass

    connection.commit()
    connection.close()


init_db()


# ============================================================
# PYDANTIC MODELS
# ============================================================

class UserCreate(BaseModel):
    name: str
    email: str
    role: str | None = None
    department: str | None = None


class CompetencyCreate(BaseModel):
    user_id: int
    skill_name: str
    score: int = Field(ge=0, le=100)


class LegacyAssessmentSubmit(BaseModel):
    user_id: int
    answers: dict[str, str]


class AIAssessmentStart(BaseModel):
    user_id: int
    skills: list[str] | None = None
    max_questions: int = 8
    assessment_type: str = "AI Assessment"
    source_course_id: int | None = None


class AIAssessmentAnswer(BaseModel):
    session_id: int
    question_id: int
    answer: str


class CourseEnrollmentCreate(BaseModel):
    user_id: int
    course_id: int


class CourseProgressUpdate(BaseModel):
    user_id: int
    course_id: int
    progress: int = Field(ge=0, le=100)


class CourseQuizSubmit(BaseModel):
    user_id: int
    answers: dict[str, str]


# ============================================================
# GENERAL HELPERS
# ============================================================

def get_level(score: int | float) -> str:
    score = float(score)

    if score >= 85:
        return "Expert"
    if score >= 70:
        return "Advanced"
    if score >= 55:
        return "Intermediate"
    if score >= 40:
        return "Foundation"
    return "Beginner"


def calculate_improvement_percentage(
    previous_score: int | float,
    new_score: int | float,
) -> float:
    previous_score = float(previous_score)
    new_score = float(new_score)

    if previous_score == 0:
        return round(100.0 if new_score > 0 else 0.0, 2)

    return round(((new_score - previous_score) / previous_score) * 100, 2)


def get_gap_priority(score: int | float) -> str:
    score = float(score)

    if score < 50:
        return "High"
    if score < 70:
        return "Medium"
    return "Low"


def normalize_options(raw: Any) -> dict[str, str]:
    if raw is None:
        return {}

    if isinstance(raw, dict):
        return {str(k): str(v) for k, v in raw.items()}

    if isinstance(raw, list):
        result: dict[str, str] = {}
        for index, item in enumerate(raw):
            label = chr(65 + index)
            if isinstance(item, dict):
                item_label = str(item.get("label", label))
                text = str(item.get("text", item.get("value", "")))
                result[item_label] = text
            else:
                result[label] = str(item)
        return result

    if isinstance(raw, str):
        try:
            parsed = json.loads(raw)
            return normalize_options(parsed)
        except (json.JSONDecodeError, TypeError):
            return {}

    return {}


def get_ai_assessment_skills(
    connection: sqlite3.Connection,
    user_id: int,
    requested_skills: list[str] | None = None,
) -> list[str]:
    if requested_skills:
        cleaned: list[str] = []
        seen: set[str] = set()

        for skill in requested_skills:
            value = str(skill).strip()
            if value and value.lower() not in seen:
                cleaned.append(value)
                seen.add(value.lower())

        if cleaned:
            return cleaned

    rows = connection.execute(
        """
        SELECT skill_name
        FROM competencies
        WHERE user_id = ?
        ORDER BY score ASC, skill_name ASC
        """,
        (user_id,),
    ).fetchall()

    skills = [
        str(row["skill_name"]).strip()
        for row in rows
        if row["skill_name"]
    ]

    if skills:
        return skills

    return [
        "Statistics",
        "Probability",
        "Python",
        "SQL",
        "Data Visualization",
    ]


def competency_rows(connection: sqlite3.Connection, user_id: int) -> list[dict]:
    rows = connection.execute(
        """
        SELECT id, user_id, skill_name, score, level
        FROM competencies
        WHERE user_id = ?
        ORDER BY score DESC, skill_name ASC
        """,
        (user_id,),
    ).fetchall()

    return [
        {
            "id": row["id"],
            "user_id": row["user_id"],
            "skill_name": row["skill_name"],
            "score": int(row["score"] or 0),
            "level": row["level"] or get_level(row["score"] or 0),
        }
        for row in rows
    ]


def skill_gap_rows(connection: sqlite3.Connection, user_id: int) -> list[dict]:
    gaps = []

    for item in competency_rows(connection, user_id):
        if item["score"] < 70:
            gaps.append(
                {
                    "skill_name": item["skill_name"],
                    "score": item["score"],
                    "level": item["level"],
                    "target_score": 70,
                    "gap": 70 - item["score"],
                    "priority": get_gap_priority(item["score"]),
                }
            )

    return sorted(gaps, key=lambda item: item["score"])


def course_to_dict(row: sqlite3.Row) -> dict:
    return {
        "course_id": int(row_value(row, "id", "course_id", default=0)),
        "course_name": str(
            row_value(row, "name", "course_name", "title", default="Course")
        ),
        "category": str(row_value(row, "category", default="General") or "General"),
        "description": str(row_value(row, "description", default="") or ""),
        "difficulty": str(
            row_value(row, "difficulty", "level", default="Beginner") or "Beginner"
        ),
        "duration_hours": float(
            row_value(row, "duration_hours", "hours", "duration", default=0) or 0
        ),
    }


def get_enrollment(
    connection: sqlite3.Connection,
    user_id: int,
    course_id: int,
) -> sqlite3.Row | None:
    if not table_exists(connection, "course_enrollments"):
        return None

    return connection.execute(
        """
        SELECT *
        FROM course_enrollments
        WHERE user_id = ? AND course_id = ?
        ORDER BY id DESC
        LIMIT 1
        """,
        (user_id, course_id),
    ).fetchone()


def find_courses_for_skill(
    connection: sqlite3.Connection,
    skill_name: str,
) -> list[sqlite3.Row]:
    results: list[sqlite3.Row] = []

    if table_exists(connection, "course_competencies"):
        cc_columns = table_columns(connection, "course_competencies")

        skill_column = None
        for candidate in ("skill_name", "competency", "competency_name", "skill"):
            if candidate in cc_columns:
                skill_column = candidate
                break

        if skill_column and "course_id" in cc_columns:
            try:
                rows = connection.execute(
                    f"""
                    SELECT c.*
                    FROM course_competencies cc
                    JOIN courses c ON c.id = cc.course_id
                    WHERE LOWER(cc.{skill_column}) = LOWER(?)
                    ORDER BY c.id
                    """,
                    (skill_name,),
                ).fetchall()
                results.extend(rows)
            except sqlite3.Error:
                pass

    if results:
        return results

    # Useful fallback for databases where course_competencies is not populated.
    try:
        rows = connection.execute(
            """
            SELECT *
            FROM courses
            WHERE LOWER(course_name) LIKE ?
               OR LOWER(category) LIKE ?
               OR LOWER(description) LIKE ?
            ORDER BY id
            """,
            (
                f"%{skill_name.lower()}%",
                f"%{skill_name.lower()}%",
                f"%{skill_name.lower()}%",
            ),
        ).fetchall()
        results.extend(rows)
    except sqlite3.Error:
        pass

    return results


def build_recommendations(
    connection: sqlite3.Connection,
    user_id: int,
) -> list[dict]:
    recommendations: list[dict] = []
    seen_course_ids: set[int] = set()

    for gap in skill_gap_rows(connection, user_id):
        courses = find_courses_for_skill(connection, gap["skill_name"])

        for course_row in courses:
            course = course_to_dict(course_row)
            course_id = course["course_id"]

            if course_id in seen_course_ids:
                continue

            enrollment = get_enrollment(connection, user_id, course_id)

            recommendation = {
                **course,
                "skill_gap": gap["skill_name"],
                "current_score": gap["score"],
                "priority": gap["priority"],
                "progress": int(row_value(enrollment, "progress", default=0) or 0),
                "status": str(
                    row_value(enrollment, "status", default="Not Enrolled")
                    or "Not Enrolled"
                ),
            }

            recommendations.append(recommendation)
            seen_course_ids.add(course_id)

    priority_order = {"High": 0, "Medium": 1, "Low": 2}
    recommendations.sort(
        key=lambda item: (
            priority_order.get(item["priority"], 9),
            item["current_score"],
        )
    )

    return recommendations


def get_user_courses(
    connection: sqlite3.Connection,
    user_id: int,
) -> list[dict]:
    if not table_exists(connection, "course_enrollments"):
        return []

    rows = connection.execute(
        """
        SELECT
            e.*,
            c.*
        FROM course_enrollments e
        JOIN courses c ON c.id = e.course_id
        WHERE e.user_id = ?
        ORDER BY e.id DESC
        """,
        (user_id,),
    ).fetchall()

    courses: list[dict] = []

    for row in rows:
        course_id = int(row_value(row, "course_id", "id", default=0))
        courses.append(
            {
                "course_id": course_id,
                "course_name": str(
                    row_value(row, "name", "course_name", "title", default="Course")
                ),
                "category": str(
                    row_value(row, "category", default="General") or "General"
                ),
                "difficulty": str(
                    row_value(row, "difficulty", "level", default="Beginner")
                    or "Beginner"
                ),
                "progress": int(row_value(row, "progress", default=0) or 0),
                "status": str(
                    row_value(row, "status", default="In Progress") or "In Progress"
                ),
                "enrolled_at": str(
                    row_value(row, "enrolled_at", "created_at", default="") or ""
                ),
            }
        )

    return courses


def get_history(
    connection: sqlite3.Connection,
    user_id: int,
    limit: int = 50,
) -> list[dict]:
    rows = connection.execute(
        """
        SELECT
            ch.*,
            c.course_name AS source_course_name
        FROM competency_history ch
        LEFT JOIN courses c
          ON c.id = ch.source_course_id
        WHERE ch.user_id = ?
        ORDER BY ch.id DESC
        LIMIT ?
        """,
        (user_id, limit),
    ).fetchall()

    return [
        {
            "id": row["id"],
            "skill_name": row["skill_name"],
            "previous_score": int(row["previous_score"] or 0),
            "new_score": int(row["new_score"] or 0),
            "improvement": int(row["improvement"] or 0),
            "improvement_percentage": float(
                row["improvement_percentage"] or 0
            ),
            "previous_level": row["previous_level"] or "Beginner",
            "new_level": row["new_level"] or "Beginner",
            "source": row["source"] or "",
            "source_course_id": row_value(
                row,
                "source_course_id",
                default=None,
            ),
            "source_course_name": row_value(
                row,
                "source_course_name",
                default=None,
            ),
            "created_at": row["created_at"] or "",
        }
        for row in rows
    ]


# ============================================================
# ROOT / USERS
# ============================================================

@app.get("/")
def root():
    return {"message": "Welcome to StatMentor AI"}


@app.get("/users")
def list_users():
    connection = get_connection()
    try:
        rows = connection.execute(
            "SELECT * FROM users ORDER BY id"
        ).fetchall()
        return [dict(row) for row in rows]
    finally:
        connection.close()


@app.post("/users")
def create_user(data: UserCreate):
    connection = get_connection()
    cursor = connection.cursor()

    try:
        cursor.execute(
            """
            INSERT INTO users (name, email, role, department)
            VALUES (?, ?, ?, ?)
            """,
            (data.name, data.email, data.role, data.department),
        )
        connection.commit()

        return {
            "message": "User created successfully.",
            "user_id": cursor.lastrowid,
        }

    except sqlite3.IntegrityError as exc:
        raise HTTPException(
            status_code=400,
            detail=f"Could not create user: {exc}",
        )
    finally:
        connection.close()


@app.get("/users/{user_id}")
def get_user(user_id: int):
    connection = get_connection()
    try:
        row = connection.execute(
            "SELECT * FROM users WHERE id = ?",
            (user_id,),
        ).fetchone()

        if not row:
            raise HTTPException(status_code=404, detail="User not found.")

        return dict(row)
    finally:
        connection.close()


# ============================================================
# COMPETENCIES
# ============================================================

@app.get("/competencies")
def list_all_competencies():
    connection = get_connection()
    try:
        rows = connection.execute(
            """
            SELECT *
            FROM competencies
            ORDER BY user_id, score DESC
            """
        ).fetchall()
        return [dict(row) for row in rows]
    finally:
        connection.close()


@app.post("/competencies")
def upsert_competency(data: CompetencyCreate):
    connection = get_connection()
    cursor = connection.cursor()

    try:
        user = cursor.execute(
            "SELECT id FROM users WHERE id = ?",
            (data.user_id,),
        ).fetchone()

        if not user:
            raise HTTPException(status_code=404, detail="User not found.")

        existing = cursor.execute(
            """
            SELECT *
            FROM competencies
            WHERE user_id = ? AND skill_name = ?
            """,
            (data.user_id, data.skill_name),
        ).fetchone()

        new_level = get_level(data.score)

        if existing:
            previous_score = int(existing["score"] or 0)
            previous_level = existing["level"] or get_level(previous_score)

            cursor.execute(
                """
                UPDATE competencies
                SET score = ?, level = ?, updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ? AND skill_name = ?
                """,
                (
                    data.score,
                    new_level,
                    data.user_id,
                    data.skill_name,
                ),
            )

            improvement = data.score - previous_score

            cursor.execute(
                """
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
                """,
                (
                    data.user_id,
                    data.skill_name,
                    previous_score,
                    data.score,
                    improvement,
                    calculate_improvement_percentage(
                        previous_score,
                        data.score,
                    ),
                    previous_level,
                    new_level,
                    "Manual Update",
                ),
            )

        else:
            cursor.execute(
                """
                INSERT INTO competencies (
                    user_id,
                    skill_name,
                    score,
                    level
                )
                VALUES (?, ?, ?, ?)
                """,
                (
                    data.user_id,
                    data.skill_name,
                    data.score,
                    new_level,
                ),
            )

        connection.commit()

        return {
            "message": "Competency saved successfully.",
            "user_id": data.user_id,
            "skill_name": data.skill_name,
            "score": data.score,
            "level": new_level,
        }
    finally:
        connection.close()


@app.get("/competencies/{user_id}")
def get_user_competencies(user_id: int):
    connection = get_connection()
    try:
        return competency_rows(connection, user_id)
    finally:
        connection.close()


# ============================================================
# DASHBOARD / SKILL GAPS / RECOMMENDATIONS
# ============================================================

@app.get("/dashboard/{user_id}")
def dashboard(user_id: int):
    connection = get_connection()

    try:
        user = connection.execute(
            "SELECT * FROM users WHERE id = ?",
            (user_id,),
        ).fetchone()

        if not user:
            raise HTTPException(status_code=404, detail="User not found.")

        competencies = competency_rows(connection, user_id)

        overall_score = (
            round(
                sum(item["score"] for item in competencies)
                / len(competencies)
            )
            if competencies
            else 0
        )

        return {
            "user": dict(user),
            "overall_score": overall_score,
            "competencies": competencies,
            "skill_gaps": skill_gap_rows(connection, user_id),
        }
    finally:
        connection.close()


@app.get("/skill-gaps/{user_id}")
def skill_gaps(user_id: int):
    connection = get_connection()
    try:
        return skill_gap_rows(connection, user_id)
    finally:
        connection.close()


@app.get("/recommendations/{user_id}")
def recommendations(user_id: int):
    connection = get_connection()
    try:
        return build_recommendations(connection, user_id)
    finally:
        connection.close()


@app.get("/dashboard/{user_id}/full")
def full_dashboard(user_id: int):
    connection = get_connection()

    try:
        user = connection.execute(
            "SELECT * FROM users WHERE id = ?",
            (user_id,),
        ).fetchone()

        if not user:
            raise HTTPException(status_code=404, detail="User not found.")

        competencies = competency_rows(connection, user_id)
        gaps = skill_gap_rows(connection, user_id)
        courses = get_user_courses(connection, user_id)
        recommendations_data = build_recommendations(connection, user_id)
        history = get_history(connection, user_id, limit=30)

        overall_score = (
            round(
                sum(item["score"] for item in competencies)
                / len(competencies)
            )
            if competencies
            else 0
        )

        strong_skills = sum(
            1 for item in competencies if item["score"] >= 70
        )

        completed_courses = sum(
            1
            for course in courses
            if str(course["status"]).lower() == "completed"
            or int(course["progress"]) >= 100
        )

        return {
            "user": {
                "id": user["id"],
                "name": user["name"],
                "email": user["email"],
                "role": user["role"],
                "department": user["department"],
            },
            "summary": {
                "overall_score": overall_score,
                "total_skills": len(competencies),
                "strong_skills": strong_skills,
                "skill_gaps": len(gaps),
                "total_courses": len(courses),
                "completed_courses": completed_courses,
            },
            "competencies": competencies,
            "skill_gaps": gaps,
            "recommendations": recommendations_data,
            "courses": courses,
            "improvement_history": history,
        }
    finally:
        connection.close()


# ============================================================
# LEARNING MATERIAL / PDF
# ============================================================

@app.post("/upload-pdf")
async def upload_pdf(
    file: UploadFile = File(...),
    user_id: int = Form(1),
    title: str | None = Form(None),
):
    file_name = Path(file.filename or "material.pdf").name
    destination = UPLOAD_DIR / file_name

    content = await file.read()
    destination.write_bytes(content)

    extracted_text = ""

    # Optional extraction. The endpoint still works even if no PDF reader
    # package is installed.
    try:
        from pypdf import PdfReader  # type: ignore

        reader = PdfReader(str(destination))
        extracted_text = "\n".join(
            page.extract_text() or ""
            for page in reader.pages
        )
    except Exception:
        try:
            from PyPDF2 import PdfReader  # type: ignore

            reader = PdfReader(str(destination))
            extracted_text = "\n".join(
                page.extract_text() or ""
                for page in reader.pages
            )
        except Exception:
            extracted_text = ""

    connection = get_connection()
    cursor = connection.cursor()

    try:
        cursor.execute(
            """
            INSERT INTO learning_materials (
                user_id,
                title,
                file_name,
                file_path,
                extracted_text
            )
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                user_id,
                title or file_name,
                file_name,
                str(destination),
                extracted_text,
            ),
        )
        connection.commit()

        return {
            "message": "PDF uploaded successfully.",
            "material_id": cursor.lastrowid,
            "file_name": file_name,
            "characters_extracted": len(extracted_text),
        }
    finally:
        connection.close()


@app.get("/materials/{material_id}")
def get_material(material_id: int):
    connection = get_connection()
    try:
        row = connection.execute(
            "SELECT * FROM learning_materials WHERE id = ?",
            (material_id,),
        ).fetchone()

        if not row:
            raise HTTPException(status_code=404, detail="Material not found.")

        return dict(row)
    finally:
        connection.close()


# ============================================================
# LEGACY / FIXED ASSESSMENT
# ============================================================

@app.get("/assessment/questions")
def legacy_assessment_questions(
    skill_name: str | None = None,
    limit: int = 10,
):
    connection = get_connection()

    try:
        if skill_name:
            rows = connection.execute(
                """
                SELECT id, skill_name, difficulty, question, options_json
                FROM assessment_questions
                WHERE LOWER(skill_name) = LOWER(?)
                ORDER BY id
                LIMIT ?
                """,
                (skill_name, limit),
            ).fetchall()
        else:
            rows = connection.execute(
                """
                SELECT id, skill_name, difficulty, question, options_json
                FROM assessment_questions
                ORDER BY id
                LIMIT ?
                """,
                (limit,),
            ).fetchall()

        return [
            {
                "id": row["id"],
                "skill_name": row["skill_name"],
                "difficulty": row["difficulty"],
                "question": row["question"],
                "options": normalize_options(row["options_json"]),
            }
            for row in rows
        ]
    finally:
        connection.close()


@app.post("/assessment/submit")
def legacy_assessment_submit(data: LegacyAssessmentSubmit):
    connection = get_connection()
    cursor = connection.cursor()

    try:
        total = 0
        correct = 0

        for question_id_text, answer in data.answers.items():
            try:
                question_id = int(question_id_text)
            except ValueError:
                continue

            question = cursor.execute(
                """
                SELECT *
                FROM assessment_questions
                WHERE id = ?
                """,
                (question_id,),
            ).fetchone()

            if not question:
                continue

            total += 1
            is_correct = (
                str(answer).strip().lower()
                == str(question["correct_answer"]).strip().lower()
            )

            if is_correct:
                correct += 1

            cursor.execute(
                """
                INSERT INTO assessment_answers (
                    user_id,
                    question_id,
                    answer,
                    score,
                    is_correct
                )
                VALUES (?, ?, ?, ?, ?)
                """,
                (
                    data.user_id,
                    question_id,
                    answer,
                    100 if is_correct else 0,
                    1 if is_correct else 0,
                ),
            )

        connection.commit()

        score = round((correct / total) * 100) if total else 0

        return {
            "message": "Assessment submitted.",
            "correct": correct,
            "total": total,
            "score": score,
        }
    finally:
        connection.close()


# ============================================================
# AI ADAPTIVE ASSESSMENT
# ============================================================

@app.post("/ai/assessment/start")
def start_ai_assessment(data: AIAssessmentStart):
    connection = get_connection()
    cursor = connection.cursor()

    try:
        cursor.execute(
            "SELECT * FROM users WHERE id = ?",
            (data.user_id,),
        )
        user = cursor.fetchone()

        if not user:
            raise HTTPException(status_code=404, detail="User not found.")

        skills = get_ai_assessment_skills(
            connection,
            data.user_id,
            data.skills,
        )

        if not skills:
            raise HTTPException(
                status_code=400,
                detail="No skills available for assessment.",
            )

        max_questions = max(1, min(data.max_questions, 30))

        # The backend decides whether this really is a post-course
        # reassessment. The frontend cannot declare one without a
        # completed enrollment for the supplied course.
        assessment_type = "AI Assessment"
        source_course_id = None

        if data.source_course_id is not None:
            cursor.execute(
                """
                SELECT
                    ce.status,
                    ce.progress,
                    c.id AS course_id,
                    c.course_name
                FROM course_enrollments ce
                JOIN courses c
                  ON c.id = ce.course_id
                WHERE ce.user_id = ?
                  AND ce.course_id = ?
                """,
                (
                    data.user_id,
                    data.source_course_id,
                ),
            )
            course_enrollment = cursor.fetchone()

            if not course_enrollment:
                raise HTTPException(
                    status_code=400,
                    detail="Course enrollment not found for reassessment.",
                )

            course_status = str(
                course_enrollment["status"] or ""
            ).strip().lower()
            course_progress = int(
                course_enrollment["progress"] or 0
            )

            if course_status != "completed" and course_progress < 100:
                raise HTTPException(
                    status_code=400,
                    detail="Course must be completed before reassessment.",
                )

            assessment_type = "Post-Course Reassessment"
            source_course_id = int(data.source_course_id)

        cursor.execute(
            """
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
            """,
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

        session_id = cursor.lastrowid
        connection.commit()

        return {
            "message": "AI assessment started successfully.",
            "session_id": session_id,
            "user_id": data.user_id,
            "skills": skills,
            "max_questions": max_questions,
            "current_skill": skills[0],
            "current_level": "Beginner",
            "assessment_type": assessment_type,
            "source_course_id": source_course_id,
        }
    finally:
        connection.close()


@app.post("/ai/assessment/next")
def get_next_ai_question(session_id: int):
    connection = get_connection()
    cursor = connection.cursor()

    try:
        cursor.execute(
            "SELECT * FROM ai_assessment_sessions WHERE id = ?",
            (session_id,),
        )
        session = cursor.fetchone()

        if not session:
            raise HTTPException(
                status_code=404,
                detail="Assessment session not found.",
            )

        if session["status"] == "Completed":
            return {
                "message": "Assessment already completed.",
                "completed": True,
            }

        # Safety guard. Normally the answer endpoint completes the session.
        if int(session["question_count"] or 0) >= int(session["max_questions"] or 0):
            return {
                "message": "Maximum question count reached.",
                "completed": True,
            }

        cursor.execute(
            "SELECT * FROM users WHERE id = ?",
            (session["user_id"],),
        )
        user = cursor.fetchone()

        if not user:
            raise HTTPException(status_code=404, detail="User not found.")

        cursor.execute(
            """
            SELECT question
            FROM ai_assessment_questions
            WHERE session_id = ?
            ORDER BY sequence_number
            """,
            (session_id,),
        )
        previous_questions = [
            row["question"]
            for row in cursor.fetchall()
        ]

        cursor.execute(
            """
            SELECT answer
            FROM ai_assessment_answers
            WHERE session_id = ?
            ORDER BY id
            """,
            (session_id,),
        )
        previous_answers = [
            row["answer"]
            for row in cursor.fetchall()
        ]

        question = generate_question(
            role=user["role"],
            department=user["department"],
            skill=session["current_skill"],
            level=session["current_level"],
            previous_questions=previous_questions,
            previous_answers=previous_answers,
        )

        if not isinstance(question, dict):
            raise HTTPException(
                status_code=500,
                detail="AI question generator returned an invalid response.",
            )

        sequence_number = int(session["question_count"] or 0) + 1

        options = normalize_options(question.get("options", {}))

        cursor.execute(
            """
            INSERT INTO ai_assessment_questions (
                session_id,
                sequence_number,
                skill_name,
                question_type,
                difficulty,
                question,
                options_json,
                correct_answer,
                explanation
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                session_id,
                sequence_number,
                question.get("skill_name") or session["current_skill"],
                question.get("question_type") or "multiple_choice",
                question.get("difficulty") or session["current_level"],
                question.get("question"),
                json.dumps(options),
                question.get("correct_answer"),
                question.get("explanation"),
            ),
        )

        question_id = cursor.lastrowid

        cursor.execute(
            """
            UPDATE ai_assessment_sessions
            SET question_count = ?
            WHERE id = ?
            """,
            (sequence_number, session_id),
        )

        connection.commit()

        return {
            "session_id": session_id,
            "question_id": question_id,
            "sequence_number": sequence_number,
            "question_type": question.get("question_type") or "multiple_choice",
            "skill_name": question.get("skill_name") or session["current_skill"],
            "difficulty": question.get("difficulty") or session["current_level"],
            "question": question.get("question"),
            "options": options,
            "completed": False,
        }
    finally:
        connection.close()


@app.post("/ai/assessment/answer")
def submit_ai_assessment_answer(data: AIAssessmentAnswer):
    connection = get_connection()
    cursor = connection.cursor()

    try:
        # ----------------------------------------------------
        # GET SESSION
        # ----------------------------------------------------
        cursor.execute(
            """
            SELECT *
            FROM ai_assessment_sessions
            WHERE id = ?
            """,
            (data.session_id,),
        )
        session = cursor.fetchone()

        if not session:
            raise HTTPException(
                status_code=404,
                detail="Assessment session not found.",
            )

        if session["status"] == "Completed":
            raise HTTPException(
                status_code=400,
                detail="Assessment is already completed.",
            )

        # ----------------------------------------------------
        # GET QUESTION
        # ----------------------------------------------------
        cursor.execute(
            """
            SELECT *
            FROM ai_assessment_questions
            WHERE id = ?
              AND session_id = ?
            """,
            (
                data.question_id,
                data.session_id,
            ),
        )
        question = cursor.fetchone()

        if not question:
            raise HTTPException(
                status_code=404,
                detail="Question not found.",
            )

        if int(question["answered"] or 0) == 1:
            raise HTTPException(
                status_code=400,
                detail="This question has already been answered.",
            )

        # ----------------------------------------------------
        # EVALUATE ANSWER
        # ----------------------------------------------------
        evaluation = evaluate_answer(
            question_type=question["question_type"],
            selected_answer=data.answer,
            correct_answer=question["correct_answer"],
            skill=question["skill_name"],
            level=question["difficulty"],
            question=question["question"],
            explanation=question["explanation"],
        )

        if not isinstance(evaluation, dict):
            evaluation = {}

        score = int(evaluation.get("score", 0))
        score = max(0, min(100, score))

        is_correct = bool(
            evaluation.get("is_correct", False)
        )

        feedback = str(
            evaluation.get("feedback", "")
            or ""
        )

        # ----------------------------------------------------
        # SAVE ANSWER
        # ----------------------------------------------------
        cursor.execute(
            """
            INSERT INTO ai_assessment_answers (
                question_id,
                session_id,
                user_id,
                answer,
                score,
                is_correct,
                feedback
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                data.question_id,
                data.session_id,
                session["user_id"],
                data.answer,
                score,
                1 if is_correct else 0,
                feedback,
            ),
        )

        # ----------------------------------------------------
        # MARK QUESTION AS ANSWERED
        # ----------------------------------------------------
        cursor.execute(
            """
            UPDATE ai_assessment_questions
            SET
                answered = 1,
                evaluation_score = ?,
                evaluation_feedback = ?
            WHERE id = ?
            """,
            (
                score,
                feedback,
                data.question_id,
            ),
        )

        # ----------------------------------------------------
        # GET ALL ANSWERS FOR THIS SESSION
        # ----------------------------------------------------
        cursor.execute(
            """
            SELECT
                q.skill_name,
                a.score,
                a.is_correct
            FROM ai_assessment_answers a
            JOIN ai_assessment_questions q
                ON q.id = a.question_id
            WHERE a.session_id = ?
            ORDER BY a.id
            """,
            (data.session_id,),
        )
        rows = cursor.fetchall()

        answer_results = [
            {
                "skill_name": row["skill_name"],
                "score": int(row["score"] or 0),
                "is_correct": bool(row["is_correct"]),
            }
            for row in rows
        ]

        # ----------------------------------------------------
        # AVAILABLE SKILLS
        # IMPORTANT: use the exact skills selected at start.
        # ----------------------------------------------------
        skills: list[str] = []

        selected_skills_json = row_value(
            session,
            "selected_skills_json",
            default=None,
        )

        if selected_skills_json:
            try:
                parsed_skills = json.loads(selected_skills_json)
                if isinstance(parsed_skills, list):
                    skills = [
                        str(skill).strip()
                        for skill in parsed_skills
                        if str(skill).strip()
                    ]
            except (json.JSONDecodeError, TypeError):
                skills = []

        if not skills:
            skills = get_ai_assessment_skills(
                connection,
                session["user_id"],
            )

        # ----------------------------------------------------
        # ADAPTIVE ENGINE
        # ----------------------------------------------------
        strategy = get_next_question_strategy(
            current_skill=session["current_skill"],
            current_level=session["current_level"],
            last_score=score,
            answer_results=answer_results,
            available_skills=skills,
            total_questions=session["question_count"],
            max_questions=session["max_questions"],
        )

        if not isinstance(strategy, dict):
            strategy = {}

        finish_assessment = bool(
            strategy.get("finish_assessment", False)
        )

        # Always stop after max_questions, even if the adaptive helper
        # returns an unexpected result.
        if int(session["question_count"] or 0) >= int(session["max_questions"] or 0):
            finish_assessment = True

        next_skill = (
            strategy.get("next_skill")
            or session["current_skill"]
        )

        # Never allow the adaptive engine to jump outside the selected list.
        if next_skill not in skills:
            next_skill = session["current_skill"]
            if next_skill not in skills and skills:
                next_skill = skills[0]

        next_level = (
            strategy.get("next_level")
            or session["current_level"]
        )

        adaptive_reason = (
            strategy.get("adaptive_reason")
            or strategy.get("reason")
            or strategy.get("message")
            or "Adaptive strategy updated from the latest answer."
        )

        # ----------------------------------------------------
        # COMPLETION
        # ----------------------------------------------------
        if finish_assessment:
            cursor.execute(
                """
                UPDATE ai_assessment_sessions
                SET
                    status = 'Completed',
                    completed_at = CURRENT_TIMESTAMP
                WHERE id = ?
                """,
                (data.session_id,),
            )

            # Group question scores by skill.
            skill_groups: dict[str, list[dict]] = {}

            for result in answer_results:
                skill = result["skill_name"]

                if skill not in skill_groups:
                    skill_groups[skill] = []

                skill_groups[skill].append(result)

            competency_results: list[dict] = []

            for skill_name, results in skill_groups.items():
                skill_score = round(
                    sum(result["score"] for result in results)
                    / len(results)
                )
                skill_score = max(0, min(100, skill_score))
                new_level = get_level(skill_score)

                cursor.execute(
                    """
                    SELECT score, level
                    FROM competencies
                    WHERE user_id = ?
                      AND skill_name = ?
                    """,
                    (
                        session["user_id"],
                        skill_name,
                    ),
                )
                existing = cursor.fetchone()

                if existing:
                    previous_score = int(existing["score"] or 0)
                    previous_level = (
                        existing["level"]
                        or get_level(previous_score)
                    )
                else:
                    previous_score = 0
                    previous_level = "Beginner"

                improvement = skill_score - previous_score
                improvement_percentage = (
                    calculate_improvement_percentage(
                        previous_score,
                        skill_score,
                    )
                )

                if existing:
                    cursor.execute(
                        """
                        UPDATE competencies
                        SET
                            score = ?,
                            level = ?,
                            updated_at = CURRENT_TIMESTAMP
                        WHERE user_id = ?
                          AND skill_name = ?
                        """,
                        (
                            skill_score,
                            new_level,
                            session["user_id"],
                            skill_name,
                        ),
                    )
                else:
                    cursor.execute(
                        """
                        INSERT INTO competencies (
                            user_id,
                            skill_name,
                            score,
                            level
                        )
                        VALUES (?, ?, ?, ?)
                        """,
                        (
                            session["user_id"],
                            skill_name,
                            skill_score,
                            new_level,
                        ),
                    )

                history_source = (
                    row_value(
                        session,
                        "assessment_type",
                        default="AI Assessment",
                    )
                    or "AI Assessment"
                )
                history_source_course_id = row_value(
                    session,
                    "source_course_id",
                    default=None,
                )

                cursor.execute(
                    """
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
                    """,
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

                competency_results.append(
                    {
                        "skill_name": skill_name,
                        "score": skill_score,
                        "level": new_level,
                        "previous_score": previous_score,
                        "previous_level": previous_level,
                        "improvement": improvement,
                        "improvement_percentage": improvement_percentage,
                    }
                )

            connection.commit()

            completed_gaps = [
                {
                    **result,
                    "priority": get_gap_priority(result["score"]),
                }
                for result in competency_results
                if result["score"] < 70
            ]

            completed_strong = [
                result
                for result in competency_results
                if result["score"] >= 70
            ]

            return {
                "message": "Answer evaluated successfully.",
                "completed": True,
                "evaluation": {
                    "score": score,
                    "is_correct": is_correct,
                    "feedback": feedback,
                },
                "next_skill": None,
                "next_level": None,
                "adaptive_reason": adaptive_reason,
                "question_number": int(session["question_count"] or 0),
                "competencies": competency_results,
                "skill_gaps": completed_gaps,
                "strong_skills": completed_strong,
            }

        # ----------------------------------------------------
        # CONTINUE ASSESSMENT
        # ----------------------------------------------------
        cursor.execute(
            """
            UPDATE ai_assessment_sessions
            SET
                current_skill = ?,
                current_level = ?
            WHERE id = ?
            """,
            (
                next_skill,
                next_level,
                data.session_id,
            ),
        )

        connection.commit()

        return {
            "message": "Answer evaluated successfully.",
            "completed": False,
            "evaluation": {
                "score": score,
                "is_correct": is_correct,
                "feedback": feedback,
            },
            "next_skill": next_skill,
            "next_level": next_level,
            "adaptive_reason": adaptive_reason,
            "question_number": int(session["question_count"] or 0),
        }

    finally:
        connection.close()


@app.get("/ai/assessment/{user_id}/result")
def get_ai_assessment_result(user_id: int):
    connection = get_connection()

    try:
        session = connection.execute(
            """
            SELECT *
            FROM ai_assessment_sessions
            WHERE user_id = ?
              AND status = 'Completed'
            ORDER BY id DESC
            LIMIT 1
            """,
            (user_id,),
        ).fetchone()

        if not session:
            raise HTTPException(
                status_code=404,
                detail="No completed AI assessment found.",
            )

        rows = connection.execute(
            """
            SELECT
                q.skill_name,
                q.difficulty,
                q.sequence_number,
                a.score,
                a.is_correct,
                a.feedback
            FROM ai_assessment_answers a
            JOIN ai_assessment_questions q
                ON q.id = a.question_id
            WHERE a.session_id = ?
            ORDER BY q.sequence_number
            """,
            (session["id"],),
        ).fetchall()

        answers = [
            {
                "skill_name": row["skill_name"],
                "difficulty": row["difficulty"],
                "sequence_number": row["sequence_number"],
                "score": int(row["score"] or 0),
                "is_correct": bool(row["is_correct"]),
                "feedback": row["feedback"] or "",
            }
            for row in rows
        ]

        competencies = competency_rows(connection, user_id)

        return {
            "session_id": session["id"],
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
                json.loads(session["selected_skills_json"])
                if row_value(session, "selected_skills_json", default=None)
                else []
            ),
            "answers": answers,
            "competencies": competencies,
            "skill_gaps": skill_gap_rows(connection, user_id),
            "recommendations": build_recommendations(connection, user_id),
        }
    finally:
        connection.close()


# ============================================================
# COURSES
# ============================================================


@app.get("/courses/{course_id}/skills")
def get_course_skills(course_id: int):
    connection = get_connection()

    try:
        course = connection.execute(
            """
            SELECT *
            FROM courses
            WHERE id = ?
            """,
            (course_id,),
        ).fetchone()

        if not course:
            raise HTTPException(
                status_code=404,
                detail="Course not found.",
            )

        rows = connection.execute(
            """
            SELECT skill_name
            FROM course_competencies
            WHERE course_id = ?
            ORDER BY id
            """,
            (course_id,),
        ).fetchall()

        skills = [
            row["skill_name"]
            for row in rows
            if row["skill_name"]
        ]

        return {
            "course_id": course_id,
            "course_name": course["course_name"],
            "skills": skills,
        }

    finally:
        connection.close()


@app.get("/courses")
def list_courses():
    connection = get_connection()
    try:
        rows = connection.execute(
            "SELECT * FROM courses ORDER BY id"
        ).fetchall()
        return [course_to_dict(row) for row in rows]
    finally:
        connection.close()


@app.post("/courses/enroll")
def enroll_course(data: CourseEnrollmentCreate):
    connection = get_connection()
    cursor = connection.cursor()

    try:
        user = cursor.execute(
            "SELECT id FROM users WHERE id = ?",
            (data.user_id,),
        ).fetchone()

        if not user:
            raise HTTPException(status_code=404, detail="User not found.")

        course = cursor.execute(
            "SELECT id FROM courses WHERE id = ?",
            (data.course_id,),
        ).fetchone()

        if not course:
            raise HTTPException(status_code=404, detail="Course not found.")

        existing = get_enrollment(
            connection,
            data.user_id,
            data.course_id,
        )

        if existing:
            return {
                "message": "User is already enrolled in this course.",
                "enrollment_id": existing["id"],
                "progress": int(row_value(existing, "progress", default=0) or 0),
                "status": row_value(
                    existing,
                    "status",
                    default="In Progress",
                ),
            }

        cursor.execute(
            """
            INSERT INTO course_enrollments (
                user_id,
                course_id,
                progress,
                status
            )
            VALUES (?, ?, ?, ?)
            """,
            (
                data.user_id,
                data.course_id,
                0,
                "In Progress",
            ),
        )
        connection.commit()

        return {
            "message": "Course enrollment successful.",
            "enrollment_id": cursor.lastrowid,
            "user_id": data.user_id,
            "course_id": data.course_id,
            "progress": 0,
            "status": "In Progress",
        }
    finally:
        connection.close()


@app.post("/courses/progress")
def update_course_progress(data: CourseProgressUpdate):
    connection = get_connection()
    cursor = connection.cursor()

    try:
        enrollment = get_enrollment(
            connection,
            data.user_id,
            data.course_id,
        )

        if not enrollment:
            raise HTTPException(
                status_code=404,
                detail="Course enrollment not found.",
            )

        status = (
            "Completed"
            if data.progress >= 100
            else "In Progress"
        )

        if status == "Completed":
            cursor.execute(
                """
                UPDATE course_enrollments
                SET
                    progress = ?,
                    status = ?,
                    completed_at = CURRENT_TIMESTAMP
                WHERE id = ?
                """,
                (
                    data.progress,
                    status,
                    enrollment["id"],
                ),
            )
        else:
            cursor.execute(
                """
                UPDATE course_enrollments
                SET
                    progress = ?,
                    status = ?
                WHERE id = ?
                """,
                (
                    data.progress,
                    status,
                    enrollment["id"],
                ),
            )

        connection.commit()

        return {
            "message": "Course progress updated.",
            "user_id": data.user_id,
            "course_id": data.course_id,
            "progress": data.progress,
            "status": status,
        }
    finally:
        connection.close()


@app.get("/courses/{course_id}/quiz")
def get_course_quiz(course_id: int):
    connection = get_connection()

    try:
        rows = connection.execute(
            """
            SELECT *
            FROM course_quiz_questions
            WHERE course_id = ?
            ORDER BY id
            """,
            (course_id,),
        ).fetchall()

        return [
            {
                "id": row["id"],
                "course_id": row["course_id"],
                "question": row["question"],
                "options": normalize_options(row["options_json"]),
                "skill_name": row_value(row, "skill_name", default=None),
            }
            for row in rows
        ]
    finally:
        connection.close()


@app.post("/courses/{course_id}/quiz/submit")
def submit_course_quiz(
    course_id: int,
    data: CourseQuizSubmit,
):
    connection = get_connection()
    cursor = connection.cursor()

    try:
        questions = cursor.execute(
            """
            SELECT *
            FROM course_quiz_questions
            WHERE course_id = ?
            ORDER BY id
            """,
            (course_id,),
        ).fetchall()

        if not questions:
            raise HTTPException(
                status_code=404,
                detail="No quiz questions found for this course.",
            )

        correct = 0
        answered = 0
        skill_scores: dict[str, list[int]] = {}

        for question in questions:
            answer = data.answers.get(str(question["id"]))

            if answer is None:
                continue

            answered += 1

            is_correct = (
                str(answer).strip().lower()
                == str(question["correct_answer"]).strip().lower()
            )

            if is_correct:
                correct += 1

            skill_name = (
                row_value(question, "skill_name", default=None)
                or "General"
            )

            skill_scores.setdefault(skill_name, []).append(
                100 if is_correct else 0
            )

        quiz_score = (
            round((correct / answered) * 100)
            if answered
            else 0
        )

        competency_updates = []

        for skill_name, scores in skill_scores.items():
            if skill_name == "General":
                continue

            new_score = round(sum(scores) / len(scores))
            new_level = get_level(new_score)

            existing = cursor.execute(
                """
                SELECT *
                FROM competencies
                WHERE user_id = ?
                  AND skill_name = ?
                """,
                (
                    data.user_id,
                    skill_name,
                ),
            ).fetchone()

            previous_score = int(
                row_value(existing, "score", default=0) or 0
            )
            previous_level = str(
                row_value(
                    existing,
                    "level",
                    default=get_level(previous_score),
                )
            )

            if existing:
                cursor.execute(
                    """
                    UPDATE competencies
                    SET
                        score = ?,
                        level = ?,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE user_id = ?
                      AND skill_name = ?
                    """,
                    (
                        new_score,
                        new_level,
                        data.user_id,
                        skill_name,
                    ),
                )
            else:
                cursor.execute(
                    """
                    INSERT INTO competencies (
                        user_id,
                        skill_name,
                        score,
                        level
                    )
                    VALUES (?, ?, ?, ?)
                    """,
                    (
                        data.user_id,
                        skill_name,
                        new_score,
                        new_level,
                    ),
                )

            improvement = new_score - previous_score

            cursor.execute(
                """
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
                """,
                (
                    data.user_id,
                    skill_name,
                    previous_score,
                    new_score,
                    improvement,
                    calculate_improvement_percentage(
                        previous_score,
                        new_score,
                    ),
                    previous_level,
                    new_level,
                    "Course Quiz",
                ),
            )

            competency_updates.append(
                {
                    "skill_name": skill_name,
                    "previous_score": previous_score,
                    "new_score": new_score,
                    "previous_level": previous_level,
                    "new_level": new_level,
                    "improvement": improvement,
                }
            )

        connection.commit()

        return {
            "message": "Course quiz submitted successfully.",
            "course_id": course_id,
            "user_id": data.user_id,
            "answered": answered,
            "correct": correct,
            "score": quiz_score,
            "competency_updates": competency_updates,
        }
    finally:
        connection.close()


# ============================================================
# IMPROVEMENT / HISTORY
# ============================================================

@app.get("/competency-history/{user_id}")
def competency_history(user_id: int):
    connection = get_connection()
    try:
        return get_history(connection, user_id, limit=100)
    finally:
        connection.close()


@app.get("/improvement")
def improvement(
    user_id: int,
    skill_name: str | None = None,
):
    connection = get_connection()

    try:
        if skill_name:
            rows = connection.execute(
                """
                SELECT *
                FROM competency_history
                WHERE user_id = ?
                  AND LOWER(skill_name) = LOWER(?)
                ORDER BY id DESC
                """,
                (
                    user_id,
                    skill_name,
                ),
            ).fetchall()
        else:
            rows = connection.execute(
                """
                SELECT *
                FROM competency_history
                WHERE user_id = ?
                ORDER BY id DESC
                """,
                (user_id,),
            ).fetchall()

        return [dict(row) for row in rows]
    finally:
        connection.close()
