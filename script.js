
    let cards = [];
    let currentCard=0;
    let masteredCount = 0;
    let firstTryCorrect = 0;
    let mathRetryCount = 0;
    const mathRetryLimit = 5;
    const masteryGoal = 2;
    const cardImage = document.getElementById("cardImage");
    const displayText = document.getElementById("displayText")
    const showButton = document.getElementById("showButton");
    const CARDS_PER_ROUND = 20;
    let gameType = "";   // "fry100" or "mathFacts" set in beginGame(selectedGame)
    let roundSize = 20;
    let mathOperators = ["+", "-"];
    let mathMin = 0;
    let mathMax = 20;
    let allowNegatives = false;

    // temp praiseMessages
    const praiseMessages = [
    "Very good!",
    "Great job!",
    "Laken! You Rock!",
    "Nice!",
    "Way to go!",
    "Well done Laken",
    "You got it!",
    "Excellent!",
    "What a brain!",
    "That's it!",
    "Awesome!",
    "Attaboy!"
    ];

    const tryAgainMessages = [
    "That's a tough one. Say it with me.",
    "Almost! Let's say it together.",
    "Good try! Say it with me.",
    "Let's practice that one together.",
    "No problem. Try saying it with me.",
    "Let's work on that one.",
    "That one can be tricky. Say it with me.",
    "Good effort! Let's try it together.",
    "Let's give that another try.",
    "Here's that again. Say it with me."
];
    
    showButton.addEventListener("click", () => {

    if (showButton.textContent === "Next") {
        nextCard();
    } else {
        showAnswer();
    }
    });
    

        async function loadCards(){
        let response = await fetch("fry100.json?v=2");
            let data = await response.json();

            cards = data.items;
            
            for (let i = 0; i < cards.length; i++) {
                cards[i].correct = 0;
                cards[i].missed = 0;
                cards[i].streak = 0;    
            }
        }

        function showAnswer() {
           document.getElementById("answer").innerHTML = cards[currentCard].answers[0];

           cardImage.src = cards[currentCard].image;

           setGameState("answer");
        }

        function showText(text) {
            cardImage.style.display = "none";
            displayText.style.display = "flex";
            displayText.textContent = text;

            if (text.length <= 16) {
                displayText.style.fontSize = "3rem";
            }
            else if (text.length <= 30) {
                displayText.style.fontSize = "2rem";
            }
            else {
                displayText.style.fontSize = "1.3rem";
            }
        }
        

        function showPicture(image) {
            displayText.style.display = "none";
            cardImage.style.display="block";
            cardImage.src = image;
        }


        function nextCard() {
            currentCard++;

            //if (masteredCount===cards.length) {
            //    endRound();
            //    return;
            //}

            if (currentCard >= cards.length) {
                endRound();
                return;

                //shuffleCards();
                //currentCard=0;
            }

            //while (cards[currentCard].streak >= masteryGoal) {
            //    currentCard++;
            //    if (currentCard>=cards.length) {
            //        shuffleCards();
            //        currentCard=0;
            //    }
            //}
  
            displayCurrentCard();
            setGameState("readSpeak");
        }


        function displayCurrentCard() {
            
            // document.getElementById("cardImage").style.display = "none";
            document.getElementById("question").innerHTML = cards[currentCard].prompt;
            document.getElementById("answer").innerHTML = "";
            updateProgress();
            //showDefaultImage();
        }

        function showDefaultImage() {
            document.getElementById("cardImage").src = "images/papat7.png";
        }


        function shuffleCards() {
           for (let i = cards.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            let temp = cards[i];
            cards[i] = cards[j];
            cards[j] = temp;
           }
        }
        
        function gotIt(advance = true) {
            cards[currentCard].correct++;
            cards[currentCard].streak++;
            if (cards[currentCard].streak===masteryGoal) {
                masteredCount++;
            }
            //updateScore();
            saveProgress();

            if (advance) {
                nextCard();   
            }
        }

        function missedIt(advance= true) {
            cards[currentCard].missed++;
            cards[currentCard].streak=0;
            //updateScore();
            saveProgress();

            if (advance) {
                nextCard();   
            }
        
        }

        function updateScore() {
            let totalCorrect = 0;
            let totalMissed = 0;
            let score = 0;

            for (let i = 0; i < cards.length; i++) {
                totalCorrect += cards[i].correct;
                totalMissed += cards[i].missed;
            }
            let totalAnswers = totalCorrect + totalMissed;
            if (totalAnswers>0) {
                score = (totalCorrect/(totalAnswers)*100);
            }

            document.getElementById("score").innerHTML=
            "Correct: "+ totalCorrect +" | Missed: "+ totalMissed + "  Score: " +
            score.toFixed(0) +"%";
        }

        function endRound() {

            let message =
                "Great job Laken! You finished all " +
                cards.length +
                "! You got " +
                firstTryCorrect +
                " on the first try! Let's get some more and play again!";

            document.getElementById("question").innerHTML =
                "Round Complete!";

            document.getElementById("answer").innerHTML =
                message;

            cardImage.src = "images/endround.png";

            speakText(message);

            setGameState("roundComplete");
        }

        function startNewRound() {
            console.log("startNewRound called");

            masteredCount=0;
            firstTryCorrect = 0;

            for (let i = 0; i < cards.length; i++) {
                cards[i].streak=0;    
            }
            
            shuffleCards();
            currentCard=0;
            displayCurrentCard();
            setGameState("readSpeak");
        }

        function saveProgress() {
        
            let progress = [];
            for (let i = 0; i < cards.length; i++) {
                progress.push({
                    question: cards[i].id,
                    correct: cards[i].correct,
                    missed: cards[i].missed
                });   
            }
            localStorage.setItem("learningGameProgress", JSON.stringify(progress));
        } 
        
        function loadProgress() {

            let savedProgress = localStorage.getItem("learningGameProgress");

            if (savedProgress) {
            let progress = JSON.parse(savedProgress);

            for (let i = 0; i < cards.length; i++) {

                    for (let j = 0; j < progress.length; j++) {

                        if (cards[i].question === progress[j].id) {
                            cards[i].correct = progress[j].correct;
                            cards[i].missed = progress[j].missed;
                        }
                }
            }
            }
        } 
        
        function updateProgress() {

            document.getElementById("score").textContent =
                (currentCard + 1) + " of " + cards.length;
        }

        function resetProgress() {
         if (confirm("Are you sure you want to reset all progress?")) {    
            for (let i = 0; i < cards.length; i++) {
                cards[i].correct = 0;
                cards[i].missed = 0;
            }
            saveProgress();
            updateScore();
         }
        }

