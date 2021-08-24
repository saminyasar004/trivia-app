/**
 * Title: Quiz App
 * Description: Generate some quizes with answer form another server.
 * Author: Samin Yasar
 * Date: 20/August/2021
 */

// DOM Select
const quizTopicSpan = document.getElementById("quizTopicSpan");
const quizNumberEl = document.getElementById("quizNumberEl");
const quizIncorrectSpan = document.getElementById("quizIncorrectSpan");
const quizCorrectSpan = document.getElementById("quizCorrectSpan");
const countdownTimeBar = document.getElementById("countdownTimeBar");
const quizQuestionEl = document.getElementById("quizQuestionEl");
const quizOptionListEl = document.getElementById("quizOptionListEl");
const quizControls = document.getElementById("quizControls");

// Global Variables
const quizAmount = 20;
const timePerQuiz = 10;
const passMark = 70; // ! in percentage
let totalTime = quizAmount * timePerQuiz;
let currentTime = totalTime;
let currentQuiz = 1;
let countIncorrect = (countCorrect = 0);
let nextQuestion = null;
let intervalId = null;

const correctAnswers = [];
const answers = [];

const quizCategories = {
    nature: 17,
    computers: 18,
    mathematics: 19,
    sports: 21,
    animals: 27,
    gadgets: 30,
};

const quizTopic =
    Object.keys(quizCategories)[
        Math.floor(Math.random() * Object.keys(quizCategories).length)
    ];

const quizCategoryId = quizCategories[quizTopic];
const quizDifficulties = ["easy", "medium", "hard"];
const quizDifficulty =
    quizDifficulties[Math.floor(Math.random() * quizDifficulties.length)];

const API_URL = `https://opentdb.com/api.php?amount=${quizAmount}&category=${quizCategoryId}`;

// Functionalities
/**
 * Start counting time in every single second.
 */
function startCountdown() {
    let currentWidth = 100;

    return (intervalId = setInterval(() => {
        if (currentTime > 0) {
            currentWidth -= 100 / totalTime; // * get the percentage of total time and decrease it every interval
            if (currentTime <= 10) {
                countdownTimeBar.style.background = `linear-gradient(270deg,#ff8271,#ff523b)`;
            }
            countdownTimeBar.style.width = `${
                currentWidth ? currentWidth : 1
            }%`;
            currentTime--;
        } else {
            clearInterval(intervalId);
        }
    }, 1000));
}

/**
 * Return the final result of the user.
 *
 */
function getResult() {
    const percentage = parseInt((passMark * quizAmount) / 100);
    if (currentTime > 0) {
        // ? time remain
        if (countCorrect >= percentage) {
            // * Win
            document.querySelector(".quiz-container").innerHTML = `
            <h2 class="result-heading">congratulation, you win!</h2>
            <p class="result-para">your score is: <span>${countCorrect}</span></p>
        `;
            document.querySelector(".result-para span").style.color = "#1DD881";
        } else {
            // ! Lost
            document.querySelector(".quiz-container").innerHTML = `
            <h2 class="result-heading">try again.</h2>
            <p class="result-para">your score is: <span>${countCorrect}</span></p>
        `;
            document.querySelector(".result-para span").style.color = "#ff523b";
        }
    } else {
        // ! times up
        if (countCorrect >= percentage) {
            // * Win but times up
            document.querySelector(".quiz-container").innerHTML = `
            <h2 class="result-heading">you passed but your times up!</h2>
            <p class="result-para">your score is: <span>${countCorrect}</span></p>
        `;
            document.querySelector(".result-para span").style.color = "#ff523b";
        } else {
            // ! Lost
            document.querySelector(".quiz-container").innerHTML = `
            <h2 class="result-heading">try again.</h2>
            <p class="result-para">your score is: <span>${countCorrect}</span></p>
        `;
            document.querySelector(".result-para span").style.color = "#ff523b";
        }
    }
}

