const state = {
    questions: [],
    currentQuestionIndex: 0,
    score: 0,
};

const elements = {
    form: document.querySelector("#question-form"),
    questionInput: document.querySelector("#question-input"),
    optionA: document.querySelector("#option-a"),
    optionB: document.querySelector("#option-b"),
    optionC: document.querySelector("#option-c"),
    optionD: document.querySelector("#option-d"),
    correctAnswer: document.querySelector("#correct-answer"),
    formMessage: document.querySelector("#form-message"),
    questionCount: document.querySelector("#question-count"),
    questionList: document.querySelector("#question-list"),
    emptyState: document.querySelector("#empty-state"),
    startQuizButton: document.querySelector("#start-quiz-button"),
    clearFormButton: document.querySelector("#clear-form-button"),
    clearQuestionsButton: document.querySelector("#clear-questions-button"),
    builderPanel: document.querySelector("#builder-panel"),
    quizPanel: document.querySelector("#quiz-panel"),
    quizProgress: document.querySelector("#quiz-progress"),
    quizQuestion: document.querySelector("#quiz-question"),
    answerOptions: document.querySelector("#answer-options"),
    quizMessage: document.querySelector("#quiz-message"),
    submitAnswerButton: document.querySelector("#submit-answer-button"),
    exitQuizButton: document.querySelector("#exit-quiz-button"),
    liveScore: document.querySelector("#live-score"),
    resultPanel: document.querySelector("#result-panel"),
    resultScore: document.querySelector("#result-score"),
    resultSummary: document.querySelector("#result-summary"),
    reviewButton: document.querySelector("#review-button"),
    restartButton: document.querySelector("#restart-button"),
    newQuizButton: document.querySelector("#new-quiz-button"),
};

const answerLabels = {
    a: "A",
    b: "B",
    c: "C",
    d: "D",
};

function getTrimmedValue(input) {
    return input.value.trim();
}

function setMessage(element, message = "", type = "") {
    element.textContent = message;
    element.className = "message";

    if (type) {
        element.classList.add(`is-${type}`);
    }
}

function getQuestionFromForm() {
    return {
        text: getTrimmedValue(elements.questionInput),
        options: {
            a: getTrimmedValue(elements.optionA),
            b: getTrimmedValue(elements.optionB),
            c: getTrimmedValue(elements.optionC),
            d: getTrimmedValue(elements.optionD),
        },
        correctAnswer: elements.correctAnswer.value,
    };
}

function validateQuestion(question) {
    if (!question.text) {
        return "Please enter a question.";
    }

    const hasEmptyOption = Object.values(question.options).some((option) => !option);
    if (hasEmptyOption) {
        return "Please fill all four answer options.";
    }

    if (!question.correctAnswer) {
        return "Please select the correct answer.";
    }

    return "";
}

function resetForm() {
    elements.form.reset();
    elements.questionInput.focus();
    setMessage(elements.formMessage);
}

function updateQuestionCount() {
    const count = state.questions.length;
    elements.questionCount.textContent = `${count} ${count === 1 ? "question" : "questions"}`;
    elements.startQuizButton.disabled = count === 0;
    elements.clearQuestionsButton.disabled = count === 0;
}

function renderQuestionList() {
    elements.questionList.replaceChildren();
    elements.emptyState.classList.toggle("is-hidden", state.questions.length > 0);

    state.questions.forEach((question, index) => {
        const listItem = document.createElement("li");
        listItem.className = "question-item";

        const header = document.createElement("div");
        header.className = "question-item-header";

        const title = document.createElement("p");
        title.className = "question-item-title";
        title.textContent = question.text;

        const removeButton = document.createElement("button");
        removeButton.className = "remove-question-button";
        removeButton.type = "button";
        removeButton.dataset.index = index;
        removeButton.textContent = "Remove";

        header.append(title, removeButton);

        listItem.append(header);
        elements.questionList.append(listItem);
    });
}

function renderBuilder() {
    updateQuestionCount();
    renderQuestionList();
}

function addQuestion(event) {
    event.preventDefault();

    const question = getQuestionFromForm();
    const error = validateQuestion(question);

    if (error) {
        setMessage(elements.formMessage, error, "error");
        return;
    }

    state.questions.push(question);
    resetForm();
    renderBuilder();
    setMessage(elements.formMessage, "Question added successfully.", "success");
}

function removeQuestion(index) {
    state.questions.splice(index, 1);
    renderBuilder();
    setMessage(elements.formMessage, "Question removed.", "success");
}

