import json
import os
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from openai import OpenAI


PROJECT_ROOT = Path(__file__).resolve().parents[2]

# Local development reads E:\statskill_ai\.env through PROJECT_ROOT.
# Railway already provides the same values as environment variables.
load_dotenv(PROJECT_ROOT / ".env")

api_key = os.getenv("OPENAI_API_KEY")
model = os.getenv("OPENAI_MODEL", "gpt-5.6-luna")

client = OpenAI(api_key=api_key) if api_key else None


def _q(
    question: str,
    a: str,
    b: str,
    c: str,
    d: str,
    correct: str,
    explanation: str,
) -> dict[str, Any]:
    return {
        "question": question,
        "options": {
            "A": a,
            "B": b,
            "C": c,
            "D": d,
        },
        "correct_answer": correct,
        "explanation": explanation,
    }


FALLBACK_QUESTION_BANK: dict[str, list[dict[str, Any]]] = {
    "statistics": [
        _q(
            "What is the mean of the numbers 4, 6, 8, and 10?",
            "6",
            "7",
            "8",
            "9",
            "B",
            "The mean is (4 + 6 + 8 + 10) / 4 = 7.",
        ),
        _q(
            "Which measure of central tendency is least affected by extreme outliers?",
            "Mean",
            "Median",
            "Variance",
            "Range",
            "B",
            "The median is resistant to extreme values and is often preferred for skewed data.",
        ),
        _q(
            "What does a standard deviation primarily describe?",
            "The center of a distribution",
            "The spread of observations around the mean",
            "The number of observations",
            "The maximum value only",
            "B",
            "Standard deviation measures how dispersed observations are around the mean.",
        ),
        _q(
            "If the p-value is 0.03 and the significance level is 0.05, what is the usual decision?",
            "Fail to reject the null hypothesis",
            "Reject the null hypothesis",
            "Accept the null hypothesis as proven true",
            "Increase the p-value to 0.05",
            "B",
            "Because 0.03 is less than 0.05, the usual decision is to reject the null hypothesis.",
        ),
        _q(
            "Which sampling method gives every member of a population an equal known chance of selection?",
            "Convenience sampling",
            "Simple random sampling",
            "Judgment sampling",
            "Snowball sampling",
            "B",
            "Simple random sampling gives each population member an equal known chance of selection.",
        ),
        _q(
            "What does a 95% confidence interval describe in repeated sampling?",
            "95% of observations must fall inside the interval",
            "95% of similarly constructed intervals would contain the true parameter",
            "The parameter has a 95% probability of changing",
            "The sample mean is always correct",
            "B",
            "In frequentist inference, 95% of intervals constructed by the same procedure would contain the true parameter.",
        ),
        _q(
            "Which graph is usually most suitable for displaying the distribution of one continuous variable?",
            "Histogram",
            "Pie chart",
            "Network diagram",
            "Flowchart",
            "A",
            "A histogram groups continuous values into bins and shows their frequency distribution.",
        ),
        _q(
            "What is the interquartile range (IQR)?",
            "Maximum minus minimum",
            "Q3 minus Q1",
            "Mean minus median",
            "Variance divided by the mean",
            "B",
            "The IQR equals the third quartile minus the first quartile.",
        ),
    ],
    "probability": [
        _q(
            "A fair coin is tossed once. What is the probability of getting heads?",
            "0",
            "0.25",
            "0.5",
            "1",
            "C",
            "A fair coin has two equally likely outcomes, so P(heads) = 1/2.",
        ),
        _q(
            "If two events A and B are mutually exclusive, what is P(A and B)?",
            "0",
            "0.5",
            "P(A) + P(B)",
            "1",
            "A",
            "Mutually exclusive events cannot occur together, so their intersection has probability zero.",
        ),
        _q(
            "For independent events A and B, how is P(A and B) calculated?",
            "P(A) + P(B)",
            "P(A) × P(B)",
            "P(A) - P(B)",
            "P(A) / P(B)",
            "B",
            "The joint probability of independent events equals the product of their probabilities.",
        ),
        _q(
            "A standard six-sided die is rolled. What is the probability of rolling an even number?",
            "1/6",
            "1/3",
            "1/2",
            "2/3",
            "C",
            "The even outcomes are 2, 4, and 6: 3 favorable outcomes out of 6 total.",
        ),
        _q(
            "Which probability distribution is commonly used to model the number of successes in a fixed number of independent trials?",
            "Normal",
            "Binomial",
            "Uniform",
            "Exponential",
            "B",
            "The binomial distribution models the number of successes in a fixed number of independent Bernoulli trials.",
        ),
        _q(
            "What must the probabilities of all mutually exclusive outcomes in a complete sample space sum to?",
            "0",
            "0.5",
            "1",
            "100",
            "C",
            "The probabilities of all outcomes in a complete sample space sum to 1.",
        ),
        _q(
            "Bayes' theorem is primarily used to do what?",
            "Calculate only means",
            "Update probabilities using new evidence",
            "Sort observations",
            "Remove outliers",
            "B",
            "Bayes' theorem updates prior probabilities after observing evidence.",
        ),
        _q(
            "If P(A)=0.4 and P(B|A)=0.5, what is P(A and B)?",
            "0.1",
            "0.2",
            "0.4",
            "0.9",
            "B",
            "P(A and B) = P(A) × P(B|A) = 0.4 × 0.5 = 0.2.",
        ),
    ],
    "regression": [
        _q(
            "In simple linear regression, what does the slope coefficient represent?",
            "The expected change in Y for a one-unit increase in X",
            "The number of observations",
            "The variance of X only",
            "The maximum value of Y",
            "A",
            "The slope is the expected change in the response for a one-unit increase in the predictor.",
        ),
        _q(
            "Which statistic is commonly used to describe the proportion of variance in Y explained by a regression model?",
            "R-squared",
            "Median",
            "Mode",
            "Range",
            "A",
            "R-squared measures the proportion of variance in the response explained by the model.",
        ),
        _q(
            "What is multicollinearity?",
            "Strong correlation among predictor variables",
            "Missing values in the response",
            "A perfectly normal residual distribution",
            "A very small dataset only",
            "A",
            "Multicollinearity occurs when predictors are strongly correlated with one another.",
        ),
        _q(
            "What does a residual represent in regression?",
            "Predicted value minus predictor",
            "Observed value minus predicted value",
            "Maximum minus minimum",
            "Slope divided by intercept",
            "B",
            "A residual is the difference between the observed response and the model's predicted response.",
        ),
        _q(
            "Which regression assumption concerns constant error variance across fitted values?",
            "Homoscedasticity",
            "Multicollinearity",
            "Randomization",
            "Stratification",
            "A",
            "Homoscedasticity means the residual variance is approximately constant across fitted values.",
        ),
        _q(
            "A very high variance inflation factor (VIF) most directly suggests what?",
            "Strong multicollinearity",
            "Perfect normality",
            "No relationship at all",
            "A larger sample size",
            "A",
            "High VIF values indicate that a predictor is strongly explained by other predictors.",
        ),
        _q(
            "Which regression type is commonly used when the outcome is binary?",
            "Logistic regression",
            "Simple averaging",
            "K-means",
            "Principal component analysis",
            "A",
            "Logistic regression is commonly used for binary response variables.",
        ),
        _q(
            "What is overfitting in a regression model?",
            "The model fits training noise and generalizes poorly",
            "The model has no predictors",
            "The response contains only integers",
            "The intercept equals zero",
            "A",
            "Overfitting occurs when a model captures noise in the training data and performs poorly on new data.",
        ),
    ],
    "python": [
        _q(
            "Which Python data type is mutable?",
            "tuple",
            "str",
            "list",
            "int",
            "C",
            "Python lists are mutable; tuples, strings, and integers are immutable.",
        ),
        _q(
            "Which pandas method is commonly used to display the first rows of a DataFrame?",
            "head()",
            "tailonly()",
            "firstrows()",
            "previewdata()",
            "A",
            "DataFrame.head() returns the first rows of a pandas DataFrame.",
        ),
        _q(
            "What does len([10, 20, 30]) return in Python?",
            "2",
            "3",
            "30",
            "60",
            "B",
            "The list contains three elements, so len(...) returns 3.",
        ),
        _q(
            "Which Python keyword is used to define a function?",
            "func",
            "define",
            "def",
            "lambdaonly",
            "C",
            "Functions are normally defined with the def keyword.",
        ),
        _q(
            "Which pandas expression selects rows where column 'score' is greater than 70?",
            "df[df['score'] > 70]",
            "df.select('score' > 70)",
            "df.where score > 70",
            "df['score'].rows(70)",
            "A",
            "Boolean indexing with df[df['score'] > 70] selects matching rows.",
        ),
        _q(
            "What is the result of 10 // 3 in Python?",
            "3",
            "3.33",
            "4",
            "1",
            "A",
            "The // operator performs floor division, so 10 // 3 equals 3.",
        ),
        _q(
            "Which statement safely handles an exception in Python?",
            "try ... except",
            "if ... sort",
            "for ... import",
            "class ... break",
            "A",
            "Python uses try and except blocks for exception handling.",
        ),
        _q(
            "Which pandas method removes rows containing missing values by default?",
            "dropna()",
            "fillna()",
            "isna()",
            "replaceall()",
            "A",
            "DataFrame.dropna() removes rows with missing values by default.",
        ),
    ],
    "sql": [
        _q(
            "Which SQL clause filters rows before grouping?",
            "WHERE",
            "HAVING",
            "ORDER BY",
            "GROUP BY",
            "A",
            "WHERE filters individual rows before grouping and aggregation.",
        ),
        _q(
            "Which SQL function returns the number of rows?",
            "COUNT()",
            "SUM()",
            "AVG()",
            "ROUND()",
            "A",
            "COUNT() is used to count rows or non-null values.",
        ),
        _q(
            "Which JOIN returns all rows from the left table and matching rows from the right table?",
            "INNER JOIN",
            "LEFT JOIN",
            "CROSS JOIN only",
            "SELF JOIN only",
            "B",
            "LEFT JOIN keeps every row from the left table and matching right-side rows.",
        ),
        _q(
            "Which SQL clause is used to group rows for aggregate calculations?",
            "GROUP BY",
            "ORDER BY",
            "WHERE",
            "LIMIT",
            "A",
            "GROUP BY forms groups that aggregate functions can summarize.",
        ),
        _q(
            "Which clause filters aggregated groups?",
            "WHERE",
            "HAVING",
            "SELECT",
            "DISTINCT",
            "B",
            "HAVING filters groups after GROUP BY and aggregation.",
        ),
        _q(
            "Which statement changes existing rows in a table?",
            "UPDATE",
            "SELECT",
            "CREATE",
            "DESCRIBE",
            "A",
            "UPDATE modifies existing rows, normally together with a WHERE condition.",
        ),
        _q(
            "What does a PRIMARY KEY enforce?",
            "Unique identification of each row",
            "Duplicate rows only",
            "Null values only",
            "Alphabetical sorting",
            "A",
            "A primary key uniquely identifies each row and cannot be null.",
        ),
        _q(
            "Which SQL window expression can calculate a running total?",
            "SUM(amount) OVER (ORDER BY date)",
            "GROUP TOTAL(amount)",
            "RUNNING(amount)",
            "ADD ROWS(amount)",
            "A",
            "SUM(...) OVER (ORDER BY ...) is a standard window-function pattern for a running total.",
        ),
    ],
    "data visualization": [
        _q(
            "Which chart is usually best for comparing values across discrete categories?",
            "Bar chart",
            "Scatter plot",
            "Histogram",
            "Contour map",
            "A",
            "Bar charts are well suited to comparing magnitudes across discrete categories.",
        ),
        _q(
            "Which chart is commonly used to study the relationship between two continuous variables?",
            "Scatter plot",
            "Pie chart",
            "Single KPI card",
            "Stacked area only",
            "A",
            "A scatter plot displays paired continuous values and helps reveal association patterns.",
        ),
        _q(
            "Which chart best displays the distribution of a continuous variable using bins?",
            "Histogram",
            "Pie chart",
            "Gauge",
            "Treemap",
            "A",
            "A histogram groups continuous observations into bins and displays their frequencies.",
        ),
        _q(
            "Which visual is useful for showing median, quartiles, and potential outliers?",
            "Box plot",
            "Donut chart",
            "Line chart",
            "Radar chart",
            "A",
            "A box plot summarizes median, quartiles, spread, and potential outliers.",
        ),
        _q(
            "When is a line chart usually appropriate?",
            "Showing change over ordered time",
            "Showing one unordered category only",
            "Showing database keys",
            "Showing text paragraphs",
            "A",
            "Line charts are commonly used to display trends across ordered time.",
        ),
        _q(
            "What is a common problem with using too many colors in one chart?",
            "It can reduce readability and make comparisons harder",
            "It always improves accuracy",
            "It automatically removes bias",
            "It increases sample size",
            "A",
            "Excessive colors add visual noise and can make categories difficult to interpret.",
        ),
        _q(
            "For a chart intended for decision-making, what should the title ideally communicate?",
            "The main message or subject of the chart",
            "Only the file name",
            "The SQL query",
            "The screen resolution",
            "A",
            "A clear title helps users quickly understand what the chart is showing.",
        ),
        _q(
            "Which practice generally improves accessibility in charts?",
            "Use labels and do not rely on color alone",
            "Use color only with no labels",
            "Remove all legends",
            "Use the smallest possible text",
            "A",
            "Labels, readable text, and redundant visual cues improve accessibility.",
        ),
    ],
    "artificial intelligence": [
        _q(
            "In supervised learning, what does the training data normally include?",
            "Inputs with known target labels",
            "Only unlabeled inputs",
            "Only random noise",
            "No examples",
            "A",
            "Supervised learning uses examples with known target outputs or labels.",
        ),
        _q(
            "What is overfitting in machine learning?",
            "Learning training noise and generalizing poorly",
            "Using too little memory",
            "Sorting features alphabetically",
            "Removing every feature",
            "A",
            "Overfitting occurs when a model fits training-specific noise and performs poorly on unseen data.",
        ),
        _q(
            "Which metric is often useful for imbalanced binary classification because it combines precision and recall?",
            "F1 score",
            "Mean only",
            "R-squared only",
            "Range",
            "A",
            "The F1 score is the harmonic mean of precision and recall.",
        ),
        _q(
            "What is a confusion matrix used for?",
            "Summarizing classification prediction outcomes",
            "Storing database passwords",
            "Drawing line charts only",
            "Calculating SQL joins",
            "A",
            "A confusion matrix summarizes true/false positive and negative classification outcomes.",
        ),
        _q(
            "What is feature engineering?",
            "Creating or transforming useful model inputs",
            "Deleting the target variable in every case",
            "Increasing API limits",
            "Changing a chart title",
            "A",
            "Feature engineering creates or transforms variables to improve model learning.",
        ),
        _q(
            "Which dataset is primarily used to estimate final model performance after model selection?",
            "Test set",
            "Training set only",
            "Raw log file only",
            "Feature-name list",
            "A",
            "A held-out test set is used to estimate performance on unseen data after model selection.",
        ),
        _q(
            "What does precision measure in binary classification?",
            "The proportion of predicted positives that are actually positive",
            "The proportion of all examples that are negative",
            "The number of model parameters",
            "The training duration",
            "A",
            "Precision equals true positives divided by all predicted positives.",
        ),
        _q(
            "What does recall measure in binary classification?",
            "The proportion of actual positives correctly identified",
            "The number of features",
            "The average prediction value",
            "The size of the training file",
            "A",
            "Recall equals true positives divided by all actual positives.",
        ),
    ],
    "communication": [
        _q(
            "When explaining a technical result to a non-technical stakeholder, what should you do first?",
            "Use clear language focused on the stakeholder's decision needs",
            "Use as much jargon as possible",
            "Read source code aloud",
            "Avoid stating the conclusion",
            "A",
            "Effective communication adapts language and detail to the audience and decision context.",
        ),
        _q(
            "Which behavior demonstrates active listening?",
            "Paraphrasing key points and asking clarifying questions",
            "Interrupting immediately",
            "Ignoring questions",
            "Changing the topic",
            "A",
            "Paraphrasing and clarifying help confirm shared understanding.",
        ),
        _q(
            "A concise professional email should normally include what near the beginning?",
            "A clear purpose or request",
            "Unrelated background first",
            "Only attachments",
            "No subject",
            "A",
            "Stating the purpose early helps recipients understand the required action.",
        ),
        _q(
            "During a disagreement, what is the most constructive approach?",
            "Focus on evidence, interests, and possible solutions",
            "Attack the other person's character",
            "Avoid all discussion",
            "Repeat the same statement louder",
            "A",
            "Constructive disagreement focuses on facts, needs, and solutions rather than personalities.",
        ),
        _q(
            "What is the main purpose of an executive summary?",
            "Present the most important findings and implications briefly",
            "Include every technical detail",
            "Replace all source data",
            "List only file names",
            "A",
            "An executive summary gives decision-makers the most important findings, implications, and actions.",
        ),
        _q(
            "Which presentation practice generally improves understanding?",
            "One clear message per slide or section",
            "Dense paragraphs on every slide",
            "Tiny fonts",
            "Unexplained acronyms",
            "A",
            "Clear, focused sections reduce cognitive load and improve comprehension.",
        ),
        _q(
            "What should feedback ideally be?",
            "Specific, timely, and focused on observable behavior",
            "Vague and delayed",
            "Personal and insulting",
            "Unrelated to performance",
            "A",
            "Specific and timely feedback is easier to understand and act on.",
        ),
        _q(
            "If a stakeholder misunderstands your message, what is the best next step?",
            "Clarify the message using a different explanation or example",
            "Repeat exactly the same words only",
            "End the conversation",
            "Blame the stakeholder",
            "A",
            "Reframing with simpler language or examples helps restore shared understanding.",
        ),
    ],
    "management": [
        _q(
            "When several tasks compete for limited resources, what should a manager do first?",
            "Prioritize based on impact, urgency, and constraints",
            "Start all tasks without a plan",
            "Ignore deadlines",
            "Choose randomly",
            "A",
            "Prioritization aligns limited resources with the most important and urgent work.",
        ),
        _q(
            "A SMART goal should be specific, measurable, achievable, relevant, and what?",
            "Time-bound",
            "Temporary",
            "Technical",
            "Theoretical",
            "A",
            "SMART goals are Specific, Measurable, Achievable, Relevant, and Time-bound.",
        ),
        _q(
            "What is delegation?",
            "Assigning responsibility and appropriate authority while retaining accountability",
            "Doing every task personally",
            "Avoiding all follow-up",
            "Removing all team autonomy",
            "A",
            "Effective delegation transfers responsibility and authority while the manager retains accountability.",
        ),
        _q(
            "What is a key purpose of a project risk register?",
            "Track identified risks, owners, likelihood, impact, and responses",
            "Store employee passwords",
            "Replace the project plan",
            "Record only completed tasks",
            "A",
            "A risk register helps teams track and manage identified risks systematically.",
        ),
        _q(
            "Which action best supports effective performance management?",
            "Set clear expectations and review progress regularly",
            "Give feedback only once per year",
            "Avoid measurable goals",
            "Change expectations without notice",
            "A",
            "Clear expectations and regular feedback help employees understand and improve performance.",
        ),
        _q(
            "What is stakeholder management mainly about?",
            "Understanding stakeholder interests and managing communication and expectations",
            "Ignoring external concerns",
            "Tracking only budgets",
            "Avoiding communication",
            "A",
            "Stakeholder management involves understanding influence, interests, expectations, and communication needs.",
        ),
        _q(
            "When a project is behind schedule, what is a useful first management action?",
            "Identify the cause and reassess priorities, dependencies, and resources",
            "Hide the delay",
            "Delete the schedule",
            "Stop measuring progress",
            "A",
            "Understanding the root cause allows the manager to choose an appropriate recovery action.",
        ),
        _q(
            "What does a KPI provide?",
            "A measurable indicator of progress toward an objective",
            "A replacement for every qualitative judgment",
            "A password policy",
            "A database schema",
            "A",
            "A key performance indicator measures progress toward a defined objective.",
        ),
    ],
    "leadership": [
        _q(
            "A leader facing uncertainty should generally do what?",
            "Communicate direction clearly while acknowledging what is still uncertain",
            "Pretend there is no uncertainty",
            "Stop communicating",
            "Give conflicting instructions",
            "A",
            "Clear communication with appropriate transparency helps teams act despite uncertainty.",
        ),
        _q(
            "What is psychological safety in a team?",
            "A climate where people can raise concerns and ideas without fear of humiliation",
            "A rule that nobody may disagree",
            "A guarantee that mistakes never occur",
            "A physical security system only",
            "A",
            "Psychological safety supports speaking up, learning, and constructive challenge.",
        ),
        _q(
            "Which behavior is most associated with servant leadership?",
            "Supporting team members' growth and removing obstacles",
            "Keeping all decisions secret",
            "Taking credit for all work",
            "Avoiding responsibility",
            "A",
            "Servant leadership emphasizes enabling and developing others.",
        ),
        _q(
            "When leading change, why is explaining the reason for the change important?",
            "It helps people understand purpose and expected benefits",
            "It removes the need for planning",
            "It guarantees zero resistance",
            "It replaces training",
            "A",
            "Understanding the purpose of change can improve alignment and engagement.",
        ),
        _q(
            "What is a useful leadership response to a team member's mistake?",
            "Understand the cause, address impact, and support learning",
            "Publicly humiliate the person",
            "Ignore every mistake",
            "Remove all responsibility permanently",
            "A",
            "A learning-focused response protects accountability while improving future performance.",
        ),
        _q(
            "What does leading by example mean?",
            "Demonstrating the standards and behaviors expected from others",
            "Giving rules that the leader does not follow",
            "Avoiding difficult work",
            "Delegating every decision",
            "A",
            "Leaders reinforce credibility when their own behavior matches the standards they set.",
        ),
        _q(
            "In a high-performing team, constructive conflict should primarily focus on what?",
            "Ideas, evidence, and decisions",
            "Personal attacks",
            "Status competition",
            "Avoiding all disagreement",
            "A",
            "Task-focused disagreement can improve decisions when it remains respectful and evidence-based.",
        ),
        _q(
            "What is one benefit of giving team members meaningful autonomy?",
            "It can increase ownership and speed of decision-making",
            "It eliminates accountability",
            "It guarantees perfect outcomes",
            "It removes the need for goals",
            "A",
            "Appropriate autonomy can increase ownership while clear goals preserve accountability.",
        ),
    ],
    "survey design": [
        _q(
            "What is the main purpose of pilot testing a survey questionnaire?",
            "Identify problems before full data collection",
            "Increase the population size",
            "Guarantee every response is correct",
            "Replace sampling",
            "A",
            "Pilot testing helps detect wording, flow, timing, and operational issues before launch.",
        ),
        _q(
            "A leading survey question is problematic because it can do what?",
            "Bias respondents toward a particular answer",
            "Increase randomness perfectly",
            "Remove measurement error",
            "Guarantee high response rates",
            "A",
            "Leading wording can influence responses and create measurement bias.",
        ),
        _q(
            "Why are mutually exclusive response categories important?",
            "Respondents should have only one appropriate category for a single-choice item",
            "They make questions longer",
            "They remove the need for instructions",
            "They guarantee a representative sample",
            "A",
            "Mutually exclusive categories prevent ambiguity about which single option applies.",
        ),
        _q(
            "What does nonresponse bias occur when?",
            "Respondents and nonrespondents differ in ways related to the survey measures",
            "Every selected person responds",
            "The sample is very large",
            "Questions are sorted alphabetically",
            "A",
            "Nonresponse bias arises when missing responses are systematically related to variables of interest.",
        ),
        _q(
            "What is stratified sampling designed to do?",
            "Divide the population into subgroups and sample within them",
            "Select only volunteers",
            "Use no sampling frame",
            "Survey one person repeatedly",
            "A",
            "Stratified sampling divides the population into strata and samples within each group.",
        ),
        _q(
            "What is a sampling frame?",
            "The operational list or source used to identify population units for sampling",
            "The survey results table",
            "A chart title",
            "The questionnaire introduction only",
            "A",
            "A sampling frame is the practical source from which sample units are selected.",
        ),
        _q(
            "Why should double-barreled survey questions be avoided?",
            "They ask about multiple issues but allow only one response",
            "They are always too short",
            "They eliminate bias",
            "They increase sample size",
            "A",
            "Double-barreled questions make it unclear which issue the respondent is answering.",
        ),
        _q(
            "What is the main purpose of weighting survey data?",
            "Adjust contributions of observations to better reflect the target population or design",
            "Change every response value",
            "Remove all sampling error",
            "Guarantee causal inference",
            "A",
            "Survey weights can account for unequal selection probabilities and other design or response adjustments.",
        ),
    ],
    "econometrics": [
        _q(
            "What problem can omitted variable bias create in a regression estimate?",
            "Biased coefficients when the omitted factor is related to included regressors and the outcome",
            "Perfectly unbiased coefficients",
            "Automatic randomization",
            "No effect under any conditions",
            "A",
            "Omitted variable bias occurs when an omitted determinant is correlated with included regressors.",
        ),
        _q(
            "What does endogeneity mean in a regression context?",
            "A regressor is correlated with the error term",
            "Every regressor is categorical",
            "The sample mean is zero",
            "The dependent variable is missing",
            "A",
            "Endogeneity violates the exogeneity condition because a regressor is correlated with the disturbance.",
        ),
        _q(
            "What is an instrumental variable intended to help address?",
            "Endogeneity",
            "Chart formatting",
            "Database normalization",
            "Text tokenization only",
            "A",
            "A valid instrument can provide exogenous variation for an endogenous explanatory variable.",
        ),
        _q(
            "What does a fixed-effects panel model control for?",
            "Time-invariant unobserved entity characteristics",
            "Only the sample size",
            "All future shocks automatically",
            "Measurement units only",
            "A",
            "Fixed effects remove time-invariant entity-specific heterogeneity.",
        ),
        _q(
            "What is heteroskedasticity?",
            "Non-constant error variance",
            "Perfect correlation among all variables",
            "No residuals",
            "A binary outcome only",
            "A",
            "Heteroskedasticity means the disturbance variance changes across observations.",
        ),
        _q(
            "Which test is commonly associated with comparing fixed-effects and random-effects estimators?",
            "Hausman test",
            "Chi-square goodness-of-fit only",
            "Shapiro-Wilk only",
            "Durbin-Watson only",
            "A",
            "The Hausman test is commonly used to assess the consistency difference between fixed and random effects.",
        ),
        _q(
            "In time-series analysis, what is stationarity broadly concerned with?",
            "Stable statistical properties over time",
            "Only alphabetical variable names",
            "A fixed number of rows",
            "Removing all lags",
            "A",
            "A stationary process has statistical properties that do not systematically change over time.",
        ),
        _q(
            "What is the purpose of difference-in-differences?",
            "Estimate a treatment effect by comparing changes over time between treated and comparison groups",
            "Calculate a simple median",
            "Sort observations",
            "Create a pie chart",
            "A",
            "Difference-in-differences compares before-after changes across treated and comparison groups.",
        ),
    ],
}


