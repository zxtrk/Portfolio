// Game State
let gameState = {
    secretWord: '',
    currentGuess: '',
    guesses: [],
    currentRow: 0,
    gameOver: false,
    maxAttempts: 6
};

// Extended word bank for validation - includes both suggested words and common valid 5-letter words
const validWords = new Set([
    'ABOUT', 'ABOVE', 'ABUSE', 'ACTOR', 'ACUTE', 'ADMIT', 'ADOPT', 'ADULT', 'AFTER', 'AGAIN',
    'AGENT', 'AGREE', 'AHEAD', 'ALARM', 'ALBUM', 'ALERT', 'ALIGN', 'ALIKE', 'ALIVE', 'ALLOW',
    'ALONE', 'ALONG', 'ALTER', 'ANGEL', 'ANGER', 'ANGLE', 'ANGRY', 'APART', 'APPLE', 'APPLY',
    'ARENA', 'ARGUE', 'ARISE', 'ARRAY', 'ASIDE', 'ASSET', 'AUDIO', 'AVOID', 'AWARD', 'AWARE',
    'BADLY', 'BAKER', 'BASES', 'BASIC', 'BASIN', 'BASIS', 'BATCH', 'BEACH', 'BEGAN', 'BEGIN',
    'BEING', 'BELOW', 'BENCH', 'BILLY', 'BIRTH', 'BLACK', 'BLADE', 'BLAME', 'BLANK', 'BLAST',
    'BLEED', 'BLESS', 'BLIND', 'BLOCK', 'BLOOD', 'BLOOM', 'BOARD', 'BOOST', 'BOOTH', 'BOUND',
    'BRAIN', 'BRAND', 'BRAVE', 'BREAD', 'BREAK', 'BREED', 'BRIEF', 'BRING', 'BROAD', 'BROKE',
    'BROWN', 'BUILD', 'BUILT', 'BUYER', 'CABLE', 'CALIF', 'CARRY', 'CATCH', 'CAUSE', 'CHAIN',
    'CHAIR', 'CHART', 'CHASE', 'CHEAP', 'CHECK', 'CHEST', 'CHIEF', 'CHILD', 'CHINA', 'CHOSE',
    'CIVIL', 'CLAIM', 'CLASS', 'CLEAN', 'CLEAR', 'CLICK', 'CLIMB', 'CLOCK', 'CLOSE', 'CLOTH',
    'CLOUD', 'COACH', 'COAST', 'COULD', 'COUNT', 'COURT', 'COVER', 'CRAFT', 'CRASH', 'CRAZY',
    'CREAM', 'CRIME', 'CROSS', 'CROWD', 'CROWN', 'CURVE', 'CYCLE', 'DAILY', 'DANCE', 'DEALT',
    'DEATH', 'DEBUT', 'DELAY', 'DEPTH', 'DOING', 'DOUBT', 'DOZEN', 'DRAFT', 'DRAMA', 'DRANK',
    'DRAWN', 'DREAM', 'DRESS', 'DRILL', 'DRINK', 'DRIVE', 'DROVE', 'DYING', 'EAGER', 'EARLY',
    'EARTH', 'EIGHT', 'ELECT', 'EMPTY', 'ENEMY', 'ENJOY', 'ENTER', 'ENTRY', 'EQUAL', 'ERROR',
    'EVENT', 'EVERY', 'EXACT', 'EXIST', 'EXTRA', 'FAITH', 'FALSE', 'FAULT', 'FIBER', 'FIELD',
    'FIFTH', 'FIFTY', 'FIGHT', 'FINAL', 'FIRST', 'FIXED', 'FLASH', 'FLEET', 'FLOOR', 'FLUID',
    'FOCUS', 'FORCE', 'FORTH', 'FORTY', 'FORUM', 'FOUND', 'FRAME', 'FRANK', 'FRAUD', 'FRESH',
    'FRONT', 'FRUIT', 'FULLY', 'FUNNY', 'GIANT', 'GIVEN', 'GLASS', 'GLOBE', 'GOING', 'GRACE',
    'GRADE', 'GRAND', 'GRANT', 'GRASS', 'GREAT', 'GREEN', 'GROSS', 'GROUP', 'GROWN', 'GUARD',
    'GUESS', 'GUEST', 'GUIDE', 'HAPPY', 'HARRY', 'HEART', 'HEAVY', 'HENCE', 'HENRY', 'HORSE',
    'HOTEL', 'HOUSE', 'HUMAN', 'IDEAL', 'IMAGE', 'INDEX', 'INNER', 'INPUT', 'ISSUE', 'JAPAN',
    'JIMMY', 'JOINT', 'JONES', 'JUDGE', 'KNOWN', 'LABEL', 'LARGE', 'LASER', 'LATER', 'LAUGH',
    'LAYER', 'LEARN', 'LEASE', 'LEAST', 'LEAVE', 'LEGAL', 'LEVEL', 'LEWIS', 'LIGHT', 'LIMIT',
    'LINKS', 'LIVES', 'LOCAL', 'LOGIC', 'LOOSE', 'LOWER', 'LUCKY', 'LUNCH', 'LYING', 'MAGIC',
    'MAJOR', 'MAKER', 'MARCH', 'MARIA', 'MATCH', 'MAYBE', 'MAYOR', 'MEANT', 'MEDIA', 'METAL',
    'MIGHT', 'MINOR', 'MINUS', 'MIXED', 'MODEL', 'MONEY', 'MONTH', 'MORAL', 'MOTOR', 'MOUNT',
    'MOUSE', 'MOUTH', 'MOVE D', 'MOVIE', 'MUSIC', 'NEEDS', 'NEVER', 'NEWLY', 'NIGHT', 'NOISE',
    'NORTH', 'NOTED', 'NOVEL', 'NURSE', 'OCCUR', 'OCEAN', 'OFFER', 'OFTEN', 'ORDER', 'OTHER',
    'OUGHT', 'PAINT', 'PANEL', 'PAPER', 'PARTY', 'PEACE', 'PETER', 'PHASE', 'PHONE', 'PHOTO',
    'PIECE', 'PILOT', 'PITCH', 'PLACE', 'PLAIN', 'PLANE', 'PLANT', 'PLATE', 'POINT', 'POUND',
    'POWER', 'PRESS', 'PRICE', 'PRIDE', 'PRIME', 'PRINT', 'PRIOR', 'PRIZE', 'PROOF', 'PROUD',
    'PROVE', 'QUEEN', 'QUICK', 'QUIET', 'QUITE', 'RADIO', 'RAISE', 'RANGE', 'RAPID', 'RATIO',
    'REACH', 'READY', 'REFER', 'RIGHT', 'RIVAL', 'RIVER', 'ROBIN', 'ROGER', 'ROMAN', 'ROUGH',
    'ROUND', 'ROUTE', 'ROYAL', 'RURAL', 'SCALE', 'SCENE', 'SCOPE', 'SCORE', 'SENSE', 'SERVE',
    'SEVEN', 'SHALL', 'SHAPE', 'SHARE', 'SHARP', 'SHEET', 'SHELF', 'SHELL', 'SHIFT', 'SHINE',
    'SHIRT', 'SHOCK', 'SHOOT', 'SHORT', 'SHOWN', 'SIGHT', 'SINCE', 'SIXTH', 'SIXTY', 'SIZED',
    'SKILL', 'SLEEP', 'SLIDE', 'SMALL', 'SMART', 'SMILE', 'SMITH', 'SMOKE', 'SOLID', 'SOLVE',
    'SORRY', 'SOUND', 'SOUTH', 'SPACE', 'SPARE', 'SPEAK', 'SPEED', 'SPEND', 'SPENT', 'SPLIT',
    'SPOKE', 'SPORT', 'STAFF', 'STAGE', 'STAKE', 'STAND', 'START', 'STATE', 'STEAM', 'STEEL',
    'STICK', 'STILL', 'STOCK', 'STONE', 'STOOD', 'STORE', 'STORM', 'STORY', 'STRIP', 'STUCK',
    'STUDY', 'STUFF', 'STYLE', 'SUGAR', 'SUITE', 'SUPER', 'SWEET', 'TABLE', 'TAKEN', 'TASTE',
    'TAXES', 'TEACH', 'TERRY', 'TEXAS', 'THANK', 'THEFT', 'THEIR', 'THEME', 'THERE', 'THESE',
    'THICK', 'THING', 'THINK', 'THIRD', 'THOSE', 'THREE', 'THREW', 'THROW', 'TIGHT', 'TIMES',
    'TITLE', 'TODAY', 'TOPIC', 'TOTAL', 'TOUCH', 'TOUGH', 'TOWER', 'TRACK', 'TRADE', 'TRAIN',
    'TREAT', 'TREND', 'TRIAL', 'TRIED', 'TRIES', 'TROOP', 'TRUCK', 'TRULY', 'TRUST', 'TRUTH',
    'TWICE', 'UNDER', 'UNDUE', 'UNION', 'UNITY', 'UNTIL', 'UPPER', 'URBAN', 'USAGE', 'USUAL',
    'VALID', 'VALUE', 'VIDEO', 'VIRUS', 'VISIT', 'VITAL', 'VOCAL', 'VOICE', 'WASTE', 'WATCH',
    'WATER', 'WHEEL', 'WHERE', 'WHICH', 'WHILE', 'WHITE', 'WHOLE', 'WHOSE', 'WOMAN', 'WOMEN',
    'WORLD', 'WORRY', 'WORSE', 'WORST', 'WORTH', 'WOULD', 'WOUND', 'WRITE', 'WRONG', 'WROTE',
    'YIELD', 'YOUNG', 'YOUTH'
]);

