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
const finalMessageSuccess = document.getElementById('final-message-success');
const finalMessageFail = document.getElementById('final-message-fail');
const playerNameInput = document.getElementById('playerName');
const leaderboardList = document.getElementById('leaderboard-list');
const MAX_LEADERBOARD_ENTRIES = 5;

// Create Audio objects for sound effects and background music
const correctSound = new Audio('correct.mp3');
const wrongSound = new Audio('wrong-47985.mp3');
const accessGrantedSound = new Audio('access-granted...mp3');
const failedSound = new Audio('Failed.mp3');
const backgroundMusic = document.getElementById('backgroundMusic');

let currentQuestionIndex;
const totalQuestions = 15;
const passingScore = 13;
let score = 0;
let selectedQuestionType;

startButton.addEventListener('click', startGame);
nextButton.addEventListener('click', () => {
    currentQuestionIndex++;
    setNextQuestion();
});
restartButtonSuccess.addEventListener('click', restartGame);
restartButtonFail.addEventListener('click', restartGame);

// --- Leaderboard Functions ---
function getLeaderboard() {
    const leaderboardJSON = localStorage.getItem('techQuizLeaderboard');
    return leaderboardJSON ? JSON.parse(leaderboardJSON) : [];
}

function saveLeaderboard(leaderboard) {
    localStorage.setItem('techQuizLeaderboard', JSON.stringify(leaderboard));
}

