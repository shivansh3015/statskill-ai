from database import get_connection


courses = [
    {
        "name": "Probability Fundamentals",
        "category": "Mathematics & Statistics",
        "description": "Learn probability concepts, probability distributions and statistical reasoning.",
        "difficulty": "Beginner",
        "skills": ["Probability"]
    },
    {
        "name": "Regression Analysis",
        "category": "Mathematics & Statistics",
        "description": "Learn linear regression, multiple regression and model interpretation.",
        "difficulty": "Intermediate",
        "skills": ["Regression"]
    },
    {
        "name": "Python for Data Analysis",
        "category": "Computer & IT",
        "description": "Learn Python programming for data analysis and statistical computing.",
        "difficulty": "Beginner",
        "skills": ["Python"]
    },
    {
        "name": "SQL for Data Management",
        "category": "Computer & IT",
        "description": "Learn SQL queries, databases and data management.",
        "difficulty": "Beginner",
        "skills": ["SQL", "Database"]
    },
    {
        "name": "Data Visualization Fundamentals",
        "category": "Data Visualization",
        "description": "Learn charts, dashboards and effective data visualization.",
        "difficulty": "Beginner",
        "skills": ["Data Visualization"]
    },
    {
        "name": "Professional Communication",
        "category": "Communication",
        "description": "Improve workplace communication, presentation and writing skills.",
        "difficulty": "Beginner",
        "skills": ["Communication"]
    },
    {
        "name": "Leadership and Team Management",
        "category": "Management",
        "description": "Develop leadership, decision-making and team management skills.",
        "difficulty": "Intermediate",
        "skills": ["Management", "Leadership"]
    },
    {
        "name": "Introduction to Artificial Intelligence",
        "category": "AI & Data Science",
        "description": "Understand artificial intelligence concepts and applications.",
        "difficulty": "Beginner",
        "skills": ["Artificial Intelligence", "AI"]
    },
    {
        "name": "Statistics Fundamentals",
        "category": "Mathematics & Statistics",
        "description": "Learn descriptive statistics, probability basics and statistical concepts.",
        "difficulty": "Beginner",
        "skills": ["Statistics"]
    }
]


connection = get_connection()
cursor = connection.cursor()

for course in courses:

    # Check if course already exists
    cursor.execute(
        """
        SELECT id
        FROM courses
        WHERE course_name = ?
        """,
        (course["name"],)
    )

    existing_course = cursor.fetchone()

    if existing_course:
        course_id = existing_course["id"]
    else:
        cursor.execute(
            """
            INSERT INTO courses
            (course_name, category, description, difficulty)
            VALUES (?, ?, ?, ?)
            """,
            (
                course["name"],
                course["category"],
                course["description"],
                course["difficulty"]
            )
        )

        course_id = cursor.lastrowid

    # Add competency mappings
    for skill in course["skills"]:

        cursor.execute(
            """
            SELECT id
            FROM course_competencies
            WHERE course_id = ?
            AND skill_name = ?
            """,
            (course_id, skill)
        )

        existing_mapping = cursor.fetchone()

        if not existing_mapping:
            cursor.execute(
                """
                INSERT INTO course_competencies
                (course_id, skill_name)
                VALUES (?, ?)
                """,
                (course_id, skill)
            )

print("Courses added successfully.")

# ============================================================
# REGRESSION REASSESSMENT QUESTIONS
# ============================================================

import sqlite3
from database import get_connection


def seed_regression_quiz():

    connection = get_connection()
    cursor = connection.cursor()

    questions = [
        (
            2,
            "What is the main purpose of linear regression?",
            "To classify data into categories",
            "To predict a dependent variable using one or more independent variables",
            "To remove all outliers",
            "To calculate only the mean",
            "B",
            "Regression",
            "Intermediate"
        ),
        (
            2,
            "In the equation y = a + bx, what does b represent?",
            "The intercept",
            "The dependent variable",
            "The slope",
            "The error term",
            "C",
            "Regression",
            "Intermediate"
        ),
        (
            2,
            "What does R-squared measure in regression?",
            "The number of observations",
            "The proportion of variance explained by the model",
            "The regression coefficient only",
            "The sample size",
            "B",
            "Regression",
            "Intermediate"
        ),
        (
            2,
            "Which method is commonly used to estimate the coefficients in linear regression?",
            "Maximum distance method",
            "Least squares method",
            "Random sampling method",
            "Sorting method",
            "B",
            "Regression",
            "Intermediate"
        ),
        (
            2,
            "What is the dependent variable in a regression model?",
            "The variable being predicted or explained",
            "The variable that is always constant",
            "The variable used only for sampling",
            "The error term",
            "A",
            "Regression",
            "Intermediate"
        )
    ]

    for question in questions:

        cursor.execute(
            """
            INSERT INTO course_quiz_questions
            (
                course_id,
                question,
                option_a,
                option_b,
                option_c,
                option_d,
                correct_answer,
                skill_name,
                difficulty
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            question
        )

    connection.commit()
    connection.close()

    print("Regression reassessment questions added successfully.")


if __name__ == "__main__":
    seed_regression_quiz()