// Word bank for suggestions (subset of valid words)
const wordBank = [
    'ABOUT', 'ABOVE', 'ABUSE', 'ACTOR', 'ACUTE', 'ADMIT', 'ADOPT', 'ADULT', 'AFTER', 'AGAIN',
    'AGENT', 'AGREE', 'AHEAD', 'ALARM', 'ALBUM', 'ALERT', 'ALIGN', 'ALIKE', 'ALIVE', 'ALLOW',
    'ALONE', 'ALONG', 'ALTER', 'ANGEL', 'ANGER', 'ANGLE', 'ANGRY', 'APART', 'APPLE', 'APPLY',
    'ARENA', 'ARGUE', 'ARISE', 'ARRAY', 'ASIDE', 'ASSET', 'AUDIO', 'AVOID', 'AWARD', 'AWARE',
    'BADLY', 'BAKER', 'BASES', 'BASIC', 'BASIN', 'BASIS', 'BEACH', 'BEGAN', 'BEGIN', 'BEING',
    'BELOW', 'BENCH', 'BILLY', 'BIRTH', 'BLACK', 'BLADE', 'BLAME', 'BLANK', 'BLAST', 'BLEED',
    'BLESS', 'BLIND', 'BLOCK', 'BLOOD', 'BLOOM', 'BOARD', 'BOOST', 'BOOTH', 'BOUND', 'BRAIN',
    'BRAND', 'BREAD', 'BREAK', 'BREED', 'BRIEF', 'BRING', 'BROAD', 'BROKE', 'BROWN', 'BUILD',
    'BUILT', 'BUYER', 'CABLE', 'CALIF', 'CARRY', 'CATCH', 'CAUSE', 'CHAIN', 'CHAIR', 'CHART',
    'CHASE', 'CHEAP', 'CHECK', 'CHEST', 'CHIEF', 'CHILD', 'CHINA', 'CHOSE', 'CIVIL', 'CLAIM',
    'CLASS', 'CLEAN', 'CLEAR', 'CLICK', 'CLOCK', 'CLOSE', 'COACH', 'COAST', 'COULD', 'COUNT',
    'COURT', 'COVER', 'CRAFT', 'CRASH', 'CRAZY', 'CREAM', 'CRIME', 'CROSS', 'CROWD', 'CROWN',
    'DANCE', 'DEALT', 'DEATH', 'DEBUT', 'DELAY', 'DEPTH', 'DOING', 'DOUBT', 'DOZEN', 'DRAFT',
    'DRAMA', 'DRANK', 'DRAWN', 'DREAM', 'DRESS', 'DRILL', 'DRINK', 'DRIVE', 'DROVE', 'DYING'
];

