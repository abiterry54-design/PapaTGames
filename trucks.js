const world = document.getElementById("world");
const loaderArm = document.getElementById("loaderArm");
const loaderForks = document.getElementById("loaderForks");
let gameState = "ready";
const cargo = [];
let completedStops = 0;
let maxStops = 6;
let truckActivities = [];
let currentChallenge = null;
let lastCorrectAnswer = null;
let lastCorrectPosition = -1;


async function loadTruckGames() {

    const response = await fetch("trucksGames.json");

    if (!response.ok) {
        throw new Error("Could not load trucksGames.json");
    }

    const config = await response.json();

    truckActivities = config.activities;

    const spellingActivity = truckActivities.find(
    activity => activity.type === "spellName"
);

    maxStops = spellingActivity.word.length;

    console.log("Truck activities loaded:", truckActivities);

}

function startDriving() {
    world.classList.remove("atStop");
    world.classList.add("driving");
}

function stopDriving() {
    world.classList.remove("driving");
    world.classList.add("atStop");
}

const message = document.getElementById("message");

function speakText(text, onComplete) {
    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);

    const voices = speechSynthesis.getVoices();

    const natasha = voices.find(
        voice => voice.name.includes("Microsoft Natasha Online")
    );

    const tessa = voices.find(
        voice => voice.name.toLowerCase().includes("tessa")
    );

    if (natasha) {
        speech.voice = natasha;
    }
    else if (tessa) {
        speech.voice = tessa;
    }
    else {
        speech.lang = "en-US";
}

    speech.rate = 0.95;
    speech.pitch = 1.0;

    speech.onend = () => {if (onComplete) {onComplete();}
    };

    window.speechSynthesis.speak(speech);
    
        //includes("Microsoft Natasha Online")
        //includes("Microsoft Molly Online")
        //includes("Microsoft Guy Online")
}

function listVoices() {
    const voices = speechSynthesis.getVoices();

    const englishVoices = voices.filter(
        voice => voice.lang.startsWith("en-")
    );

    console.table(
        englishVoices.map(voice => ({
            name: voice.name,
            language: voice.lang
        }))
    );
}

speechSynthesis.onvoiceschanged = listVoices;
listVoices();

function driveToNextStop() {

    gameState = "driving";

    message.textContent = "Let's go!";
    startDriving();

    const house = document.querySelector(".redHouse");

    // Desired position of house on screen
    const targetX = window.innerWidth * 0.30;

    let previousX = null;
    let hasMoved = false;

    function checkHousePosition() {

        const rect = house.getBoundingClientRect();
        const houseX = rect.left + rect.width / 2;

        if (previousX !== null &&
            Math.abs(houseX - previousX) > 1) {
            hasMoved = true;
        }

        // Stop when house crosses the target position
        if (hasMoved &&
            previousX !== null &&
            previousX < targetX &&
            houseX >= targetX) {

            stopDriving();

            prepareNextStop();

            gameState = "choosing";

            console.log("Arrived at house!");
            return;
        }

        previousX = houseX;

        requestAnimationFrame(checkHousePosition);
    }

    requestAnimationFrame(checkHousePosition);
}


    const startButton = document.getElementById("startButton");

    startButton.addEventListener("click", () => {
        startButton.style.display = "none";

        speakText("Let's go find some trash!");

        setTimeout(() => {driveToNextStop();}, 2500);

    });

    document.getElementById("playAgainButton")
        .addEventListener("click", () => {
            window.location.reload();
        });

    document.getElementById("exitButton")
        .addEventListener("click", () => {
            window.location.href = "index.html";
        });    

    const dumpsters = document.querySelectorAll(".dumpster");

    dumpsters.forEach(dumpster => {

        dumpster.addEventListener("click", () => {

    // Ignore clicks unless we're waiting for an answer
    if (gameState !== "choosing") {
        return;
    }

    const answer = dumpster.dataset.answer;

    console.log("Orion picked:", answer);

    if (answer === String(currentChallenge.answer)) {

        gameState = "pickingUp";

        pickupDumpster(dumpster, pickupComplete);
    }

    }); // End click listener

}); // End dumpsters.forEach