function clearQuestions() {
    state.questions = [];
    state.currentQuestionIndex = 0;
    state.score = 0;
    showBuilder();
    renderBuilder();
    setMessage(elements.formMessage, "All questions cleared.", "success");
}

function showBuilder() {
    elements.builderPanel.classList.remove("is-hidden");
    elements.quizPanel.classList.add("is-hidden");
    elements.resultPanel.classList.add("is-hidden");
}

function startQuiz() {
    if (state.questions.length === 0) {
        setMessage(elements.formMessage, "Add at least one question before starting the quiz.", "error");
        return;
    }

    state.currentQuestionIndex = 0;
    state.score = 0;
    setMessage(elements.formMessage);
    elements.builderPanel.classList.add("is-hidden");
    elements.resultPanel.classList.add("is-hidden");
    elements.quizPanel.classList.remove("is-hidden");
    renderCurrentQuestion();
}

function renderCurrentQuestion() {
    const currentQuestion = state.questions[state.currentQuestionIndex];
    const questionNumber = state.currentQuestionIndex + 1;

    elements.quizProgress.textContent = `Question ${questionNumber} of ${state.questions.length}`;
    elements.liveScore.textContent = `Score: ${state.score}`;
    elements.quizQuestion.textContent = currentQuestion.text;
    elements.answerOptions.replaceChildren();
    setMessage(elements.quizMessage);

    Object.entries(currentQuestion.options).forEach(([key, value]) => {
        const optionId = `answer-${key}`;
        const label = document.createElement("label");
        label.className = "answer-option";
        label.setAttribute("for", optionId);

        const input = document.createElement("input");
        input.id = optionId;
        input.type = "radio";
        input.name = "answer";
        input.value = key;

        const text = document.createElement("span");
        text.textContent = `${answerLabels[key]}. ${value}`;

        label.append(input, text);
        elements.answerOptions.append(label);
    });
}

function getSelectedAnswer() {
    const selectedAnswer = document.querySelector('input[name="answer"]:checked');
    return selectedAnswer ? selectedAnswer.value : "";
}

function submitAnswer() {
    const selectedAnswer = getSelectedAnswer();

    if (!selectedAnswer) {
        setMessage(elements.quizMessage, "Please select an answer before submitting.", "error");
        return;
    }

    const currentQuestion = state.questions[state.currentQuestionIndex];

    if (selectedAnswer === currentQuestion.correctAnswer) {
        state.score += 1;
    }

    const hasNextQuestion = state.currentQuestionIndex < state.questions.length - 1;

    if (hasNextQuestion) {
        state.currentQuestionIndex += 1;
        renderCurrentQuestion();
    } else {
        showResult();
    }
}

function showResult() {
    const totalQuestions = state.questions.length;
    const percentage = Math.round((state.score / totalQuestions) * 100);

    elements.builderPanel.classList.add("is-hidden");
    elements.quizPanel.classList.add("is-hidden");
    elements.resultPanel.classList.remove("is-hidden");
    elements.resultScore.textContent = `${state.score}/${totalQuestions}`;
    elements.resultSummary.textContent = `You scored ${percentage}%. Review your questions, restart the quiz, or create a new quiz.`;
}

function exitQuiz() {
    state.currentQuestionIndex = 0;
    state.score = 0;
    showBuilder();
    setMessage(elements.formMessage, "Quiz closed. You can edit your question list and start again.", "success");
}

function createNewQuiz() {
    resetForm();
    clearQuestions();
    setMessage(elements.formMessage, "Ready for a new quiz.", "success");
}

elements.form.addEventListener("submit", addQuestion);
elements.clearFormButton.addEventListener("click", resetForm);
elements.startQuizButton.addEventListener("click", startQuiz);
elements.clearQuestionsButton.addEventListener("click", clearQuestions);
elements.submitAnswerButton.addEventListener("click", submitAnswer);
elements.exitQuizButton.addEventListener("click", exitQuiz);
elements.restartButton.addEventListener("click", startQuiz);
elements.newQuizButton.addEventListener("click", createNewQuiz);
elements.reviewButton.addEventListener("click", () => {
    showBuilder();
    setMessage(elements.formMessage, "Question list is ready for review.", "success");
    window.scrollTo({ top: 0, behavior: "smooth" });
});

elements.questionList.addEventListener("click", (event) => {
    const removeButton = event.target.closest(".remove-question-button");

    if (!removeButton) {
        return;
    }

    removeQuestion(Number(removeButton.dataset.index));
});

renderBuilder();
