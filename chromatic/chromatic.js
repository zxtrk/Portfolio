const allColors = [
  { name: 'Crimson', value: '#DC143C', key: 'Q' },
  { name: 'Azure', value: '#007FFF', key: 'W' },
  { name: 'Emerald', value: '#50C878', key: 'A' },
  { name: 'Gold', value: '#FFD700', key: 'S' },
  { name: 'Violet', value: '#8B00FF', key: 'Z' },
  { name: 'Coral', value: '#FF7F50', key: 'X' },
  { name: 'Magenta', value: '#FF00FF', key: 'E' },
  { name: 'Cyan', value: '#00FFFF', key: 'D' }
];

let gameColors = [];
let sequence = [];
let playerSequence = [];
let level = 1;
let score = 0;
let highscore = localStorage.getItem('chromaticMemoryHighScore') || 0;
let isPlaying = false;
let isShowingSequence = false;

// Difficulty variables
let displaySpeed = 700; // ms for each color display
let gapSpeed = 400; // ms between colors
let numColors = 4; // number of colors to choose from

const instructionScreen = document.getElementById('instructionScreen');
const gameScreen = document.getElementById('gameScreen');
const instructionStartBtn = document.getElementById('instructionStartBtn');
const colorDisplay = document.getElementById('colorDisplay');
const statusText = document.getElementById('statusText');
const optionsDiv = document.getElementById('options');
const levelIndicator = document.getElementById('levelIndicator');
const gameoverOverlay = document.getElementById('gameoverOverlay');
const finalScore = document.getElementById('finalScore');
const finalLevel = document.getElementById('finalLevel');
const finalBest = document.getElementById('finalBest');
const tryAgainBtn = document.getElementById('tryAgainBtn');

function updateDifficulty() {
  // Speed increases every 3 levels
  if (level >= 3) {
      displaySpeed = Math.max(300, 700 - Math.floor(level / 3) * 50);
      gapSpeed = Math.max(150, 400 - Math.floor(level / 3) * 30);
  }

  // Add 5th color at level 6
  if (level >= 6 && numColors < 5) {
      numColors = 5;
      updateGameColors();
      statusText.textContent = 'New color added!';
  }

  // Add 6th color at level 11
  if (level >= 11 && numColors < 6) {
      numColors = 6;
      updateGameColors();
      statusText.textContent = 'New color added!';
  }

  // Add 7th color at level 16
  if (level >= 16 && numColors < 7) {
      numColors = 7;
      updateGameColors();
      statusText.textContent = 'New color added!';
  }

  // Add 8th color at level 21
  if (level >= 21 && numColors < 8) {
      numColors = 8;
      updateGameColors();
      statusText.textContent = 'All colors unlocked!';
  }
}

function updateGameColors() {
  const shuffled = [...allColors].sort(() => Math.random() - 0.5);
  gameColors = shuffled.slice(0, numColors);
}

function getRandomColor() {
  return gameColors[Math.floor(Math.random() * gameColors.length)];
}

async function showSequence() {
  isShowingSequence = true;
  optionsDiv.style.opacity = '0.3';
  optionsDiv.style.pointerEvents = 'none';
  statusText.textContent = `Watch carefully... (Speed: ${displaySpeed}ms)`;

  await new Promise(resolve => setTimeout(resolve, 800));

  for (let i = 0; i < sequence.length; i++) {
      colorDisplay.style.background = sequence[i].value;
      colorDisplay.classList.add('pulse');

      await new Promise(resolve => setTimeout(resolve, displaySpeed));
      colorDisplay.classList.remove('pulse');
      colorDisplay.style.background = '#1a1a1a';
      await new Promise(resolve => setTimeout(resolve, gapSpeed));
  }

  await new Promise(resolve => setTimeout(resolve, 500));
  isShowingSequence = false;
  showOptions();
}

function showOptions() {
  statusText.textContent = 'Your turn';
  optionsDiv.innerHTML = '';
  optionsDiv.style.opacity = '1';
  optionsDiv.style.pointerEvents = 'auto';

  // Adjust grid layout based on number of colors
  if (numColors <= 4) {
      optionsDiv.style.gridTemplateColumns = 'repeat(2, 1fr)';
  } else if (numColors <= 6) {
      optionsDiv.style.gridTemplateColumns = 'repeat(3, 1fr)';
  } else {
      optionsDiv.style.gridTemplateColumns = 'repeat(4, 1fr)';
  }

  gameColors.forEach(color => {
      const btn = document.createElement('button');
      btn.className = 'color-option';
      btn.style.setProperty('--color', color.value);
      btn.innerHTML = `
          <span>${color.name}</span>
          <span class="keybind">[${color.key}]</span>
      `;
      btn.onclick = () => selectColor(color);
      btn.dataset.key = color.key;

      btn.addEventListener('mouseenter', function() {
          this.style.background = color.value;
      });
      btn.addEventListener('mouseleave', function() {
          this.style.background = '#1a1a1a';
      });

      optionsDiv.appendChild(btn);
  });
}