// DOM Elements
const wordSelectionScreen = document.getElementById('wordSelectionScreen');
const gameScreen = document.getElementById('gameScreen');
const gameOverScreen = document.getElementById('gameOverScreen');

const wordGrid = document.getElementById('wordGrid');
const customWordInput = document.getElementById('customWordInput');
const confirmWordBtn = document.getElementById('confirmWordBtn');
const wordError = document.getElementById('wordError');

const gameBoard = document.getElementById('gameBoard');
const keyboard = document.getElementById('keyboard');
const guessError = document.getElementById('guessError');

const resultTitle = document.getElementById('resultTitle');
const resultMessage = document.getElementById('resultMessage');
const finalWord = document.getElementById('finalWord');
const finalAttempts = document.getElementById('finalAttempts');
const playAgainBtn = document.getElementById('playAgainBtn');

const darkModeToggle = document.getElementById('darkModeToggle');

// Keyboard layout
const keys = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DELETE']
];

// Dark Mode Functions
function initDarkMode() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
}

function toggleDarkMode() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// Show error message
function showError(element, message) {
    element.textContent = message;
    element.classList.add('show');

    // Auto-hide after 3 seconds
    setTimeout(() => {
        element.classList.remove('show');
    }, 3000);
}

// Check if word is valid
function isValidWord(word) {
    return validWords.has(word.toUpperCase());
}