function displayLeaderboard() {
    const leaderboard = getLeaderboard();
    leaderboardList.innerHTML = '';
    leaderboard.forEach((entry, index) => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${index + 1}. ${entry.name}</span><span>${entry.score} pts</span>`;
        leaderboardList.appendChild(li);
    });
}

function addToLeaderboard(name, score) {
    const leaderboard = getLeaderboard();
     if (score > 0) {
        leaderboard.push({ name, score });
        leaderboard.sort((a, b) => b.score - a.score);
        leaderboard.splice(MAX_LEADERBOARD_ENTRIES);
        saveLeaderboard(leaderboard);
        displayLeaderboard();
    }
}
// --- End Leaderboard Functions ---

// Audio Management Functions
function playSound(sound) {
    sound.currentTime = 0;
    sound.play();
}

function pauseBackgroundMusic() {
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
}
// --- End Audio Management Functions ---


function generateConversionQuestion(type) {
    const decimal = Math.floor(Math.random() * 255) + 1;
    const binary = decimal.toString(2);
    const hex = decimal.toString(16).toUpperCase();
    
    let questionText;
    let correctAnswer;
    let possibleAnswers = [];

    switch (type) {
        case 'binary':
            questionText = `What is the binary equivalent of the decimal number ${decimal}?`;
            correctAnswer = binary;
            possibleAnswers = [
                (decimal + Math.floor(Math.random() * 5) + 1).toString(2),
                (decimal - Math.floor(Math.random() * 5) - 1).toString(2)
            ].filter(answer => parseInt(answer, 2) > 0);
             let furtherIncorrectBinary = (decimal + Math.floor(Math.random() * 10) + 5).toString(2);
             if(parseInt(furtherIncorrectBinary, 2) > 0) possibleAnswers.push(furtherIncorrectBinary);
            break;
        case 'decimal':
            questionText = `What is the decimal equivalent of the binary number ${binary}?`;
            correctAnswer = decimal.toString();
            possibleAnswers = [
                (decimal + Math.floor(Math.random() * 5) + 1).toString(),
                (decimal - Math.floor(Math.random() * 5) - 1).toString()
            ].filter(answer => parseInt(answer) > 0);
             let furtherIncorrectDecimal = (decimal + Math.floor(Math.random() * 10) + 5).toString();
             if(parseInt(furtherIncorrectDecimal) > 0) possibleAnswers.push(furtherIncorrectDecimal);
            break;
        case 'hex':
            questionText = `What is the hexadecimal equivalent of the decimal number ${decimal}?`;
            correctAnswer = hex;
            possibleAnswers = [
                (decimal + Math.floor(Math.random() * 5) + 1).toString(16).toUpperCase(),
                (decimal - Math.floor(Math.random() * 5) - 1).toString(16).toUpperCase()
            ].filter(answer => parseInt(answer, 16) > 0);
            let furtherIncorrectHex = (decimal + Math.floor(Math.random() * 10) + 5).toString(16).toUpperCase();
            if(parseInt(furtherIncorrectHex, 16) > 0) possibleAnswers.push(furtherIncorrectHex);
            break;
    }

    const uniqueIncorrectAnswers = Array.from(new Set(possibleAnswers)).filter(answer => answer !== correctAnswer);
     while (uniqueIncorrectAnswers.length < 3) {
        let randomIncorrect;
        let randomDecimal = Math.floor(Math.random() * 255) + 1;
        if (type === 'binary') randomIncorrect = randomDecimal.toString(2);
        if (type === 'decimal') randomIncorrect = randomDecimal.toString();
        if (type === 'hex') randomIncorrect = randomDecimal.toString(16).toUpperCase();

        if (randomIncorrect !== correctAnswer && !uniqueIncorrectAnswers.includes(randomIncorrect) && parseInt(randomIncorrect, type === 'binary' ? 2 : (type === 'hex' ? 16 : 10)) > 0) {
            uniqueIncorrectAnswers.push(randomIncorrect);
        }
    }


    let allAnswers = uniqueIncorrectAnswers.slice(0, 3).map(text => ({ text: text, correct: false }));
    allAnswers.push({ text: correctAnswer, correct: true });
    allAnswers.sort(() => Math.random() - 0.5);

    return {
        question: questionText,
        answers: allAnswers
    };
}


function startGame() {
    selectedQuestionType = document.querySelector('input[name="qType"]:checked').value;
    introScreen.classList.add('hide');
    quizScreen.classList.remove('hide');
    currentQuestionIndex = 0;
    score = 0;
    backgroundMusic.muted = false;
    backgroundMusic.play();
    setNextQuestion();
}

function restartGame() {
    successScreen.classList.add('hide');
    failScreen.classList.add('hide');
    introScreen.classList.remove('hide');
    displayLeaderboard();
    backgroundMusic.muted = true;
    backgroundMusic.pause();
}

function setNextQuestion() {
    resetState();
    if (currentQuestionIndex < totalQuestions) {
        const newQuestion = generateConversionQuestion(selectedQuestionType);
        showQuestion(newQuestion);
    } else {
        showFinalScreen();
    }
}

function showQuestion(question) {
    questionElement.innerText = question.question;
    question.answers.forEach(answer => {
        const button = document.createElement('button');
        button.innerText = answer.text;
        button.classList.add('btn');
        if (answer.correct) {
            button.dataset.correct = answer.correct;
        }
        button.addEventListener('click', selectAnswer);
        answerButtonsElement.appendChild(button);
    });
}

function resetState() {
    clearStatusClass(document.body);
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
    }
    setStatusClass(selectedButton, correct);

    Array.from(answerButtonsElement.children).forEach(button => {
        button.removeEventListener('click', selectAnswer);
         if (button.dataset.correct === 'true') {
             button.classList.add('correct');
         } else {
            if (!correct) {
                button.classList.add('wrong');
             }
         }
    });

    if (currentQuestionIndex < totalQuestions - 1) {
        nextButton.innerText = 'Next Question';
        nextButton.classList.remove('hide');
    } else {
        nextButton.innerText = 'FINISH';
        nextButton.classList.remove('hide');
    }
}

function showFinalScreen() {
    quizScreen.classList.add('hide');
    // Background music continues to play
    const playerName = playerNameInput.value.trim() || 'Player';

    if (score >= passingScore) {
        successScreen.classList.remove('hide');
        const message = `Quiz complete, ${playerName}! You answered ${score} out of ${totalQuestions} questions correctly.`;
        animateTypewriterText(finalMessageSuccess, message);
        addToLeaderboard(playerName, score);

    } else {
        failScreen.classList.remove('hide');
        const message = `Quiz incomplete, ${playerName}. You answered ${score} out of ${totalQuestions} questions correctly. You need ${passingScore} to pass.`;
        animateTypewriterText(finalMessageFail, message);
        addToLeaderboard(playerName, score);
    }
}

function animateTypewriterText(element, text) {
    let i = 0;
    element.innerText = '';
    function type() {
        if (i < text.length) {
            element.innerText += text.charAt(i);
            i++;
            setTimeout(type, 30);
        }
    }
    type();
}

function setStatusClass(element, correct) {
    clearStatusClass(element);
    if (correct) {
        element.classList.add('correct');
    } else {
        element.classList.add('wrong');
    }
}

function clearStatusClass(element) {
    element.classList.remove('correct');
    element.classList.remove('wrong');
}

displayLeaderboard();