ALIASES = {
    "data visualisation": "data visualization",
    "visualization": "data visualization",
    "visualisation": "data visualization",
    "ai": "artificial intelligence",
    "machine learning": "artificial intelligence",
    "python programming": "python",
    "sql database": "sql",
    "sql databases": "sql",
    "statistics and probability": "statistics",
}


GENERIC_FALLBACKS = [
    _q(
        "Which approach is most appropriate when solving a new competency-related problem?",
        "Clarify the requirement, identify relevant principles, then evaluate the result",
        "Guess immediately without checking assumptions",
        "Ignore the requirement",
        "Choose the longest answer automatically",
        "A",
        "A structured approach starts by clarifying the problem, applying relevant principles, and checking the result.",
    ),
    _q(
        "When evidence conflicts with an initial assumption, what is the best response?",
        "Reassess the assumption using the available evidence",
        "Ignore the evidence",
        "Keep the assumption unchanged in every case",
        "Delete the evidence",
        "A",
        "Competent problem-solving updates assumptions when evidence shows they may be wrong.",
    ),
    _q(
        "What is the best way to verify a proposed solution?",
        "Check it against requirements, edge cases, and available evidence",
        "Assume it is correct because it was first",
        "Avoid testing",
        "Only check formatting",
        "A",
        "Verification should test whether the solution actually satisfies requirements and handles relevant cases.",
    ),
    _q(
        "Which behavior best demonstrates professional judgment?",
        "Distinguish facts, assumptions, risks, and uncertainties",
        "Treat every assumption as a fact",
        "Hide uncertainty",
        "Ignore constraints",
        "A",
        "Professional judgment explicitly separates evidence from assumptions and communicates uncertainty.",
    ),
    _q(
        "When a task has multiple possible solutions, what is a useful selection criterion?",
        "Fit to requirements, evidence, cost, risk, and maintainability",
        "Choose randomly",
        "Always choose the most complex option",
        "Ignore user needs",
        "A",
        "Good decisions compare solutions against relevant requirements and trade-offs.",
    ),
    _q(
        "What should you do when important information is missing?",
        "Identify the gap and seek clarification or reliable evidence",
        "Invent a value silently",
        "Ignore the missing information",
        "Assume the most convenient answer",
        "A",
        "Recognizing and resolving information gaps reduces avoidable errors.",
    ),
    _q(
        "Which action best supports continuous improvement?",
        "Review outcomes, identify lessons, and apply them to future work",
        "Never review completed work",
        "Repeat mistakes without analysis",
        "Avoid feedback",
        "A",
        "Continuous improvement depends on feedback, reflection, and applying lessons learned.",
    ),
    _q(
        "What is the strongest basis for explaining a professional recommendation?",
        "Relevant evidence and clearly stated reasoning",
        "Personal preference only",
        "Unrelated examples",
        "Authority without explanation",
        "A",
        "Evidence and transparent reasoning make recommendations understandable and reviewable.",
    ),
]