// Initialize game
function init() {
    initDarkMode();
    populateWordGrid();
    createKeyboard();
    attachEventListeners();
}

// Event Listeners
function attachEventListeners() {
    confirmWordBtn.addEventListener('click', handleConfirmWord);
    playAgainBtn.addEventListener('click', resetGame);
    darkModeToggle.addEventListener('click', toggleDarkMode);

    customWordInput.addEventListener('input', handleCustomWordInput);
    customWordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleConfirmWord();
    });

    document.addEventListener('keydown', handlePhysicalKeyboard);
}

// Populate word selection grid
function populateWordGrid() {
    wordGrid.innerHTML = '';

    // Shuffle and take first 12 words
    const shuffled = [...wordBank].sort(() => Math.random() - 0.5);
    const selectedWords = shuffled.slice(0, 12);

    selectedWords.forEach(word => {
        const wordOption = document.createElement('div');
        wordOption.className = 'word-option';
        wordOption.textContent = word;
        wordOption.addEventListener('click', () => selectWordOption(wordOption, word));
        wordGrid.appendChild(wordOption);
    });
}

// Select word from grid
function selectWordOption(element, word) {
    // Deselect all others
    document.querySelectorAll('.word-option').forEach(opt => {
        opt.classList.remove('selected');
    });

    // Select this one
    element.classList.add('selected');
    customWordInput.value = '';
}

// Handle custom word input
function handleCustomWordInput(e) {
    const value = e.target.value.toUpperCase().replace(/[^A-Z]/g, '');
    e.target.value = value;

    // Deselect grid words if custom word is entered
    if (value.length > 0) {
        document.querySelectorAll('.word-option').forEach(opt => {
            opt.classList.remove('selected');
        });
    }
}