function pickupComplete() {
    completedStops++;
    gameState = "ready";

    if (completedStops >= maxStops) {
        endGame();
        return;
    }

    const encouragement = [
        "Nice job!",
        "Way to go!",
        "Great pickup!",
        "You're doing great!"
    ];

    const praise = encouragement[
        Math.floor(Math.random() * encouragement.length)
    ];

    message.textContent = praise;
    speakText(praise);

    setTimeout(() => driveToNextStop(), 2000);
}


function pickupDumpster(dumpster, onComplete) {

    console.log("Starting pickup:", dumpster.dataset.answer);

    
            // Remember the dumpster's original parking space
            dumpster.originalParent = dumpster.parentElement;
            dumpster.originalNextSibling = dumpster.nextElementSibling;

            console.log("Original parent:", dumpster.originalParent);

            //Hide the wrong dumpsters
            dumpsters.forEach(otherDumpster => {
                if (otherDumpster !== dumpster) {
                    otherDumpster.classList.add("wrongChoice");
                }
            });

            const dumpsterRect =
                dumpster.getBoundingClientRect();

            const pickupRect =
                document.getElementById("pickupPoint")
                        .getBoundingClientRect();

            const dumpsterCenterX =
                dumpsterRect.left + dumpsterRect.width / 2;

            const dumpsterCenterY =
                dumpsterRect.top + dumpsterRect.height / 2;

            const pickupCenterX =
                pickupRect.left + pickupRect.width / 2;

            const pickupCenterY =
                pickupRect.top + pickupRect.height / 2;

            const moveX =
                pickupCenterX - dumpsterCenterX;

            const moveY =
                pickupCenterY - dumpsterCenterY;

            dumpster.style.setProperty(
                "--move-x",
                moveX + "px"
            );

            dumpster.style.setProperty(
                "--move-y",
                moveY + "px"
            );

            dumpster.classList.add("selected");

            // Wait until dumpster finishes moving to truck
            dumpster.addEventListener("animationend", () => {

                console.log("Dumpster arrived at truck");

                // Listen BEFORE starting the forks
                loaderForks.addEventListener("transitionend", () => {

                    console.log("Forks are under the dumpster!");

                    const dumpsterRect =
                        dumpster.getBoundingClientRect();

                    const forksRect =
                        loaderForks.getBoundingClientRect();

                    // Make dumpster a child of the forks
                    loaderForks.appendChild(dumpster);

                    dumpster.classList.remove("selected");

                    dumpster.style.position = "absolute";

                    dumpster.style.left =
                        (dumpsterRect.left - forksRect.left) + "px";

                    dumpster.style.top =
                        (dumpsterRect.top - forksRect.top) + "px";

                    dumpster.style.transform = "none";

                    console.log("Dumpster attached to forks!");

       
    function armReachedTop(event) {

        // Ignore events coming from child elements
        if (event.target !== loaderArm ||
            event.propertyName !== "transform") {
            return;
        }

        // Remove listener only after the ARM finishes
        loaderArm.removeEventListener(
            "transitionend",
            armReachedTop
        );

        console.log("Loader reached the top!");

        // Listen for the forks to finish tipping
        function forksFinishedTipping(event) {

            if (event.target !== loaderForks ||
                event.propertyName !== "transform") {
                return;
            }

            loaderForks.removeEventListener(
                "transitionend",
                forksFinishedTipping
            );

            console.log("Dumpster finished tipping!");

            dumpNumber(dumpster, onComplete);
        }

        loaderForks.addEventListener(
            "transitionend",
            forksFinishedTipping
        );

        // Tip the dumpster
        loaderForks.classList.add("dumping");
    }

    loaderArm.addEventListener(
        "transitionend",
        armReachedTop
    );

                loaderArm.classList.add("lifting");
                }, { once: true }); // Forks extended

                // Start extending the forks
                loaderArm.classList.add("forksOut");

            }, { once: true }); // Dumpster arrived

}




