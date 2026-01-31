const startButton = document.getElementById('start-btn');
const nextButton = document.getElementById('next-btn');
const proceedButton = document.getElementById('proceed-btn');
const instructionScreen = document.getElementById('instruction-screen');
const setupScreen = document.getElementById('setup-screen');
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
const feedbackExplanationElement = document.getElementById('feedback-explanation');
const MAX_LEADERBOARD_ENTRIES = 5;

// Audio objects (Ensure these files exist in your project folder)
const correctSound = new Audio('correct.mp3'); 
const wrongSound = new Audio('wrong-47985.mp3'); 
const backgroundMusic = document.getElementById('backgroundMusic');

let currentQuestionIndex;
const totalQuestions = 15;
let score = 0;
let selectedQuestionType;
let currentCorrectAnswer; // Variable to store the correct answer for explanation

// --- Event Listeners ---
proceedButton.addEventListener('click', showSetupScreen);
startButton.addEventListener('click', startGame);
nextButton.addEventListener('click', () => {
    currentQuestionIndex++;
    setNextQuestion();
});
restartButtonSuccess.addEventListener('click', restartGame);
restartButtonFail.addEventListener('click', restartGame);

// --- Core Game Functions ---

// Handles the new 3-screen flow
function showSetupScreen() {
    instructionScreen.classList.add('hide');
    setupScreen.classList.remove('hide');
    // Load leaderboard here when moving to setup screen
    // displayLeaderboard(); 
}

function startGame() {
    const checkedInput = document.querySelector('input[name="qType"]:checked');
    selectedQuestionType = checkedInput ? checkedInput.value : 'binary';
    setupScreen.classList.add('hide');
    quizScreen.classList.remove('hide');
    currentQuestionIndex = 0;
    score = 0;
    // backgroundMusic.muted = false; // Uncomment this line if you want the music to start unmuted
    backgroundMusic.play();
    setNextQuestion();
}

function setNextQuestion() {
    resetState();
    if (currentQuestionIndex < totalQuestions) {
        const newQuestion = generateConversionQuestion(selectedQuestionType);
        showQuestion(newQuestion);
    } else {
        // NOTE: You need to ensure your showFinalScreen() function is defined elsewhere in your JS file!
        // showFinalScreen(); 
        // Example placeholder:
        alert(`Quiz finished! You scored ${score}/${totalQuestions}`);
        restartGame();
    }
}

function generateConversionQuestion(type) {
    const decimal = Math.floor(Math.random() * 254) + 1; // Range 1-255
    let questionText, correctAnswer, explanationText, baseFrom, baseTo;
    let possibleAnswers = [];

    // Math Logic and Explanation Text for all 4 Levels
    if (type === 'binary') {
        baseFrom = 'decimal'; baseTo = 'binary';
        questionText = `What is the binary equivalent of decimal ${decimal}?`;
        correctAnswer = decimal.toString(2);
        explanationText = `To convert ${decimal} from decimal to binary, you use repeated division by 2.`;
    } else if (type === 'octal') {
        baseFrom = 'decimal'; baseTo = 'octal';
        questionText = `What is the octal equivalent of decimal ${decimal}?`;
        correctAnswer = decimal.toString(8);
        explanationText = `To convert ${decimal} from decimal to octal, you use repeated division by 8.`;
    } else if (type === 'hex') {
        baseFrom = 'decimal'; baseTo = 'hexadecimal';
        questionText = `What is the hexadecimal equivalent of decimal ${decimal}?`;
        correctAnswer = decimal.toString(16).toUpperCase();
        explanationText = `To convert ${decimal} from decimal to hexadecimal, you group binary digits into fours.`;
    } else { // Decimal conversion question
        baseFrom = 'binary'; baseTo = 'decimal';
        const binaryVal = decimal.toString(2);
        questionText = `What is the decimal equivalent of binary ${binaryVal}?`;
        correctAnswer = decimal.toString();
        explanationText = `To convert ${binaryVal} from binary to decimal, you sum the powers of 2.`;
    }
    currentCorrectAnswer = correctAnswer; // Store for feedback

    // Generate Wrong Answers based on Type
    while (possibleAnswers.length < 3) {
        let rand = Math.floor(Math.random() * 254) + 1;
        let wrong;
        if (type === 'binary') wrong = rand.toString(2);
        else if (type === 'octal') wrong = rand.toString(8);
        else if (type === 'hex') wrong = rand.toString(16).toUpperCase();
        else wrong = rand.toString();

        if (wrong !== correctAnswer && !possibleAnswers.includes(wrong) && wrong.length === correctAnswer.length) {
            possibleAnswers.push(wrong);
        }
    }

    let allAnswers = possibleAnswers.map(text => ({ text: text, correct: false }));
    allAnswers.push({ text: correctAnswer, correct: true });
    allAnswers.sort(() => Math.random() - 0.5);

    return { question: questionText, answers: allAnswers, explanation: explanationText };
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

// Resets state for the next question
function resetState() {
    nextButton.classList.add('hide');
    feedbackExplanationElement.classList.add('hide');
    feedbackExplanationElement.innerText = '';
    while (answerButtonsElement.firstChild) {
        answerButtonsElement.removeChild(answerButtonsElement.firstChild);
    }
}

// Handles answer selection and immediate inline feedback
function selectAnswer(e) {
    const selectedButton = e.target;
    const correct = selectedButton.dataset.correct === 'true';

    // Disable all buttons after one click
    Array.from(answerButtonsElement.children).forEach(button => {
        button.disabled = true;
        if (button.dataset.correct === 'true') {
            button.classList.add('correct');
        } else {
            button.classList.add('wrong');
        }
    });

    // Display inline feedback and explanation
    feedbackExplanationElement.classList.remove('hide');
    if (correct) {
        score++;
        feedbackExplanationElement.classList.add('feedback-correct');
        feedbackExplanationElement.classList.remove('feedback-wrong');
        feedbackExplanationElement.innerHTML = `✅ **Correct!** ${questionElement.dataset.explanation || ''}`;
        correctSound.play();
    } else {
        feedbackExplanationElement.classList.add('feedback-wrong');
        feedbackExplanationElement.classList.remove('feedback-correct');
        feedbackExplanationElement.innerHTML = `❌ **Wrong!** The correct answer was **${currentCorrectAnswer}**. ${questionElement.dataset.explanation || ''}`;
        wrongSound.play();
    }

    nextButton.classList.remove('hide');
}

function restartGame() {
    successScreen.classList.add('hide');
    failScreen.classList.add('hide');
    instructionScreen.classList.remove('hide');
    // You might want to reload the page or reset state fully here depending on your needs
}

// NOTE: You must ensure your showFinalScreen() and displayLeaderboard() functions are included here if they were in your original script.
