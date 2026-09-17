import json
import os

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv(r"E:\statskill_ai\.env")

api_key = os.getenv("OPENAI_API_KEY")
model = os.getenv("OPENAI_MODEL")

if not api_key:
    raise RuntimeError("OPENAI_API_KEY is missing from E:\\statskill_ai\\.env")

if not model:
    raise RuntimeError("OPENAI_MODEL is missing from E:\\statskill_ai\\.env")

client = OpenAI(api_key=api_key)


def generate_question(
    role,
    department,
    skill,
    level="Beginner",
    previous_questions=None,
    previous_answers=None
):
    previous_questions = previous_questions or []
    previous_answers = previous_answers or []

    prompt = f"""
You are the AI competency assessment engine for StatSkill AI.

Generate ONE assessment question for an employee.

EMPLOYEE:
Role: {role}
Department: {department}

COMPETENCY:
{skill}

CURRENT LEVEL:
{level}

PREVIOUS QUESTIONS:
{json.dumps(previous_questions)}

PREVIOUS ANSWERS:
{json.dumps(previous_answers)}

RULES:

1. Generate a NEW question.
2. Never repeat a previous question.
3. Test the specified competency directly.
4. Match the question difficulty to the current level.
5. Questions may be:
   - MCQ
   - practical problem
   - numerical problem
   - scenario-based
   - open-ended
6. Technical skills can use practical questions.
7. Communication, management and leadership can use scenarios.
8. Do not reveal the correct answer to the employee.
9. Return ONLY valid JSON.

For an MCQ use:

{{
    "question_type": "mcq",
    "skill_name": "{skill}",
    "difficulty": "{level}",
    "question": "Question text",
    "options": {{
        "A": "Option A",
        "B": "Option B",
        "C": "Option C",
        "D": "Option D"
    }},
    "correct_answer": "A",
    "explanation": "Why this is correct"
}}

For an open-ended question use:

{{
    "question_type": "open_ended",
    "skill_name": "{skill}",
    "difficulty": "{level}",
    "question": "Question text",
    "options": {{}},
    "correct_answer": "",
    "explanation": "What a good answer should contain"
}}
"""

    response = client.responses.create(
        model=model,
        input=prompt
    )

    result = response.output_text.strip()

    try:
        return json.loads(result)
    except json.JSONDecodeError:
        raise RuntimeError(
            f"AI returned invalid JSON: {result}"
        )