function dumpNumber(dumpster, onComplete) {

    console.log("Dumping number!");

    const number = document.createElement("div");

    number.className = "dumpedNumber";
    number.textContent = dumpster.dataset.answer;

    // Hide the original number in the dumpster
    dumpster.style.color = "transparent";

    // Find the dumpster's current position
    const rect = dumpster.getBoundingClientRect();

    // Put the falling number in the world
    world.appendChild(number);

    const worldRect = world.getBoundingClientRect();

    number.style.left =
        (rect.left + rect.width / 2 - worldRect.left) + "px";

    number.style.top =
        (rect.top - worldRect.top) + "px";

    number.addEventListener("animationend", () => { 

    console.log("Number landed in truck!");

    // Save the collected number or letter
    cargo.push(dumpster.dataset.answer);

    console.log("Cargo aboard:", cargo);

    number.remove();

    // Wait for the arm to reach the bottom
    function armReachedBottom(event) {

        if (event.target !== loaderArm ||
            event.propertyName !== "transform") return;

        loaderArm.removeEventListener(
            "transitionend",
            armReachedBottom
        );

        console.log("Loader reached the bottom!");

        // Return empty dumpster to its original container

        console.log("Returning dumpster:", dumpster);
        console.log("Parking parent:", dumpster.originalParent);

        // FIRST: Remember where the dumpster is on screen
        const startRect = dumpster.getBoundingClientRect();

        // Return dumpster to its original flex position
        dumpster.originalParent.insertBefore(
            dumpster,
            dumpster.originalNextSibling
        );

        // Clear its old forklift positioning
        dumpster.style.position = "";
        dumpster.style.left = "";
        dumpster.style.top = "";
        dumpster.style.transform = "";
        dumpster.style.animation = "none";

        // LAST: Find its new parking position
        const endRect = dumpster.getBoundingClientRect();

        // INVERT: Visually place it back where it started
        const dx = startRect.left - endRect.left;
        const dy = startRect.top - endRect.top;

        dumpster.style.transition = "none";
        dumpster.style.transform = `translate(${dx}px, ${dy}px)`;

        // Force browser to recognize the starting position
        void dumpster.offsetWidth;

        function dumpsterParked(event) {
            if (event.target !== dumpster ||
                event.propertyName !== "transform") return;

            dumpster.removeEventListener("transitionend", dumpsterParked);

        console.log("Dumpster parked at curb!");

        // Retract the empty forks
        function forksRetracted(event) {

            if (event.target !== loaderForks ||
                event.propertyName !== "transform") return;

            loaderForks.removeEventListener(
                "transitionend",
                forksRetracted
            );

            console.log("Forks fully retracted!");

            onComplete();
        }

        loaderForks.addEventListener(
            "transitionend",
            forksRetracted
        );

        loaderArm.classList.remove("forksOut");
        }

        dumpster.addEventListener("transitionend", dumpsterParked);

        // PLAY: Animate home
        dumpster.style.transition = "transform 2s ease-in-out";
        dumpster.style.transform = "translate(0, 0)";

        console.log("Dumpster returning to curb!");

    }

    // Listen BEFORE lowering
    loaderArm.addEventListener(
        "transitionend",
        armReachedBottom
    );

    // Now lower the arm
    loaderArm.classList.remove("lifting");

        // Return forks from 30° to 0°
        loaderForks.classList.remove("dumping");

    }, { once: true });

}

//const loaderArm = document.getElementById("loaderArm");

//setTimeout(() => {
//    loaderArm.classList.add("lifting");
//        loaderArm.classList.add("forksOut");
//}, 2000);

function generateTruckChallenge() {

    const activity = truckActivities.find(
        activity => activity.type === "spellName"
    );

    let pool;

    if (activity.type === "findNumber") {

        pool = [];

        for (let n = activity.min; n <= activity.max; n++) {
            pool.push(String(n));
        }
        } else if (activity.type === "findLetter") {
            pool = [...activity.letters];

        } else if (activity.type === "spellName") {
            pool = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"];

        } else {
            throw new Error("Unknown truck activity: " + activity.type);
        }

    // Avoid repeating the previous correct answer.
    const available = pool.filter(
        value => value !== lastCorrectAnswer
    );

    const answerPool = available.length ? available : pool;

    const answer = activity.type === "spellName"
        ? activity.word[completedStops]
        : answerPool[Math.floor(Math.random() * answerPool.length)];

    lastCorrectAnswer = answer;

    // Select two different incorrect answers.
    const distractors = pool
        .filter(value => value !== answer)
        .sort(() => Math.random() - 0.5)
        .slice(0, activity.choiceCount - 1);

    const choices = [answer, ...distractors]
        .sort(() => Math.random() - 0.5);

    // Avoid putting the answer in the same position twice.
    let correctPosition = choices.indexOf(answer);

    if (correctPosition === lastCorrectPosition) {

        const swapPosition = (correctPosition + 1) % choices.length;

        [choices[correctPosition], choices[swapPosition]] =
            [choices[swapPosition], choices[correctPosition]];

        correctPosition = swapPosition;
    }

    lastCorrectPosition = correctPosition;

    const placeholder =
        activity.type === "findNumber" ? "{number}" : "{letter}";

    return {
        type: activity.type,
        prompt: activity.prompt.replace(placeholder, answer),
        answer: answer,
        choices: choices.map(value => ({
            value: value,
            label: value
        }))
    };
}


