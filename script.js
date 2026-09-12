
    let cards = [];
    let currentCard=0;
    let masteredCount = 0;
    let firstTryCorrect = 0;
    const masteryGoal = 2;
    const cardImage = document.getElementById("cardImage");
    const displayText = document.getElementById("displayText")
    const showButton = document.getElementById("showButton");
    const CARDS_PER_ROUND = 20;

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
    "Good reading!",
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
    "Let's give that word another try.",
    "Here's that word again. Say it with me."
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
                " words! You got " +
                firstTryCorrect +
                " on the first try! Let's get some more words and play again!";

            document.getElementById("question").innerHTML =
                "Round Complete!";

            document.getElementById("answer").innerHTML =
                message;

            speakText(message);

            setGameState("roundComplete");
        }

        function startNewRound() {
            console.log("startNewRound called");

            masteredCount=0;
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

        switch (action) {

        case "question":
            document.getElementById("speakButton").style.display = "inline-block";
            document.getElementById("showButton").style.display = "inline-block";
            document.getElementById("gotItButton").style.display = "none";
            document.getElementById("missedButton").style.display = "none";
            document.getElementById("playAgainButton").style.display = "none";
            showButton.textContent = "Show Answer";
            break;

        case "answer":
            document.getElementById("speakButton").style.display = "inline-block";
            document.getElementById("showButton").style.display = "none";
            document.getElementById("gotItButton").style.display = "inline-block";
            document.getElementById("missedButton").style.display = "inline-block";
            document.getElementById("playAgainButton").style.display = "none";
            break;

        case "roundComplete":
            document.getElementById("speakButton").style.display = "none";
            document.getElementById("showButton").style.display = "none";
            document.getElementById("gotItButton").style.display = "none";
            document.getElementById("missedButton").style.display = "none";
            document.getElementById("playAgainButton").style.display = "inline-block";
            break;
            
        case "readSpeak":
            // Read → Speak: child sees the word and presses Speak
            document.getElementById("speakButton").style.display = "inline-block";
            document.getElementById("showButton").style.display = "none";
            document.getElementById("gotItButton").style.display = "none";
            document.getElementById("missedButton").style.display = "none";
            document.getElementById("playAgainButton").style.display = "none";
            break;

        case "readResult":
            // Read → Speak: answer has been checked
            // Later showButton will become our Next button
            document.getElementById("speakButton").style.display = "none";
            document.getElementById("showButton").style.display = "inline-block";
            document.getElementById("gotItButton").style.display = "none";
            document.getElementById("missedButton").style.display = "none";
            document.getElementById("playAgainButton").style.display = "none";
            showButton.textContent = "Next";
            break;

        case "seeSpeak":
            // See → Say: child sees picture and presses Speak
            document.getElementById("speakButton").style.display = "inline-block";
            document.getElementById("showButton").style.display = "none";
            document.getElementById("gotItButton").style.display = "none";
            document.getElementById("missedButton").style.display = "none";
            document.getElementById("playAgainButton").style.display = "none";
            break;
            
            case "readRetry":
            document.getElementById("speakButton").style.display = "inline-block";
            document.getElementById("showButton").style.display = "none";
            document.getElementById("gotItButton").style.display = "none";
            document.getElementById("missedButton").style.display = "none";
            document.getElementById("playAgainButton").style.display = "none";
            break;


        }
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
        "Listening...";

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

    let normalizedAnswers =
        cards[currentCard].answers.map(answer =>
            answer.trim().toLowerCase()
        );

    console.log(
        "Accepted answers:",
        normalizedAnswers
    );

    if (normalizedAnswers.includes(spokenWord)) {

        document.getElementById("answer").innerHTML =
            "Correct!";

            if (cards[currentCard].image) {
                cardImage.src = cards[currentCard].image;
            }
            let word = cards[currentCard].prompt;

            speakText(word + ". " + getPraise());

            firstTryCorrect++;

            gotIt(false);
            setGameState("readResult");
        }
    else {
        let word = cards[currentCard].prompt;

        document.getElementById("answer").innerHTML= 'Oops! I heard: "' + spokenWord + '"';

        speakText(word + ". " + getTryAgainMessage() + " " + word );

        missedIt(false);
        setGameState("readResult");
    }
}

function speakText(text) {

    window.speechSynthesis.cancel();

    let speech =
        new SpeechSynthesisUtterance(text);

    speech.lang = "en-US";

    speech.onstart = function() {
        console.log("Speech started:", text);
    };

    speech.onend = function() {
        console.log("Speech finished.");
    };

    speech.onerror = function(event) {
        console.log("Speech synthesis error:", event.error);
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

function beginGame() {
  document.getElementById("welcomeScreen").style.display = "none";
  document.getElementById("gameArea").style.display = "block";
  startGame();
}

async function startGame() {
    firstTryCorrect = 0;
    await loadCards();
    loadProgress();
    shuffleCards();
    cards = cards.slice(0, CARDS_PER_ROUND);
    displayCurrentCard();
    //updateScore();
    setGameState("readSpeak");

}

//showText("Because");
//showPicture("images/papat7.png");

//startGame();