function setGameState(action) {

    console.log("Game state:", action);

    // -----------------------------------------
    // DEFAULT STATE
    // Hide every game button first.
    // Each state below turns on only what it needs.
    // -----------------------------------------

    document.getElementById("speakButton").style.display = "none";
    document.getElementById("showButton").style.display = "none";
    document.getElementById("gotItButton").style.display = "none";
    document.getElementById("missedButton").style.display = "none";
    document.getElementById("wordsAgainButton").style.display = "none";
    document.getElementById("mathAgainButton").style.display = "none";


    switch (action) {

        case "buttonsOff":
            // All buttons were already turned off above.
            // Nothing to turn back on.
            break;

        case "question":
            speakButton.style.display = "inline-block";
            showButton.style.display = "inline-block";
            showButton.textContent = "Show Answer";
            break;


        case "answer":
            speakButton.style.display = "inline-block";
            gotItButton.style.display = "inline-block";
            missedButton.style.display = "inline-block";
            break;


        case "readSpeak":
            // Child sees word and may press Speak
            speakButton.style.display = "inline-block";
            break;


        case "readResult":
            // Speech result is complete.
            // Child may advance to next word.
            showButton.style.display = "inline-block";
            showButton.textContent = "Next";
            break;


        case "readRetry":
            // Child may try the word again.
            speakButton.style.display = "inline-block";
            break;


        case "seeSpeak":
            // Child sees picture and may press Speak.
            speakButton.style.display = "inline-block";
            break;


        case "roundComplete":
            wordsAgainButton.style.display = "inline-block";
            mathAgainButton.style.display = "inline-block";
            break;
    }
} 

function beginNextGame(selectedGame) {
    gameType = selectedGame;
    startGame();
}
    


// --------------------
// SPEECH RECOGNITION
// --------------------