// Confirm word selection
function handleConfirmWord() {
    let selectedWord = '';

    // Check if a word from grid is selected
    const selectedOption = document.querySelector('.word-option.selected');
    if (selectedOption) {
        selectedWord = selectedOption.textContent;
    } else {
        // Check custom word
        selectedWord = customWordInput.value.toUpperCase().trim();
    }

    // Validate word
    if (selectedWord.length !== 5) {
        showError(wordError, 'Please select or enter a 5-letter word!');
        return;
    }

    if (!/^[A-Z]{5}$/.test(selectedWord)) {
        showError(wordError, 'Word must contain only letters A-Z!');
        return;
    }

    // Validate that the word exists in our dictionary
    if (!isValidWord(selectedWord)) {
        showError(wordError, 'Please enter a valid English word!');
        return;
    }

    gameState.secretWord = selectedWord;

    createGameBoard();

    switchScreen(wordSelectionScreen, gameScreen);
}

// Create game board
function createGameBoard() {
    gameBoard.innerHTML = '';

    for (let i = 0; i < gameState.maxAttempts; i++) {
        const row = document.createElement('div');
        row.className = 'guess-row';
        row.dataset.row = i;

        for (let j = 0; j < 5; j++) {
            const box = document.createElement('div');
            box.className = 'letter-box';
            box.dataset.col = j;
            row.appendChild(box);
        }

        gameBoard.appendChild(row);
    }
}

// Create keyboard
function createKeyboard() {
    keyboard.innerHTML = '';

    keys.forEach(row => {
        const keyRow = document.createElement('div');
        keyRow.className = 'keyboard-row';

        row.forEach(key => {
            const keyBtn = document.createElement('button');
            keyBtn.className = 'key';
            keyBtn.textContent = key;
            keyBtn.dataset.key = key;

            if (key === 'ENTER' || key === 'DELETE') {
                keyBtn.classList.add('wide');
            }

            keyBtn.addEventListener('click', () => handleKeyPress(key));
            keyRow.appendChild(keyBtn);
        });

        keyboard.appendChild(keyRow);
    });
}

// Handle key press
function handleKeyPress(key) {
    if (gameState.gameOver) return;

    if (key === 'DELETE') {
        deleteLetter();
    } else if (key === 'ENTER') {
        submitGuess();
    } else if (gameState.currentGuess.length < 5) {
        addLetter(key);
    }
}

// Handle physical keyboard
function handlePhysicalKeyboard(e) {
    if (gameState.gameOver) return;
    if (!gameScreen.classList.contains('active')) return;

    const key = e.key.toUpperCase();

    if (key === 'BACKSPACE') {
        e.preventDefault();
        deleteLetter();
    } else if (key === 'ENTER') {
        e.preventDefault();
        submitGuess();
    } else if (/^[A-Z]$/.test(key) && gameState.currentGuess.length < 5) {
        addLetter(key);
    }
}

// Add letter to current guess
function addLetter(letter) {
    if (gameState.currentGuess.length >= 5) return;

    gameState.currentGuess += letter;
    updateCurrentRow();
}

// Delete letter from current guess
function deleteLetter() {
    if (gameState.currentGuess.length === 0) return;

    gameState.currentGuess = gameState.currentGuess.slice(0, -1);
    updateCurrentRow();
}

// Update current row display
function updateCurrentRow() {
    const currentRow = document.querySelector(`[data-row="${gameState.currentRow}"]`);
    const boxes = currentRow.querySelectorAll('.letter-box');

    boxes.forEach((box, index) => {
        if (index < gameState.currentGuess.length) {
            box.textContent = gameState.currentGuess[index];
            box.classList.add('filled');
        } else {
            box.textContent = '';
            box.classList.remove('filled');
        }
    });
}

