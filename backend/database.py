import sqlite3
from pathlib import Path


# ============================================================
# DATABASE PATH
# ============================================================

DATABASE_PATH = (
    Path(__file__).resolve().parent.parent
    / "database"
    / "statmentor.db"
)

# Make sure the database folder exists
DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)


# ============================================================
# DATABASE CONNECTION
# ============================================================

def get_connection():
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


# ============================================================
# INITIALIZE DATABASE
# ============================================================

def initialize_database():

    connection = get_connection()
    cursor = connection.cursor()

    # --------------------------------------------------------
    # USERS TABLE
    # --------------------------------------------------------

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            role TEXT,
            department TEXT
        )
    """)

    # --------------------------------------------------------
    # COMPETENCIES TABLE
    # --------------------------------------------------------

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS competencies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            skill_name TEXT NOT NULL,
            score INTEGER DEFAULT 0,
            level TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)

    # Remove duplicate competency records
    cursor.execute("""
        DELETE FROM competencies
        WHERE id NOT IN (
            SELECT MIN(id)
            FROM competencies
            GROUP BY user_id, skill_name
        )
    """)

    # Prevent duplicate skills for the same user
    cursor.execute("""
        CREATE UNIQUE INDEX IF NOT EXISTS idx_competencies_user_skill
        ON competencies(user_id, skill_name)
    """)
    # --------------------------------------------------------
    # LEARNING MATERIALS TABLE
    # --------------------------------------------------------

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS learning_materials (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            filename TEXT NOT NULL,
            topic TEXT,
            content TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)

    # --------------------------------------------------------
    # QUIZZES TABLE
    # --------------------------------------------------------

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS quizzes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            topic TEXT,
            difficulty TEXT
        )
    """)

    # --------------------------------------------------------
    # QUIZ RESULTS TABLE
    # --------------------------------------------------------

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS quiz_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            quiz_id INTEGER NOT NULL,
            score INTEGER,
            total_questions INTEGER,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
        )
    """)

    # --------------------------------------------------------
    # COURSES TABLE
    # --------------------------------------------------------

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS courses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            course_name TEXT NOT NULL,
            category TEXT NOT NULL,
            description TEXT,
            difficulty TEXT
        )
    """)

    # --------------------------------------------------------
    # COURSE-COMPETENCY MAPPING TABLE
    # --------------------------------------------------------

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS course_competencies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            course_id INTEGER NOT NULL,
            skill_name TEXT NOT NULL,
            FOREIGN KEY (course_id) REFERENCES courses(id)
        )
    """)

    # --------------------------------------------------------
    # ASSESSMENT QUESTIONS TABLE
    # --------------------------------------------------------

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS assessment_questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question TEXT NOT NULL,
            option_a TEXT NOT NULL,
            option_b TEXT NOT NULL,
            option_c TEXT NOT NULL,
            option_d TEXT NOT NULL,
            correct_answer TEXT NOT NULL,
            skill_name TEXT NOT NULL,
            difficulty TEXT DEFAULT 'Beginner'
        )
    """)

    # --------------------------------------------------------
    # ASSESSMENT ANSWERS TABLE
    # --------------------------------------------------------

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS assessment_answers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            question_id INTEGER NOT NULL,
            selected_answer TEXT NOT NULL,
            is_correct INTEGER NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (question_id) REFERENCES assessment_questions(id)
        )
    """)

    # --------------------------------------------------------
    # COURSE ENROLLMENTS TABLE
    # --------------------------------------------------------

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS course_enrollments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            course_id INTEGER NOT NULL,
            status TEXT DEFAULT 'In Progress',
            progress INTEGER DEFAULT 0,
            enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (course_id) REFERENCES courses(id),
            UNIQUE(user_id, course_id)
        )
    """)

    # --------------------------------------------------------
    # COURSE REASSESSMENT QUESTIONS TABLE
    # --------------------------------------------------------

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS course_quiz_questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            course_id INTEGER NOT NULL,
            question TEXT NOT NULL,
            option_a TEXT NOT NULL,
            option_b TEXT NOT NULL,
            option_c TEXT NOT NULL,
            option_d TEXT NOT NULL,
            correct_answer TEXT NOT NULL,
            skill_name TEXT NOT NULL,
            difficulty TEXT DEFAULT 'Intermediate',
            FOREIGN KEY (course_id) REFERENCES courses(id)
        )
    """)

    # --------------------------------------------------------
    # ADD PROGRESS COLUMN IF IT DOES NOT EXIST
    # --------------------------------------------------------

    cursor.execute("PRAGMA table_info(course_enrollments)")
    columns = [column["name"] for column in cursor.fetchall()]

    if "progress" not in columns:
        cursor.execute("""
            ALTER TABLE course_enrollments
            ADD COLUMN progress INTEGER DEFAULT 0
        """)

    # --------------------------------------------------------
    # COMPETENCY HISTORY TABLE
    # --------------------------------------------------------

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS competency_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            skill_name TEXT NOT NULL,
            previous_score INTEGER NOT NULL,
            new_score INTEGER NOT NULL,
            improvement INTEGER NOT NULL,
            improvement_percentage REAL NOT NULL,
            previous_level TEXT,
            new_level TEXT,
            source TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)
    # AI adaptive assessment sessions
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS ai_assessment_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            status TEXT DEFAULT 'In Progress',
            current_skill TEXT,
            current_level TEXT DEFAULT 'Beginner',
            question_count INTEGER DEFAULT 0,
            max_questions INTEGER DEFAULT 12,
            started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            completed_at TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)

    # AI-generated assessment questions
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS ai_assessment_questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id INTEGER NOT NULL,
            sequence_number INTEGER NOT NULL,
            skill_name TEXT NOT NULL,
            question_type TEXT NOT NULL,
            difficulty TEXT NOT NULL,
            question TEXT NOT NULL,
            options_json TEXT,
            correct_answer TEXT,
            explanation TEXT,
            answered INTEGER DEFAULT 0,
            evaluation_score INTEGER,
            evaluation_feedback TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (session_id) REFERENCES ai_assessment_sessions(id)
        )
    """)

    # Employee answers to AI-generated questions
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS ai_assessment_answers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question_id INTEGER NOT NULL,
            session_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            answer TEXT NOT NULL,
            score INTEGER,
            is_correct INTEGER,
            feedback TEXT,
            answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (question_id) REFERENCES ai_assessment_questions(id),
            FOREIGN KEY (session_id) REFERENCES ai_assessment_sessions(id),
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)
    # --------------------------------------------------------
    # SAVE CHANGES
    # --------------------------------------------------------

    connection.commit()

    # --------------------------------------------------------
    # CLOSE CONNECTION
    # IMPORTANT: This must be AFTER all CREATE TABLE commands
    # --------------------------------------------------------

    connection.close()