const startButton = document.getElementById('start-btn');
const nextButton = document.getElementById('next-btn');
const introScreen = document.getElementById('intro-screen');
const quizScreen = document.getElementById('quiz-screen');
const questionContainerElement = document.getElementById('question-container');
const questionElement = document.getElementById('question');
const answerButtonsElement = document.getElementById('answer-buttons');
const successScreen = document.getElementById('success-screen');
const failScreen = document.getElementById('fail-screen');
const restartButtonSuccess = document.getElementById('restart-btn-success');
const restartButtonFail = document.getElementById('restart-btn-fail');
const playerNameInput = document.getElementById('playerName');
const leaderboardList = document.getElementById('leaderboard-list');
const MAX_LEADERBOARD_ENTRIES = 5;

// Audio objects
const correctSound = new Audio('correct.mp3');
const wrongSound = new Audio('wrong-47985.mp3');
const backgroundMusic = document.getElementById('backgroundMusic');

let currentQuestionIndex;
const totalQuestions = 15;
let score = 0;
let selectedQuestionType;

startButton.addEventListener('click', startGame);
nextButton.addEventListener('click', () => {
    currentQuestionIndex++;
    setNextQuestion();
});
restartButtonSuccess.addEventListener('click', restartGame);
restartButtonFail.addEventListener('click', restartGame);

// --- Core Game Functions ---
function startGame() {
    const checkedInput = document.querySelector('input[name="qType"]:checked');
    selectedQuestionType = checkedInput ? checkedInput.value : 'binary';
    introScreen.classList.add('hide');
    quizScreen.classList.remove('hide');
    currentQuestionIndex = 0;
    score = 0;
    backgroundMusic.muted = false;
    backgroundMusic.play();
    setNextQuestion();
}

function setNextQuestion() {
    resetState();
    if (currentQuestionIndex < totalQuestions) {
        const newQuestion = generateConversionQuestion(selectedQuestionType);
        showQuestion(newQuestion);
    } else {
        showFinalScreen(); // Ensure this function exists in your full script
    }
}

function generateConversionQuestion(type) {
    const decimal = Math.floor(Math.random() * 255) + 1;
    let questionText, correctAnswer;
    let possibleAnswers = [];

    // Math Logic for all 4 Levels
    if (type === 'binary') {
        questionText = `What is the binary equivalent of decimal ${decimal}?`;
        correctAnswer = decimal.toString(2);
    } else if (type === 'octal') {
        questionText = `What is the octal equivalent of decimal ${decimal}?`;
        correctAnswer = decimal.toString(8);
    } else if (type === 'hex') {
        questionText = `What is the hexadecimal equivalent of decimal ${decimal}?`;
        correctAnswer = decimal.toString(16).toUpperCase();
    } else {
        const binaryVal = decimal.toString(2);
        questionText = `What is the decimal equivalent of binary ${binaryVal}?`;
        correctAnswer = decimal.toString();
    }

    // Generate Wrong Answers based on Type
    while (possibleAnswers.length < 3) {
        let rand = Math.floor(Math.random() * 255) + 1;
        let wrong;
        if (type === 'binary') wrong = rand.toString(2);
        else if (type === 'octal') wrong = rand.toString(8);
        else if (type === 'hex') wrong = rand.toString(16).toUpperCase();
        else wrong = rand.toString();

        if (wrong !== correctAnswer && !possibleAnswers.includes(wrong)) {
            possibleAnswers.push(wrong);
        }
    }

    let allAnswers = possibleAnswers.map(text => ({ text: text, correct: false }));
    allAnswers.push({ text: correctAnswer, correct: true });
    allAnswers.sort(() => Math.random() - 0.5);

    return { question: questionText, answers: allAnswers };
}

function showQuestion(question) {
    questionElement.innerText = question.question;
    question.answers.forEach(answer => {
        const button = document.createElement('button');
        button.innerText = answer.text;
        button.classList.add('btn');
        if (answer.correct) button.dataset.correct = answer.correct;
        button.addEventListener('click', selectAnswer);
        answerButtonsElement.appendChild(button);
    });
}

function resetState() {
    nextButton.classList.add('hide');
    while (answerButtonsElement.firstChild) {
        answerButtonsElement.removeChild(answerButtonsElement.firstChild);
    }
}

function selectAnswer(e) {
    const selectedButton = e.target;
    const correct = selectedButton.dataset.correct === 'true';
    if (correct) {
        score++;
        selectedButton.style.backgroundColor = "green";
    } else {
        selectedButton.style.backgroundColor = "red";
    }
    nextButton.classList.remove('hide');
}

function restartGame() {
    successScreen.classList.add('hide');
    failScreen.classList.add('hide');
    introScreen.classList.remove('hide');
}

// NOTE: Make sure your original showFinalScreen() function is still at the bottom of your script!