function startListening() {

    // Wake up speech synthesis while we are inside
    // a real user button tap
    const unlockSpeech =
        new SpeechSynthesisUtterance("");

    window.speechSynthesis.speak(unlockSpeech);

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    document.getElementById("answer").innerHTML =
    '<span class="listening">Listening...</span>';

    recognition.start();

    recognition.onresult = function(event) {

        let spokenWord =
            event.results[0][0].transcript;

        spokenWord = spokenWord
            .trim()
            .toLowerCase()
            .replace(/[.,!?]/g, "");

        console.log("Speech heard:", spokenWord);

        recognition.stop();

    recognition.onend = function() {
        console.log("Recognition ended.");


         setTimeout(function() {
            checkSpokenAnswer(spokenWord);}, 500);
    };
};

    recognition.onerror = function(event) {

        console.log(
            "Speech error:",
            event.error
        );

        document.getElementById("answer").innerHTML =
            "I didn't hear that. Try again.";
    };
}


function checkSpokenAnswer(spokenWord) {
    let card = cards[currentCard];

    // For math facts, convert spoken number words
    // to numbers before checking the answer.
    if (card.type === "mathFact") {

        let spokenNumber =
            spokenNumberToNumber(spokenWord);

        // Speech was heard, but it wasn't
        // something we recognize as a number.
   
if (spokenNumber === null) {

    mathRetryCount++;

    console.log(
        "Math speech not understood:",
        spokenWord,
        "Retry:",
        mathRetryCount,
        "of",
        mathRetryLimit
    );

    // Try automatically until we reach the limit
    if (mathRetryCount < mathRetryLimit) {

        document.getElementById("answer").innerHTML =
            "I didn't understand that. Try again.";

        setGameState("buttonsOff");

        speakText(
            "I didn't understand that. Try again.",
            function() {
                setTimeout(startListening, 500);
            }
        );

        return;
    }

    // We reached the retry limit.
    // Stop listening and let Laken restart when ready.
    mathRetryCount = 0;

    document.getElementById("answer").innerHTML =
        "Press Speak when you're ready.";

    setGameState("readRetry");

    speakText(
        "I'm having trouble hearing you. Press Speak when you're ready."
    );

    return;
}

        // We successfully heard a number,
        // so reset the retry counter.
        mathRetryCount = 0;

        // Example: "sixteen" becomes "16"
        spokenWord = String(spokenNumber);
    }

        // ---------------------------------
        // WORDS: nothing was heard
        // ---------------------------------
        if (card.type !== "mathFact" && spokenWord === "") {

            console.log("Word speech was empty - trying again.");

            document.getElementById("answer").innerHTML =
                "I didn't hear you. Try again.";

            setGameState("buttonsOff");

            speakText(
                "I didn't hear you. Try again.",
                function() {
                    setTimeout(startListening, 500);
                }
            );

            return;
        }


    let normalizedAnswers =
        card.answers.map(answer =>
            answer.trim().toLowerCase()
        );

    console.log(
        "Accepted answers:",
        normalizedAnswers
    );

    if (normalizedAnswers.includes(spokenWord)) {


let answers = card.answers;
let answerMessage;

if (card.type === "mathFact") {
    answerMessage =
        "<strong>" +
        card.prompt + " " + answers[0] +
        "</strong><br><br>Correct!";
}
else {
    answerMessage = "Correct!";

    if (answers.length > 1) {
        answerMessage +=
            "<br><br>Here are some words that sound alike:<br>" +
            "<strong>" +
            answers.join(" &nbsp; • &nbsp; ") +
            "</strong>";
    }
}

    document.getElementById("answer").innerHTML = answerMessage;


        if (card.image) {
            cardImage.src = card.image;
        }

        if (card.type === "mathFact") {
            let spokenProblem = getMathSpokenPrompt(card);
            let correctAnswer = card.answers[0];

            setGameState("buttonsOff");

            speakText(
                spokenProblem + " " +
                correctAnswer + ". " +
                getPraise(),
                function() {
                    setGameState("readResult");
                }
            );
        }

        else {
            setGameState("buttonsOff");

            speakText(
                card.prompt + ". " + getPraise(),
                function() {
                    setGameState("readResult");
                }
            );
        }

        firstTryCorrect++;

        gotIt(false);
        

    }
    else {

        if (card.type === "mathFact") {
            document.getElementById("answer").innerHTML =
                "<strong>" +
                card.prompt + " " + card.answers[0] +
                "</strong><br><br>" +
                'Oops! I heard: "' + spokenWord + '"';
        }
        else {
            document.getElementById("answer").innerHTML =
                'Oops! I heard: "' + spokenWord + '"';
        }

        if (card.type === "mathFact") {
            let spokenProblem = getMathSpokenPrompt(card);
            let correctAnswer = card.answers[0];

            setGameState("buttonsOff");

            speakText(
                getTryAgainMessage() + " " +
                spokenProblem + " " +
                correctAnswer,
                function() {
                    setGameState("readResult");
                }
            );
        }
        else {
            let word = card.prompt;

            setGameState("buttonsOff");

            speakText(
                word + ". " +
                getTryAgainMessage() + " " +
                word,
                function() {
                    setGameState("readResult");
                }
            );
        }

        missedIt(false);
    }
}

