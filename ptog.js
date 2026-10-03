
//const shapes = ["circle", "square", "triangle"];

const params = new URLSearchParams(window.location.search);
const studentName = params.get("student") || "Orion";

let currentAnswer = "";
let currentPrompt = "";
let acceptingAnswers = false;
let messages = {};
let cardsPerRound = 12;
let completedCards = 0;
let lastShape = null;
let lastColor = null;

const startButton = document.getElementById("startButton");
const gameScreen = document.getElementById("gameScreen");
const welcomeScreen = document.getElementById("welcomeScreen");
const question = document.getElementById("question");
const choices = document.getElementById("choices");
const feedback = document.getElementById("feedback");
const roundCompleteScreen = document.getElementById("roundCompleteScreen");
const roundMessage = document.getElementById("roundMessage");
const playAgainButton = document.getElementById("playAgainButton");
const activityMenu = document.getElementById("activityMenu");

let selectedActivities = [];
let activityDeck = [];
let activities = [];
const colorValues = {
    red: "#e74c3c",
    blue: "#3478e5",
    yellow: "#f4ca36",
    green: "#37a65b"
};

async function loadConfig() {
    const response = await fetch("ptog.json");

    if (!response.ok) {
        throw new Error("Could not load ptog.json");
    }

    const config = await response.json();
    activities = config.activities;
    cardsPerRound = config.cardsPerRound ?? 12;

    console.log("Loaded PTOG activities:", activities);
}

async function loadMessages() {
    const response = await fetch("messages.json");

    if (!response.ok) {
        throw new Error("Could not load messages.json");
    }

    messages = await response.json();

    console.log("Loaded shared messages:", messages);
}

function randomMessage(category) {
    const options = messages[category];

    const message = options[
        Math.floor(Math.random() * options.length)
    ];

    return message.replaceAll("{name}", studentName);
}



document.getElementById("heading").textContent =
    "Hi " + studentName + "! 👋";

startButton.addEventListener("click", startGame);
playAgainButton.addEventListener("click", showActivityMenu);

initializeGame();


function showActivityMenu() {

    roundCompleteScreen.hidden = true;
    gameScreen.hidden = true;
    welcomeScreen.hidden = false;
}


async function initializeGame() {

    //const startLabel = document.getElementById("startLabel");

    startButton.disabled = true;
    startButton.textContent = "LOADING...";

    try {
        await Promise.all([
            loadConfig(),
            loadMessages()
        ]);

        buildActivityMenu();

        startButton.disabled = true;
        startButton.textContent = "LET'S PLAY!";

        console.log("PTOG is ready!");

    } catch (error) {

        console.error("PTOG startup error:", error);
        startButton.textContent = "PLEASE RELOAD";
    }
}

function buildActivityMenu() {

    activityMenu.innerHTML = "";

    activities.forEach(activity => {

        const button = document.createElement("button");

        button.className = "activityButton";
        button.type = "button";
        button.textContent = activity.label;

        button.addEventListener("click", () => {

            const isSelected =
                button.classList.toggle("selected");

            if (isSelected) {

                selectedActivities.push(activity);

            } else {

                selectedActivities =
                    selectedActivities.filter(
                        selected => selected !== activity
                    );
            }

            startButton.disabled = selectedActivities.length === 0;

            console.log(
                "Selected activities:",
                selectedActivities
            );
        });

        activityMenu.appendChild(button);
    });
}


function speakText(text, onFinished) {
    speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);
    speech.rate = 0.85;

    let finished = false;

    function finishOnce() {
        if (finished) return;
        finished = true;

        if (onFinished) onFinished();
    }

    speech.onend = finishOnce;
    speech.onerror = finishOnce;

    speechSynthesis.speak(speech);
}

function shuffle(array) {
    return [...array].sort(() => Math.random() - 0.5);
}



