from database import get_connection

questions = [

    # =========================
    # PROBABILITY
    # =========================

    {
        "question": "What is the probability of getting a head when a fair coin is tossed?",
        "option_a": "0",
        "option_b": "0.25",
        "option_c": "0.5",
        "option_d": "1",
        "correct_answer": "C",
        "skill_name": "Probability",
        "difficulty": "Beginner"
    },

    {
        "question": "A standard die is rolled once. What is the probability of getting a 6?",
        "option_a": "1/2",
        "option_b": "1/3",
        "option_c": "1/6",
        "option_d": "1/12",
        "correct_answer": "C",
        "skill_name": "Probability",
        "difficulty": "Beginner"
    },

    {
        "question": "If two events cannot occur at the same time, they are called:",
        "option_a": "Independent events",
        "option_b": "Mutually exclusive events",
        "option_c": "Dependent events",
        "option_d": "Certain events",
        "correct_answer": "B",
        "skill_name": "Probability",
        "difficulty": "Intermediate"
    },

    # =========================
    # STATISTICS
    # =========================

    {
        "question": "Which measure represents the middle value of an ordered dataset?",
        "option_a": "Mean",
        "option_b": "Mode",
        "option_c": "Median",
        "option_d": "Range",
        "correct_answer": "C",
        "skill_name": "Statistics",
        "difficulty": "Beginner"
    },

    {
        "question": "Which measure is calculated by adding all observations and dividing by the number of observations?",
        "option_a": "Median",
        "option_b": "Mean",
        "option_c": "Mode",
        "option_d": "Variance",
        "correct_answer": "B",
        "skill_name": "Statistics",
        "difficulty": "Beginner"
    },

    {
        "question": "Which measure describes the spread of data around its mean?",
        "option_a": "Variance",
        "option_b": "Median",
        "option_c": "Mode",
        "option_d": "Frequency",
        "correct_answer": "A",
        "skill_name": "Statistics",
        "difficulty": "Intermediate"
    },

    # =========================
    # REGRESSION
    # =========================

    {
        "question": "What is the main purpose of regression analysis?",
        "option_a": "To store data",
        "option_b": "To predict or explain a dependent variable",
        "option_c": "To sort data alphabetically",
        "option_d": "To create databases",
        "correct_answer": "B",
        "skill_name": "Regression",
        "difficulty": "Beginner"
    },

    {
        "question": "In a simple linear regression model, which variable is being predicted?",
        "option_a": "Independent variable",
        "option_b": "Dependent variable",
        "option_c": "Random variable",
        "option_d": "Control variable",
        "correct_answer": "B",
        "skill_name": "Regression",
        "difficulty": "Beginner"
    },

    {
        "question": "What does the coefficient of determination (R²) generally measure?",
        "option_a": "Number of observations",
        "option_b": "Percentage of variation explained by the model",
        "option_c": "Mean of the dependent variable",
        "option_d": "Number of predictors",
        "correct_answer": "B",
        "skill_name": "Regression",
        "difficulty": "Intermediate"
    },

    # =========================
    # PYTHON
    # =========================

    {
        "question": "Which keyword is used to define a function in Python?",
        "option_a": "function",
        "option_b": "define",
        "option_c": "def",
        "option_d": "func",
        "correct_answer": "C",
        "skill_name": "Python",
        "difficulty": "Beginner"
    },

    {
        "question": "Which data type stores a collection of ordered and changeable elements in Python?",
        "option_a": "Tuple",
        "option_b": "List",
        "option_c": "Set",
        "option_d": "String",
        "correct_answer": "B",
        "skill_name": "Python",
        "difficulty": "Beginner"
    },

    {
        "question": "Which symbol is used for a single-line comment in Python?",
        "option_a": "//",
        "option_b": "/*",
        "option_c": "#",
        "option_d": "--",
        "correct_answer": "C",
        "skill_name": "Python",
        "difficulty": "Beginner"
    },

    # =========================
    # SQL
    # =========================

    {
        "question": "Which SQL command is used to retrieve data from a table?",
        "option_a": "GET",
        "option_b": "SELECT",
        "option_c": "FETCH",
        "option_d": "READ",
        "correct_answer": "B",
        "skill_name": "SQL",
        "difficulty": "Beginner"
    },

    {
        "question": "Which SQL command is used to add a new record to a table?",
        "option_a": "ADD",
        "option_b": "INSERT",
        "option_c": "CREATE",
        "option_d": "UPDATE",
        "correct_answer": "B",
        "skill_name": "SQL",
        "difficulty": "Beginner"
    },

    {
        "question": "Which SQL clause is used to filter records?",
        "option_a": "ORDER BY",
        "option_b": "GROUP BY",
        "option_c": "WHERE",
        "option_d": "FILTER",
        "correct_answer": "C",
        "skill_name": "SQL",
        "difficulty": "Intermediate"
    },

    # =========================
    # DATA VISUALIZATION
    # =========================

    {
        "question": "Which chart is generally best for showing trends over time?",
        "option_a": "Pie chart",
        "option_b": "Line chart",
        "option_c": "Histogram",
        "option_d": "Scatter plot",
        "correct_answer": "B",
        "skill_name": "Data Visualization",
        "difficulty": "Beginner"
    },

    {
        "question": "Which chart is commonly used to compare values across categories?",
        "option_a": "Bar chart",
        "option_b": "Line chart",
        "option_c": "Scatter plot",
        "option_d": "Box plot",
        "correct_answer": "A",
        "skill_name": "Data Visualization",
        "difficulty": "Beginner"
    },

    # =========================
    # COMMUNICATION
    # =========================

    {
        "question": "Which of the following is an important part of effective communication?",
        "option_a": "Active listening",
        "option_b": "Ignoring feedback",
        "option_c": "Using unclear language",
        "option_d": "Avoiding questions",
        "correct_answer": "A",
        "skill_name": "Communication",
        "difficulty": "Beginner"
    },

    {
        "question": "What is feedback in communication?",
        "option_a": "The response of the receiver",
        "option_b": "The communication channel",
        "option_c": "The sender's message",
        "option_d": "Noise",
        "correct_answer": "A",
        "skill_name": "Communication",
        "difficulty": "Beginner"
    },

    # =========================
    # MANAGEMENT
    # =========================

    {
        "question": "Which function of management involves setting organizational goals?",
        "option_a": "Planning",
        "option_b": "Controlling",
        "option_c": "Staffing",
        "option_d": "Directing",
        "correct_answer": "A",
        "skill_name": "Management",
        "difficulty": "Beginner"
    },

    {
        "question": "Which skill is important for effective leadership?",
        "option_a": "Decision-making",
        "option_b": "Avoiding responsibility",
        "option_c": "Ignoring employees",
        "option_d": "Avoiding communication",
        "correct_answer": "A",
        "skill_name": "Leadership",
        "difficulty": "Beginner"
    },

    # =========================
    # AI
    # =========================

    {
        "question": "What does AI stand for?",
        "option_a": "Automated Internet",
        "option_b": "Artificial Intelligence",
        "option_c": "Advanced Information",
        "option_d": "Automatic Integration",
        "correct_answer": "B",
        "skill_name": "Artificial Intelligence",
        "difficulty": "Beginner"
    },

    {
        "question": "Which technology allows computers to learn patterns from data?",
        "option_a": "Machine Learning",
        "option_b": "Word Processing",
        "option_c": "File Compression",
        "option_d": "Networking",
        "correct_answer": "A",
        "skill_name": "Artificial Intelligence",
        "difficulty": "Beginner"
    }
]


connection = get_connection()
cursor = connection.cursor()

for q in questions:

    cursor.execute(
        """
        SELECT id
        FROM assessment_questions
        WHERE question = ?
        """,
        (q["question"],)
    )

    existing_question = cursor.fetchone()

    if existing_question:
        continue

    cursor.execute(
        """
        INSERT INTO assessment_questions
        (
            question,
            option_a,
            option_b,
            option_c,
            option_d,
            correct_answer,
            skill_name,
            difficulty
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            q["question"],
            q["option_a"],
            q["option_b"],
            q["option_c"],
            q["option_d"],
            q["correct_answer"],
            q["skill_name"],
            q["difficulty"]
        )
    )


connection.commit()
connection.close()

print("Assessment questions added successfully.")
print(f"Total questions available: {len(questions)}")