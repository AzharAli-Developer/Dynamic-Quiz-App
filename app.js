const QUESTION_TIME_LIMIT_SECONDS = 30;
const TIMER_WARNING_THRESHOLD_SECONDS = 10;

const state = {
    questions: [],
    currentQuestionIndex: 0,
    score: 0,
    editingQuestionIndex: null,
    remainingTime: QUESTION_TIME_LIMIT_SECONDS,
    quizTimerId: null,
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
    saveQuestionButton: document.querySelector("#save-question-button"),
    cancelEditButton: document.querySelector("#cancel-edit-button"),
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
    quizTimer: document.querySelector("#quiz-timer"),
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

function populateForm(question) {
    elements.questionInput.value = question.text;
    elements.optionA.value = question.options.a;
    elements.optionB.value = question.options.b;
    elements.optionC.value = question.options.c;
    elements.optionD.value = question.options.d;
    elements.correctAnswer.value = question.correctAnswer;
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

function updateFormMode() {
    const isEditing = state.editingQuestionIndex !== null;
    elements.saveQuestionButton.textContent = isEditing ? "Update Question" : "Add Question";
    elements.cancelEditButton.classList.toggle("is-hidden", !isEditing);
}

function resetForm() {
    elements.form.reset();
    state.editingQuestionIndex = null;
    updateFormMode();
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

        const editButton = document.createElement("button");
        editButton.className = "edit-question-button";
        editButton.type = "button";
        editButton.dataset.index = index;
        editButton.textContent = "Edit";

        const itemActions = document.createElement("div");
        itemActions.className = "question-item-actions";
        itemActions.append(editButton, removeButton);

        header.append(title, itemActions);

        listItem.append(header);
        elements.questionList.append(listItem);
    });
}

function renderBuilder() {
    updateQuestionCount();
    renderQuestionList();
}

function saveQuestion(event) {
    event.preventDefault();

    const question = getQuestionFromForm();
    const error = validateQuestion(question);

    if (error) {
        setMessage(elements.formMessage, error, "error");
        return;
    }

    if (state.editingQuestionIndex !== null) {
        const updatedIndex = state.editingQuestionIndex;
        state.questions[updatedIndex] = question;
        resetForm();
        renderBuilder();
        setMessage(elements.formMessage, `Question ${updatedIndex + 1} updated successfully.`, "success");
        return;
    }

    state.questions.push(question);
    resetForm();
    renderBuilder();
    setMessage(elements.formMessage, "Question added successfully.", "success");
}

function editQuestion(index) {
    const question = state.questions[index];

    if (!question) {
        return;
    }

    state.editingQuestionIndex = index;
    populateForm(question);
    updateFormMode();
    setMessage(elements.formMessage, `Editing question ${index + 1}.`, "success");
    elements.questionInput.focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function removeQuestion(index) {
    state.questions.splice(index, 1);

    if (state.editingQuestionIndex === index) {
        resetForm();
    } else if (state.editingQuestionIndex !== null && state.editingQuestionIndex > index) {
        state.editingQuestionIndex -= 1;
        updateFormMode();
    }

    renderBuilder();
    setMessage(elements.formMessage, "Question removed.", "success");
}

function clearQuestions() {
    state.questions = [];
    state.currentQuestionIndex = 0;
    state.score = 0;
    resetForm();
    showBuilder();
    renderBuilder();
    setMessage(elements.formMessage, "All questions cleared.", "success");
}

function showBuilder() {
    clearQuizTimer();
    elements.builderPanel.classList.remove("is-hidden");
    elements.quizPanel.classList.add("is-hidden");
    elements.resultPanel.classList.add("is-hidden");
}

function updateTimerDisplay() {
    elements.quizTimer.textContent = `Time: ${state.remainingTime}s`;
    elements.quizTimer.classList.toggle("is-warning", state.remainingTime <= TIMER_WARNING_THRESHOLD_SECONDS);
}

function clearQuizTimer() {
    if (state.quizTimerId) {
        clearInterval(state.quizTimerId);
        state.quizTimerId = null;
    }
}

function startQuestionTimer() {
    clearQuizTimer();
    state.remainingTime = QUESTION_TIME_LIMIT_SECONDS;
    updateTimerDisplay();

    state.quizTimerId = setInterval(() => {
        state.remainingTime -= 1;
        updateTimerDisplay();

        if (state.remainingTime <= 0) {
            clearQuizTimer();
            setMessage(elements.quizMessage, "Time is up. Moving to the next question.", "error");
            moveToNextQuestion();
        }
    }, 1000);
}

function startQuiz() {
    if (state.questions.length === 0) {
        setMessage(elements.formMessage, "Add at least one question before starting the quiz.", "error");
        return;
    }

    state.currentQuestionIndex = 0;
    state.score = 0;
    state.remainingTime = QUESTION_TIME_LIMIT_SECONDS;
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
    elements.submitAnswerButton.disabled = false;
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

    startQuestionTimer();
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

    clearQuizTimer();
    moveToNextQuestion();
}

function moveToNextQuestion() {
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

    clearQuizTimer();
    elements.builderPanel.classList.add("is-hidden");
    elements.quizPanel.classList.add("is-hidden");
    elements.resultPanel.classList.remove("is-hidden");
    elements.resultScore.textContent = `${state.score}/${totalQuestions}`;
    elements.resultSummary.textContent = `You scored ${percentage}%. Review your questions, restart the quiz, or create a new quiz.`;
}

function exitQuiz() {
    state.currentQuestionIndex = 0;
    state.score = 0;
    clearQuizTimer();
    showBuilder();
    setMessage(elements.formMessage, "Quiz closed. You can edit your question list and start again.", "success");
}

function createNewQuiz() {
    resetForm();
    clearQuestions();
    setMessage(elements.formMessage, "Ready for a new quiz.", "success");
}

elements.form.addEventListener("submit", saveQuestion);
elements.clearFormButton.addEventListener("click", resetForm);
elements.cancelEditButton.addEventListener("click", resetForm);
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
    const editButton = event.target.closest(".edit-question-button");

    if (editButton) {
        editQuestion(Number(editButton.dataset.index));
        return;
    }

    if (removeButton) {
        removeQuestion(Number(removeButton.dataset.index));
    }
});

renderBuilder();
