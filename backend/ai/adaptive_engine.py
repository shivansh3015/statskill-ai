from collections import defaultdict


LEVELS = [
    "Beginner",
    "Foundation",
    "Intermediate",
    "Advanced",
    "Expert"
]


def get_level_index(level):
    """
    Return the numerical position of a competency level.
    """

    level = str(level or "Beginner").strip().title()

    if level not in LEVELS:
        return 0

    return LEVELS.index(level)


def get_level_from_score(score):
    """
    Convert a competency score into a competency level.
    """

    score = max(0, min(100, float(score)))

    if score < 40:
        return "Beginner"

    if score < 55:
        return "Foundation"

    if score < 70:
        return "Intermediate"

    if score < 85:
        return "Advanced"

    return "Expert"


def increase_level(level):
    """
    Increase difficulty by one level.
    """

    index = get_level_index(level)

    if index >= len(LEVELS) - 1:
        return LEVELS[-1]

    return LEVELS[index + 1]


def decrease_level(level):
    """
    Decrease difficulty by one level.
    """

    index = get_level_index(level)

    if index <= 0:
        return LEVELS[0]

    return LEVELS[index - 1]


def calculate_skill_score(results):
    """
    Calculate the current competency score for a skill.

    Each result should contain:
        {
            "score": 0-100
        }
    """

    if not results:
        return 0

    scores = []

    for result in results:
        try:
            score = float(result.get("score", 0))
        except (TypeError, ValueError):
            score = 0

        scores.append(max(0, min(100, score)))

    return round(sum(scores) / len(scores))


def get_skill_statistics(results):
    """
    Calculate detailed statistics for a skill.
    """

    if not results:
        return {
            "score": 0,
            "questions": 0,
            "correct": 0,
            "accuracy": 0,
            "level": "Beginner"
        }

    scores = []

    correct = 0

    for result in results:

        try:
            score = float(result.get("score", 0))
        except (TypeError, ValueError):
            score = 0

        score = max(0, min(100, score))

        scores.append(score)

        if result.get("is_correct") is True:
            correct += 1

    score = round(sum(scores) / len(scores))

    accuracy = round(
        (correct / len(results)) * 100
    )

    return {
        "score": score,
        "questions": len(results),
        "correct": correct,
        "accuracy": accuracy,
        "level": get_level_from_score(score)
    }


def choose_next_level(current_level, last_score):
    """
    Decide whether the next question should be
    easier, harder, or stay at the same level.

    Rules:

    80+  -> increase difficulty
    50-79 -> maintain
    below 50 -> decrease difficulty
    """

    try:
        score = float(last_score)
    except (TypeError, ValueError):
        score = 0

    if score >= 80:
        return increase_level(current_level)

    if score < 50:
        return decrease_level(current_level)

    return current_level


def choose_next_skill(
    skill_results,
    current_skill=None,
    available_skills=None
):
    """
    Decide which competency should be assessed next.

    Priority:
    1. Weak skills
    2. Skills with insufficient evidence
    3. Unassessed skills
    4. Otherwise continue with current skill
    """

    if not available_skills:
        return current_skill

    statistics = {}

    for skill in available_skills:

        results = skill_results.get(skill, [])

        statistics[skill] = get_skill_statistics(results)

    # First prioritize completely unassessed skills.
    for skill in available_skills:

        if len(skill_results.get(skill, [])) == 0:
            return skill

    # Then prioritize weak skills.
    weak_skills = sorted(
        available_skills,
        key=lambda skill: statistics[skill]["score"]
    )

    for skill in weak_skills:

        if statistics[skill]["score"] < 70:
            return skill

    # Continue current skill if no obvious weakness exists.
    if current_skill in available_skills:
        return current_skill

    return available_skills[0]


def should_continue_skill(results):
    """
    Determine whether enough evidence has been collected
    for a particular skill.
    """

    if len(results) < 2:
        return True

    statistics = get_skill_statistics(results)

    # If performance is uncertain, ask more questions.
    if 40 <= statistics["score"] <= 80:
        return True

    # If accuracy is low, collect more evidence.
    if statistics["accuracy"] < 70:
        return True

    return len(results) < 4


def should_finish_assessment(
    total_questions,
    max_questions,
    skill_results
):
    """
    Decide whether the complete adaptive assessment
    has enough evidence to finish.
    """

    if total_questions >= max_questions:
        return True

    if total_questions < 5:
        return False

    # Every assessed skill should have at least
    # some evidence.
    for skill, results in skill_results.items():

        if len(results) == 0:
            return False

    # If we have enough questions and most skills
    # have reasonable evidence, finish.
    if total_questions >= 8:
        return True

    return False


def analyze_assessment(
    answer_results,
    available_skills
):
    """
    Produce the current competency profile
    from all assessment answers.

    answer_results format:

    [
        {
            "skill_name": "Python",
            "score": 80,
            "is_correct": True
        }
    ]
    """

    skill_results = defaultdict(list)

    for result in answer_results:

        skill = result.get("skill_name")

        if not skill:
            continue

        skill_results[skill].append(result)

    competency_profile = []

    for skill in available_skills:

        results = skill_results.get(skill, [])

        statistics = get_skill_statistics(results)

        competency_profile.append({
            "skill_name": skill,
            "score": statistics["score"],
            "level": statistics["level"],
            "questions": statistics["questions"],
            "correct": statistics["correct"],
            "accuracy": statistics["accuracy"]
        })

    competency_profile.sort(
        key=lambda item: item["score"]
    )

    return {
        "competencies": competency_profile,
        "skill_gaps": [
            item
            for item in competency_profile
            if item["score"] < 70
        ],
        "strong_skills": [
            item
            for item in competency_profile
            if item["score"] >= 70
        ]
    }


def get_next_question_strategy(
    current_skill,
    current_level,
    last_score,
    answer_results,
    available_skills,
    total_questions,
    max_questions
):
    """
    Main adaptive decision function.

    Returns instructions for the question generator.
    """

    skill_results = defaultdict(list)

    for result in answer_results:

        skill = result.get("skill_name")

        if skill:
            skill_results[skill].append(result)

    current_results = skill_results.get(
        current_skill,
        []
    )

    # Decide difficulty.
    next_level = choose_next_level(
        current_level,
        last_score
    )

    # Decide whether current skill needs more testing.
    continue_current = should_continue_skill(
        current_results
    )

    if continue_current:
        next_skill = current_skill
    else:
        next_skill = choose_next_skill(
            skill_results,
            current_skill,
            available_skills
        )

    finish = should_finish_assessment(
        total_questions,
        max_questions,
        skill_results
    )

    return {
        "next_skill": next_skill,
        "next_level": next_level,
        "finish_assessment": finish,
        "reason": (
            "Difficulty increased because the employee "
            "performed strongly."
            if last_score >= 80
            else
            "Difficulty decreased because the employee "
            "needs additional support."
            if last_score < 50
            else
            "Difficulty maintained to collect more evidence."
        )
    }