function generateColorCard(activity) {
    const colors = activity.colors;

    // Exclude the previous answer.
    const availableColors = colors.filter(
        color => color !== lastColor
    );

    // Choose a random color from the remaining colors.
    const answer = availableColors[
        Math.floor(Math.random() * availableColors.length)
    ];

    // Remember this answer for the next question.
    lastColor = answer;

    // Insert the selected color into the question.
    const prompt = activity.prompt.replace(
        "{color}",
        answer
    );

    // Create one choice for each color.
    const cardChoices = shuffle(colors).map(colorName => ({
        shape: activity.shape,
        color: colorName,
        value: colorName
    }));

    return {
        prompt: prompt,
        answer: answer,
        choices: cardChoices
    };
}



function startGame() {

    completedCards = 0;
    lastShape = null;
    lastColor = null;

    // Build the deck from the selected activities.
    activityDeck = [];

    for (let i = 0; i < cardsPerRound; i++) {

        const activity =
            selectedActivities[i % selectedActivities.length];

        activityDeck.push(activity);
    }

    activityDeck = shuffle(activityDeck);

    welcomeScreen.hidden = true;
    roundCompleteScreen.hidden = true;
    gameScreen.hidden = false;

    nextCard();
}


function nextCard() {
    acceptingAnswers = false;
    feedback.textContent = "";

    const activity = activityDeck[completedCards];

    const card = generateCard(activity);

    currentAnswer = card.answer;
    currentPrompt = card.prompt;

    question.textContent = currentPrompt;
    choices.innerHTML = "";

    card.choices.forEach(choice => {
        const button = document.createElement("button");
        button.className = "choiceButton";
        button.disabled = true;

        button.setAttribute(
            "aria-label",
            choice.color + " " + choice.shape
        );

        const shape = document.createElement("div");
        shape.className = "shape " + choice.shape;

        if (choice.label !== undefined) {
            shape.textContent = choice.label;
}

//console.log("Rendering choice:", choice);

        // Look up the actual CSS color.
        if (choice.shape === "triangle") {
            shape.style.borderBottomColor = colorValues[choice.color];
        } else {
            shape.style.backgroundColor = colorValues[choice.color];
        }

        button.appendChild(shape);

        button.addEventListener("click", () => {
            checkAnswer(choice.value);
        });

        choices.appendChild(button);
    });

    speakText(
        studentName + ", " + currentPrompt,
        () => setChoicesEnabled(true)
    );
}


function setChoicesEnabled(enabled) {
    acceptingAnswers = enabled;

    document.querySelectorAll(".choiceButton")
        .forEach(button => {
            button.disabled = !enabled;
        });
}

function checkAnswer(selectedShape) {
    if (!acceptingAnswers) return;

    setChoicesEnabled(false);

    if (selectedShape === currentAnswer) {
        const praise = randomMessage("praise");

        feedback.textContent = praise;

        speakText(praise, () => {
            completedCards++;

            if (completedCards >= cardsPerRound) {
                endRound();
            } else {
                setTimeout(nextCard, 700);
            }
        });
    } else {
        const encouragement = randomMessage("tryAgain");

        feedback.textContent = encouragement;

        const prompt = currentPrompt;

        speakText(
            encouragement + " " + prompt,
            () => setChoicesEnabled(true)
        );
    }
}

function endRound() {
    acceptingAnswers = false;

    gameScreen.hidden = true;
    roundCompleteScreen.hidden = false;

    const message = randomMessage("roundComplete");

    roundMessage.textContent = message;

    playAgainButton.disabled = true;

    speakText(message, () => {
        playAgainButton.disabled = false;
    });
}


function generateShapeCard(activity) {
    const availableShapes = activity.shapes.filter(
        shape => shape !== lastShape
    );

    const answer = availableShapes[
        Math.floor(Math.random() * availableShapes.length)
    ];

    lastShape = answer;

    const prompt = activity.prompt.replace(
        "{shape}",
        answer
    );

    const cardChoices = shuffle(activity.shapes).map(
        shapeName => ({
            shape: shapeName,
            color: "red",
            value: shapeName
        })
    );

    return {
        prompt: prompt,
        answer: answer,
        choices: cardChoices
    };
}


