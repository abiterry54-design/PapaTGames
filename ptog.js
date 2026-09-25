
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
playAgainButton.addEventListener("click", startGame);

async function initializeGame() {
    startButton.disabled = true;
    startButton.textContent = "LOADING...";

    try {
        await Promise.all([
            loadConfig(),
            loadMessages()
        ]);

        startButton.disabled = false;
        startButton.textContent = "LET'S PLAY!";

        console.log("PTOG is ready!");
    } catch (error) {
        console.error("PTOG startup error:", error);
        startButton.textContent = "PLEASE RELOAD";
    }
}

initializeGame();

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
    welcomeScreen.hidden = true;
    roundCompleteScreen.hidden = true;
    gameScreen.hidden = false;
    nextCard();
}


function nextCard() {
    acceptingAnswers = false;
    feedback.textContent = "";

    const activity = activities[
        Math.floor(Math.random() * activities.length)
    ];

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
            activity.type === "findShape"
                ? choice.shape
                : choice.color
        );

        const shape = document.createElement("div");
        shape.className = "shape " + choice.shape;

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

        default:
            throw new Error(
                "Unknown activity type: " + activity.type
            );
    }
}

