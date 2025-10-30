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

function generateConversionQuestion(type) {
    const decimal = Math.floor(Math.random() * 255) + 1;
    const binary = decimal.toString(2);
    const hex = decimal.toString(16).toUpperCase();
    const questionTypes = ['decimal_to_binary', 'binary_to_decimal', 'decimal_to_hex'];
    
    let questionText;
    let correctAnswer;
    let possibleAnswers = [];

    switch (type) {
        case 'binary':
            questionText = `What is the binary equivalent of the decimal number ${decimal}?`;
            correctAnswer = binary;
            possibleAnswers = [
                (decimal + Math.floor(Math.random() * 5) + 1).toString(2),
                (decimal - Math.floor(Math.random() * 5) - 1).toString(2),
                (decimal + Math.floor(Math.random() * 5) + 10).toString(2)
            ].filter(answer => parseInt(answer, 2) > 0);
            break;
        case 'decimal':
            questionText = `What is the decimal equivalent of the binary number ${binary}?`;
            correctAnswer = decimal.toString();
            possibleAnswers = [
                (decimal + Math.floor(Math.random() * 5) + 1).toString(),
                (decimal - Math.floor(Math.random() * 5) - 1).toString(),
                (decimal + Math.floor(Math.random() * 5) + 10).toString()
            ].filter(answer => parseInt(answer) > 0);
            break;
        case 'hex':
            questionText = `What is the hexadecimal equivalent of the decimal number ${decimal}?`;
            correctAnswer = hex;
            possibleAnswers = [
                (decimal + Math.floor(Math.random() * 5) + 1).toString(16).toUpperCase(),
                (decimal - Math.floor(Math.random() * 5) - 1).toString(16).toUpperCase(),
                (decimal + Math.floor(Math.random() * 5) + 10).toString(16).toUpperCase()
            ].filter(answer => parseInt(answer, 16) > 0);
            break;
    }

    while (possibleAnswers.length < 3) {
        let randomIncorrect;
        if (type === 'binary') randomIncorrect = (decimal + Math.floor(Math.random() * 20) + 1).toString(2);
        if (type === 'decimal') randomIncorrect = (decimal + Math.floor(Math.random() * 20) + 1).toString();
        if (type === 'hex') randomIncorrect = (decimal + Math.floor(Math.random() * 20) + 1).toString(16).toUpperCase();

        if (randomIncorrect !== correctAnswer && !possibleAnswers.includes(randomIncorrect) && parseInt(randomIncorrect, type === 'binary' ? 2 : (type === 'hex' ? 16 : 10)) > 0) {
            possibleAnswers.push(randomIncorrect);
        }
    }

    let allAnswers = possibleAnswers.map(text => ({ text: text, correct: false }));
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
    setNextQuestion();
}

function restartGame() {
    successScreen.classList.add('hide');
    failScreen.classList.add('hide');
    introScreen.classList.remove('hide');
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
    setStatusClass(document.body, correct);
    Array.from(answerButtonsElement.children).forEach(button => {
        setStatusClass(button, button.dataset.correct === 'true');
        button.removeEventListener('click', selectAnswer);
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
    if (score >= passingScore) {
        successScreen.classList.remove('hide');
        const message = `System repair complete! You successfully decrypted ${score} out of ${totalQuestions} files.`;
        animateTypewriterText(finalMessageSuccess, message);
    } else {
        failScreen.classList.remove('hide');
        const message = `Failure. You only decrypted ${score} out of ${totalQuestions} files.`;
        animateTypewriterText(finalMessageFail, message);
    }
}

function animateTypewriterText(element, text) {
    let i = 0;
    element.innerText = ''; // Clear existing text
    function type() {
        if (i < text.length) {
            element.innerText += text.charAt(i);
            i++;
            setTimeout(type, 50); // Adjust typing speed here (in milliseconds)
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