// Submit guess
function submitGuess() {
    if (gameState.currentGuess.length !== 5) {
        showError(guessError, 'Word must be 5 letters!');
        return;
    }

    // ADDED: Validate that the guessed word is in the dictionary
    if (!isValidWord(gameState.currentGuess)) {
        showError(guessError, 'Not a valid word!');
        return;
    }

    const guess = gameState.currentGuess;
    gameState.guesses.push(guess);

    // Check the guess
    const result = checkGuess(guess, gameState.secretWord);

    // Animate and color the boxes
    const currentRow = document.querySelector(`[data-row="${gameState.currentRow}"]`);
    const boxes = currentRow.querySelectorAll('.letter-box');

    boxes.forEach((box, index) => {
        setTimeout(() => {
            box.classList.remove('filled');
            box.classList.add(result[index]);
        }, index * 200);
    });

    // Update keyboard colors
    setTimeout(() => {
        updateKeyboard(guess, result);
    }, 1000);

    // Check win/lose condition
    setTimeout(() => {
        if (guess === gameState.secretWord) {
            endGame(true);
        } else if (gameState.currentRow === gameState.maxAttempts - 1) {
            endGame(false);
        } else {
            gameState.currentRow++;
            gameState.currentGuess = '';
        }
    }, 1200);
}

// Check guess against secret word
function checkGuess(guess, secret) {
    const result = Array(5).fill('absent');
    const secretArray = secret.split('');
    const guessArray = guess.split('');

    // First pass: mark correct letters
    guessArray.forEach((letter, index) => {
        if (letter === secretArray[index]) {
            result[index] = 'correct';
            secretArray[index] = null;
        }
    });

    // Second pass: mark present letters
    guessArray.forEach((letter, index) => {
        if (result[index] === 'correct') return;

        const secretIndex = secretArray.indexOf(letter);
        if (secretIndex !== -1) {
            result[index] = 'present';
            secretArray[secretIndex] = null;
        }
    });

    return result;
}

// Update keyboard colors
function updateKeyboard(guess, result) {
    guess.split('').forEach((letter, index) => {
        const key = document.querySelector(`[data-key="${letter}"]`);
        if (!key) return;

        const status = result[index];

        // Don't downgrade a key's status
        if (key.classList.contains('correct')) return;
        if (key.classList.contains('present') && status === 'absent') return;

        key.classList.remove('correct', 'present', 'absent');
        key.classList.add(status);
    });
}

// End game
function endGame(won) {
    gameState.gameOver = true;

    setTimeout(() => {
        if (won) {
            resultTitle.textContent = 'Congratulations!';
            resultMessage.textContent = `You guessed the word in ${gameState.currentRow + 1} ${gameState.currentRow === 0 ? 'try' : 'tries'}!`;
        } else {
            resultTitle.textContent = 'Game Over';
            resultMessage.textContent = 'Better luck next time!';
        }

        finalWord.textContent = gameState.secretWord;
        finalAttempts.textContent = `${gameState.currentRow + (won ? 1 : 0)}/6`;

        switchScreen(gameScreen, gameOverScreen);
    }, 1500);
}

// Reset game
function resetGame() {
    gameState = {
        secretWord: '',
        currentGuess: '',
        guesses: [],
        currentRow: 0,
        gameOver: false,
        maxAttempts: 6
    };

    // Clear custom input
    customWordInput.value = '';

    // Clear word grid selections
    document.querySelectorAll('.word-option').forEach(opt => {
        opt.classList.remove('selected');
    });

    // Reset keyboard
    document.querySelectorAll('.key').forEach(key => {
        key.classList.remove('correct', 'present', 'absent');
    });

    // Repopulate word grid with new random words
    populateWordGrid();

    switchScreen(gameOverScreen, wordSelectionScreen);
}

// Switch between screens
function switchScreen(fromScreen, toScreen) {
    fromScreen.classList.remove('active');
    toScreen.classList.add('active');
}

// Initialize on load
init();