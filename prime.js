/* Watt's the PrlmE? — lightweight, dependency-free prime puzzle game. */
(() => {
  "use strict";

  const STORAGE_KEY = "watts-the-prlme-data-v1";
  const ROUND_DURATIONS = {
    easy: 60,
    medium: 90,
    hard: 150
  };
  const MAX_LIFE_UNITS = 10;
  const HINTS_PER_GAME = 3;
  const PRIME_FACTS = [
    "2 is the only even prime. Every other even number can be divided by 2!",
    "1 is not prime: a prime number must have exactly two positive divisors.",
    "Every whole number greater than 1 can be built from primes, and that prime factorization is unique.",
    "There are infinitely many primes. No matter how far you count, there is always another one!",
    "Any number greater than 5 that ends in 5 is divisible by 5, so it cannot be prime.",
    "Every prime greater than 3 is one more or one less than a multiple of 6.",
    "But numbers next to multiples of 6 are not always prime: 25 is a sneaky example!",
    "In base 10, every prime greater than 5 ends in 1, 3, 7, or 9.",
    "11 is both a prime and a palindrome: it reads the same backward and forward.",
    "101 is another palindromic prime. So is 131!",
    "Some primes look like 2ⁿ − 1. These are called Mersenne primes, after mathematician Marin Mersenne.",
    "Prime gaps can be surprisingly long: you can find stretches of consecutive numbers with no primes at all.",
    "As numbers get larger, primes become less common. Near a large number n, their frequency is about 1 in ln(n).",
    "Goldbach's conjecture says every even number greater than 2 is a sum of two primes—but it has not been proven yet!",
    "The Sieve of Eratosthenes finds primes by crossing out multiples, starting with the smallest prime."
  ];
  const DIFFICULTIES = {
    easy: { min: 50, max: 250, label: "EASY" },
    medium: { min: 251, max: 1000, label: "MEDIUM" },
    hard: { min: 1001, max: 9999, label: "HARD" }
  };
  const LEVEL_NAMES = ["SPARK", "CIRCUIT", "VOLTAGE", "GENIUS", "SUPER NOVA"];
  const ACHIEVEMENTS = [
    { id: "first-prime", name: "Prime Time", detail: "Find your first prime.", icon: "✦" },
    { id: "combo-five", name: "On a Roll", detail: "Reach a 5x combo.", icon: "⚡" },
    { id: "hidden-prime", name: "Mystery Solver", detail: "Guess a hidden prime.", icon: "?" },
    { id: "hundred-primes", name: "Prime Collector", detail: "Find 100 primes total.", icon: "◈" },
    { id: "level-five", name: "Power Surge", detail: "Reach level 5 in a game.", icon: "★" }
  ];

  const elements = {
    score: document.querySelector("#score-value"),
    combo: document.querySelector("#combo-label"),
    livesCount: document.querySelector("#lives-count"),
    lives: document.querySelector("#lives-display"),
    timerCard: document.querySelector("#timer-card"),
    timer: document.querySelector("#timer-value"),
    timerBar: document.querySelector("#timer-bar"),
    level: document.querySelector("#level-value"),
    levelName: document.querySelector("#level-name"),
    levelNote: document.querySelector("#level-note"),
    found: document.querySelector("#found-count"),
    hints: document.querySelector("#hint-count"),
    hintButtonCount: document.querySelector("#hint-button-count"),
    hintButton: document.querySelector("#hint-button"),
    restartButton: document.querySelector("#restart-button"),
    board: document.querySelector("#game-board"),
    boardHeading: document.querySelector("#board-heading"),
    modeChip: document.querySelector("#mode-chip"),
    message: document.querySelector("#game-message"),
    progress: document.querySelector("#progress-value"),
    progressBar: document.querySelector("#progress-bar"),
    progressFill: document.querySelector("#progress-fill"),
    gameLayout: document.querySelector("#game-layout"),
    startCard: document.querySelector("#start-card"),
    startButton: document.querySelector("#start-button"),
    modeSelect: document.querySelector("#mode-select"),
    difficultySelect: document.querySelector("#difficulty-select"),
    guessDialog: document.querySelector("#guess-dialog"),
    guessForm: document.querySelector("#guess-form"),
    guessInput: document.querySelector("#guess-input"),
    guessError: document.querySelector("#guess-error"),
    guessRange: document.querySelector("#guess-range"),
    resultDialog: document.querySelector("#result-dialog"),
    resultHeading: document.querySelector("#result-heading"),
    resultEyebrow: document.querySelector("#result-eyebrow"),
    resultCopy: document.querySelector("#result-copy"),
    resultStats: document.querySelector("#result-stats"),
    resultIcon: document.querySelector("#result-icon"),
    infoDialog: document.querySelector("#info-dialog"),
    infoHeading: document.querySelector("#info-heading"),
    infoEyebrow: document.querySelector("#info-eyebrow"),
    infoContent: document.querySelector("#info-content"),
    toastRegion: document.querySelector("#toast-region"),
    confetti: document.querySelector("#confetti-layer")
  };

  const state = {
    active: false,
    mode: "classic",
    difficulty: "easy",
    score: 0,
    lifeUnits: MAX_LIFE_UNITS,
    level: 1,
    combo: 0,
    highestComboThisGame: 0,
    primesFoundThisGame: 0,
    grid: [],
    hiddenPrime: 0,
    patternClue: "",
    visiblePrimeCount: 0,
    levelPrimesFound: 0,
    levelCompleted: false,
    hiddenSolved: false,
    answerReview: false,
    hintsLeft: HINTS_PER_GAME,
    timerSeconds: ROUND_DURATIONS.easy,
    elapsedSeconds: 0,
    timerId: null,
    lastSettings: { mode: "classic", difficulty: "easy" },
    storage: loadStorage()
  };
  const robot = document.querySelector(".robot");
  const robotFactBubble = document.querySelector("#robot-fact-bubble");
  let robotReturnTimer = null;
  let robotCleanupTimer = null;
  let robotFactTimer = null;
  let lastPrimeFactIndex = -1;
  let renderedGrid = null;

  function defaultStorage() {
    return {
      gamesPlayed: 0,
      primesFound: 0,
      selections: 0,
      correctSelections: 0,
      highestCombo: 0,
      achievements: [],
      leaderboard: []
    };
  }

  function loadStorage() {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (!saved) return defaultStorage();
      const parsed = JSON.parse(saved);
      const defaults = defaultStorage();
      return {
        ...defaults,
        ...parsed,
        achievements: Array.isArray(parsed.achievements) ? parsed.achievements : [],
        leaderboard: Array.isArray(parsed.leaderboard) ? parsed.leaderboard : []
      };
    } catch (error) {
      console.warn("Could not read saved game data.", error);
      return defaultStorage();
    }
  }

  function saveStorage() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.storage));
    } catch (error) {
      console.warn("Could not save game data.", error);
      showToast("Your browser couldn't save this update.");
    }
  }

  // Trial division only needs to check factors up to the square root.
  function isPrime(number) {
    if (!Number.isInteger(number) || number < 2) return false;
    if (number === 2) return true;
    if (number % 2 === 0) return false;
    for (let divisor = 3; divisor * divisor <= number; divisor += 2) {
      if (number % divisor === 0) return false;
    }
    return true;
  }

  function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function randomPrime(min, max, excluded = new Set()) {
    for (let attempt = 0; attempt < 1200; attempt += 1) {
      const candidate = randomInteger(min, max);
      if (isPrime(candidate) && !excluded.has(candidate)) return candidate;
    }
    for (let candidate = min; candidate <= max; candidate += 1) {
      if (isPrime(candidate) && !excluded.has(candidate)) return candidate;
    }
    throw new Error(`No available prime in range ${min}-${max}.`);
  }

  function makePattern(target, difficulty) {
    const evenStep = maximum => randomInteger(1, maximum / 2) * 2;
    const pattern = {
      horizontalStep: evenStep(difficulty === "easy" ? 20 : 30),
      verticalStep: evenStep(difficulty === "easy" ? 20 : 30),
      crossStep: 0,
      curve: 0
    };

    if (difficulty === "medium") {
      pattern.crossStep = evenStep(12) * (Math.random() < 0.5 ? -1 : 1);
    } else if (difficulty === "hard") {
      pattern.curve = evenStep(8);
    }

    const values = [];
    for (let row = 0; row < 5; row += 1) {
      const y = row - 2;
      for (let column = 0; column < 5; column += 1) {
        const x = column - 2;
        values.push(
          target +
          pattern.horizontalStep * x +
          pattern.verticalStep * y +
          pattern.crossStep * x * y +
          pattern.curve * (x * x + y * y)
        );
      }
    }

    const clues = {
      easy: "Pattern clue: rows and columns use constant steps.",
      medium: "Pattern clue: row and column steps shift steadily across the grid.",
      hard: "Pattern clue: look for a constant second difference in each row and column."
    };
    return { values, clue: clues[difficulty] };
  }

  function inferPatternCenter(values, difficulty) {
    const middleRow = values.slice(10, 15);
    const nearAverage = (middleRow[1] + middleRow[3]) / 2;
    if (difficulty !== "hard") return nearAverage;
    const farAverage = (middleRow[0] + middleRow[4]) / 2;
    return (4 * nearAverage - farAverage) / 3;
  }

  function makeGrid() {
    const { min, max } = DIFFICULTIES[state.difficulty];
    let puzzle = null;
    for (let attempt = 0; attempt < 500; attempt += 1) {
      const target = randomPrime(min, max);
      const candidate = makePattern(target, state.difficulty);
      const { values } = candidate;
      const inRange = values.every(value => value >= min && value <= max);
      const unique = new Set(values).size === 25;
      const visiblePrimeCount = values.reduce(
        (count, value, index) => count + (index !== 12 && isPrime(value) ? 1 : 0),
        0
      );
      const inferredCenter = inferPatternCenter(values, state.difficulty);
      if (
        inRange &&
        unique &&
        isPrime(target) &&
        values[12] === target &&
        visiblePrimeCount >= 5 &&
        inferredCenter === target &&
        isPrime(inferredCenter)
      ) {
        puzzle = { ...candidate, target, visiblePrimeCount };
        break;
      }
    }

    if (!puzzle) {
      throw new Error(`Could not generate a valid ${state.difficulty} pattern puzzle.`);
    }

    state.hiddenPrime = puzzle.target;
    state.patternClue = puzzle.clue;
    state.visiblePrimeCount = puzzle.visiblePrimeCount;
    state.levelPrimesFound = 0;
    state.levelCompleted = false;
    state.hiddenSolved = false;
    state.answerReview = false;
    state.grid = puzzle.values.map((value, index) => index === 12
      ? { mystery: true, state: "open" }
      : { value, prime: isPrime(value), state: "open" });
  }

  function formatTime(seconds) {
    const safeSeconds = Math.max(0, Math.floor(seconds));
    const minutes = Math.floor(safeSeconds / 60);
    const remainder = safeSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
  }

  function getRoundDuration(difficulty) {
    return ROUND_DURATIONS[difficulty];
  }

  function levelLabel() {
    return LEVEL_NAMES[Math.min(state.level - 1, LEVEL_NAMES.length - 1)];
  }

  function render() {
    elements.score.textContent = String(state.score);
    elements.combo.textContent = state.combo > 1 ? `${state.combo}× combo — keep it going!` : state.combo === 1 ? "Nice one! Keep the streak." : "Ready to roll!";
    renderLives();
    elements.timerCard.hidden = state.mode === "endless";
    const remaining = state.mode === "classic" ? state.timerSeconds : state.elapsedSeconds;
    elements.timer.textContent = formatTime(remaining);
    const roundDuration = getRoundDuration(state.difficulty);
    elements.timerBar.style.width = state.mode === "classic" ? `${Math.max(0, state.timerSeconds / roundDuration * 100)}%` : `${Math.min(100, state.elapsedSeconds % 60 / 60 * 100)}%`;
    elements.timerBar.classList.toggle("low-time", state.mode === "classic" && state.timerSeconds <= Math.min(15, roundDuration * .25));
    elements.level.textContent = String(state.level);
    elements.levelName.textContent = levelLabel();
    elements.levelNote.textContent = state.active ? (state.mode === "classic" ? "Find every prime!" : "Keep the streak alive!") : "Find every prime!";
    elements.found.textContent = String(state.primesFoundThisGame);
    elements.hints.textContent = String(state.hintsLeft);
    elements.hintButtonCount.textContent = `(${state.hintsLeft})`;
    elements.hintButton.disabled = !state.active || state.hintsLeft <= 0;
    elements.restartButton.disabled = state.grid.length === 0;
    elements.modeChip.textContent = `${state.mode.toUpperCase()} · ${state.difficulty.toUpperCase()}`;
    elements.boardHeading.textContent = state.answerReview
      ? "Answer review"
      : state.active
        ? (state.mode === "endless" ? "Find primes. Keep going!" : "Tap every prime number")
        : "Ready when you are";
    renderProgress();
  }

  function renderLives() {
    const fullLives = Math.floor(state.lifeUnits / 2);
    const halfLife = state.lifeUnits % 2 === 1;
    elements.livesCount.textContent = `${(state.lifeUnits / 2).toFixed(1).replace(".0", "")} / 5`;
    elements.lives.setAttribute("aria-label", `${(state.lifeUnits / 2).toFixed(1).replace(".0", "")} of 5 lives remaining`);
    elements.lives.innerHTML = "";
    for (let index = 0; index < 5; index += 1) {
      const heart = document.createElement("span");
      heart.className = "heart";
      heart.textContent = "♥";
      if (index >= fullLives + (halfLife ? 1 : 0)) heart.classList.add("empty");
      else if (index === fullLives && halfLife) heart.classList.add("half");
      heart.setAttribute("aria-hidden", "true");
      elements.lives.append(heart);
    }
  }

  function renderProgress() {
    const denominator = state.visiblePrimeCount;
    const found = state.levelPrimesFound;
    const percentage = denominator ? Math.round(found / denominator * 100) : 0;
    elements.progress.textContent = `${found} / ${denominator} primes`;
    elements.progressFill.style.width = `${percentage}%`;
    elements.progressBar.setAttribute("aria-valuenow", String(percentage));
    elements.progressBar.setAttribute("aria-valuetext", `${found} of ${denominator} primes found`);
  }

  function renderBoard() {
    if (renderedGrid === state.grid) {
      state.grid.forEach((cell, index) => updateTile(elements.board.children[index], cell, index));
      return;
    }

    renderedGrid = state.grid;
    elements.board.replaceChildren();
    if (state.grid.length === 0) {
      const placeholder = document.createElement("div");
      placeholder.className = "board-placeholder";
      placeholder.innerHTML = "<span aria-hidden=\"true\">✦</span><b>Your grid is charging...</b><small>Choose your settings and hit start!</small>";
      elements.board.append(placeholder);
      return;
    }

    const grid = state.grid;
    grid.forEach((cell, index) => {
      const tile = document.createElement("button");
      tile.type = "button";
      tile.className = "tile";
      tile.dataset.index = String(index);
      tile.style.animationDelay = `${index * 12}ms`;
      tile.addEventListener("click", () => {
        if (state.grid === grid) selectTile(index);
      });
      updateTile(tile, cell, index);
      elements.board.append(tile);
    });
  }

  function updateTile(tile, cell, index) {
    if (!tile) return;
    tile.classList.toggle("mystery-tile", Boolean(cell.mystery));
    tile.classList.toggle("solved", Boolean(cell.mystery && state.hiddenSolved));
    tile.classList.toggle(
      "answer-reveal",
      Boolean(cell.mystery && state.answerReview)
    );
    tile.classList.toggle("prime-found", Boolean(!cell.mystery && cell.state === "found"));
    tile.classList.toggle("wrong", Boolean(!cell.mystery && cell.state === "wrong"));
    const missedPrime = state.answerReview && !cell.mystery && cell.prime && cell.state === "open";
    tile.classList.toggle("missed-prime", Boolean(missedPrime));
    const text = cell.mystery
      ? (state.answerReview ? String(state.hiddenPrime) : state.hiddenSolved ? "✓" : "?")
      : String(cell.value);
    if (tile.textContent !== text) tile.textContent = text;
    const label = cell.mystery
      ? (state.answerReview
        ? `Optional hidden pattern answer: ${state.hiddenPrime}`
        : state.hiddenSolved ? "Hidden prime solved" : "Guess the hidden prime")
      : `${cell.value}${cell.state === "found" ? ", prime found" : cell.state === "wrong" ? ", incorrect selection" : missedPrime ? ", missed prime answer" : ""}`;
    if (tile.getAttribute("aria-label") !== label) tile.setAttribute("aria-label", label);
    const disabled = !state.active || (cell.mystery ? state.hiddenSolved : cell.state !== "open");
    if (tile.disabled !== disabled) tile.disabled = disabled;
  }

  function startGame(mode = elements.modeSelect.value, difficulty = elements.difficultySelect.value) {
    stopTimer();
    state.active = true;
    state.mode = mode;
    state.difficulty = difficulty;
    state.lastSettings = { mode, difficulty };
    state.score = 0;
    state.lifeUnits = MAX_LIFE_UNITS;
    state.level = 1;
    state.combo = 0;
    state.highestComboThisGame = 0;
    state.primesFoundThisGame = 0;
    state.hintsLeft = HINTS_PER_GAME;
    state.timerSeconds = getRoundDuration(difficulty);
    state.elapsedSeconds = 0;
    state.storage.gamesPlayed += 1;
    saveStorage();
    elements.startCard.hidden = true;
    elements.gameLayout.hidden = false;
    if (elements.resultDialog.open) elements.resultDialog.close();
    if (elements.guessDialog.open) elements.guessDialog.close();
    makeGrid();
    const objective = mode === "classic"
      ? "Find every prime before time runs out."
      : "Find every prime to keep your streak alive.";
    elements.message.textContent = `${state.patternClue} ${objective} Use the pattern to infer the gold tile.`;
    render();
    renderBoard();
    startTimer();
  }

  function stopTimer() {
    if (state.timerId !== null) {
      window.clearInterval(state.timerId);
      state.timerId = null;
    }
  }

  function startTimer() {
    stopTimer();
    state.timerId = window.setInterval(() => {
      if (!state.active) return;
      if (state.mode === "classic") {
        state.timerSeconds -= 1;
        if (state.timerSeconds <= 0) {
          state.timerSeconds = 0;
          render();
          endGame("time");
          return;
        }
      } else {
        state.elapsedSeconds += 1;
      }
      render();
    }, 1000);
  }

  function selectTile(index) {
    if (!state.active) return;
    const cell = state.grid[index];
    if (cell.mystery) {
      openGuessDialog();
      return;
    }
    if (cell.state !== "open") return;
    state.storage.selections += 1;
    if (cell.prime) {
      cell.state = "found";
      state.combo += 1;
      state.highestComboThisGame = Math.max(state.highestComboThisGame, state.combo);
      state.storage.highestCombo = Math.max(state.storage.highestCombo, state.combo);
      state.score += 2 * Math.min(state.combo, 5);
      state.levelPrimesFound += 1;
      state.primesFoundThisGame += 1;
      state.storage.primesFound += 1;
      state.storage.correctSelections += 1;
      elements.message.textContent = `Yes! ${cell.value} is prime. ${state.combo > 1 ? `${state.combo}× combo!` : "Keep the streak going!"}`;
      if (state.primesFoundThisGame === 1) unlockAchievement("first-prime");
      if (state.combo >= 5) unlockAchievement("combo-five");
      if (state.storage.primesFound >= 100) unlockAchievement("hundred-primes");
      saveStorage();
    } else {
      cell.state = "wrong";
      state.combo = 0;
      state.lifeUnits = Math.max(0, state.lifeUnits - 1);
      saveStorage();
      elements.message.textContent = `${cell.value} isn't prime. You lost half a heart — try another!`;
    }
    render();
    renderBoard();
    if (state.lifeUnits <= 0) {
      endGame("lives");
      return;
    }
    checkLevelComplete();
  }

  function openGuessDialog() {
    if (!state.active || state.hiddenSolved) return;
    const { min, max } = DIFFICULTIES[state.difficulty];
    elements.guessRange.textContent = `The hidden number is between ${min} and ${max}.`;
    elements.guessError.textContent = "";
    elements.guessInput.value = "";
    elements.guessDialog.showModal();
    window.setTimeout(() => elements.guessInput.focus(), 0);
  }

  function submitGuess(event) {
    event.preventDefault();
    if (!state.active || state.hiddenSolved) return;
    const value = Number(elements.guessInput.value);
    const { min, max } = DIFFICULTIES[state.difficulty];
    if (!Number.isInteger(value) || value < min || value > max) {
      elements.guessError.textContent = `Enter a whole number from ${min} to ${max}.`;
      elements.guessInput.focus();
      return;
    }
    state.storage.selections += 1;
    if (!isPrime(value)) {
      elements.guessError.textContent = "That number isn't prime. Try another!";
      state.lifeUnits = Math.max(0, state.lifeUnits - 4);
      state.combo = 0;
      saveStorage();
      elements.message.textContent = "Not quite! The mystery prime takes two lives.";
      render();
      if (state.lifeUnits <= 0) {
        elements.guessDialog.close();
        endGame("lives");
      }
      return;
    }
    if (value !== state.hiddenPrime) {
      elements.guessError.textContent = "That's a prime, but not the hidden one. Try again!";
      state.lifeUnits = Math.max(0, state.lifeUnits - 4);
      state.combo = 0;
      saveStorage();
      elements.message.textContent = "Close, but not the mystery number. Two lives lost!";
      render();
      if (state.lifeUnits <= 0) {
        elements.guessDialog.close();
        endGame("lives");
      }
      return;
    }

    state.hiddenSolved = true;
    state.score += 10;
    state.primesFoundThisGame += 1;
    state.storage.primesFound += 1;
    state.storage.correctSelections += 1;
    state.combo += 1;
    state.highestComboThisGame = Math.max(state.highestComboThisGame, state.combo);
    state.storage.highestCombo = Math.max(state.storage.highestCombo, state.combo);
    saveStorage();
    unlockAchievement("hidden-prime");
    if (state.storage.primesFound >= 100) unlockAchievement("hundred-primes");
    elements.guessDialog.close();
    elements.message.textContent = `Brilliant! ${value} was the hidden prime — +10 bonus points!`;
    render();
    renderBoard();
    celebrate();
    checkLevelComplete();
  }

  function checkLevelComplete() {
    if (
      !state.active ||
      state.levelCompleted ||
      state.levelPrimesFound !== state.visiblePrimeCount
    ) return;

    state.levelCompleted = true;
    state.score += 5;
    state.level += 1;
    if (state.level >= 5) unlockAchievement("level-five");
    if (state.mode === "classic") {
      state.timerSeconds = Math.min(getRoundDuration(state.difficulty), state.timerSeconds + 8);
    }
    makeGrid();
    elements.message.textContent = `Grid cleared! +5 level bonus. Level ${state.level} is ready. ${state.patternClue}`;
    showToast(`Grid cleared! +5 bonus points`);
    render();
    renderBoard();
  }

  function useHint() {
    if (!state.active || state.hintsLeft <= 0) return;
    const candidates = state.grid
      .map((cell, index) => ({ cell, index }))
      .filter(({ cell }) => !cell.mystery && cell.prime && cell.state === "open");
    if (candidates.length === 0) {
      elements.message.textContent = "No visible primes left to hint at — solve the gold tile!";
      return;
    }
    state.hintsLeft -= 1;
    render();
    const { index } = candidates[randomInteger(0, candidates.length - 1)];
    const tile = elements.board.querySelector(`[data-index="${index}"]`);
    if (tile) {
      tile.classList.add("hint-highlight");
      tile.focus();
      window.setTimeout(() => tile.classList.remove("hint-highlight"), 2400);
    }
    elements.message.textContent = "A prime is glowing blue! Select it before the hint fades.";
  }

  function endGame(reason) {
    if (!state.active) return;
    state.active = false;
    stopTimer();
    state.answerReview = reason === "time" || reason === "lives";
    if (state.answerReview) {
      elements.message.textContent =
        `Answer review: yellow tiles are missed required primes; the gold center shows the optional pattern answer${reason === "time" ? " after time ran out." : " after your lives ran out."}`;
    }
    render();
    renderBoard();
    const won = reason === "complete";
    const resultEntry = {
      score: state.score,
      level: state.level,
      mode: state.mode,
      difficulty: state.difficulty,
      date: new Date().toISOString()
    };
    state.storage.leaderboard.push(resultEntry);
    state.storage.leaderboard.sort((a, b) => b.score - a.score);
    state.storage.leaderboard = state.storage.leaderboard.slice(0, 10);
    saveStorage();
    elements.resultEyebrow.textContent = won ? "ALL CHARGED UP" : reason === "time" ? "TIME'S UP" : "OUT OF LIVES";
    elements.resultHeading.textContent = won ? "You're a prime pro!" : reason === "time" ? "The clock got you!" : "Battery depleted!";
    const missedPrimeCount = state.answerReview
      ? state.grid.filter(cell => !cell.mystery && cell.prime && cell.state === "open").length
      : 0;
    elements.resultCopy.textContent = won
      ? "Every prime found and every mystery solved. What a power move!"
      : state.answerReview
        ? `${reason === "time" ? "Time ran out" : "You ran out of lives"}. Review the grid: ${missedPrimeCount} missed required ${missedPrimeCount === 1 ? "prime is" : "primes are"} highlighted yellow. The gold center reveals the optional pattern answer: ${state.hiddenPrime}.${state.hiddenSolved ? " Your score includes the +10 bonus already earned." : " This reveal does not award bonus points."}`
        : "That was a close one! Recharge and give the grid another go.";
    elements.resultIcon.textContent = won ? "⚡" : reason === "time" ? "◷" : "♡";
    elements.resultStats.innerHTML = [
      resultStat("SCORE", state.score),
      resultStat("PRIMES", state.primesFoundThisGame),
      resultStat("BEST COMBO", `${state.highestComboThisGame}×`)
    ].join("");
    if (elements.guessDialog.open) elements.guessDialog.close();
    elements.resultDialog.classList.toggle("answer-review-dialog", state.answerReview);
    if (state.answerReview) elements.resultDialog.show();
    else elements.resultDialog.showModal();
  }

  function resultStat(label, value) {
    return `<div class="result-stat"><b>${escapeHTML(String(value))}</b><span>${label}</span></div>`;
  }

  function escapeHTML(value) {
    const span = document.createElement("span");
    span.textContent = value;
    return span.innerHTML;
  }

  function unlockAchievement(id) {
    if (state.storage.achievements.includes(id)) return;
    const achievement = ACHIEVEMENTS.find((item) => item.id === id);
    if (!achievement) return;
    state.storage.achievements.push(id);
    saveStorage();
    showToast(`Badge unlocked: ${achievement.name} ${achievement.icon}`);
  }

  function showToast(message, duration = 3000) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    elements.toastRegion.append(toast);
    window.setTimeout(() => toast.remove(), duration);
  }

  function sharePrimeFact() {
    holdRobotPosition();
    let factIndex = randomInteger(0, PRIME_FACTS.length - 1);
    if (factIndex === lastPrimeFactIndex) {
      factIndex = (factIndex + 1) % PRIME_FACTS.length;
    }
    lastPrimeFactIndex = factIndex;
    robotFactBubble.textContent = PRIME_FACTS[factIndex];
    robotFactBubble.classList.remove("on-left", "above");
    robotFactBubble.hidden = false;
    const robotBounds = robot.getBoundingClientRect();
    const gap = 12;
    const maxWidth = Math.min(280, window.innerWidth - 16);
    const leftSpace = robotBounds.left - gap - 8;
    const rightSpace = window.innerWidth - robotBounds.right - gap - 8;
    const putOnLeft = leftSpace >= rightSpace;
    const sideSpace = putOnLeft ? leftSpace : rightSpace;
    const bubbleOnSide = sideSpace >= 180;
    robotFactBubble.style.width = `${bubbleOnSide ? Math.min(maxWidth, sideSpace) : maxWidth}px`;
    robotFactBubble.classList.toggle("on-left", bubbleOnSide && putOnLeft);
    robotFactBubble.classList.toggle("above", !bubbleOnSide);
    const bubbleBounds = robotFactBubble.getBoundingClientRect();
    const left = bubbleOnSide
      ? putOnLeft
        ? robotBounds.left - gap - bubbleBounds.width
        : robotBounds.right + gap
      : robotBounds.left + (robotBounds.width - bubbleBounds.width) / 2;
    const top = bubbleOnSide
      ? robotBounds.top - bubbleBounds.height + 28
      : robotBounds.top - bubbleBounds.height - gap;
    const safeLeft = Math.max(8, Math.min(window.innerWidth - bubbleBounds.width - 8, left));
    const safeTop = Math.max(0, Math.min(window.innerHeight - bubbleBounds.height - 8, top));
    robotFactBubble.style.left = `${safeLeft}px`;
    robotFactBubble.style.top = `${safeTop}px`;
    if (bubbleOnSide) {
      robotFactBubble.style.setProperty(
        "--bubble-tail-y",
        `${Math.max(14, Math.min(bubbleBounds.height - 14, robotBounds.top + robotBounds.height / 2 - safeTop))}px`
      );
    } else {
      robotFactBubble.style.setProperty(
        "--bubble-tail-x",
        `${Math.max(14, Math.min(bubbleBounds.width - 14, robotBounds.left + robotBounds.width / 2 - safeLeft))}px`
      );
    }
    window.clearTimeout(robotFactTimer);
    robotFactTimer = window.setTimeout(() => {
      robotFactBubble.hidden = true;
      robotFactTimer = null;
      scheduleRobotReturn(3000);
    }, 5000);
  }

  function getRobotTranslate() {
    const translate = getComputedStyle(robot).translate;
    if (translate === "none") return [0, 0];
    const values = translate.split(/\s+/);
    return [0, 1].map(index => Number.parseFloat(values[index]) || 0);
  }

  function holdRobotPosition() {
    window.clearTimeout(robotReturnTimer);
    window.clearTimeout(robotCleanupTimer);
    if (!robot.classList.contains("is-dodging")) return;

    const [x, y] = getRobotTranslate();
    robot.style.setProperty("--dodge-x", `${x}px`);
    robot.style.setProperty("--dodge-y", `${y}px`);
  }

  function scheduleRobotReturn(delay = 5000) {
    window.clearTimeout(robotReturnTimer);
    window.clearTimeout(robotCleanupTimer);
    if (!robot.classList.contains("is-dodging")) return;
    robotReturnTimer = window.setTimeout(() => {
      robot.style.setProperty("--dodge-x", "0px");
      robot.style.setProperty("--dodge-y", "0px");
      robotCleanupTimer = window.setTimeout(() => {
        robot.classList.remove("is-dodging");
        robot.style.removeProperty("--dodge-x");
        robot.style.removeProperty("--dodge-y");
        robotCleanupTimer = null;
      }, 700);
    }, delay);
  }

  function dodgeRobot() {
    window.clearTimeout(robotReturnTimer);
    window.clearTimeout(robotCleanupTimer);
    const [currentX, currentY] = getRobotTranslate();
    robot.style.setProperty("--dodge-x", `${currentX}px`);
    robot.style.setProperty("--dodge-y", `${currentY}px`);
    robot.classList.add("is-dodging");
    void robot.offsetWidth;
    const bounds = robot.getBoundingClientRect();
    const margin = 20;
    const maxLeft = Math.max(margin, window.innerWidth - bounds.width - margin);
    const maxTop = Math.max(margin, window.innerHeight - bounds.height - margin);
    const minDistance = Math.min(window.innerWidth, window.innerHeight) * .25;
    let destinationLeft = bounds.left;
    let destinationTop = bounds.top;
    for (let attempt = 0; attempt < 20; attempt += 1) {
      destinationLeft = randomInteger(margin, Math.floor(maxLeft));
      destinationTop = randomInteger(margin, Math.floor(maxTop));
      if (Math.hypot(destinationLeft - bounds.left, destinationTop - bounds.top) >= minDistance) break;
    }
    window.clearTimeout(robotFactTimer);
    robotFactBubble.hidden = true;
    const transform = new DOMMatrixReadOnly(getComputedStyle(robot).transform);
    const determinant = transform.a * transform.d - transform.b * transform.c;
    const deltaX = destinationLeft - bounds.left;
    const deltaY = destinationTop - bounds.top;
    const translateX = (deltaX * transform.d - deltaY * transform.c) / determinant;
    const translateY = (deltaY * transform.a - deltaX * transform.b) / determinant;
    robot.style.setProperty("--dodge-x", `${currentX + translateX}px`);
    robot.style.setProperty("--dodge-y", `${currentY + translateY}px`);
    scheduleRobotReturn();
  }

  function celebrate() {
    const colors = ["#e990ae", "#f0bf55", "#55b998", "#66a9d8", "#8d91d2"];
    elements.confetti.replaceChildren();
    for (let index = 0; index < 48; index += 1) {
      const piece = document.createElement("i");
      piece.className = "confetti-piece";
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.background = colors[index % colors.length];
      piece.style.animationDelay = `${Math.random() * .65}s`;
      piece.style.setProperty("--drift", `${Math.round(Math.random() * 180 - 90)}px`);
      elements.confetti.append(piece);
    }
    window.setTimeout(() => elements.confetti.replaceChildren(), 3100);
  }

  function openInfo(type) {
    const isStats = type === "stats";
    elements.infoEyebrow.textContent = isStats ? "YOUR JOURNEY" : "COLLECT THEM ALL";
    elements.infoHeading.textContent = isStats ? "Your stats" : "Achievement badges";
    if (isStats) {
      const accuracy = state.storage.selections
        ? Math.round(state.storage.correctSelections / state.storage.selections * 100)
        : 0;
      const entries = [...state.storage.leaderboard].sort((a, b) => b.score - a.score).slice(0, 5);
      elements.infoContent.innerHTML = `
        <div class="stats-grid">
          ${statsCell(state.storage.gamesPlayed, "GAMES PLAYED")}
          ${statsCell(state.storage.primesFound, "PRIMES FOUND")}
          ${statsCell(`${accuracy}%`, "ACCURACY")}
          ${statsCell(`${state.storage.highestCombo}×`, "HIGHEST COMBO")}
        </div>
        <h3 class="list-heading">🏆 Leaderboard</h3>
        ${entries.length ? entries.map((entry, index) => `<div class="leader-row"><span class="leader-rank">#${index + 1}</span><span class="leader-name">${escapeHTML(entry.mode[0].toUpperCase() + entry.mode.slice(1))} · ${escapeHTML(entry.difficulty)}</span><span class="leader-score">${escapeHTML(String(entry.score))} pts</span></div>`).join("") : '<div class="empty-list">Finish a game to add your first score!</div>'}
      `;
    } else {
      elements.infoContent.innerHTML = ACHIEVEMENTS.map((badge) => {
        const unlocked = state.storage.achievements.includes(badge.id);
        return `<div class="badge-row${unlocked ? "" : " locked"}"><span class="badge-icon" aria-hidden="true">${badge.icon}</span><span class="badge-info"><b>${badge.name}</b><small>${badge.detail}</small></span>${unlocked ? '<span aria-label="Unlocked">✓</span>' : '<span aria-label="Locked">🔒</span>'}</div>`;
      }).join("");
    }
    elements.infoDialog.showModal();
  }

  function statsCell(value, label) {
    return `<div class="stats-cell"><b>${escapeHTML(String(value))}</b><span>${label}</span></div>`;
  }

  document.querySelector("#start-button").addEventListener("click", () => startGame());
  document.querySelector("#robot-face").addEventListener("click", sharePrimeFact);
  document.querySelector("#robot-body").addEventListener("click", dodgeRobot);
  document.querySelector("#restart-button").addEventListener("click", () => startGame(state.lastSettings.mode, state.lastSettings.difficulty));
  document.querySelector("#new-game-button").addEventListener("click", () => {
    stopTimer();
    state.active = false;
    state.grid = [];
    state.score = 0;
    state.lifeUnits = MAX_LIFE_UNITS;
    state.level = 1;
    state.combo = 0;
    state.highestComboThisGame = 0;
    state.primesFoundThisGame = 0;
    state.hintsLeft = HINTS_PER_GAME;
    state.elapsedSeconds = 0;
    state.visiblePrimeCount = 0;
    state.levelPrimesFound = 0;
    state.hiddenSolved = false;
    state.answerReview = false;
    elements.resultDialog.classList.remove("answer-review-dialog");
    state.mode = elements.modeSelect.value;
    state.difficulty = elements.difficultySelect.value;
    state.timerSeconds = getRoundDuration(state.difficulty);
    elements.startCard.hidden = false;
    elements.gameLayout.hidden = true;
    elements.message.textContent = "A prime number is greater than 1 and divisible only by 1 and itself.";
    render();
    renderBoard();
  });
  document.querySelector("#hint-button").addEventListener("click", useHint);
  document.querySelector("#guess-form").addEventListener("submit", submitGuess);
  document.querySelector("#stats-open").addEventListener("click", () => openInfo("stats"));
  document.querySelector("#achievements-open").addEventListener("click", () => openInfo("badges"));
  document.querySelector("#result-new-game").addEventListener("click", () => {
    elements.resultDialog.close();
    document.querySelector("#new-game-button").click();
  });
  document.querySelector("#result-restart").addEventListener("click", () => startGame(state.lastSettings.mode, state.lastSettings.difficulty));
  elements.modeSelect.addEventListener("change", () => {
    state.mode = elements.modeSelect.value;
    state.lastSettings.mode = state.mode;
    render();
  });
  elements.difficultySelect.addEventListener("change", () => {
    state.difficulty = elements.difficultySelect.value;
    state.lastSettings.difficulty = state.difficulty;
    if (!state.active) state.timerSeconds = getRoundDuration(state.difficulty);
    render();
  });
  elements.guessDialog.addEventListener("click", (event) => {
    if (event.target === elements.guessDialog) elements.guessDialog.close();
  });
  elements.infoDialog.addEventListener("click", (event) => {
    if (event.target === elements.infoDialog) elements.infoDialog.close();
  });

  render();
  renderBoard();
})();