
/* Laken's Personal Wordle — Version 0.1 */

// Temporary settings until we connect wordle.json
const answer = "COOKIE";
const maxGuesses = 6;
let currentGuess = "";
let currentRow = 0;
let gameOver = false;

const wordleGrid = document.getElementById("wordleGrid");
const keyboard = document.getElementById("keyboard");
const keyStates = {};

const colorPriority = {
    gray: 1,
    yellow: 2,
    green: 3
};

// Build the puzzle grid
function createGrid() {
    wordleGrid.innerHTML = "";

    wordleGrid.style.gridTemplateColumns =
        `repeat(${answer.length}, 52px)`;

    for (let i = 0; i < maxGuesses * answer.length; i++) {
        const tile = document.createElement("div");
        tile.classList.add("tile");
        wordleGrid.appendChild(tile);
    }
}

// Build the on-screen keyboard
function createKeyboard() {
    keyboard.innerHTML = "";

    const rows = [
        "QWERTYUIOP",
        "ASDFGHJKL",
        "ZXCVBNM"
    ];

    rows.forEach((letters, rowIndex) => {
        const row = document.createElement("div");
        row.classList.add("keyboardRow");

        // Add Enter before the bottom row
        if (rowIndex === 2) {
            addKey(row, "ENTER");
        }

        letters.split("").forEach(letter => {
            addKey(row, letter);
        });

        // Add Backspace after the bottom row
        if (rowIndex === 2) {
            addKey(row, "BACKSPACE");
        }

        keyboard.appendChild(row);
    });
}

// Create one keyboard button
function addKey(row, value) {
    const button = document.createElement("button");

    button.textContent = value === "BACKSPACE" ? "⌫" : value;
    button.dataset.key = value;
    button.classList.add("key");

    if (value === "ENTER" || value === "BACKSPACE") {
        button.classList.add("special");
    }

    row.appendChild(button);
}

keyboard.addEventListener("click", event => {
    const button = event.target.closest("button");

    if (!button) return;

    handleKey(button.dataset.key);
});

function handleKey(key) {
    if (gameOver) return;

    if (key === "BACKSPACE") {
        currentGuess = currentGuess.slice(0, -1);
    }
    else if (key === "ENTER") {
        submitGuess();
        return;
    }
    else if (currentGuess.length < answer.length) {
        currentGuess += key;
    }

    displayCurrentGuess();
}

function displayCurrentGuess() {
    const tiles = wordleGrid.children;
    const startIndex = currentRow * answer.length;

    for (let i = 0; i < answer.length; i++) {
        tiles[startIndex + i].textContent =
            currentGuess[i] || "";
    }
}


function submitGuess() {
    // Don't submit an incomplete word
    if (currentGuess.length !== answer.length) {
        return;
    }

    const result = evaluateGuess(currentGuess);

    updateKeyboardColors(currentGuess, result);

    const startIndex = currentRow * answer.length;

    // Color the tiles in the submitted row
    for (let i = 0; i < answer.length; i++) {
        const tile = wordleGrid.children[startIndex + i];
        tile.classList.add(result[i]);
    }

    currentRow++;

    if (currentGuess === answer) {
        gameOver = true;
        document.getElementById("guessCounter").textContent =
            `Solved in ${currentRow} of ${maxGuesses} guesses!`;
        document.getElementById("message").textContent =
            `Great job, Laken! You solved LADLE in ${currentRow} guesses!`;
    }
    else if (currentRow >= maxGuesses) {
        gameOver = true;
        document.getElementById("guessCounter").textContent =
    `       Used all ${maxGuesses} guesses`;
        document.getElementById("message").textContent =
            `Good try, Laken! The word was ${answer}.`;
    }
    else {
        currentGuess = "";
        document.getElementById("guessCounter").textContent =
            `Guess ${currentRow + 1} of ${maxGuesses}`;
    }
}


function evaluateGuess(guess) {
    const result = Array(answer.length).fill("gray");
    const remaining = answer.split("");

    // First pass: exact matches (green)
    for (let i = 0; i < answer.length; i++) {
        if (guess[i] === answer[i]) {
            result[i] = "green";
            remaining[i] = null;
        }
    }

    // Second pass: misplaced matches (yellow)
    for (let i = 0; i < answer.length; i++) {
        if (result[i] === "green") continue;

        const index = remaining.indexOf(guess[i]);

        if (index !== -1) {
            result[i] = "yellow";
            remaining[index] = null;
        }
    }

    return result;
}

function updateKeyboardColors(guess, result) {
    for (let i = 0; i < guess.length; i++) {
        const letter = guess[i];
        const newColor = result[i];
        const oldColor = keyStates[letter];

        if (!oldColor ||
            colorPriority[newColor] > colorPriority[oldColor]) {

            keyStates[letter] = newColor;

            const button = keyboard.querySelector(
                `button[data-key="${letter}"]`
            );

            if (button) {
                button.classList.remove(
                    "green", "yellow", "gray"
                );
                button.classList.add(newColor);
            }
        }
    }
}

// Initialize the game screen
createGrid();
createKeyboard();
document.getElementById("guessCounter").textContent =
    `Guess 1 of ${maxGuesses}`;