function generateCard(activity) {

    switch (activity.type) {

        case "findShape":
            return generateShapeCard(activity);

        case "findColor":
            return generateColorCard(activity);

        case "findColoredShape":
            return generateColoredShapeCard(activity);

        case "findNumber":
            return generateNumberCard(activity); 
            
        case "findLetter":
            return generateLetterCard(activity);

        default:
            throw new Error(
                "Unknown activity type: " + activity.type
            );
    }
}

function generateNumberCard(activity) {

    // Build the available number pool.
    const numbers = [];

    for (let number = activity.min; number <= activity.max; number++) {
        numbers.push(number);
    }

    // Pick the correct answer.
    const answer = shuffle(numbers)[0];

    // Pick the other three choices.
    const otherNumbers = shuffle(
        numbers.filter(number => number !== answer)
    ).slice(0, activity.choiceCount - 1);

    // Put the answer and distractors together and shuffle them.
    const numberChoices = shuffle([
        answer,
        ...otherNumbers
    ]);

    // Create choices in our standard card format.
    const cardChoices = numberChoices.map(number => ({
        shape: "square",
        color: shuffle(["red", "blue", "yellow", "green"])[0],
        value: number,
        label: number
    }));

    const prompt = activity.prompt.replace(
        "{number}",
        answer
    );

    return {
        prompt: prompt,
        answer: answer,
        choices: cardChoices
    };
}

function generateLetterCard(activity) {

    // Get the pool of letters from JSON.
    const letters = activity.letters;

    // Pick the correct answer.
    const answer = shuffle(letters)[0];

    // Pick three other letters as wrong choices.
    const otherLetters = shuffle(
        letters.filter(letter => letter !== answer)
    ).slice(0, activity.choiceCount - 1);

    // Put the correct answer with the distractors
    // and shuffle their positions.
    const letterChoices = shuffle([
        answer,
        ...otherLetters
    ]);

    // Convert the letters into our standard PTOG choice objects.
    const cardChoices = letterChoices.map(letter => ({
        shape: "square",
        color: shuffle(["red", "blue", "yellow", "green"])[0],
        value: letter,
        label: letter
    }));

    // Put the selected letter into the spoken/displayed prompt.
    const prompt = activity.prompt.replace(
        "{letter}",
        answer
    );

    // Return our standard PTOG card.
    return {
        prompt: prompt,
        answer: answer,
        choices: cardChoices
    };
}

function generateColoredShapeCard(activity) {

    // Choose the correct shape and color.
    const answerShape = shuffle(activity.shapes)[0];
    const answerColor = shuffle(activity.colors)[0];

    const correct = {
        shape: answerShape,
        color: answerColor,
        value: answerColor + "-" + answerShape
    };

    // Same shape, different color.
    const otherColor = shuffle(
        activity.colors.filter(c => c !== answerColor)
    )[0];

    const distractor1 = {
        shape: answerShape,
        color: otherColor,
        value: otherColor + "-" + answerShape
    };

    // Same color, different shape.
    const otherShape = shuffle(
        activity.shapes.filter(s => s !== answerShape)
    )[0];

    const distractor2 = {
        shape: otherShape,
        color: answerColor,
        value: answerColor + "-" + otherShape
    };

    // Choose a third distractor from all remaining combinations.
    const usedValues = [
        correct.value,
        distractor1.value,
        distractor2.value
    ];

    const remaining = [];

    activity.shapes.forEach(shape => {
        activity.colors.forEach(color => {
            const value = color + "-" + shape;

            if (!usedValues.includes(value)) {
                remaining.push({
                    shape: shape,
                    color: color,
                    value: value
                });
            }
        });
    });

    const distractor3 = shuffle(remaining)[0];

    const prompt = activity.prompt
        .replace("{color}", answerColor)
        .replace("{shape}", answerShape);

    return {
        prompt: prompt,
        answer: correct.value,
        choices: shuffle([
            correct,
            distractor1,
            distractor2,
            distractor3
        ])
    };
}