def _normalize_skill(skill: Any) -> str:
    normalized = str(skill or "General").strip().lower()
    return ALIASES.get(normalized, normalized)


def _fallback_question(
    skill: Any,
    level: Any,
    previous_questions: list[str] | None = None,
) -> dict[str, Any]:
    previous_questions = previous_questions or []

    normalized_skill = _normalize_skill(skill)
    bank = FALLBACK_QUESTION_BANK.get(
        normalized_skill,
        GENERIC_FALLBACKS,
    )

    used = {
        str(item or "").strip().casefold()
        for item in previous_questions
    }

    selected = None

    for candidate in bank:
        if candidate["question"].strip().casefold() not in used:
            selected = candidate
            break

    # An 8-question assessment will normally find a unique item above.
    # If the configured assessment is longer than the local bank, create a
    # harmless variant instead of crashing or repeating identical text.
    if selected is None:
        base = bank[len(previous_questions) % len(bank)]
        selected = dict(base)
        selected["question"] = (
            f"{base['question']} "
            f"(Assessment variant {len(previous_questions) + 1})"
        )

    return {
        "question_type": "mcq",
        "skill_name": str(skill or "General"),
        "difficulty": str(level or "Beginner"),
        "question": selected["question"],
        "options": dict(selected["options"]),
        "correct_answer": selected["correct_answer"],
        "explanation": selected["explanation"],
    }