function selectColor(color) {
  if (isShowingSequence) return;

  playerSequence.push(color);
  const index = playerSequence.length - 1;

  colorDisplay.style.background = color.value;
  colorDisplay.classList.add('pulse');
  setTimeout(() => {
      colorDisplay.classList.remove('pulse');
      colorDisplay.style.background = '#1a1a1a';
  }, 400);

  if (color.name !== sequence[index].name) {
      gameOver();
      return;
  }

  if (playerSequence.length === sequence.length) {
      levelComplete();
  }
}

function levelComplete() {
  // Bonus points for higher levels and faster speeds
  const speedBonus = Math.floor((700 - displaySpeed) / 50);
  score += (level * 10) + speedBonus;
  statusText.textContent = 'Perfect!';

  setTimeout(() => {
      level++;
      levelIndicator.textContent = `Level ${level}`;
      updateDifficulty();

      // Check if player won at level 40
      if (level > 40) {
          gameWon();
          return;
      }

      // Reset sequence every 5 levels to increase challenge
      if (level % 5 === 0) {
          sequence = [];
          statusText.textContent = 'Sequence Reset!';
          setTimeout(() => {
              nextRound();
          }, 1500);
      } else {
          nextRound();
      }
  }, 1200);
}

function gameWon() {
  isPlaying = false;
  optionsDiv.style.opacity = '0.3';
  optionsDiv.style.pointerEvents = 'none';
  statusText.textContent = 'You Win!';

  if (score > highscore) {
      highscore = score;
      localStorage.setItem('chromaticMemoryHighScore', highscore);
  }

  finalScore.textContent = score;
  finalLevel.textContent = '40 (Complete!)';
  finalBest.textContent = highscore;

  setTimeout(() => {
      gameoverOverlay.classList.add('show');
      document.querySelector('.gameover-content h2').textContent = 'You Win!';
  }, 500);
}

function gameOver() {
  isPlaying = false;
  optionsDiv.style.opacity = '0.3';
  optionsDiv.style.pointerEvents = 'none';
  statusText.textContent = '';

  // Add TV break animation
  colorDisplay.classList.add('breaking');

  // Wait for break animation to complete before showing game over
  setTimeout(() => {
      if (score > highscore) {
          highscore = score;
          localStorage.setItem('chromaticMemoryHighScore', highscore);
      }

      finalScore.textContent = score;
      finalLevel.textContent = level;
      finalBest.textContent = highscore;

      gameoverOverlay.classList.add('show');
      document.querySelector('.gameover-content h2').textContent = 'Game Over';

      // Remove breaking class for next game
      colorDisplay.classList.remove('breaking');
      colorDisplay.style.background = '#1a1a1a';
  }, 1000);
}

function nextRound() {
  playerSequence = [];
  sequence.push(getRandomColor());
  showSequence();
}

function startGame() {
  isPlaying = true;
  sequence = [];
  playerSequence = [];
  level = 1;
  score = 0;
  displaySpeed = 700;
  gapSpeed = 400;
  numColors = 4;

  // Select initial 4 random colors
  const shuffled = [...allColors].sort(() => Math.random() - 0.5);
  gameColors = shuffled.slice(0, 4);

  levelIndicator.textContent = 'Level 1';
  colorDisplay.style.background = '#1a1a1a';
  colorDisplay.classList.remove('breaking');
  gameoverOverlay.classList.remove('show');
  nextRound();
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
  if (!isPlaying || isShowingSequence) return;

  const key = e.key.toUpperCase();
  const color = gameColors.find(c => c.key === key);

  if (color) {
      const btn = Array.from(optionsDiv.children).find(b => b.dataset.key === key);
      if (btn) {
          btn.style.background = color.value;
          setTimeout(() => {
              btn.style.background = '#1a1a1a';
          }, 200);
      }
      selectColor(color);
  }
});

instructionStartBtn.addEventListener('click', () => {
  instructionScreen.classList.add('hidden');
  setTimeout(() => {
      gameScreen.classList.add('active');
      startGame();
  }, 500);
});

tryAgainBtn.addEventListener('click', () => {
  startGame();
});