function speakText(text, onFinished) {

    window.speechSynthesis.cancel();

    let speech =
        new SpeechSynthesisUtterance(text);

    speech.lang = "en-US";

    speech.onstart = function() {
        console.log("Speech started:", text);
    };

    speech.onend = function() {
        console.log("Speech finished.");

        if (onFinished) {
            onFinished();
        }
    };

    speech.onerror = function(event) {
        console.log(
            "Speech synthesis error:",
            event.error
        );
    };

    window.speechSynthesis.speak(speech);
}

function getPraise() {

    let randomIndex = Math.floor(Math.random() * praiseMessages.length);
    return praiseMessages[randomIndex];
}

function getTryAgainMessage() {

    let randomIndex =
        Math.floor(Math.random() * tryAgainMessages.length);

    return tryAgainMessages[randomIndex];
}

//Startup Here

function beginGame(selectedGame) {
    gameType=selectedGame;

    document.getElementById("welcomeScreen").style.display = "none";
    document.getElementById("gameArea").style.display = "block";
    startGame();
}

function getMathSpokenPrompt(card) {
    return card.prompt
        .replace("+", " plus ")
        .replace("-", " minus ")
        .replace("=", " equals ");
}

async function startGame() {
    firstTryCorrect = 0;
    currentCard = 0;

    if (gameType === "mathFacts") {
        cards = generateMathFacts();
    } else {
        await loadCards();
    }

    loadProgress();
    shuffleCards();
    cards = cards.slice(0, CARDS_PER_ROUND);

    displayCurrentCard();
    // updateScore();
    setGameState("readSpeak");
}

//showText("Because");
//showPicture("images/papat7.png");
//startGame();

function generateMathFacts() {
    let mathCards = [];

    for (let i = 0; i < roundSize; i++) {
        let operator =
            mathOperators[Math.floor(Math.random() * mathOperators.length)];

        let num1 =
            Math.floor(Math.random() * (mathMax - mathMin + 1)) + mathMin;

        let num2 =
            Math.floor(Math.random() * (mathMax - mathMin + 1)) + mathMin;

        if (operator === "-" && !allowNegatives && num2 > num1) {
            let temp = num1;
            num1 = num2;
            num2 = temp;
        }

        let answer;

        if (operator === "+") {
            answer = num1 + num2;
        } else {
            answer = num1 - num2;
        }

        mathCards.push({
            id: String(i + 1).padStart(3, "0"),
            type: "mathFact",
            prompt: `${num1} ${operator} ${num2} =`,
            answers: [String(answer)]
        });
    }

    return mathCards;
}

function spokenNumberToNumber(spokenWord) {
    if (
        spokenWord === null ||
        spokenWord === undefined ||
        spokenWord.trim() === ""
    ) {
        console.log("Empty speech - not a number");
        return null;
    }

    const numbers = {
        "zero": 0,
        "one": 1,
        "two": 2,
        "three": 3,
        "four": 4,
        "five": 5,
        "six": 6,
        "seven": 7,
        "eight": 8,
        "nine": 9,
        "ten": 10,
        "eleven": 11,
        "twelve": 12,
        "thirteen": 13,
        "fourteen": 14,
        "fifteen": 15,
        "sixteen": 16,
        "seventeen": 17,
        "eighteen": 18,
        "nineteen": 19,
        "twenty": 20
    };

    // Recognition already returned digits
    if (!isNaN(spokenWord)) {
        console.log(
            'Spoken number already numeric:',
            spokenWord
        );

        return Number(spokenWord);
    }

    // Recognition returned a number word
    if (numbers.hasOwnProperty(spokenWord)) {

        console.log(
            'Converted spoken number:',
            spokenWord,
            '→',
            numbers[spokenWord]
        );

        return numbers[spokenWord];
    }

    console.log(
        'Not recognized as a number:',
        spokenWord
    );

    return null;
}