def _extract_json_object(text: str) -> dict[str, Any]:
    cleaned = text.strip()

    # Handle models that wrap JSON in markdown code fences.
    if cleaned.startswith("```"):
        cleaned = cleaned.strip("`").strip()

        if cleaned.lower().startswith("json"):
            cleaned = cleaned[4:].strip()

    try:
        parsed = json.loads(cleaned)
    except json.JSONDecodeError:
        # Last-resort extraction when surrounding prose accidentally appears.
        start = cleaned.find("{")
        end = cleaned.rfind("}")

        if start < 0 or end <= start:
            raise

        parsed = json.loads(
            cleaned[start : end + 1]
        )

    if not isinstance(parsed, dict):
        raise ValueError(
            "AI question response must be a JSON object."
        )

    return parsed


def _valid_question(
    question: dict[str, Any],
) -> bool:
    if not str(
        question.get("question", "")
    ).strip():
        return False

    question_type = str(
        question.get(
            "question_type",
            "mcq",
        )
    ).strip().lower()

    if question_type in {
        "mcq",
        "multiple_choice",
        "multiple-choice",
    }:
        options = question.get("options")

        if not isinstance(options, dict):
            return False

        if len(options) < 2:
            return False

        if not str(
            question.get(
                "correct_answer",
                "",
            )
        ).strip():
            return False

    return True


