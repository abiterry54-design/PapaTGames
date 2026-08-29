
    let cards = [];
    let currentCard=0;
    

        async function loadCards(){
            let response = await fetch("spanish.json");
            cards = await response.json();
            
            for (let i = 0; i < cards.length; i++) {
                cards[i].correct=0;
                cards[i].missed=0;    
            }
        }

        function showAnswer() {
           document.getElementById("answer").innerHTML = cards[currentCard].answer;
           setGameState("answer");
        }

        function nextCard() {
            currentCard++;

            if (currentCard >= cards.length) {
                //shuffleCards();
                //currentCard=0;
                endRound();
                return;
            }
            displayCurrentCard();
            setGameState("question");
        }

        function displayCurrentCard() {
            document.getElementById("question").innerHTML = cards[currentCard].question;
            document.getElementById("answer").innerHTML = "";
        }

        function shuffleCards() {
           for (let i = cards.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            let temp = cards[i];
            cards[i] = cards[j];
            cards[j] = temp;
           }
        }
        
        function gotIt() {
            cards[currentCard].correct++;
            updateScore();
            saveProgress();
            nextCard();
        }

        function missedIt() {
            cards[currentCard].missed++;
            updateScore();
            saveProgress();
            nextCard();
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
            document.getElementById("question").innerHTML="Round Complete!";
            document.getElementById("answer").innerHTML="";
            setGameState("roundComplete");
        }

        function startNewRound() {
            shuffleCards();
            currentCard=0;
            displayCurrentCard();
            setGameState("question");
        }

        function saveProgress() {
        
            let progress = [];
            for (let i = 0; i < cards.length; i++) {
                progress.push({
                    question: cards[i].question,
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

                    if (cards[i].question === progress[j].question) {
                        cards[i].correct = progress[j].correct;
                        cards[i].missed = progress[j].missed;
                    }
               }
           }
        }
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

    switch (action) {

        case "question":
            document.getElementById("showButton").style.display = "inline-block";
            document.getElementById("gotItButton").style.display = "none";
            document.getElementById("missedButton").style.display = "none";
            document.getElementById("playAgainButton").style.display = "none";
            break;

        case "answer":
            document.getElementById("showButton").style.display = "none";
            document.getElementById("gotItButton").style.display = "inline-block";
            document.getElementById("missedButton").style.display = "inline-block";
            document.getElementById("playAgainButton").style.display = "none";
            break;

        case "roundComplete":
            document.getElementById("showButton").style.display = "none";
            document.getElementById("gotItButton").style.display = "none";
            document.getElementById("missedButton").style.display = "none";
            document.getElementById("playAgainButton").style.display = "inline-block";
            break;  

    }
}       


//Startup Here

async function startGame() {
    await loadCards();
    loadProgress();
    shuffleCards();
    displayCurrentCard();
    updateScore();
    setGameState("question");
}

startGame();


