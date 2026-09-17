import json
import os

from dotenv import load_dotenv
from openai import OpenAI


# Load environment variables
load_dotenv(r"E:\statskill_ai\.env")

api_key = os.getenv("OPENAI_API_KEY")
model = os.getenv("OPENAI_MODEL")

if not api_key:
    raise RuntimeError(
        "OPENAI_API_KEY is missing from E:\\statskill_ai\\.env"
    )

if not model:
    raise RuntimeError(
        "OPENAI_MODEL is missing from E:\\statskill_ai\\.env"
    )

client = OpenAI(api_key=api_key)


def evaluate_mcq_answer(selected_answer, correct_answer):
    """
    Evaluate an MCQ answer without using AI.
    """

    selected = str(selected_answer).strip().upper()
    correct = str(correct_answer).strip().upper()

    if selected == correct:
        return {
            "score": 100,
            "is_correct": True,
            "feedback": "Correct answer."
        }

    return {
        "score": 0,
        "is_correct": False,
        "feedback": "Incorrect answer."
    }


def evaluate_open_ended_answer(
    skill,
    level,
    question,
    expected_answer,
    employee_answer
):
    """
    Use AI to evaluate an open-ended answer.
    """

    prompt = f"""
You are the answer evaluation engine for StatSkill AI.

Evaluate an employee's answer to a competency assessment question.

SKILL:
{skill}

EXPECTED LEVEL:
{level}

QUESTION:
{question}

EXPECTED ANSWER / EVALUATION CRITERIA:
{expected_answer}

EMPLOYEE ANSWER:
{employee_answer}

Evaluate the answer based on:
1. Correctness
2. Understanding of the concept
3. Completeness
4. Relevance
5. Appropriate depth for the expected level

Give a score from 0 to 100.

Scoring guidance:

90-100 = Excellent understanding
75-89 = Strong understanding
60-74 = Good/basic understanding with some gaps
40-59 = Partial understanding
20-39 = Weak understanding
0-19 = Very poor or incorrect understanding

Return ONLY valid JSON.

Required format:

{{
    "score": 0,
    "is_correct": false,
    "feedback": "Short useful feedback",
    "strengths": [
        "Strength 1"
    ],
    "weaknesses": [
        "Weakness 1"
    ]
}}
"""

    response = client.responses.create(
        model=model,
        input=prompt
    )

    result = response.output_text.strip()

    try:
        evaluation = json.loads(result)
    except json.JSONDecodeError:
        raise RuntimeError(
            f"AI returned invalid evaluation JSON: {result}"
        )

    score = evaluation.get("score", 0)

    try:
        score = int(score)
    except (TypeError, ValueError):
        score = 0

    score = max(0, min(100, score))

    evaluation["score"] = score

    if score >= 50:
        evaluation["is_correct"] = True
    else:
        evaluation["is_correct"] = False

    return evaluation


def evaluate_answer(
    question_type,
    selected_answer,
    correct_answer=None,
    skill=None,
    level=None,
    question=None,
    explanation=None
):
    """
    Main answer evaluation function.

    MCQ:
        Evaluated locally.

    Open-ended:
        Evaluated using AI.
    """

    question_type = str(question_type).strip().lower()

    if question_type == "mcq":
        return evaluate_mcq_answer(
            selected_answer,
            correct_answer
        )

    if question_type == "open_ended":
        return evaluate_open_ended_answer(
            skill=skill,
            level=level,
            question=question,
            expected_answer=explanation or correct_answer or "",
            employee_answer=selected_answer
        )

    # For future question types such as:
    # practical
    # numerical
    # scenario
    #
    # we currently send them through the AI evaluator.

    return evaluate_open_ended_answer(
        skill=skill,
        level=level,
        question=question,
        expected_answer=explanation or correct_answer or "",
        employee_answer=selected_answer
    )