function prepareNextStop() {

    // Generate a new number or letter challenge.
    currentChallenge = generateTruckChallenge();

    // Put the new choices on our three dumpsters.
    dumpsters.forEach((dumpster, index) => {

        const choice = currentChallenge.choices[index];

        // Store the answer for the click handler.
        dumpster.dataset.answer = String(choice.value);

        // Display the new number or letter.
        dumpster.textContent = choice.label;

        // Restore appearance after previous pickup.
        dumpster.classList.remove("selected", "wrongChoice");

        dumpster.style.color = "";
        dumpster.style.opacity = "";
        dumpster.style.transform = "";
        dumpster.style.transition = "";
        dumpster.style.animation = "";
    });

     // Display the new question.
        message.textContent = currentChallenge.prompt;

        if (completedStops === 0) {
            speakText(currentChallenge.prompt);
        }
        else if (completedStops === maxStops - 1) {
            speakText("Last one! " + currentChallenge.prompt);
        }
        else {
            speakText("Now, " + currentChallenge.prompt.toLowerCase());
        }

        }

        loadTruckGames().catch(error => {
            console.error("Truck game configuration error:", error);
});

function endGame() {
    gameState = "finished";
    stopDriving();

    document.getElementById("world").classList.add("gameComplete");
    
    message.textContent = "Great job! You spelled your name!";

    const spelledWord = document.getElementById("spelledWord");

    spelledWord.innerHTML = "";

    cargo.forEach(letter => {
        const letterBox = document.createElement("div");
        letterBox.className = "spelledLetter";
        letterBox.textContent = letter;
        spelledWord.appendChild(letterBox);
    });

    spelledWord.style.display = "flex";
    document.getElementById("endButtons").style.display = "flex";

    // Celebrate the completed word.
    const finishedWord = cargo.join("");

function speakLetter(index) {

    // All letters have been spoken.
    if (index >= cargo.length) {
        setTimeout(() => {
            speakText(
                finishedWord + "! You did it! Great job!"
            );
        }, 800);
        return;
    }

    // Speak one letter, then wait before the next.
    speakText(cargo[index], () => {
        setTimeout(() => {
            speakLetter(index + 1);
        }, 600);
    });
}

    // Begin spelling.
    speakLetter(0);

    console.log("GAME COMPLETE!");
    console.log("Final cargo:", cargo);
}

function buildVoiceMenu() {
    const select = document.getElementById("voiceSelect");

    const voices = speechSynthesis.getVoices();

    select.innerHTML = "";

    voices
        .filter(voice => voice.lang.startsWith("en-"))
        .forEach(voice => {
            const option = document.createElement("option");

            option.value = voice.name;
            option.textContent = voice.name;

            select.appendChild(option);
        });
}

document.getElementById("testVoiceButton")
    .addEventListener("click", () => {

        const selectedName =
            document.getElementById("voiceSelect").value;

        const voice = speechSynthesis.getVoices()
            .find(v => v.name === selectedName);

        speechSynthesis.cancel();

        const speech = new SpeechSynthesisUtterance(
            "Hey Orion! Let's pick up some trash!"
        );

        if (voice) {
            speech.voice = voice;
        }

        speech.rate = 0.95;
        speech.pitch = 1.1;

        speechSynthesis.speak(speech);
    });

speechSynthesis.addEventListener(
    "voiceschanged",
    buildVoiceMenu
);

buildVoiceMenu();