def generate_question(
    role,
    department,
    skill,
    level="Beginner",
    previous_questions=None,
    previous_answers=None,
):
    previous_questions = (
        previous_questions or []
    )
    previous_answers = (
        previous_answers or []
    )

    # If the key is absent, the assessment remains fully usable using
    # the built-in fallback question bank.
    if client is None:
        return _fallback_question(
            skill,
            level,
            previous_questions,
        )

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

    try:
        response = client.responses.create(
            model=model,
            input=prompt,
        )

        result = (
            response.output_text or ""
        ).strip()

        question = _extract_json_object(
            result
        )

        if not _valid_question(
            question
        ):
            raise ValueError(
                "AI returned an incomplete question."
            )

        question.setdefault(
            "question_type",
            "mcq",
        )
        question.setdefault(
            "skill_name",
            str(skill or "General"),
        )
        question.setdefault(
            "difficulty",
            str(level or "Beginner"),
        )
        question.setdefault(
            "options",
            {},
        )
        question.setdefault(
            "correct_answer",
            "",
        )
        question.setdefault(
            "explanation",
            "",
        )

        # Do not let an AI-generated duplicate break the assessment.
        normalized_previous = {
            str(item or "")
            .strip()
            .casefold()
            for item in previous_questions
        }

        if (
            str(
                question.get(
                    "question",
                    "",
                )
            )
            .strip()
            .casefold()
            in normalized_previous
        ):
            return _fallback_question(
                skill,
                level,
                previous_questions,
            )

        return question

    except Exception as exc:
        # Important for Railway/demo reliability:
        # RateLimitError (429), API connection errors, temporary OpenAI
        # failures, malformed model output, or missing quota must never
        # terminate an assessment. We intentionally log only the exception
        # class so API/account details are not leaked to application logs.
        print(
            "StatSkill AI question generation "
            f"fallback activated: "
            f"{type(exc).__name__}"
        )

        return _fallback_question(
            skill,
            level,
            previous_questions,
        )