/**
 * Update the results variables.
 */
function updateResult() {
    countIncorrect = answers.filter((answer, ind) => {
        return answer !== correctAnswers[ind];
    }).length;
    countCorrect = answers.filter((answer, ind) => {
        return answer === correctAnswers[ind];
    }).length;
}

/**
 * Render all the question into the corresponding placeholder.
 *
 * @param {Object} questions - All the questions as an array of object.
 */
function renderQuestion(questions) {
    let currentQuizIndex = 0;

    return function () {
        // ? Render the next question!
        quizQuestionEl.innerHTML =
            quizOptionListEl.innerHTML =
            quizControls.innerHTML =
                ""; // remove all the items which are inserted before

        if (currentQuizIndex <= questions.length - 1) {
            const quiz = questions[currentQuizIndex];
            const options = quiz.incorrect_answers
                .concat(quiz.correct_answer)
                .sort(() => Math.random() - 0.5); // concat the `correct_answer` property value with the `incorrect_answers` array to create a bunch of options and also sorted it

            quizNumberEl.innerHTML = `
                <h3>#${currentQuiz} <span>of ${questions.length}</span></h3>
            `;
            quizIncorrectSpan.innerText = countIncorrect;
            quizCorrectSpan.innerText = countCorrect;

            quizQuestionEl.innerText = quiz.question.replace(
                /&#(\d+);/gi,
                (match, charCode) => {
                    return String.fromCharCode(charCode);
                }
            ); // ! Convert the HTML entity code to text string. {Note: Only works for entity which has digit but not work for characters entity}

            options.forEach((option, ind) => {
                const optionHeading = ["a", "b", "c", "d"];
                quizOptionListEl.innerHTML += `
                    <li>
                        <h3>${optionHeading[ind]}</h3>
                        <p>${option}</p>
                    </li>
                `;
                quizControls.innerHTML += `
                    <button data-answer=${JSON.stringify(
                        option
                    )} class="btn btn-option">${optionHeading[ind]}</button>
                `;
            });

            const optionButtons = document.querySelectorAll(".btn-option");
            optionButtons.forEach((optionButton) => {
                optionButton.addEventListener("click", (e) => {
                    [...optionButtons]
                        .filter((el) =>
                            el.classList.contains("btn-selected-option")
                        )
                        .forEach((el) =>
                            el.classList.remove("btn-selected-option")
                        );

                    answers.push(e.target.dataset.answer); // push the item to user's answer array
                    updateResult();
                    nextQuestion();
                });
            });

            currentQuiz++;
            ++currentQuizIndex;
        } else {
            // ? Quiz is completed!
            getResult();
        }
    };
}

/**
 * Request to the `opentdb.com` server to get all questions.
 * @return {string[]} - Return all the questions as an array.
 */
async function getQuestions() {
    const defaultQuestion = {
        category: "mathematics",
        correct_answer: "3.1416",
        difficulty: "easy",
        incorrect_answers: ["3.1614", "2.3498", "3.1415"],
        question: "What is the rounded value of PI?",
        type: "multiple",
    }; // * If the API request will not response any questions then this default question will be pass

    try {
        const { results: questions = [defaultQuestion] } = await (
            await fetch(API_URL)
        ).json();
        if (questions.length) {
            throw questions;
        }
    } catch (err) {
        return err;
    }
}

/**
 * Initializer function of this project.
 */
async function init() {
    try {
        const questions = await getQuestions();

        // insert all correct question into an array
        questions.forEach((question) => {
            correctAnswers.push(question.correct_answer);
        });

        startCountdown();

        quizTopicSpan.innerText = quizTopic;

        nextQuestion = renderQuestion(questions);
        nextQuestion();
    } catch (err) {
        document.querySelector(".quiz-section").innerHTML = `
            <h1 class="error-heading">check your internet connection.</h1>
        `;
        console.log(err);
    }
}

// * Initialize the app
init();
