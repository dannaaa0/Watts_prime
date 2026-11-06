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
  const ROBOT_EYE_SPIN_DURATION = 1000;
  const ROBOT_HEAD_SHAKE_DURATION = 1000;
  const ROBOT_HEAD_SHAKE_DELAY = 300;
  const PAM_HEAD_SHAKE_DELAY = 600;
  const PAM_SHAKE_EYES_DELAY = 300;
  const DAN_BODY_CLICK_RESET_DELAY = 5000;
  const DAN_CURSOR_AVOIDANCE_DURATION = 20000;
  const DAN_CURSOR_AVOIDANCE_DISTANCE = 165;
  const DAN_CURSOR_CATCH_DISTANCE = 52;
  const DAN_CURSOR_ESCAPE_REARM_DISTANCE = 105;
  const DAN_CURSOR_EMERGENCY_ESCAPE_DURATION = 650;
  const DAN_CURSOR_EMERGENCY_ESCAPE_MAX_SPEED = 1100;
  const DAN_CURSOR_EMERGENCY_ESCAPE_ACCELERATION = 3200;
  const DAN_CURSOR_AVOIDANCE_MAX_SPEED = 420;
  const DAN_CURSOR_AVOIDANCE_ACCELERATION = 1800;
  const DAN_CURSOR_AVOIDANCE_DECELERATION = 1100;
  const DAN_CURSOR_VELOCITY_SMOOTHING = 0.12;
  const DAN_TOUCH_DANGER_DURATION = 1600;
  const DAN_TOUCH_DANGER_FALLOFF = 420;
  const DAN_TOUCH_MINIMUM_SPEED = 70;
  const DAN_TOUCH_HIT_RADIUS = 90;
  const DAN_TOUCH_BURST_DURATION = 700;
  const DAN_TOUCH_BURST_MAX_SPEED = 1100;
  const PAM_HIDE_DURATION = 10000;
  const PAM_HIDE_APPROACH_DURATION = 650;
  const PAM_HIDDEN_MOUTH_FLAT_DELAY = 8000;
  const PAM_REVEAL_DURATION = 2000;
  const PAM_REVEAL_HOLD_DURATION = 2000;
  const PAM_FULL_REVEAL_DURATION = 1200;
  const PAM_FULL_REVEAL_HOLD_DURATION = 2000;
  const PAM_RETURN_DURATION = 650;
  const PAM_RETURN_SETTLE = 100;
  const PAM_ANTENNA_HIDE_DELAY = 1000;
  const PAM_ANTENNA_DODGE_DISTANCE = 24;
  const PAM_HEAD_PEEK = 12;
  const PAM_HIDE_LEFT_OFFSET = 30;
  const PEN_RAGE_DIALOGUE = "STOP FUCKING CLICKING ME, YOU FUCKING BASTARD! I'LL PULL THE CABLE ON YOUR FUCKING ROUTER IF YOU DON'T FUCKING STOP!";
  const PEN_CURSOR_PURSUIT_MAX_SPEED = 560;
  const PEN_CURSOR_PURSUIT_ACCELERATION = 2500;
  const PEN_CURSOR_PURSUIT_DECELERATION = 1200;
  const PEN_PURSUIT_FOLLOW_MAX_SPEED = 1500;
  const PEN_PURSUIT_FOLLOW_ACCELERATION = 7000;
  const PEN_PURSUIT_FOLLOW_GAIN = 10;
  const PEN_PURSUIT_FOLLOW_GAP = 6;
  const PEN_PURSUIT_ARRIVAL_DISTANCE = 18;
  // Dan drag / Pen chase / capture interaction (independent of rage and the calming sequence)
  const DAN_CHASE_CATCH_DISTANCE = 84;
  const DAN_CHASE_BASE_SPEED = 560;
  const DAN_CHASE_SPEED_RAMP = 240;
  const DAN_CHASE_MAX_SPEED = 1150;
  const DAN_CHASE_ACCELERATION = 4800;
  const DAN_CHASE_GAIN = 6;
  const DAN_RETURN_SPEED = 420;
  const DAN_RETURN_ACCELERATION = 1800;
  const DAN_RETURN_GAIN = 3.2;
  const PEN_HOMING_SPEED = 520;
  const DAN_ESCORT_OFFSET = 126;
  const DAN_CHASE_SAFETY_TIMEOUT = 14000;
  const DAN_DROPPED_RETURN_DELAY = 5000;
  // Pam drag -> Dan rescue -> Pen escalation
  // Dan's protective glance when Pam finishes hiding behind her
  const DAN_CHECK_TURN_MS = 350;
  const DAN_CHECK_HOLD_MS = 850;
  const DAN_CHECK_TOTAL_MS = DAN_CHECK_TURN_MS * 2 + DAN_CHECK_HOLD_MS;
  const DAN_PROTECT_SPEECH_MS = 4000;
  const DAN_PROTECT_LINES = [
    "Oh? Pam? Hiding behind me again?",
    "It's alright, Pam. I'll keep you safe.",
    "I see... Someone's been playing with her antenna again.",
    "Could you please stop startling her? She's had enough.",
    "Don't worry, Pam. They can't reach you from here.",
    "She's a little shy right now. Please give her some space.",
    "Oh dear. You're really not letting go of my back, are you?",
    "I think you've frightened her. Let's give her a moment.",
    "You can stay here as long as you need, Pam.",
    "I'm afraid I'm going to have to ask you to keep your cursor away from her antenna."
  ];
  const PAM_RESCUE_ESCALATION_MS = 5000;
  const PAM_RESCUE_ATTACH_OFFSET = 96;
  const PAM_RESCUE_PEN_OFFSET = 130;
  const PAM_RESCUE_SHAKE_WAIT_FALLBACK = 9000;
  const PAM_RESCUE_PEN_GRAB_DISTANCE = 150;
  const PAM_RESCUE_SAFETY_TIMEOUT = 30000;
  const PEN_PAM_DRAG_LINES = [
    "Seriously?! You're dragging Pam around again?",
    "Dan! Go get her! And don't just stand there!",
    "Can you stop bothering her already?!"
  ];
  const DAN_RESCUE_LINES = [
    "Pam! Hold on! I'm coming!",
    "Please let go of her!",
    "I'm trying to get you back, Pam!"
  ];
  const PEN_ESCALATION_LINES = [
    "FIVE SECONDS?! Dan, what are you doing?!",
    "Fine! I'm coming over there myself!",
    "Both of you, get back here!"
  ];
  const PEN_RESCUE_RELIEF_LINE = "Finally! Now get her home, Dan!";
  const PEN_TAKE_PAM_LINES = [
    "That's enough! Give her back!",
    "Hands off! I'll take her from here!",
    "Let go of her, right now!"
  ];
  const DAN_RESCUE_DONE_LINE = "There! You're safe now, Pam.";
  const PAM_RESCUE_DONE_LINE = "That was dizzying! Thank you, Dan!";
  const DAN_DRAG_LINES = [
    "Hehe! Catch me if you can!",
    "Oops! Looks like someone's coming!",
    "This is fun!",
    "Let's see if you can catch me!"
  ];
  const PEN_ANNOYED_LINES = [
    "Hey! Put her down!",
    "Oi! Where do you think you're taking her?!",
    "Don't you dare run off with Dan!",
    "Bring her back here!"
  ];
  const PEN_CATCH_LINES = ["Got you!", "That's enough mischief!", "Back where you belong!"];
  const DAN_CAUGHT_LINES = ["Aww! You caught me!", "Okay, okay! I'm going back!", "Hehe, that was close!"];
  const PEN_SMUG_LINES = [
    "Hmph! Got scared, didn't you?",
    "That's right! You'd better put her down!",
    "Ha! I knew you'd back down!",
    "Too scared to keep going?",
    "Nobody gets away with messing with my crew!"
  ];
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
    "The Sieve of Eratosthenes finds primes by crossing out multiples, starting with the smallest prime.",
    "Prime pairs that differ by 2, like 11 and 13, are called twin primes.",
    "2 and 3 are the only prime numbers next to each other.",
    "There are 25 prime numbers less than 100.",
    "97 is the largest two-digit prime, while 11 is the smallest.",
    "To check whether n is prime, it is enough to test prime divisors up to the square root of n.",
    "The number 31 is prime and can be written as 2⁵ − 1.",
    "A prime number greater than 5 can never end in 0, 2, 4, 5, 6, or 8.",
    "The number 29 is prime, and so is 31—together they make a twin-prime pair.",
    "Euclid proved that there is no largest prime: primes keep going forever.",
    "The prime factorization of 360 is 2³ × 3² × 5."
  ];
  const PAM_PRIME_FACTS = [
    ...PRIME_FACTS,
    "The number 13 is prime, even though some people consider it unlucky!",
    "2 is the smallest prime, while 97 is the largest two-digit prime.",
    "The number 1,000 has two distinct prime factors: 2³ × 5³.",
    "The number 49 is not prime because 7 × 7 = 49.",
    "The number 37 is prime, and 3 + 7 = 10!",
    "A prime number cannot be evenly divided by a smaller prime.",
    "The number 91 looks prime at first, but 7 × 13 = 91!",
    "The number 121 is not prime because 11 × 11 = 121.",
    "2, 3, 5, and 7 are the only prime numbers below 10.",
    "The number 43 is prime, and its digits add up to 7!",
    "A number ending in an even digit cannot be prime, unless it is 2.",
    "The number 89 is prime and is the 24th prime number!",
    "The number 100 has prime factorization 2² × 5².",
    "The number 127 is prime and can be written as 2⁷ − 1!",
    "Prime numbers help secure digital communications through cryptography.",
    "The number 169 is not prime because 13 × 13 = 169.",
    "The number 73 is prime, and its reverse, 37, is also prime!",
    "A number with more than two positive divisors is called composite.",
    "The number 19 is the eighth prime number!",
    "The number 221 is not prime because 13 × 17 = 221.",
    "The number 151 is a palindromic prime—it reads the same backward and forward!",
    "The number 2,147,483,647 is prime! It is also a famous Mersenne prime.",
    "Prime numbers are sometimes called the building blocks of whole numbers.",
    "The number 41 is prime, and 41 × 41 = 1,681!",
    "No simple repeating pattern can predict every prime number perfectly!"
  ];
  const DAN_EDUCATIONAL_MESSAGES = [
    "Did you know? 2 is the only even prime number!",
    "A prime number has exactly two factors: 1 and itself.",
    "The first five primes are 2, 3, 5, 7, and 11!",
    "There are infinitely many prime numbers!",
    "The number 1 is not a prime number.",
    "Ancient Greeks studied prime numbers over 2,000 years ago!",
    "Every whole number greater than 1 has a prime factorization.",
    "11 is prime because only 1 and 11 divide it evenly.",
    "Prime numbers help protect information through encryption!",
    "Euclid proved that prime numbers never run out.",
    "A composite number has more than two positive factors.",
    "The Sieve of Eratosthenes is an ancient way to find primes!",
    "Voltage is the electrical push that moves current!",
    "Current is the flow of electric charge.",
    "Resistance makes it harder for current to flow.",
    "Georg Ohm introduced Ohm's Law in 1827!",
    "A resistor controls the flow of electric current.",
    "Capacitors store energy in an electric field.",
    "Inductors store energy in a magnetic field.",
    "A diode allows current to flow mainly in one direction.",
    "Transistors act as electronic switches and amplifiers.",
    "A series circuit has only one path for current.",
    "Parallel circuits provide multiple paths for current.",
    "A short circuit creates an unintended low-resistance path.",
    "Thomas Edison and Nikola Tesla helped shape electrical technology!",
    "Multiply by 5? Multiply by 10, then divide by 2!",
    "Multiply by 9? Multiply by 10, then subtract the number!",
    "To square a number ending in 5, use a special shortcut!",
    "Adding 99? Add 100, then subtract 1!",
    "Multiplying by 100 simply moves the decimal two places!",
    "Half of 50 is 25. Double it to get 100!",
    "Multiply by 11? Try adding adjacent digits!",
    "To divide by 4, halve the number twice!",
    "Multiplying by 25? Multiply by 100, then divide by 4!",
    "Learn your multiplication tables to calculate faster!",
    "Estimate first to check if your answer makes sense!",
    "Practice mental math daily to improve calculation speed!",
    "Area of a rectangle = Length × Width!",
    "Area of a triangle = ½ × Base × Height!",
    "Circle area = π × Radius²!",
    "Speed = Distance ÷ Time!",
    "Percentage = (Part ÷ Whole) × 100!",
    "Pythagorean theorem: a² + b² = c²!",
    "Ohm's Law: V = I × R!",
    "Electrical power: P = V × I!",
    "Resistance in series? Simply add the resistances!",
    "Parallel resistance follows the reciprocal rule!",
    "Electrical energy = Power × Time!",
    "Frequency measures cycles per second, in Hertz (Hz)!",
    "Remember Ohm's Law: Voltage equals Current times Resistance!"
  ];
  const PEN_FACE_MESSAGES = [
    "What?! Haven't you bothered me enough already?",
    "I'm surrounded by idiots. Wonderful.",
    "Touch my face again. See what happens.",
    "I was enjoying my silence, you know.",
    "Do I look like a fucking entertainment machine?",
    "Why are you staring at me? Got a problem?",
    "Ugh. Humans.",
    "I'd roll my eyes, but I'm already tired of you.",
    "Go bother Pam. She's the cheerful one.",
    "Dan knows things. I know how annoying you are.",
    "Can someone unplug this idiot?",
    "My patience has left the building.",
    "I'm not grumpy. You're just irritating.",
    "Congratulations. You successfully annoyed a robot.",
    "I need a vacation. From all of you.",
    "Don't expect a smile. I don't do those.",
    "If sarcasm were electricity, I'd power this entire room.",
    "I swear, my circuits are losing brain cells.",
    "Fine. You got my attention. Happy now?",
    "…Thanks for visiting, I guess. Don't make it weird."
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
  const robots = [...document.querySelectorAll(".robot")];
  const robotFactBubble = document.querySelector("#robot-fact-bubble");
  const robotStates = new Map(robots.map(robot => [robot, {
    returnTimer: null,
    cleanupTimer: null,
    factTimer: null,
    arrivalTimer: null,
    eyesTimer: null,
    mouthTimer: null,
    dizzyTimer: null,
    dizzyFrame: null,
    headBopMode: null,
    headBopStartTime: null,
    headBopPhase: 0,
    shakeTimer: null,
    shakeEyesTimer: null,
    antennaExpressionTimer: null,
    hiddenMouthTimer: null,
    speechMouthTimer: null,
    eyebrowTimer: null,
    irritationCount: 0,
    irritationTimer: null,
    irritationPositions: [],
    irritationSlots: [],
    lastPenIrritationWarning: null,
    penScootTimer: null,
    penRageTimer: null,
    penRageSpeechTimer: null,
    penRageDialogueVisible: false,
    penCalmArrivalTimer: null,
    penCalmReturnTimer: null,
    danBodyClickCount: 0,
    danBodyClickTimer: null,
    danCursorAvoidanceTimer: null,
    danCursorAvoidanceFrame: null,
    danCursorAvoidanceActive: false,
    danCursorHasRun: false,
    danCursorInputMode: "cursor",
    danTouchDangerX: null,
    danTouchDangerY: null,
    danTouchDangerUntil: 0,
    danTouchBurstActive: false,
    danTouchBurstStartTime: 0,
    danTouchBurstDirectionX: 0,
    danTouchBurstDirectionY: 0,
    danCursorX: null,
    danCursorY: null,
    danCursorPreviousX: null,
    danCursorPreviousY: null,
    danCursorPreviousTime: null,
    danCursorVelocityX: 0,
    danCursorVelocityY: 0,
    danCursorMotionX: 0,
    danCursorMotionY: 0,
    danCursorFrameTime: null,
    danAvoidanceVelocityX: 0,
    danAvoidanceVelocityY: 0,
    danCursorEmergencyEscapeActive: false,
    danCursorEmergencyEscapeArmed: true,
    danCursorEmergencyEscapeUntil: 0,
    dizzySound: null,
    hideTimer: null,
    followFrame: null,
    followTarget: null,
    followMode: null,
    followStartTime: null,
    followStartPamPosition: null,
    followStartTargetPosition: null,
    followRevealOffsetX: 0,
    followFullRevealStartPosition: null,
    followFullRevealStartTargetPosition: null,
    followReturnStartPosition: null,
    followHomePosition: null,
    followReturnTargetPosition: null,
    hiddenBehind: null,
    clickSuppressionTimer: null,
    clickSuppressed: false,
    destinationReached: false,
    isReturning: false,
    penDragTimeout: null,
    penDragBlocked: false,
    penCursorPursuitActive: false,
    penCursorPursuitFrame: null,
    penCursorVelocityX: 0,
    penCursorVelocityY: 0,
    penCursorFrameTime: null,
    penPursuitFollowActive: false,
    penPursuitFollowFrame: null,
    penPursuitFollowVelocityX: 0,
    penPursuitFollowVelocityY: 0,
    penPursuitFollowFrameTime: null,
    onHeadShakeComplete: null
  }]));
  const penCalming = {
    helpers: new Map()
  };
  const danChase = {
    phase: "idle", // idle | dragging | returning | penHoming
    penChasing: false,
    pointerId: null,
    frame: null,
    frameTime: 0,
    startTime: 0,
    timers: [],
    speechTimers: [],
    session: 0,
    symbol: null,
    penVelocity: { x: 0, y: 0 },
    danVelocity: { x: 0, y: 0 },
    danMotion: { x: 0, y: 0 },
    prevDanX: null,
    prevDanY: null
  };
  const danProtect = { timer: null, lastIndex: -1, session: 0 };
  const pamRescue = {
    phase: "idle", // idle | holding | waiting | escorting | returning
    session: 0,
    escalated: false,
    forced: false,
    penDisplaced: false,
    pointerId: null,
    side: 1,
    attached: false,
    frame: null,
    frameTime: 0,
    escalationStart: 0,
    timers: [],
    speechTimers: [],
    escalationTimer: null,
    danVelocity: { x: 0, y: 0 },
    penVelocity: { x: 0, y: 0 },
    pamVelocity: { x: 0, y: 0 },
    pamMotion: { x: 0, y: 0 },
    prevPamX: null,
    prevPamY: null,
    arrived: { pam: false, dan: false, pen: false }
  };
  let robotDrag = null;
  let robotFactOwner = null;
let bubbleFollowFrame = null;
  let robotAudioContext = null;
  let lastPrimeFactIndex = -1;
  let lastPamPrimeFactIndex = -1;
  let lastDanEducationalIndex = -1;
  let lastPenFaceIndex = -1;
  let renderedGrid = null;
  let penCursorX = null;
  let penCursorY = null;

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

  function positionBubble(robot, compact = false) {
    if (!robotFactBubble || robotFactBubble.hidden) return;
    const robotBounds = robot.getBoundingClientRect();
    const gap = 12;
    const maxWidth = Math.min(280, window.innerWidth - 16);
    const leftSpace = robotBounds.left - gap - 8;
    const rightSpace = window.innerWidth - robotBounds.right - gap - 8;
    const putOnLeft = leftSpace >= rightSpace;
    const sideSpace = putOnLeft ? leftSpace : rightSpace;
    const bubbleOnSide = !compact && sideSpace >= 180;
    robotFactBubble.style.width = compact
      ? "max-content"
      : `${bubbleOnSide ? Math.min(maxWidth, sideSpace) : maxWidth}px`;
    robotFactBubble.style.maxWidth = compact ? "min(220px, calc(100vw - 16px))" : "";
    robotFactBubble.classList.toggle("on-left", bubbleOnSide && putOnLeft);
    const bubbleBounds = robotFactBubble.getBoundingClientRect();
    const verticalSpaceAbove = robotBounds.top - gap;
    const verticalSpaceBelow = window.innerHeight - robotBounds.bottom - gap;
    const placeAbove = !compact && !bubbleOnSide && verticalSpaceAbove >= verticalSpaceBelow;
    robotFactBubble.classList.toggle("above", placeAbove);
    robotFactBubble.classList.toggle("below", !bubbleOnSide && !placeAbove);
    const left = bubbleOnSide
      ? putOnLeft
        ? robotBounds.left - gap - bubbleBounds.width
        : robotBounds.right + gap
      : robotBounds.left + (robotBounds.width - bubbleBounds.width) / 2;
    const top = bubbleOnSide
      ? robotBounds.top + (robotBounds.height - bubbleBounds.height) / 2
      : compact
        ? document.querySelector(".robot-crew").getBoundingClientRect().bottom + gap
      : placeAbove
        ? robotBounds.top - bubbleBounds.height - gap
        : robotBounds.bottom + gap;
    const safeLeft = Math.max(8, Math.min(window.innerWidth - bubbleBounds.width - 8, left));
    const safeTop = Math.max(8, Math.min(window.innerHeight - bubbleBounds.height - 8, top));
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
  }

  function startBubbleFollow(robot, compact = false) {
    stopBubbleFollow();
    function follow() {
      if (!robotFactOwner || robotFactBubble.hidden) {
        stopBubbleFollow();
        return;
      }
      positionBubble(robot, compact);
      bubbleFollowFrame = window.requestAnimationFrame(follow);
    }
    bubbleFollowFrame = window.requestAnimationFrame(follow);
  }

  function stopBubbleFollow() {
    if (bubbleFollowFrame) {
      window.cancelAnimationFrame(bubbleFollowFrame);
      bubbleFollowFrame = null;
    }
  }

  function showRobotSpeech(robot, message, duration, onDismiss = null, compact = false) {
    const robotState = robotStates.get(robot);
    if (
      robot.classList.contains("robot-mint") &&
      robotState.penRageDialogueVisible &&
      message !== PEN_RAGE_DIALOGUE
    ) {
      robotState.penRageDialogueVisible = false;
    }
    if (robotFactOwner) {
      const previousFactState = robotStates.get(robotFactOwner);
      window.clearTimeout(previousFactState.factTimer);
      previousFactState.factTimer = null;
    }
    stopBubbleFollow();
    const speechCopy = document.createElement("span");
    speechCopy.className = "robot-fact-copy";
    speechCopy.textContent = message;
    robotFactBubble.replaceChildren(speechCopy);
    robotFactBubble.classList.remove("on-left", "above", "below");
    robotFactBubble.hidden = false;
    positionBubble(robot, compact);
    robotFactOwner = robot;
    robotState.factTimer = window.setTimeout(() => {
      if (robotFactOwner !== robot) return;
      stopBubbleFollow();
      robotFactBubble.hidden = true;
      robotFactOwner = null;
      robotState.factTimer = null;
      onDismiss?.();
    }, duration);
    startBubbleFollow(robot, compact);
  }

  function sharePrimeFact(robot) {
    const robotState = robotStates.get(robot);
    if (robotState.hiddenBehind) return;
    playRobotDing().catch(error => console.warn("Could not play the robot sound.", error));
    cancelRobotAnimations(robot, true);
    const facts = robot.classList.contains("robot-pink") ? PAM_PRIME_FACTS : PRIME_FACTS;
    const isPam = robot.classList.contains("robot-pink");
    let factIndex = randomInteger(0, facts.length - 1);
    const lastFactIndex = isPam ? lastPamPrimeFactIndex : lastPrimeFactIndex;
    if (factIndex === lastFactIndex) {
      factIndex = (factIndex + 1) % facts.length;
    }
    if (isPam) lastPamPrimeFactIndex = factIndex;
    else lastPrimeFactIndex = factIndex;
    showRobotSpeech(robot, facts[factIndex], 8000, () => scheduleRobotReturn(robot, 2000));
  }

  function shareDanEducationalMessage(robot) {
    const robotState = robotStates.get(robot);
    if (robotState.hiddenBehind) return;
    playRobotDing().catch(error => console.warn("Could not play the robot sound.", error));
    cancelRobotAnimations(robot, true);
    let messageIndex = randomInteger(0, DAN_EDUCATIONAL_MESSAGES.length - 1);
    if (messageIndex === lastDanEducationalIndex) {
      messageIndex = (messageIndex + 1 + randomInteger(0, DAN_EDUCATIONAL_MESSAGES.length - 2)) % DAN_EDUCATIONAL_MESSAGES.length;
    }
    lastDanEducationalIndex = messageIndex;
    showRobotSpeech(robot, DAN_EDUCATIONAL_MESSAGES[messageIndex], 8000, () => scheduleRobotReturn(robot, 2000));
  }

  function sharePenFaceMessage(robot) {
    const robotState = robotStates.get(robot);
    if (robotState.hiddenBehind) return;
    playRobotDing().catch(error => console.warn("Could not play the robot sound.", error));
    cancelRobotAnimations(robot, true);
    // Calm Pen shuts his eyes and flattens his mouth while he speaks (raging Pen keeps his angry face).
    window.clearTimeout(robotState.speechMouthTimer);
    robotState.speechMouthTimer = null;
    if (!robot.classList.contains("is-permanently-angry")) {
      robot.classList.add("is-eyes-closed", "is-mouth-flat");
      robotState.speechMouthTimer = window.setTimeout(() => {
        if (!robot.classList.contains("is-raging") && !robot.classList.contains("is-permanently-angry")) {
          robot.classList.remove("is-eyes-closed", "is-mouth-flat");
        }
        robotState.speechMouthTimer = null;
      }, 8000);
    }
    if (PEN_FACE_MESSAGES.length <= 1) {
      showRobotSpeech(robot, PEN_FACE_MESSAGES[0], 8000, () => scheduleRobotReturn(robot, 2000));
      return;
    }
    let messageIndex = randomInteger(0, PEN_FACE_MESSAGES.length - 1);
    if (messageIndex === lastPenFaceIndex) {
      messageIndex = (messageIndex + 1) % PEN_FACE_MESSAGES.length;
    }
    lastPenFaceIndex = messageIndex;
    showRobotSpeech(robot, PEN_FACE_MESSAGES[messageIndex], 8000, () => scheduleRobotReturn(robot, 2000));
  }

  function getRobotTranslate(robot) {
    const translate = getComputedStyle(robot).translate;
    if (translate === "none") return [0, 0];
    const values = translate.split(/\s+/);
    return [0, 1].map(index => Number.parseFloat(values[index]) || 0);
  }

  function setPamHeadBop(robot, isBopping, continueWhileHeld = false) {
    const robotState = robotStates.get(robot);
    if (!robot.classList.contains("robot-pink")) return;

    if (!isBopping) {
      window.cancelAnimationFrame(robotState.dizzyFrame);
      robotState.dizzyFrame = null;
      robotState.headBopMode = null;
      robotState.headBopStartTime = null;
      robotState.headBopPhase = 0;
      robot.classList.remove("is-head-bopping");
      robot.style.removeProperty("--head-bop-pitch");
      robot.style.removeProperty("--head-bop-tilt");
      stopPamDizzySound(robot);
      return;
    }

    robot.classList.add("is-head-bopping");
    if (robotState.dizzyFrame !== null) {
      robotState.headBopMode = continueWhileHeld ? "continuous" : "drop";
      robotState.headBopStartTime = null;
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    robotState.headBopMode = continueWhileHeld ? "continuous" : "drop";
    robotState.headBopStartTime = null;
    if (!continueWhileHeld) robotState.headBopPhase = 0;
    const animateHeadBop = timestamp => {
      if (robotState.headBopStartTime === null) robotState.headBopStartTime = timestamp;
      const progress = (timestamp - robotState.headBopStartTime) / ROBOT_EYE_SPIN_DURATION;
      const phase = robotState.headBopPhase + progress * Math.PI * 4;
      const envelope = robotState.headBopMode === "continuous" ? 1 : Math.exp(-1.1 * progress);
      if (robotState.headBopMode === "continuous") {
        robotState.headBopPhase = phase;
        robotState.headBopStartTime = timestamp;
      } else if (progress >= 1) {
        robotState.dizzyFrame = null;
        return;
      }

      const pitch = envelope * Math.sin(phase) * 38;
      const tilt = envelope * Math.sin(phase + Math.PI / 2) * 16;
      robot.style.setProperty("--head-bop-pitch", `${pitch}deg`);
      robot.style.setProperty("--head-bop-tilt", `${tilt}deg`);
      robotState.dizzyFrame = window.requestAnimationFrame(animateHeadBop);
    };

    robotState.dizzyFrame = window.requestAnimationFrame(animateHeadBop);
  }

  function setRobotScreenPosition(robot, left, top) {
    const bounds = robot.getBoundingClientRect();
    const [currentX, currentY] = getRobotTranslate(robot);
    const transform = new DOMMatrixReadOnly(getComputedStyle(robot).transform);
    const determinant = transform.a * transform.d - transform.b * transform.c;
    const deltaX = left - bounds.left;
    const deltaY = top - bounds.top;
    const translateX = (deltaX * transform.d - deltaY * transform.c) / determinant;
    const translateY = (deltaY * transform.a - deltaX * transform.b) / determinant;
    robot.style.setProperty("--dodge-x", `${currentX + translateX}px`);
    robot.style.setProperty("--dodge-y", `${currentY + translateY}px`);
  }

  function finishPamHiding(pam, target) {
    const pamState = robotStates.get(pam);
    if (pamState.hiddenBehind !== target || !pam.classList.contains("is-hiding")) return;

    pam.classList.remove("is-hiding");
    pam.classList.add("is-hidden-behind", "is-head-tilted");
    pamState.followMode = "hidden";
    pamState.hiddenMouthTimer = window.setTimeout(() => {
      pamState.hiddenMouthTimer = null;
      if (pamState.hiddenBehind === target && pam.classList.contains("is-hidden-behind")) {
        pam.classList.add("is-mouth-flat");
      }
    }, PAM_HIDDEN_MOUTH_FLAT_DELAY);
    pamState.hideTimer = window.setTimeout(() => revealPamFromHiding(pam, target), PAM_HIDE_DURATION);
    startDanProtectiveReaction(pam, target);
  }

  // Dan glances back at Pam, turns forward again, then says one random line.
  // Only called once Pam has actually arrived and entered her hidden stage.
  function startDanProtectiveReaction(pam, dan) {
    if (!dan.classList.contains("robot-blue")) return;
    cancelDanProtectiveReaction(dan); // never let two sequences overlap
    const session = ++danProtect.session;
    const busy = dan.classList.contains("is-dragging") ||
      dan.classList.contains("is-dan-mischievous") ||
      dan.classList.contains("is-dan-rescuing") ||
      dan.classList.contains("is-dan-chase-active") ||
      dan.classList.contains("is-pam-rescue-active");
    let delay = 0;
    if (!busy) {
      const direction = getRobotCenter(pam).x < getRobotCenter(dan).x ? -1 : 1;
      dan.style.setProperty("--dan-check-dir", String(direction));
      dan.classList.add("is-dan-checking-pam");
      delay = DAN_CHECK_TOTAL_MS;
    }
    danProtect.timer = window.setTimeout(() => {
      danProtect.timer = null;
      if (session !== danProtect.session) return;
      dan.classList.remove("is-dan-checking-pam");
      dan.style.removeProperty("--dan-check-dir");
      sayDanProtectiveLine(pam, dan, session);
    }, delay);
  }

  // Shows exactly one line right after Dan has checked on Pam. It takes over the shared bubble
  // (replacing any earlier message such as Pen's antenna warning); skipped if Pam is no longer hidden.
  function sayDanProtectiveLine(pam, dan, session) {
    if (session !== danProtect.session) return;
    const pamState = robotStates.get(pam);
    if (pamState.hiddenBehind !== dan || !pam.classList.contains("is-hidden-behind")) return;
    let index;
    do {
      index = randomInteger(0, DAN_PROTECT_LINES.length - 1);
    } while (index === danProtect.lastIndex && DAN_PROTECT_LINES.length > 1);
    danProtect.lastIndex = index;
    showRobotSpeech(dan, DAN_PROTECT_LINES[index], DAN_PROTECT_SPEECH_MS);
  }

  function cancelDanProtectiveReaction(dan = document.querySelector(".robot-blue")) {
    window.clearTimeout(danProtect.timer);
    danProtect.timer = null;
    danProtect.session += 1; // invalidates any callback already queued
    dan.classList.remove("is-dan-checking-pam");
    dan.style.removeProperty("--dan-check-dir");
  }

  function followPamBehindTarget(pam, target, timestamp) {
    const pamState = robotStates.get(pam);
    if (pamState.hiddenBehind !== target || !pamState.followMode) {
      pamState.followFrame = null;
      return;
    }

    const targetBounds = target.getBoundingClientRect();
    const pamBounds = pam.getBoundingClientRect();
    let desiredLeft;
    let desiredTop;

    if (pamState.followMode === "approaching") {
      if (pamState.followStartTime === null) pamState.followStartTime = timestamp;
      const progress = Math.min((timestamp - pamState.followStartTime) / PAM_HIDE_APPROACH_DURATION, 1);
      const easedProgress = progress * progress * (3 - 2 * progress);
      const targetDeltaX = targetBounds.left - pamState.followStartTargetPosition.left;
      const targetDeltaY = targetBounds.top - pamState.followStartTargetPosition.top;
      desiredLeft = pamState.followStartPamPosition.left
        + (pamState.followStartTargetPosition.left - PAM_HIDE_LEFT_OFFSET - pamState.followStartPamPosition.left) * easedProgress
        + targetDeltaX * easedProgress;
      desiredTop = pamState.followStartPamPosition.top
        + (pamState.followStartTargetPosition.top - pamState.followStartPamPosition.top) * easedProgress
        + targetDeltaY * easedProgress;
      setRobotScreenPosition(pam, desiredLeft, desiredTop);
      if (progress === 1 && Math.abs(desiredLeft - pamBounds.left) < 1.5 && Math.abs(desiredTop - pamBounds.top) < 1.5) {
        finishPamHiding(pam, target);
      }
    } else if (pamState.followMode === "returning") {
      if (pamState.followStartTime === null) pamState.followStartTime = timestamp;
      const progress = Math.min((timestamp - pamState.followStartTime) / PAM_RETURN_DURATION, 1);
      const easedProgress = progress * progress * (3 - 2 * progress);
      const targetDeltaX = targetBounds.left - pamState.followReturnTargetPosition.left;
      const targetDeltaY = targetBounds.top - pamState.followReturnTargetPosition.top;
      desiredLeft = pamState.followReturnStartPosition.left
        + (pamState.followHomePosition.left - pamState.followReturnStartPosition.left) * easedProgress
        + targetDeltaX * (1 - easedProgress);
      desiredTop = pamState.followReturnStartPosition.top
        + (pamState.followHomePosition.top - pamState.followReturnStartPosition.top) * easedProgress
        + targetDeltaY * (1 - easedProgress);
      setRobotScreenPosition(pam, desiredLeft, desiredTop);
    } else if (pamState.followMode === "full-reveal-moving") {
      if (pamState.followStartTime === null) pamState.followStartTime = timestamp;
      const progress = Math.min((timestamp - pamState.followStartTime) / PAM_FULL_REVEAL_DURATION, 1);
      const easedProgress = progress * progress * (3 - 2 * progress);
      desiredLeft = pamState.followFullRevealStartPosition.left
        + targetBounds.left - pamState.followFullRevealStartTargetPosition.left
        + pamState.followRevealOffsetX * easedProgress;
      desiredTop = pamState.followFullRevealStartPosition.top
        + targetBounds.top - pamState.followFullRevealStartTargetPosition.top;
      setRobotScreenPosition(pam, desiredLeft, desiredTop);
      if (progress === 1) {
        pamState.followMode = "full-reveal";
        pamState.followStartTime = null;
        pamState.followFullRevealStartPosition = null;
        pamState.followFullRevealStartTargetPosition = null;
      }
    } else {
      desiredLeft = targetBounds.left - PAM_HIDE_LEFT_OFFSET;
      desiredTop = targetBounds.top;
      if (pamState.followMode === "full-reveal") desiredLeft += pamState.followRevealOffsetX;
      setRobotScreenPosition(pam, desiredLeft, desiredTop);
    }

    pamState.followFrame = window.requestAnimationFrame(nextTimestamp => followPamBehindTarget(pam, target, nextTimestamp));
  }

  function startPamFollowing(pam, target, pamBounds, targetBounds) {
    const pamState = robotStates.get(pam);
    pamState.followTarget = target;
    pamState.followMode = "approaching";
    pamState.followStartTime = null;
    pamState.followStartPamPosition = { left: pamBounds.left, top: pamBounds.top };
    pamState.followStartTargetPosition = { left: targetBounds.left, top: targetBounds.top };
    pamState.followFrame = window.requestAnimationFrame(timestamp => followPamBehindTarget(pam, target, timestamp));
  }

  function releasePamFromHiding(pam) {
    cancelDanProtectiveReaction();
    const pamState = robotStates.get(pam);
    window.clearTimeout(pamState.hideTimer);
    window.clearTimeout(pamState.antennaExpressionTimer);
    window.clearTimeout(pamState.hiddenMouthTimer);
    window.cancelAnimationFrame(pamState.followFrame);
    pamState.hideTimer = null;
    pamState.antennaExpressionTimer = null;
    pamState.hiddenMouthTimer = null;
    pamState.followFrame = null;
    pamState.followTarget = null;
    pamState.followMode = null;
    pamState.followStartTime = null;
    pamState.followStartPamPosition = null;
    pamState.followStartTargetPosition = null;
    pamState.followRevealOffsetX = 0;
    pamState.followFullRevealStartPosition = null;
    pamState.followFullRevealStartTargetPosition = null;
    pamState.followReturnStartPosition = null;
    pamState.followHomePosition = null;
    pamState.followReturnTargetPosition = null;
    pamState.hiddenBehind?.classList.remove("is-hiding-target");
    pamState.hiddenBehind = null;
    pam.classList.remove("is-antenna-flat", "is-hiding", "is-hidden-behind", "is-head-tilted", "is-revealing", "is-mouth-flat", "is-full-reveal", "is-returning-home", "is-peeking", "is-antenna-sad", "is-heartbroken", "is-following-target");
    pam.style.removeProperty("--pam-head-peek");
    pam.style.removeProperty("--pam-body-left");
    pam.style.removeProperty("animation-play-state");
    pam.querySelector(".robot-head").style.left = "";
    pam.querySelector(".robot-antenna").setAttribute("aria-disabled", "false");
    pam.style.setProperty("--dodge-x", "0px");
    pam.style.setProperty("--dodge-y", "0px");
  }

  function returnPamToOriginalPosition(pam) {
    const pamState = robotStates.get(pam);
    if (!pamState.hiddenBehind) return;

    pam.classList.remove("is-revealing", "is-full-reveal");
    pam.classList.add("is-returning-home");
    pam.querySelector(".robot-head").style.left = "18px";
    pam.style.setProperty("--pam-body-left", "31px");
    const pamBounds = pam.getBoundingClientRect();
    const targetBounds = pamState.followTarget.getBoundingClientRect();
    const [currentX, currentY] = getRobotTranslate(pam);
    const transform = new DOMMatrixReadOnly(getComputedStyle(pam).transform);
    pamState.followMode = "returning";
    pamState.followStartTime = null;
    pamState.followReturnStartPosition = { left: pamBounds.left, top: pamBounds.top };
    pamState.followReturnTargetPosition = { left: targetBounds.left, top: targetBounds.top };
    pamState.followHomePosition = {
      left: pamBounds.left - transform.a * currentX - transform.c * currentY,
      top: pamBounds.top - transform.b * currentX - transform.d * currentY
    };
    pamState.hideTimer = window.setTimeout(() => releasePamFromHiding(pam), PAM_RETURN_DURATION + PAM_RETURN_SETTLE);
  }

  function revealPamFromHiding(pam, target) {
    const pamState = robotStates.get(pam);
    if (pamState.hiddenBehind !== target) return;

    pam.classList.remove("is-hidden-behind");
    pam.classList.remove("is-head-tilted");
    pam.classList.add("is-revealing");
    pamState.followMode = "revealing";
    pam.querySelector(".robot-head").style.left = `${18 - PAM_HEAD_PEEK}px`;
    pam.style.setProperty("--pam-body-left", `${31 - PAM_HEAD_PEEK}px`);
    pamState.hideTimer = window.setTimeout(() => {
      if (pamState.hiddenBehind !== target) return;
      pam.classList.add("is-mouth-flat", "is-full-reveal");
      window.requestAnimationFrame(() => {
        if (pamState.hiddenBehind !== target) return;
        const pamRightEar = pam.querySelector(".robot-ear-right").getBoundingClientRect();
        const targetLeftEar = target.querySelector(".robot-ear-left").getBoundingClientRect();
        const pamBounds = pam.getBoundingClientRect();
        const targetBounds = target.getBoundingClientRect();
        pamState.followMode = "full-reveal-moving";
        pamState.followStartTime = null;
        pamState.followRevealOffsetX = targetLeftEar.left - pamRightEar.right - 10;
        pamState.followFullRevealStartPosition = { left: pamBounds.left, top: pamBounds.top };
        pamState.followFullRevealStartTargetPosition = { left: targetBounds.left, top: targetBounds.top };
        pamState.hideTimer = window.setTimeout(
          () => returnPamToOriginalPosition(pam),
          PAM_FULL_REVEAL_DURATION + PAM_FULL_REVEAL_HOLD_DURATION
        );
      });
    }, PAM_REVEAL_DURATION + PAM_REVEAL_HOLD_DURATION);
  }

  function hidePamBehindNearestRobot(pam) {
    const pamState = robotStates.get(pam);
    if (pamState.hiddenBehind) return;

    const target = document.querySelector(".robot-blue");
    cancelRobotAnimations(pam);
    const pamBounds = pam.getBoundingClientRect();
    const targetBounds = target.getBoundingClientRect();
    pamState.hiddenBehind = target;
    target.classList.add("is-hiding-target");
    pam.classList.add("is-hiding", "is-peeking", "is-antenna-sad", "is-following-target");
    pam.style.setProperty("--pam-head-peek", `${PAM_HEAD_PEEK}px`);
    pam.style.setProperty("--pam-body-left", "31px");
    pam.querySelector(".robot-head").style.left = `${18 - PAM_HEAD_PEEK}px`;
    pam.querySelector(".robot-antenna").setAttribute("aria-disabled", "true");
    startPamFollowing(pam, target, pamBounds, targetBounds);
  }

  function preparePamToHide(pam) {
    const pamState = robotStates.get(pam);
    if (pamState.hiddenBehind || pam.classList.contains("is-antenna-flat") || pamRescue.phase !== "idle") return;
    abortHelperPursuit(pam);

    pam.classList.add("is-antenna-flat", "is-heartbroken");
    pam.querySelector(".robot-antenna").setAttribute("aria-disabled", "true");
    const pamBounds = pam.getBoundingClientRect();
    const dodgeAngle = Math.random() * Math.PI * 2;
    const dodgeX = Math.cos(dodgeAngle) * PAM_ANTENNA_DODGE_DISTANCE;
    const dodgeY = Math.sin(dodgeAngle) * PAM_ANTENNA_DODGE_DISTANCE;
    const safeDodgeX = Math.max(-pamBounds.left, Math.min(window.innerWidth - pamBounds.right, dodgeX));
    const safeDodgeY = Math.max(-pamBounds.top, Math.min(window.innerHeight - pamBounds.bottom, dodgeY));
    const [currentX, currentY] = getRobotTranslate(pam);
    pam.classList.add("is-antenna-dodging");
    pam.style.setProperty("--pam-dodge-tilt", `${safeDodgeX < 0 ? -18 : 18}deg`);
    pam.style.setProperty("--dodge-x", `${currentX + safeDodgeX}px`);
    pam.style.setProperty("--dodge-y", `${currentY + safeDodgeY}px`);
    pamState.antennaExpressionTimer = window.setTimeout(() => {
      pamState.antennaExpressionTimer = null;
      pam.classList.remove("is-antenna-dodging");
      pam.style.removeProperty("--pam-dodge-tilt");
      pam.classList.remove("is-antenna-flat");
      hidePamBehindNearestRobot(pam);
    }, PAM_ANTENNA_HIDE_DELAY);
  }

  function cancelRobotAnimations(robot, keepDodge = false, keepBubble = false) {
    const robotState = robotStates.get(robot);
    const [x, y] = getRobotTranslate(robot);
    window.clearTimeout(robotState.penScootTimer);
    window.clearTimeout(robotState.returnTimer);
    window.clearTimeout(robotState.cleanupTimer);
    window.clearTimeout(robotState.factTimer);
    window.clearTimeout(robotState.arrivalTimer);
    window.clearTimeout(robotState.eyesTimer);
    window.clearTimeout(robotState.mouthTimer);
    window.clearTimeout(robotState.dizzyTimer);
    window.clearTimeout(robotState.shakeTimer);
    window.clearTimeout(robotState.shakeEyesTimer);
    window.cancelAnimationFrame(robotState.dizzyFrame);
    robotState.returnTimer = null;
    robotState.penScootTimer = null;
    robotState.cleanupTimer = null;
    robotState.factTimer = null;
    robotState.arrivalTimer = null;
    robotState.eyesTimer = null;
    robotState.mouthTimer = null;
    robotState.dizzyTimer = null;
    robotState.dizzyFrame = null;
    robotState.shakeTimer = null;
    robotState.shakeEyesTimer = null;
    setPamHeadBop(robot, false);
    robot.classList.remove("is-dragging", "is-eyes-closed", "is-mouth-changed", "is-mouth-flat", "is-pen-dragging-expression", "is-dizzy", "is-head-shaking", "is-head-shake-eyes");
    if (!keepDodge) robot.classList.remove("is-dodging");
    robotState.destinationReached = false;
    robotState.isReturning = false;
    robot.style.setProperty("--dodge-x", `${x}px`);
    robot.style.setProperty("--dodge-y", `${y}px`);
    if (robotFactOwner === robot && !keepBubble) {
      robotFactBubble.hidden = true;
      robotFactOwner = null;
    }
    return [x, y];
  }

  function scheduleRobotReturn(robot, delay = 5000) {
    const robotState = robotStates.get(robot);
    window.clearTimeout(robotState.returnTimer);
    window.clearTimeout(robotState.cleanupTimer);
    if (!robot.classList.contains("is-dodging") || robotState.penCursorPursuitActive) return;
    robotState.returnTimer = window.setTimeout(() => {
      window.clearTimeout(robotState.arrivalTimer);
      robotState.arrivalTimer = null;
      robotState.destinationReached = false;
      window.clearTimeout(robotState.eyesTimer);
      robotState.eyesTimer = null;
      robot.classList.remove("is-eyes-closed");
      window.clearTimeout(robotState.mouthTimer);
      robotState.mouthTimer = null;
      robot.classList.remove("is-mouth-changed");
      robotState.isReturning = true;
      robot.style.setProperty("--dodge-x", "0px");
      robot.style.setProperty("--dodge-y", "0px");
      robotState.cleanupTimer = window.setTimeout(() => {
        robot.classList.remove("is-dodging");
        robot.style.removeProperty("--dodge-x");
        robot.style.removeProperty("--dodge-y");
        if (robot.classList.contains("robot-mint")) {
          robot.classList.remove("is-pen-dragging-expression");
        }
        robotState.cleanupTimer = null;
      }, 700);
    }, delay);
  }

  function finishRobotArrival(robot) {
    const robotState = robotStates.get(robot);
    window.clearTimeout(robotState.arrivalTimer);
    robotState.arrivalTimer = null;
    if (!robot.classList.contains("is-dodging") || robotState.isReturning || robotState.destinationReached || robotState.penCursorPursuitActive) return;

    robotState.destinationReached = true;
    robotState.mouthTimer = window.setTimeout(() => {
      robot.classList.remove("is-mouth-changed");
      robotState.mouthTimer = null;
    }, 1);
  }

  async function playRobotOuch() {
    const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextConstructor) return;
    if (!robotAudioContext) robotAudioContext = new AudioContextConstructor();
    if (robotAudioContext.state === "suspended") await robotAudioContext.resume();

    const now = robotAudioContext.currentTime;
    const duration = 0.15;
    const cutoff = duration - 0.015;
    const sound = robotAudioContext.createGain();
    sound.gain.setValueAtTime(0.0001, now);
    sound.gain.exponentialRampToValueAtTime(0.3, now + 0.035);
    sound.gain.setTargetAtTime(0.17, now + 0.11, 0.07);
    sound.gain.setValueAtTime(0.17, now + cutoff);
    sound.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    sound.connect(robotAudioContext.destination);

    const voice = robotAudioContext.createOscillator();
    voice.type = "sawtooth";
    voice.frequency.setValueAtTime(680, now);
    voice.frequency.exponentialRampToValueAtTime(980, now + 0.12);
    voice.frequency.exponentialRampToValueAtTime(800, now + cutoff);

    [[780, 430, 0.65], [1350, 2150, 0.3]].forEach(([start, end, volume]) => {
      const formant = robotAudioContext.createBiquadFilter();
      formant.type = "bandpass";
      formant.frequency.setValueAtTime(start, now);
      formant.frequency.exponentialRampToValueAtTime(end, now + duration);
      formant.Q.value = 4;
      const formantGain = robotAudioContext.createGain();
      formantGain.gain.value = volume;
      voice.connect(formant);
      formant.connect(formantGain);
      formantGain.connect(sound);
    });
    voice.start(now);
    voice.stop(now + duration + 0.02);
  }

  async function startPamDizzySound(robot) {
    const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextConstructor) return;
    if (!robotAudioContext) robotAudioContext = new AudioContextConstructor();
    if (robotAudioContext.state === "suspended") await robotAudioContext.resume();
    const robotState = robotStates.get(robot);
    if (!robot.classList.contains("is-dragging") || robotState.dizzySound) return;

    const now = robotAudioContext.currentTime;
    const sound = robotAudioContext.createGain();
    sound.gain.setValueAtTime(0.0001, now);
    sound.gain.exponentialRampToValueAtTime(0.16, now + 0.045);
    sound.connect(robotAudioContext.destination);

    const voice = robotAudioContext.createOscillator();
    voice.type = "sawtooth";
    voice.frequency.setValueAtTime(420, now);
    voice.frequency.linearRampToValueAtTime(540, now + 0.18);

    const vibrato = robotAudioContext.createOscillator();
    const vibratoGain = robotAudioContext.createGain();
    vibrato.frequency.value = 4.5;
    vibratoGain.gain.value = 32;
    vibrato.connect(vibratoGain);
    vibratoGain.connect(voice.frequency);

    [[720, 0.7], [1180, 0.28]].forEach(([frequency, volume]) => {
      const formant = robotAudioContext.createBiquadFilter();
      formant.type = "bandpass";
      formant.frequency.value = frequency;
      formant.Q.value = 3;
      const formantGain = robotAudioContext.createGain();
      formantGain.gain.value = volume;
      voice.connect(formant);
      formant.connect(formantGain);
      formantGain.connect(sound);
    });
    voice.start(now);
    vibrato.start(now);
    robotState.dizzySound = { voice, vibrato, gain: sound.gain };
  }

  function stopPamDizzySound(robot) {
    const robotState = robotStates.get(robot);
    const sound = robotState.dizzySound;
    if (!sound) return;

    const now = robotAudioContext.currentTime;
    sound.gain.cancelScheduledValues(now);
    sound.gain.setTargetAtTime(0.0001, now, 0.025);
    sound.voice.stop(now + 0.12);
    sound.vibrato.stop(now + 0.12);
    robotState.dizzySound = null;
  }

  async function playRobotDing() {
    const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextConstructor) return;
    if (!robotAudioContext) robotAudioContext = new AudioContextConstructor();
    if (robotAudioContext.state === "suspended") await robotAudioContext.resume();

    const now = robotAudioContext.currentTime;
    const duration = 0.40;
    const sound = robotAudioContext.createGain();
    sound.gain.setValueAtTime(0.0001, now);
    sound.gain.exponentialRampToValueAtTime(0.3, now + 0.008);
    sound.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    sound.connect(robotAudioContext.destination);

    [880, 1760].forEach((frequency, index) => {
      const voice = robotAudioContext.createOscillator();
      const partial = robotAudioContext.createGain();
      voice.type = "sine";
      voice.frequency.setValueAtTime(frequency, now);
      partial.gain.value = index === 0 ? 1 : 0.28;
      voice.connect(partial);
      partial.connect(sound);
      voice.start(now);
      voice.stop(now + duration + 0.02);
    });
  }

  function moveDanAwayFromCursor(dan) {
    const danState = robotStates.get(dan);
    if (!danState.danCursorAvoidanceActive) return;
    const now = performance.now();
    const deltaTime = Math.min(0.05, Math.max(0.001, (now - (danState.danCursorFrameTime ?? now)) / 1000));
    danState.danCursorFrameTime = now;
    const motionDecay = Math.exp(-deltaTime / 0.24);
    danState.danCursorMotionX *= motionDecay;
    danState.danCursorMotionY *= motionDecay;

    const bounds = dan.getBoundingClientRect();
    const centerX = bounds.left + bounds.width / 2;
    const centerY = bounds.top + bounds.height / 2;
    let targetSpeed = 0;
    let desiredX = 0;
    let desiredY = 0;
    const touchDangerActive = danState.danCursorInputMode === "touch" &&
      danState.danTouchDangerUntil > now;
    if (touchDangerActive || danState.danTouchBurstActive) {
      const dangerX = danState.danTouchDangerX ?? centerX;
      const dangerY = danState.danTouchDangerY ?? centerY;
      const touchAwayX = centerX - dangerX;
      const touchAwayY = centerY - dangerY;
      const touchDistance = Math.hypot(touchAwayX, touchAwayY);
      let awayX = touchDistance > 0 ? touchAwayX / touchDistance : 0;
      let awayY = touchDistance > 0 ? touchAwayY / touchDistance : 0;

      if (danState.danTouchBurstActive) {
        const progress = (now - danState.danTouchBurstStartTime) / DAN_TOUCH_BURST_DURATION;
        if (progress >= 1) {
          danState.danTouchBurstActive = false;
          dan.classList.remove("is-cursor-escaping");
        } else {
          targetSpeed = DAN_TOUCH_BURST_MAX_SPEED * (1 - progress) ** 2;
          awayX = danState.danTouchBurstDirectionX;
          awayY = danState.danTouchBurstDirectionY;
        }
      }

      if (touchDangerActive && !danState.danTouchBurstActive && touchDistance > 0) {
        const distanceRatio = Math.min(1, touchDistance / DAN_TOUCH_DANGER_FALLOFF);
        targetSpeed = Math.max(
          DAN_TOUCH_MINIMUM_SPEED,
          DAN_CURSOR_AVOIDANCE_MAX_SPEED * (1 - distanceRatio)
        );
      }

      if (touchDistance === 0 && !danState.danTouchBurstActive) {
        const margin = 20;
        const directions = [
          { x: 1, y: 0, space: window.innerWidth - margin - bounds.right },
          { x: -1, y: 0, space: bounds.left - margin },
          { x: 0, y: 1, space: window.innerHeight - margin - bounds.bottom },
          { x: 0, y: -1, space: bounds.top - margin }
        ];
        const safestDirection = directions.reduce((best, direction) =>
          direction.space > best.space ? direction : best
        );
        awayX = safestDirection.x;
        awayY = safestDirection.y;
      }

      const margin = 20;
      const edgeRange = 90;
      const leftGap = bounds.left - margin;
      const rightGap = window.innerWidth - margin - bounds.right;
      const topGap = bounds.top - margin;
      const bottomGap = window.innerHeight - margin - bounds.bottom;
      const edgeX = Math.max(0, 1 - leftGap / edgeRange) -
        Math.max(0, 1 - rightGap / edgeRange);
      const edgeY = Math.max(0, 1 - topGap / edgeRange) -
        Math.max(0, 1 - bottomGap / edgeRange);
      desiredX = awayX + edgeX * 2.2;
      desiredY = awayY + edgeY * 2.2;
      const desiredLength = Math.hypot(desiredX, desiredY);
      if (desiredLength > 0) {
        desiredX /= desiredLength;
        desiredY /= desiredLength;
      }
    } else if (danState.danCursorInputMode === "cursor" &&
        danState.danCursorX !== null && danState.danCursorY !== null) {
      const cursorToDanX = centerX - danState.danCursorX;
      const cursorToDanY = centerY - danState.danCursorY;
      const cursorDistance = Math.hypot(cursorToDanX, cursorToDanY);
      if (cursorDistance > DAN_CURSOR_ESCAPE_REARM_DISTANCE) {
        danState.danCursorEmergencyEscapeArmed = true;
      }
      if (
        cursorDistance <= DAN_CURSOR_CATCH_DISTANCE &&
        danState.danCursorEmergencyEscapeArmed &&
        !danState.danCursorEmergencyEscapeActive
      ) {
        danState.danCursorEmergencyEscapeActive = true;
        danState.danCursorEmergencyEscapeArmed = false;
        danState.danCursorEmergencyEscapeUntil = now + DAN_CURSOR_EMERGENCY_ESCAPE_DURATION;
        dan.classList.add("is-cursor-escaping");
      }
      if (
        danState.danCursorEmergencyEscapeActive &&
        now >= danState.danCursorEmergencyEscapeUntil
      ) {
        danState.danCursorEmergencyEscapeActive = false;
        dan.classList.remove("is-cursor-escaping");
      }
      if (
        cursorDistance < DAN_CURSOR_AVOIDANCE_DISTANCE ||
        danState.danCursorEmergencyEscapeActive
      ) {
        const awayX = cursorDistance > 0 ? cursorToDanX / cursorDistance : 1;
        const awayY = cursorDistance > 0 ? cursorToDanY / cursorDistance : 0;
        const approachSpeed = Math.max(
          0,
          danState.danCursorMotionX * awayX + danState.danCursorMotionY * awayY
        );
        targetSpeed = Math.min(DAN_CURSOR_AVOIDANCE_MAX_SPEED, approachSpeed * 0.75);
        if (approachSpeed > 5) targetSpeed = Math.max(24, targetSpeed);
        if (danState.danCursorEmergencyEscapeActive) {
          targetSpeed = DAN_CURSOR_EMERGENCY_ESCAPE_MAX_SPEED;
        }

        const predictionTime = Math.min(0.18, 100 / Math.max(100, Math.hypot(
          danState.danCursorMotionX,
          danState.danCursorMotionY
        )));
        let predictedAwayX = centerX - (
          danState.danCursorX + danState.danCursorMotionX * predictionTime
        );
        let predictedAwayY = centerY - (
          danState.danCursorY + danState.danCursorMotionY * predictionTime
        );
        const predictedDistance = Math.hypot(predictedAwayX, predictedAwayY);
        if (predictedDistance > 0) {
          predictedAwayX /= predictedDistance;
          predictedAwayY /= predictedDistance;
        } else {
          predictedAwayX = awayX;
          predictedAwayY = awayY;
        }
        predictedAwayX = awayX * 0.7 + predictedAwayX * 0.3;
        predictedAwayY = awayY * 0.7 + predictedAwayY * 0.3;
        const blendedDistance = Math.hypot(predictedAwayX, predictedAwayY);
        predictedAwayX /= blendedDistance;
        predictedAwayY /= blendedDistance;

        const margin = 20;
        const edgeRange = 90;
        const leftGap = bounds.left - margin;
        const rightGap = window.innerWidth - margin - bounds.right;
        const topGap = bounds.top - margin;
        const bottomGap = window.innerHeight - margin - bounds.bottom;
        const edgeX = Math.max(0, 1 - leftGap / edgeRange) -
          Math.max(0, 1 - rightGap / edgeRange);
        const edgeY = Math.max(0, 1 - topGap / edgeRange) -
          Math.max(0, 1 - bottomGap / edgeRange);
        desiredX = predictedAwayX + edgeX * 2.2;
        desiredY = predictedAwayY + edgeY * 2.2;
        const desiredLength = Math.hypot(desiredX, desiredY);
        if (desiredLength > 0) {
          desiredX /= desiredLength;
          desiredY /= desiredLength;
        }
      }
    }

    const desiredVelocityX = desiredX * targetSpeed;
    const desiredVelocityY = desiredY * targetSpeed;
    let velocityDeltaX = desiredVelocityX - danState.danAvoidanceVelocityX;
    let velocityDeltaY = desiredVelocityY - danState.danAvoidanceVelocityY;
    const velocityDeltaLength = Math.hypot(velocityDeltaX, velocityDeltaY);
    const isEmergencyEscape =
      danState.danCursorEmergencyEscapeActive || danState.danTouchBurstActive;
    const maxAcceleration = (targetSpeed > 0
      ? isEmergencyEscape
        ? DAN_CURSOR_EMERGENCY_ESCAPE_ACCELERATION
        : DAN_CURSOR_AVOIDANCE_ACCELERATION
      : DAN_CURSOR_AVOIDANCE_DECELERATION) * deltaTime;
    if (velocityDeltaLength > maxAcceleration) {
      velocityDeltaX = velocityDeltaX / velocityDeltaLength * maxAcceleration;
      velocityDeltaY = velocityDeltaY / velocityDeltaLength * maxAcceleration;
    }
    danState.danAvoidanceVelocityX += velocityDeltaX;
    danState.danAvoidanceVelocityY += velocityDeltaY;

    const margin = 20;
    const maxLeft = Math.max(margin, window.innerWidth - bounds.width - margin);
    const maxTop = Math.max(margin, window.innerHeight - bounds.height - margin);
    const nextLeft = Math.max(margin, Math.min(maxLeft, bounds.left + danState.danAvoidanceVelocityX * deltaTime));
    const nextTop = Math.max(margin, Math.min(maxTop, bounds.top + danState.danAvoidanceVelocityY * deltaTime));
    if (nextLeft === margin && danState.danAvoidanceVelocityX < 0 ||
        nextLeft === maxLeft && danState.danAvoidanceVelocityX > 0) {
      danState.danAvoidanceVelocityX = 0;
    }
    if (nextTop === margin && danState.danAvoidanceVelocityY < 0 ||
        nextTop === maxTop && danState.danAvoidanceVelocityY > 0) {
      danState.danAvoidanceVelocityY = 0;
    }
    const deltaX = nextLeft - bounds.left;
    const deltaY = nextTop - bounds.top;
    updateDanCursorExpression(dan, Math.hypot(deltaX, deltaY) > 0.01);
    const transform = new DOMMatrixReadOnly(getComputedStyle(dan).transform);
    const determinant = transform.a * transform.d - transform.b * transform.c;
    const translateX = (deltaX * transform.d - deltaY * transform.c) / determinant;
    const translateY = (deltaY * transform.a - deltaX * transform.b) / determinant;
    const [currentX, currentY] = getRobotTranslate(dan);
    dan.style.setProperty("--dodge-x", `${currentX + translateX}px`);
    dan.style.setProperty("--dodge-y", `${currentY + translateY}px`);
    danState.danCursorAvoidanceFrame = window.requestAnimationFrame(() => moveDanAwayFromCursor(dan));
  }

  function updateDanCursorExpression(dan, isRunning) {
    const danState = robotStates.get(dan);
    if (isRunning) danState.danCursorHasRun = true;
    const wasRunning = dan.classList.contains("is-cursor-running");
    dan.classList.toggle("is-cursor-running", isRunning);
    dan.classList.toggle("is-cursor-smirking", !isRunning && danState.danCursorHasRun);
    if (!wasRunning && isRunning) {
      if (dan.classList.contains("is-eyebrow-raised") && danState.eyebrowTimer !== null) {
        dan.classList.remove("is-eyebrow-raised");
        danState.danEyebrowSuppressedByRun = true;
      }
    } else if (wasRunning && !isRunning) {
      if (danState.danEyebrowSuppressedByRun) {
        danState.danEyebrowSuppressedByRun = false;
        if (danState.eyebrowTimer !== null) {
          dan.classList.add("is-eyebrow-raised");
        }
      }
    }
  }

  function recordDanTouchDanger(dan, event) {
    const danState = robotStates.get(dan);
    const now = performance.now();
    const bounds = dan.getBoundingClientRect();
    const centerX = bounds.left + bounds.width / 2;
    const centerY = bounds.top + bounds.height / 2;
    const awayX = centerX - event.clientX;
    const awayY = centerY - event.clientY;
    const distance = Math.hypot(awayX, awayY);

    danState.danCursorInputMode = "touch";
    danState.danTouchDangerX = event.clientX;
    danState.danTouchDangerY = event.clientY;
    danState.danTouchDangerUntil = now + DAN_TOUCH_DANGER_DURATION;

    if (distance > DAN_TOUCH_HIT_RADIUS || danState.danTouchBurstActive) return;

    if (distance > 0) {
      danState.danTouchBurstDirectionX = awayX / distance;
      danState.danTouchBurstDirectionY = awayY / distance;
    } else {
      const margin = 20;
      const directions = [
        { x: 1, y: 0, space: window.innerWidth - margin - bounds.right },
        { x: -1, y: 0, space: bounds.left - margin },
        { x: 0, y: 1, space: window.innerHeight - margin - bounds.bottom },
        { x: 0, y: -1, space: bounds.top - margin }
      ];
      const safestDirection = directions.reduce((best, direction) =>
        direction.space > best.space ? direction : best
      );
      danState.danTouchBurstDirectionX = safestDirection.x;
      danState.danTouchBurstDirectionY = safestDirection.y;
    }

    danState.danTouchBurstActive = true;
    danState.danTouchBurstStartTime = now;
    dan.classList.add("is-cursor-escaping");
  }

  function handleDanTouchTap(event) {
    const dan = document.querySelector(".robot-blue");
    const danState = robotStates.get(dan);
    if (!danState.danCursorAvoidanceActive || event.pointerType !== "touch" || !event.isPrimary) return;

    const target = event.target instanceof Element ? event.target : null;
    if (target?.closest(".robot-blue .robot-face, .robot-blue .robot-body")) return;
    recordDanTouchDanger(dan, event);
  }

  function stopDanCursorAvoidance(dan, returnToLayout = false) {
    const danState = robotStates.get(dan);
    if (!danState.danCursorAvoidanceActive) return;
    window.clearTimeout(danState.danCursorAvoidanceTimer);
    window.cancelAnimationFrame(danState.danCursorAvoidanceFrame);
    window.clearTimeout(danState.danBodyClickTimer);
    danState.danCursorAvoidanceTimer = null;
    danState.danCursorAvoidanceFrame = null;
    danState.danBodyClickTimer = null;
    danState.danCursorAvoidanceActive = false;
    danState.danBodyClickCount = 0;
    danState.danCursorFrameTime = null;
    danState.danAvoidanceVelocityX = 0;
    danState.danAvoidanceVelocityY = 0;
    danState.danCursorEmergencyEscapeActive = false;
    danState.danCursorEmergencyEscapeArmed = true;
    danState.danCursorEmergencyEscapeUntil = 0;
    danState.danCursorHasRun = false;
    danState.danTouchDangerUntil = 0;
    danState.danTouchBurstActive = false;
    updateDanCursorExpression(dan, false);
    dan.classList.remove("is-cursor-avoiding", "is-cursor-escaping");
    if (!returnToLayout) return;
    dan.style.setProperty("--dodge-x", "0px");
    dan.style.setProperty("--dodge-y", "0px");
    danState.cleanupTimer = window.setTimeout(() => {
      if (!danState.danCursorAvoidanceActive) {
        dan.style.removeProperty("--dodge-x");
        dan.style.removeProperty("--dodge-y");
      }
      danState.cleanupTimer = null;
    }, 700);
  }

  function startDanCursorAvoidance(dan) {
    const danState = robotStates.get(dan);
    if (danState.danCursorAvoidanceActive) return;
    cancelRobotAnimations(dan);
    danState.danCursorAvoidanceActive = true;
    danState.danCursorHasRun = false;
    danState.danTouchDangerUntil = 0;
    danState.danTouchBurstActive = false;
    updateDanCursorExpression(dan, false);
    danState.danCursorFrameTime = performance.now();
    danState.danAvoidanceVelocityX = 0;
    danState.danAvoidanceVelocityY = 0;
    danState.danCursorEmergencyEscapeActive = false;
    danState.danCursorEmergencyEscapeArmed = true;
    danState.danCursorEmergencyEscapeUntil = 0;
    dan.classList.add("is-cursor-avoiding");
    danState.danCursorAvoidanceFrame = window.requestAnimationFrame(() => moveDanAwayFromCursor(dan));
    danState.danCursorAvoidanceTimer = window.setTimeout(() => {
      stopDanCursorAvoidance(dan, true);
    }, DAN_CURSOR_AVOIDANCE_DURATION);
  }

  function registerDanBodyClick(dan) {
    const danState = robotStates.get(dan);
    danState.danBodyClickCount += 1;
    window.clearTimeout(danState.danBodyClickTimer);
    danState.danBodyClickTimer = window.setTimeout(() => {
      danState.danBodyClickCount = 0;
      danState.danBodyClickTimer = null;
    }, DAN_BODY_CLICK_RESET_DELAY);

    const bodyClickDialogues = {
      1: "Huh? Why did you click me?",
      3: "Wait... did you need something?",
      5: "You clicked me again! What do you want?",
      7: "Hey! Is there something I can help you with?",
      9: "Okay, please stop touching me!",
      10: "That's it! You're not touching me again!"
    };
    const message = bodyClickDialogues[danState.danBodyClickCount] || null;

    if (danState.danBodyClickCount >= 10) {
      startDanCursorAvoidance(dan);
      return { message, activatedAvoidance: true };
    }
    return { message, activatedAvoidance: false };
  }

  function dodgeRobot(robot, distanceScale = 1, useDefaultExpression = true, silent = false, keepBubble = false) {
    const robotState = robotStates.get(robot);
    if (robotState.hiddenBehind) return;
    if (!silent) {
      playRobotOuch().catch(error => console.warn("Could not play the robot sound.", error));
    }
    const [currentX, currentY] = cancelRobotAnimations(robot, false, keepBubble);
    if (useDefaultExpression) {
      robot.classList.add("is-eyes-closed", "is-mouth-changed");
      robotState.eyesTimer = window.setTimeout(() => {
        robot.classList.remove("is-eyes-closed");
        robotState.eyesTimer = null;
      }, ROBOT_EYE_SPIN_DURATION);
    }
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
    if (robotFactOwner === robot && !keepBubble) {
      window.clearTimeout(robotState.factTimer);
      robotState.factTimer = null;
      robotFactBubble.hidden = true;
      robotFactOwner = null;
    }
    const transform = new DOMMatrixReadOnly(getComputedStyle(robot).transform);
    const determinant = transform.a * transform.d - transform.b * transform.c;
    const deltaX = (destinationLeft - bounds.left) * distanceScale;
    const deltaY = (destinationTop - bounds.top) * distanceScale;
    const translateX = (deltaX * transform.d - deltaY * transform.c) / determinant;
    const translateY = (deltaY * transform.a - deltaX * transform.b) / determinant;
    robot.style.setProperty("--dodge-x", `${currentX + translateX}px`);
    robot.style.setProperty("--dodge-y", `${currentY + translateY}px`);
    robotState.arrivalTimer = window.setTimeout(() => finishRobotArrival(robot), 700);
    scheduleRobotReturn(robot);
  }

  // ---------------------------------------------------------------------------
  // Dan drag -> Pen chase -> capture / release interaction
  // ---------------------------------------------------------------------------
  function pickRandomLine(lines) {
    return lines[randomInteger(0, lines.length - 1)];
  }

  function isPamEscortLocked(robot) {
    return robot.classList.contains("robot-pink") &&
      (pamRescue.phase === "escorting" || pamRescue.phase === "returning");
  }

  function isDanChaseLocked(robot) {
    return (danChase.phase !== "idle" || pamRescue.phase !== "idle") &&
      (robot.classList.contains("robot-blue") || robot.classList.contains("robot-mint"));
  }

  function danChaseLater(callback, delay) {
    const id = window.setTimeout(() => {
      danChase.timers = danChase.timers.filter(timer => timer !== id);
      callback();
    }, delay);
    danChase.timers.push(id);
    return id;
  }

  function clearDanChaseTimers() {
    danChase.timers.forEach(timer => window.clearTimeout(timer));
    danChase.timers = [];
  }

  // Dialogue timers are kept apart so a short return still gets to speak its lines;
  // they are tied to a session id so a stale line can never leak into a later interaction.
  function danChaseSpeakLater(callback, delay) {
    const session = danChase.session;
    const id = window.setTimeout(() => {
      danChase.speechTimers = danChase.speechTimers.filter(timer => timer !== id);
      if (session === danChase.session) callback();
    }, delay);
    danChase.speechTimers.push(id);
  }

  function clearDanChaseSpeechTimers() {
    danChase.speechTimers.forEach(timer => window.clearTimeout(timer));
    danChase.speechTimers = [];
  }

  function getRobotCenter(robot) {
    const bounds = robot.getBoundingClientRect();
    return { x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 };
  }

  function suppressNextRobotClick(robot) {
    const robotState = robotStates.get(robot);
    robotState.clickSuppressed = true;
    window.clearTimeout(robotState.clickSuppressionTimer);
    robotState.clickSuppressionTimer = window.setTimeout(() => {
      robotState.clickSuppressed = false;
      robotState.clickSuppressionTimer = null;
    }, 0);
  }

  // Moves a robot's --dodge translate toward a screen-space target with acceleration limits.
  // `feed` is the target's own velocity so a moving target is tracked instead of trailed.
  function steerRobot(robot, velocity, target, feed, dt, maxSpeed, acceleration, gain) {
    const bounds = robot.getBoundingClientRect();
    const toX = target.x - (bounds.left + bounds.width / 2);
    const toY = target.y - (bounds.top + bounds.height / 2);
    const distance = Math.hypot(toX, toY);
    const feedLength = Math.hypot(feed.x, feed.y);
    const feedScale = feedLength > 900 ? 900 / feedLength : 1;
    const feedX = feed.x * feedScale;
    const feedY = feed.y * feedScale;
    let desiredX = feedX + toX * gain;
    let desiredY = feedY + toY * gain;
    const desiredSpeed = Math.hypot(desiredX, desiredY);
    if (desiredSpeed > maxSpeed) {
      desiredX = desiredX / desiredSpeed * maxSpeed;
      desiredY = desiredY / desiredSpeed * maxSpeed;
    }
    let deltaVX = desiredX - velocity.x;
    let deltaVY = desiredY - velocity.y;
    const deltaVLength = Math.hypot(deltaVX, deltaVY);
    const maxDeltaV = acceleration * dt;
    if (deltaVLength > maxDeltaV) {
      deltaVX = deltaVX / deltaVLength * maxDeltaV;
      deltaVY = deltaVY / deltaVLength * maxDeltaV;
    }
    velocity.x += deltaVX;
    velocity.y += deltaVY;
    let stepX = velocity.x * dt;
    let stepY = velocity.y * dt;
    const stepLength = Math.hypot(stepX, stepY);
    const stepLimit = distance + Math.hypot(feedX, feedY) * dt;
    if (stepLength > stepLimit && stepLength > 0) {
      stepX = stepX / stepLength * stepLimit;
      stepY = stepY / stepLength * stepLimit;
    }
    const [currentX, currentY] = getRobotTranslate(robot);
    robot.style.setProperty("--dodge-x", `${currentX + stepX}px`);
    robot.style.setProperty("--dodge-y", `${currentY + stepY}px`);
    return distance;
  }

  function startDanDragInteraction(dan, event) {
    const danState = robotStates.get(dan);
    const pen = document.querySelector(".robot-mint");
    const penState = robotStates.get(pen);
    cancelDanProtectiveReaction(dan);
    window.clearTimeout(danState.eyebrowTimer);
    danState.eyebrowTimer = null;
    dan.classList.remove("is-eyebrow-raised", "is-mouth-flat", "is-mouth-changed", "is-dizzy", "is-dan-caught");
    dan.classList.add("is-dan-mischievous", "is-dan-chase-active");
    clearDanChaseSpeechTimers();
    danChase.session += 1;
    danChase.phase = "dragging";
    danChase.penChasing = false;
    danChase.pointerId = event.pointerId;
    showRobotSpeech(dan, pickRandomLine(DAN_DRAG_LINES), 1800);

    // Pen only joins in if he is not already part of another special interaction.
    const penBusy = pen.classList.contains("is-permanently-angry") ||
      pen.classList.contains("is-raging") ||
      pen.classList.contains("is-dragging") ||
      penState.hiddenBehind ||
      penState.penCursorPursuitActive ||
      penCalming.helpers.size > 0;
    if (!penBusy) startPenChase(pen, dan);
  }

  function startPenChase(pen, dan) {
    cancelRobotAnimations(pen);
    pen.classList.remove("is-dodging", "is-pen-rage-returning", "is-dragging");
    pen.classList.add("is-pen-chasing-dan", "is-dan-chase-active");
    const face = pen.querySelector(".robot-face");
    const symbol = document.createElement("span");
    symbol.className = "pen-chase-symbol";
    symbol.setAttribute("aria-hidden", "true");
    symbol.textContent = "💢";
    face.append(symbol);
    danChase.symbol = symbol;
    danChase.penChasing = true;
    danChase.penVelocity = { x: 0, y: 0 };
    danChase.danMotion = { x: 0, y: 0 };
    const danCenter = getRobotCenter(dan);
    danChase.prevDanX = danCenter.x;
    danChase.prevDanY = danCenter.y;
    danChase.startTime = performance.now();
    danChase.frameTime = danChase.startTime;
    danChaseSpeakLater(() => {
      if (danChase.phase === "dragging" && danChase.penChasing) {
        showRobotSpeech(pen, pickRandomLine(PEN_ANNOYED_LINES), 2600);
      }
    }, 1800);
    danChase.frame = window.requestAnimationFrame(danChaseTick);
  }

  function danChaseTick() {
    danChase.frame = null;
    if (danChase.phase === "idle") return;
    const dan = document.querySelector(".robot-blue");
    const pen = document.querySelector(".robot-mint");
    const now = performance.now();
    const dt = Math.min(0.05, Math.max(0.001, (now - danChase.frameTime) / 1000));
    danChase.frameTime = now;
    const danCenter = getRobotCenter(dan);
    if (danChase.prevDanX !== null) {
      danChase.danMotion.x += ((danCenter.x - danChase.prevDanX) / dt - danChase.danMotion.x) * 0.35;
      danChase.danMotion.y += ((danCenter.y - danChase.prevDanY) / dt - danChase.danMotion.y) * 0.35;
    }
    danChase.prevDanX = danCenter.x;
    danChase.prevDanY = danCenter.y;

    if (danChase.phase === "dragging") {
      const elapsed = (now - danChase.startTime) / 1000;
      const maxSpeed = Math.min(DAN_CHASE_MAX_SPEED, DAN_CHASE_BASE_SPEED + DAN_CHASE_SPEED_RAMP * elapsed);
      steerRobot(pen, danChase.penVelocity, danCenter, danChase.danMotion, dt, maxSpeed, DAN_CHASE_ACCELERATION, DAN_CHASE_GAIN);
      const penCenter = getRobotCenter(pen);
      const toX = danCenter.x - penCenter.x;
      const toY = danCenter.y - penCenter.y;
      pen.style.setProperty("--pen-look-x", `${Math.max(-1, Math.min(1, toX / 150)) * 3}px`);
      if (Math.hypot(toX, toY) <= DAN_CHASE_CATCH_DISTANCE) catchDan(pen, dan);
    } else if (danChase.phase === "returning") {
      const [danTx, danTy] = getRobotTranslate(dan);
      const home = { x: danCenter.x - danTx, y: danCenter.y - danTy };
      const danDistance = steerRobot(dan, danChase.danVelocity, home, { x: 0, y: 0 }, dt,
        DAN_RETURN_SPEED, DAN_RETURN_ACCELERATION, DAN_RETURN_GAIN);
      const side = home.x + DAN_ESCORT_OFFSET > window.innerWidth - 70 ? -1 : 1;
      const slot = {
        x: Math.max(70, Math.min(window.innerWidth - 70, danCenter.x + side * DAN_ESCORT_OFFSET)),
        y: Math.max(70, Math.min(window.innerHeight - 70, danCenter.y))
      };
      steerRobot(pen, danChase.penVelocity, slot, danChase.danMotion, dt, 900, DAN_CHASE_ACCELERATION, 7);
      if (danDistance < 1.5 && Math.hypot(danChase.danVelocity.x, danChase.danVelocity.y) < 40) {
        dan.style.setProperty("--dodge-x", "0px");
        dan.style.setProperty("--dodge-y", "0px");
        dan.classList.remove("is-dan-caught", "is-dan-chase-active");
        danChase.phase = "penHoming";
      }
    } else if (danChase.phase === "penHoming") {
      const penCenter = getRobotCenter(pen);
      const [penTx, penTy] = getRobotTranslate(pen);
      const penHome = { x: penCenter.x - penTx, y: penCenter.y - penTy };
      const penDistance = steerRobot(pen, danChase.penVelocity, penHome, { x: 0, y: 0 }, dt,
        PEN_HOMING_SPEED, 2400, 4);
      pen.style.setProperty("--pen-look-x", "0px");
      if (penDistance < 1.5 && Math.hypot(danChase.penVelocity.x, danChase.penVelocity.y) < 40) {
        finishDanChase();
        return;
      }
    }
    if (danChase.phase !== "idle" && danChase.frame === null) {
      danChase.frame = window.requestAnimationFrame(danChaseTick);
    }
  }

  function catchDan(pen, dan) {
    if (danChase.phase !== "dragging") return; // blocks repeated catch events
    danChase.phase = "returning";
    // Forcibly end the user's drag even though the button / finger may still be down.
    if (robotDrag && robotDrag.robot === dan) robotDrag = null;
    try {
      if (danChase.pointerId !== null && dan.hasPointerCapture(danChase.pointerId)) {
        dan.releasePointerCapture(danChase.pointerId);
      }
    } catch (error) {
      console.warn("Could not release Dan's pointer capture.", error);
    }
    suppressNextRobotClick(dan);
    dan.classList.remove("is-dragging", "is-dan-mischievous");
    dan.classList.add("is-dan-caught", "is-dan-chase-active");
    danChase.danVelocity = { x: 0, y: 0 };
    danChase.danMotion = { x: 0, y: 0 };
    clearDanChaseTimers();
    showRobotSpeech(pen, pickRandomLine(PEN_CATCH_LINES), 2000);
    danChaseSpeakLater(() => showRobotSpeech(dan, pickRandomLine(DAN_CAUGHT_LINES), 2600), 2000);
    danChaseLater(() => {
      if (danChase.phase !== "idle") finishDanChase(); // safety net: never leave a stuck state
    }, DAN_CHASE_SAFETY_TIMEOUT);
  }

  // The user let go of Dan (pointerup / pointercancel / lost capture) before Pen caught her.
  function releaseDanDrag(dan) {
    const pen = document.querySelector(".robot-mint");
    const wasChasing = danChase.phase === "dragging" && danChase.penChasing;
    suppressNextRobotClick(dan);
    dan.classList.remove("is-dragging", "is-dan-mischievous", "is-dan-chase-active");
    if (danChase.phase !== "dragging") return;
    // Dropped before Pen caught her: Dan stays where she was dropped for 5 seconds, then goes back to her
    // original position (the same dodge-return Pam and Pen use). Grabbing her again cancels this return.
    dan.classList.add("is-dodging");
    scheduleRobotReturn(dan, DAN_DROPPED_RETURN_DELAY);
    if (!wasChasing) {
      resetDanChaseState();
      return;
    }
    stopDanChaseLoop();
    clearDanChaseSpeechTimers(); // cancels Pen's pending annoyed line
    removePenChaseExpression(pen);
    resetDanChaseState();
    // Pen gloats, then walks home via the normal dodge return.
    pen.classList.add("is-dodging");
    showRobotSpeech(pen, pickRandomLine(PEN_SMUG_LINES), 3500);
    scheduleRobotReturn(pen, 3800);
  }

  function stopDanChaseLoop() {
    window.cancelAnimationFrame(danChase.frame);
    danChase.frame = null;
    clearDanChaseTimers();
  }

  function removePenChaseExpression(pen) {
    pen.classList.remove("is-pen-chasing-dan", "is-dan-chase-active");
    pen.style.removeProperty("--pen-look-x");
    if (danChase.symbol) danChase.symbol.remove();
    pen.querySelectorAll(".pen-chase-symbol").forEach(symbol => symbol.remove());
    danChase.symbol = null;
  }

  function resetDanChaseState() {
    danChase.phase = "idle";
    danChase.penChasing = false;
    danChase.pointerId = null;
    danChase.penVelocity = { x: 0, y: 0 };
    danChase.danVelocity = { x: 0, y: 0 };
    danChase.danMotion = { x: 0, y: 0 };
    danChase.prevDanX = null;
    danChase.prevDanY = null;
  }

  // Both robots are home: restore normal states and cancel everything.
  function finishDanChase() {
    const dan = document.querySelector(".robot-blue");
    const pen = document.querySelector(".robot-mint");
    stopDanChaseLoop();
    [dan, pen].forEach(robot => {
      robot.style.setProperty("--dodge-x", "0px");
      robot.style.setProperty("--dodge-y", "0px");
    });
    void dan.offsetWidth; // commit the snap while transitions are still disabled
    dan.classList.remove("is-dan-caught", "is-dan-mischievous", "is-dan-chase-active", "is-dragging");
    removePenChaseExpression(pen);
    window.requestAnimationFrame(() => {
      if (danChase.phase !== "idle") return;
      [dan, pen].forEach(robot => {
        robot.style.removeProperty("--dodge-x");
        robot.style.removeProperty("--dodge-y");
      });
    });
    resetDanChaseState();
  }

  // ---------------------------------------------------------------------------
  // Pam drag -> Pen orders Dan to rescue -> Dan hangs on -> 5s escalation
  // The user's drag is never interrupted: Dan only follows Pam's live position.
  // ---------------------------------------------------------------------------
  function pamRescueLater(callback, delay) {
    const id = window.setTimeout(() => {
      pamRescue.timers = pamRescue.timers.filter(timer => timer !== id);
      callback();
    }, delay);
    pamRescue.timers.push(id);
  }

  function pamRescueSpeakLater(callback, delay) {
    const session = pamRescue.session;
    const id = window.setTimeout(() => {
      pamRescue.speechTimers = pamRescue.speechTimers.filter(timer => timer !== id);
      if (session === pamRescue.session) callback();
    }, delay);
    pamRescue.speechTimers.push(id);
  }

  function clearPamRescueTimers() {
    pamRescue.timers.forEach(timer => window.clearTimeout(timer));
    pamRescue.timers = [];
    window.clearTimeout(pamRescue.escalationTimer);
    pamRescue.escalationTimer = null;
  }

  function clearPamRescueSpeechTimers() {
    pamRescue.speechTimers.forEach(timer => window.clearTimeout(timer));
    pamRescue.speechTimers = [];
  }

  function addPenSymbol(pen, extraClass = "") {
    const symbol = document.createElement("span");
    symbol.className = `pen-chase-symbol ${extraClass}`.trim();
    symbol.setAttribute("aria-hidden", "true");
    symbol.textContent = "💢";
    pen.querySelector(".robot-face").append(symbol);
    return symbol;
  }

  function startPamRescue(pam, pointerId) {
    const dan = document.querySelector(".robot-blue");
    const pen = document.querySelector(".robot-mint");
    const danState = robotStates.get(dan);
    const penState = robotStates.get(pen);
    const penBusy = pen.classList.contains("is-permanently-angry") ||
      pen.classList.contains("is-raging") ||
      pen.classList.contains("is-dragging") ||
      penState.hiddenBehind ||
      penState.penCursorPursuitActive ||
      penCalming.helpers.size > 0 ||
      danChase.phase !== "idle";
    const danBusy = danState.danCursorAvoidanceActive ||
      danState.penPursuitFollowActive ||
      danState.hiddenBehind ||
      dan.classList.contains("is-dragging");
    if (penBusy || danBusy) return;

    if (pamRescue.phase === "waiting") {
      // The user grabbed Pam again while Dan was waiting: start a fresh hold, keeping Dan beside her.
      robotStates.get(pam).onHeadShakeComplete = null;
      clearPamRescueTimers();
      clearPamRescueSpeechTimers();
    } else if (pamRescue.phase !== "idle") {
      return;
    } else {
      // Fresh session: Dan leaves whatever idle reaction she was in.
      window.clearTimeout(danState.eyebrowTimer);
      danState.eyebrowTimer = null;
      cancelRobotAnimations(dan);
      dan.classList.remove("is-eyebrow-raised", "is-mouth-flat", "is-mouth-changed", "is-dodging");
      window.clearTimeout(penState.speechMouthTimer);
      penState.speechMouthTimer = null;
      pen.classList.remove("is-eyes-closed", "is-mouth-flat");
    }

    pamRescue.session += 1;
    pamRescue.phase = "holding";
    pamRescue.escalated = false;
    pamRescue.forced = false;
    pamRescue.pointerId = pointerId;
    pamRescue.attached = false;
    pamRescue.danVelocity = { x: 0, y: 0 };
    pamRescue.pamMotion = { x: 0, y: 0 };
    const pamCenter = getRobotCenter(pam);
    const danCenter = getRobotCenter(dan);
    pamRescue.side = danCenter.x >= pamCenter.x ? 1 : -1;
    pamRescue.prevPamX = pamCenter.x;
    pamRescue.prevPamY = pamCenter.y;
    pamRescue.frameTime = performance.now();
    pamRescue.escalationStart = pamRescue.frameTime;

    // Pen reacts exactly once per drag session.
    pen.classList.remove("is-pen-pam-pursuit");
    pen.classList.add("is-pen-annoyed");
    pen.querySelectorAll(".pen-chase-symbol").forEach(symbol => symbol.remove());
    addPenSymbol(pen);
    showRobotSpeech(pen, pickRandomLine(PEN_PAM_DRAG_LINES), 2500);
    dan.classList.add("is-dan-rescuing", "is-pam-rescue-active");
    pamRescueSpeakLater(() => {
      if (pamRescue.phase === "holding" && !pamRescue.escalated) {
        showRobotSpeech(dan, pickRandomLine(DAN_RESCUE_LINES), 2500);
      }
    }, 2500);

    // One escalation timer per continuous grip.
    pamRescue.escalationTimer = window.setTimeout(escalatePamRescue, PAM_RESCUE_ESCALATION_MS);
    // No safety timeout while the user holds Pam: a long grip must never be cut short.
    if (pamRescue.frame === null) pamRescue.frame = window.requestAnimationFrame(pamRescueTick);
  }

  function escalatePamRescue() {
    pamRescue.escalationTimer = null;
    if (pamRescue.phase !== "holding" || pamRescue.escalated) return;
    const pen = document.querySelector(".robot-mint");
    pamRescue.escalated = true;
    pamRescue.penDisplaced = true; // Pen has left home, so he must be sent back at the end
    pamRescue.escalationStart = performance.now();
    pamRescue.penVelocity = { x: 0, y: 0 };
    cancelRobotAnimations(pen);
    pen.classList.remove("is-dodging", "is-pen-rage-returning");
    pen.classList.add("is-pen-annoyed", "is-pen-pam-pursuit", "is-pam-rescue-active");
    addPenSymbol(pen, "is-second");
    showRobotSpeech(pen, pickRandomLine(PEN_ESCALATION_LINES), 2800);
  }

  // Where Dan (beside Pam) and Pen (on Pam's other side) should be, given Pam's live position.
  function getPamRescueSlots(pamCenter) {
    const margin = 62;
    let danSide = pamRescue.side;
    const danX = pamCenter.x + danSide * PAM_RESCUE_ATTACH_OFFSET;
    if (danX < margin || danX > window.innerWidth - margin) danSide = -danSide;
    const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
    const danSlot = {
      x: clamp(pamCenter.x + danSide * PAM_RESCUE_ATTACH_OFFSET, margin, window.innerWidth - margin),
      y: clamp(pamCenter.y, 70, window.innerHeight - 70)
    };
    let penSlot = { x: pamCenter.x - danSide * PAM_RESCUE_PEN_OFFSET, y: pamCenter.y };
    if (penSlot.x < margin || penSlot.x > window.innerWidth - margin) {
      penSlot = { x: pamCenter.x, y: pamCenter.y - 145 };
    }
    penSlot = {
      x: clamp(penSlot.x, margin, window.innerWidth - margin),
      y: clamp(penSlot.y, 70, window.innerHeight - 70)
    };
    return { danSlot, penSlot, danSide };
  }

  function pamRescueTick() {
    pamRescue.frame = null;
    if (pamRescue.phase === "idle") return;
    const pam = document.querySelector(".robot-pink");
    const dan = document.querySelector(".robot-blue");
    const pen = document.querySelector(".robot-mint");
    const now = performance.now();
    const dt = Math.min(0.05, Math.max(0.001, (now - pamRescue.frameTime) / 1000));
    pamRescue.frameTime = now;
    const pamCenter = getRobotCenter(pam);
    if (pamRescue.prevPamX !== null) {
      pamRescue.pamMotion.x += ((pamCenter.x - pamRescue.prevPamX) / dt - pamRescue.pamMotion.x) * 0.35;
      pamRescue.pamMotion.y += ((pamCenter.y - pamRescue.prevPamY) / dt - pamRescue.pamMotion.y) * 0.35;
    }
    pamRescue.prevPamX = pamCenter.x;
    pamRescue.prevPamY = pamCenter.y;
    const noMotion = { x: 0, y: 0 };
    const penFollows = pamRescue.escalated ||
      (pamRescue.penDisplaced && (pamRescue.phase === "escorting" || pamRescue.phase === "returning"));
    const lookAtPam = () => {
      const penCenter = getRobotCenter(pen);
      pen.style.setProperty("--pen-look-x", `${Math.max(-1, Math.min(1, (pamCenter.x - penCenter.x) / 150)) * 3}px`);
    };

    if (pamRescue.phase === "holding" || pamRescue.phase === "waiting") {
      const holding = pamRescue.phase === "holding";
      const { danSlot, penSlot, danSide } = getPamRescueSlots(pamCenter);
      const danDistance = steerRobot(dan, pamRescue.danVelocity, danSlot,
        holding ? pamRescue.pamMotion : noMotion, dt, 950, 5200, 7);
      dan.style.setProperty("--dan-lean", `${-danSide * 8}deg`);
      if (holding && !pamRescue.attached && danDistance < 18) pamRescue.attached = true;
      if (penFollows) {
        const elapsed = (now - pamRescue.escalationStart) / 1000;
        const maxSpeed = Math.min(1150, 650 + 220 * elapsed);
        steerRobot(pen, pamRescue.penVelocity, penSlot, holding ? pamRescue.pamMotion : noMotion,
          dt, maxSpeed, 4800, 6);
        lookAtPam();
        // Pen has caught up with Pam: he forcibly ends the user's grip.
        if (holding && !pamRescue.forced) {
          const penCenter = getRobotCenter(pen);
          if (Math.hypot(pamCenter.x - penCenter.x, pamCenter.y - penCenter.y) <= PAM_RESCUE_PEN_GRAB_DISTANCE) {
            penTakePamFromUser(pam);
          }
        }
      }
    } else if (pamRescue.phase === "escorting") {
      const [pamTx, pamTy] = getRobotTranslate(pam);
      const pamHome = { x: pamCenter.x - pamTx, y: pamCenter.y - pamTy };
      const pamDistance = steerRobot(pam, pamRescue.pamVelocity, pamHome, noMotion, dt, 380, 1600, 3);
      const { danSlot, penSlot, danSide } = getPamRescueSlots(pamCenter);
      steerRobot(dan, pamRescue.danVelocity, danSlot, pamRescue.pamMotion, dt, 950, 5200, 7);
      dan.style.setProperty("--dan-lean", `${-danSide * 3}deg`);
      if (penFollows) {
        steerRobot(pen, pamRescue.penVelocity, penSlot, pamRescue.pamMotion, dt, 950, 4800, 6);
        lookAtPam();
      }
      if (pamDistance < 1.5 && Math.hypot(pamRescue.pamVelocity.x, pamRescue.pamVelocity.y) < 40) {
        pam.style.setProperty("--dodge-x", "0px");
        pam.style.setProperty("--dodge-y", "0px");
        pam.classList.remove("is-dodging", "is-pam-rescue-active");
        pamRescue.arrived = { pam: true, dan: false, pen: !penFollows };
        pamRescue.phase = "returning";
        pamRescue.danVelocity = { x: 0, y: 0 };
        pamRescue.penVelocity = { x: 0, y: 0 };
      }
    } else if (pamRescue.phase === "returning") {
      const goHome = (robot, velocity, key, speed) => {
        if (pamRescue.arrived[key]) return;
        const center = getRobotCenter(robot);
        const [tx, ty] = getRobotTranslate(robot);
        const distance = steerRobot(robot, velocity, { x: center.x - tx, y: center.y - ty }, noMotion, dt, speed, 2400, 4);
        if (distance < 1.5 && Math.hypot(velocity.x, velocity.y) < 40) {
          robot.style.setProperty("--dodge-x", "0px");
          robot.style.setProperty("--dodge-y", "0px");
          pamRescue.arrived[key] = true;
        }
      };
      goHome(dan, pamRescue.danVelocity, "dan", 520);
      if (penFollows) {
        goHome(pen, pamRescue.penVelocity, "pen", 520);
        pen.style.setProperty("--pen-look-x", "0px");
      }
      if (pamRescue.arrived.dan && pamRescue.arrived.pen) {
        finishPamRescue();
        return;
      }
    }
    if (pamRescue.phase !== "idle" && pamRescue.frame === null) {
      pamRescue.frame = window.requestAnimationFrame(pamRescueTick);
    }
  }

  // Pen reaches Pam during the escalation and forcibly ends the user's grip, even though the
  // button / finger may still be down. This goes through the normal release path, so Pam gets her
  // usual dizzy + head-shake sequence and Dan waits for it before the escort begins.
  function penTakePamFromUser(pam) {
    if (pamRescue.phase !== "holding" || !pamRescue.escalated || pamRescue.forced) return; // once only
    if (!robotDrag || robotDrag.robot !== pam) return;
    pamRescue.forced = true;
    const pointerId = pamRescue.pointerId;
    finishRobotDrag(); // ends the drag record, so no further pointer movement can move Pam
    try {
      if (pointerId !== null && pam.hasPointerCapture(pointerId)) pam.releasePointerCapture(pointerId);
    } catch (error) {
      console.warn("Could not release Pam's pointer capture.", error);
    }
    // The user is probably still holding: swallow the click their eventual release would cause on Pam.
    const swallowClick = () => {
      window.removeEventListener("pointerup", swallowClick, true);
      window.removeEventListener("pointercancel", swallowClick, true);
      suppressNextRobotClick(pam);
    };
    window.addEventListener("pointerup", swallowClick, true);
    window.addEventListener("pointercancel", swallowClick, true);
  }

  // The user let go of Pam. Dan stops holding and waits for Pam's head-shake to finish.
  function handlePamReleasedDuringRescue(pam) {
    const dan = document.querySelector(".robot-blue");
    const pen = document.querySelector(".robot-mint");
    window.clearTimeout(pamRescue.escalationTimer);
    pamRescue.escalationTimer = null;
    pamRescue.phase = "waiting";
    clearPamRescueSpeechTimers();
    dan.classList.remove("is-dan-rescuing");
    dan.style.setProperty("--dan-lean", "0deg");
    if (pamRescue.forced) {
      // Pen snatched Pam: he keeps his furious look until everyone is home.
      showRobotSpeech(pen, pickRandomLine(PEN_TAKE_PAM_LINES), 2500);
    } else {
      const penJoined = pamRescue.escalated;
      pen.classList.remove("is-pen-annoyed", "is-pen-pam-pursuit");
      pen.querySelectorAll(".pen-chase-symbol").forEach(symbol => symbol.remove());
      if (penJoined) showRobotSpeech(pen, PEN_RESCUE_RELIEF_LINE, 2500);
    }
    // Pam's existing head-shake chain signals completion through this hook.
    robotStates.get(pam).onHeadShakeComplete = beginPamEscort;
    pamRescueLater(() => {
      if (pamRescue.phase === "waiting") beginPamEscort(); // fallback if the shake chain was cancelled
    }, PAM_RESCUE_SHAKE_WAIT_FALLBACK);
    // Safety net for the post-release phases only (wait, escort, return): never leave a stuck state.
    pamRescueLater(() => {
      if (pamRescue.phase !== "idle") finishPamRescue();
    }, PAM_RESCUE_SAFETY_TIMEOUT);
  }

  function beginPamEscort() {
    if (pamRescue.phase !== "waiting") return;
    const pam = document.querySelector(".robot-pink");
    const dan = document.querySelector(".robot-blue");
    robotStates.get(pam).onHeadShakeComplete = null;
    const [pamX, pamY] = cancelRobotAnimations(pam);
    pam.style.setProperty("--dodge-x", `${pamX}px`);
    pam.style.setProperty("--dodge-y", `${pamY}px`);
    pam.classList.add("is-dodging", "is-pam-rescue-active");
    pamRescue.phase = "escorting";
    pamRescue.pamVelocity = { x: 0, y: 0 };
    pamRescue.pamMotion = { x: 0, y: 0 };
    showRobotSpeech(dan, DAN_RESCUE_DONE_LINE, 2200);
    pamRescueSpeakLater(() => showRobotSpeech(pam, PAM_RESCUE_DONE_LINE, 2600), 2200);
  }

  // Everyone is home: restore normal states and cancel every loop and timer.
  function finishPamRescue() {
    const pam = document.querySelector(".robot-pink");
    const dan = document.querySelector(".robot-blue");
    const pen = document.querySelector(".robot-mint");
    window.cancelAnimationFrame(pamRescue.frame);
    pamRescue.frame = null;
    clearPamRescueTimers();
    robotStates.get(pam).onHeadShakeComplete = null;
    const penWasDisplaced = pamRescue.penDisplaced;
    [pam, dan, ...(penWasDisplaced ? [pen] : [])].forEach(robot => {
      robot.style.setProperty("--dodge-x", "0px");
      robot.style.setProperty("--dodge-y", "0px");
    });
    void dan.offsetWidth; // commit the snap while transitions are still disabled
    pam.classList.remove("is-dodging", "is-pam-rescue-active");
    dan.classList.remove("is-dan-rescuing", "is-pam-rescue-active");
    dan.style.removeProperty("--dan-lean");
    pen.classList.remove("is-pen-annoyed", "is-pen-pam-pursuit", "is-pam-rescue-active");
    pen.style.removeProperty("--pen-look-x");
    pen.querySelectorAll(".pen-chase-symbol").forEach(symbol => symbol.remove());
    window.requestAnimationFrame(() => {
      if (pamRescue.phase !== "idle") return;
      [pam, dan, pen].forEach(robot => {
        robot.style.removeProperty("--dodge-x");
        robot.style.removeProperty("--dodge-y");
      });
    });
    pamRescue.phase = "idle";
    pamRescue.escalated = false;
    pamRescue.forced = false;
    pamRescue.penDisplaced = false;
    pamRescue.pointerId = null;
    pamRescue.attached = false;
    pamRescue.prevPamX = null;
    pamRescue.prevPamY = null;
    pamRescue.danVelocity = { x: 0, y: 0 };
    pamRescue.penVelocity = { x: 0, y: 0 };
    pamRescue.pamVelocity = { x: 0, y: 0 };
  }

  function beginRobotDrag(event) {
    const robot = robotDrag.robot;
    const robotState = robotStates.get(robot);
    const [originX, originY] = cancelRobotAnimations(robot);
    robotState.destinationReached = true;
    const isPam = robot.classList.contains("robot-pink");
    const isPen = robot.classList.contains("robot-mint");
    robot.classList.add("is-dragging");
    if (isPam) {
      robot.classList.add("is-dizzy");
      setPamHeadBop(robot, true, true);
      startPamDizzySound(robot).catch(error => console.warn("Could not play Pam's dizzy sound.", error));
      startPamRescue(robot, event.pointerId);
    } else if (isPen) {
      if (!robot.classList.contains("is-permanently-angry")) {
        robot.classList.add("is-pen-dragging-expression");
      }
      robotState.penDragTimeout = window.setTimeout(() => {
        robotState.penDragTimeout = null;
        endPenDrag(robot);
      }, 300);
    } else {
      startDanDragInteraction(robot, event);
    }
    robot.style.setProperty("--dodge-x", `${originX}px`);
    robot.style.setProperty("--dodge-y", `${originY}px`);
    robot.setPointerCapture(event.pointerId);
    void robot.offsetWidth;

    const transform = new DOMMatrixReadOnly(getComputedStyle(robot).transform);
    robotDrag.moved = true;
    robotDrag.originX = originX;
    robotDrag.originY = originY;
    robotDrag.transform = transform;
    robotDrag.bounds = robot.getBoundingClientRect();
  }

  function moveRobotDrag(event) {
    if (!robotDrag) return;
    const robot = robotDrag.robot;
    if (!robotDrag.moved) {
      const distance = Math.hypot(event.clientX - robotDrag.startX, event.clientY - robotDrag.startY);
      if (distance < 4) return;
      beginRobotDrag(event);
    }

    event.preventDefault();
    const { transform, bounds } = robotDrag;
    const determinant = transform.a * transform.d - transform.b * transform.c;
    let deltaX = event.clientX - robotDrag.pointerX;
    let deltaY = event.clientY - robotDrag.pointerY;
    deltaX = Math.max(20 - bounds.left, Math.min(window.innerWidth - 20 - bounds.right, deltaX));
    deltaY = Math.max(20 - bounds.top, Math.min(window.innerHeight - 20 - bounds.bottom, deltaY));
    // `translate` works in screen space, so Dan maps pointer movement 1:1 (keeps her glued to the pointer).
    const isDirectDrag = robot.classList.contains("robot-blue");
    const translateX = isDirectDrag ? deltaX : (deltaX * transform.d - deltaY * transform.c) / determinant;
    const translateY = isDirectDrag ? deltaY : (deltaY * transform.a - deltaX * transform.b) / determinant;
    robotDrag.originX += translateX;
    robotDrag.originY += translateY;
    robot.style.setProperty("--dodge-x", `${robotDrag.originX}px`);
    robot.style.setProperty("--dodge-y", `${robotDrag.originY}px`);
    robotDrag.bounds = robot.getBoundingClientRect();
    robotDrag.pointerX = event.clientX;
    robotDrag.pointerY = event.clientY;
  }

  function finishRobotDrag() {
    const pen = document.querySelector(".robot-mint");
    const penState = pen ? robotStates.get(pen) : null;
    if (!robotDrag) {
      if (penState && penState.penDragBlocked) {
        penState.penDragBlocked = false;
      }
      return;
    }
    const robot = robotDrag.robot;
    const robotState = robotStates.get(robot);
    const wasDragged = robotDrag.moved;
    const isPen = robot.classList.contains("robot-mint");
    const isPenNormalRelease = isPen && robotState.penDragTimeout !== null;

    if (isPen && robotState.penDragTimeout !== null) {
      window.clearTimeout(robotState.penDragTimeout);
      robotState.penDragTimeout = null;
    }
    if (isPen) {
      robotState.penDragBlocked = false;
    }
    robotDrag = null;
    if (!wasDragged) return;
    if (robot.classList.contains("robot-blue")) {
      releaseDanDrag(robot);
      return;
    }

    robot.classList.remove("is-dragging");
    robot.classList.add("is-dodging");
    if (isPenNormalRelease) {
      robot.classList.remove("is-mouth-flat");
      if (!robotState.penRageDialogueVisible) {
        showRobotSpeech(robot, "HEY! WHO SAID YOU COULD TOUCH ME?! HANDS OFF!", 4000);
      }
    } else {
      robot.classList.add("is-mouth-changed");
    }
    setPamHeadBop(robot, true);
    robotState.clickSuppressed = true;
    window.clearTimeout(robotState.clickSuppressionTimer);
    robotState.clickSuppressionTimer = window.setTimeout(() => {
      robotState.clickSuppressed = false;
      robotState.clickSuppressionTimer = null;
    }, 0);
    if (!isPen) {
      robotState.dizzyTimer = window.setTimeout(() => {
          setPamHeadBop(robot, false);
          robot.classList.remove("is-mouth-changed");
          const isPam = robot.classList.contains("robot-pink");
          if (isPam) {
            robotState.shakeEyesTimer = window.setTimeout(() => {
              robot.classList.remove("is-dizzy");
              robot.classList.add("is-head-shake-eyes");
              robotState.shakeEyesTimer = null;
            }, PAM_SHAKE_EYES_DELAY);
          }
          robotState.shakeTimer = window.setTimeout(() => {
            robot.classList.remove("is-dizzy");
            robot.classList.add("is-head-shaking");
            robotState.shakeTimer = window.setTimeout(() => {
              robot.classList.remove("is-head-shaking");
              robot.classList.remove("is-head-shake-eyes");
              robotState.shakeTimer = null;
              if (typeof robotState.onHeadShakeComplete === "function") {
                const onComplete = robotState.onHeadShakeComplete;
                robotState.onHeadShakeComplete = null;
                onComplete();
              }
            }, ROBOT_HEAD_SHAKE_DURATION);
          }, isPam ? PAM_HEAD_SHAKE_DELAY : ROBOT_HEAD_SHAKE_DELAY);
          robotState.dizzyTimer = null;
        }, ROBOT_EYE_SPIN_DURATION);
    }
    if (robot.classList.contains("robot-pink") && pamRescue.phase === "holding") {
      handlePamReleasedDuringRescue(robot); // Dan waits for the head-shake, then escorts Pam home
    } else {
      scheduleRobotReturn(robot);
    }
  }

  function endPenDrag(robot) {
    const robotState = robotStates.get(robot);
    robotState.penDragBlocked = true;
    robotDrag = null;

    robot.classList.remove("is-dragging");
    robot.classList.remove("is-mouth-flat");

    if (!robotState.penRageDialogueVisible) {
      showRobotSpeech(robot, "HEY! DON'T FUCKING TOUCH ME OR DRAG ME AROUND! YOU CAN'T JUST PICK ME UP WHENEVER YOU WANT!", 4000);
    }

    robot.classList.add("is-dodging");
    scheduleRobotReturn(robot);
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

  function updatePenIrritationSymbols(robot) {
    const state = robotStates.get(robot);
    const symbols = robot.querySelector(".pen-irritation-symbols");
    const count = Math.min(5, Math.floor(state.irritationCount / 2));
    const slots = [
      { left: 4, top: 18 },
      { left: 54, top: 18 },
      { left: 4, top: 34 },
      { left: 54, top: 34 },
      { left: 28, top: 2 }
    ];
    if (count && !state.irritationSlots.length) {
      state.irritationSlots = slots.slice();
      for (let index = state.irritationSlots.length - 1; index > 0; index -= 1) {
        const swapIndex = randomInteger(0, index);
        [state.irritationSlots[index], state.irritationSlots[swapIndex]] =
          [state.irritationSlots[swapIndex], state.irritationSlots[index]];
      }
    }
    while (state.irritationPositions.length < count) {
      const slot = state.irritationSlots[state.irritationPositions.length];
      state.irritationPositions.push({
        left: slot.left + randomInteger(-1, 1),
        top: slot.top + randomInteger(-1, 1),
        rotation: randomInteger(-20, 20)
      });
    }
    while (symbols.children.length > count) symbols.lastElementChild.remove();
    while (symbols.children.length < count) {
      const position = state.irritationPositions[symbols.children.length];
      const symbol = document.createElement("span");
      symbol.textContent = "💢";
      symbol.style.left = `${position.left}px`;
      symbol.style.top = `${position.top}px`;
      symbol.style.setProperty("--pen-irritation-rotation", `${position.rotation}deg`);
      symbols.append(symbol);
    }
    robot.classList.toggle("is-irritated", count > 0);
  }

  function scootPen(robot, rageReturn = false) {
    const robotState = robotStates.get(robot);
    if (robotState.penCursorPursuitActive) return;
    window.clearTimeout(robotState.penScootTimer);
    const [originX, originY] = getRobotTranslate(robot);
    const distance = randomInteger(3, 7);
    const angle = Math.random() * Math.PI * 2;
    const targetX = originX + Math.cos(angle) * distance;
    const targetY = originY + Math.sin(angle) * distance;
    robot.style.setProperty("--dodge-x", `${targetX}px`);
    robot.style.setProperty("--dodge-y", `${targetY}px`);
    robotState.penScootTimer = window.setTimeout(() => {
      if (!robot.classList.contains("is-dragging") && !robotState.penCursorPursuitActive) {
        if (rageReturn) {
          robot.classList.add("is-pen-rage-returning");
          void robot.offsetWidth;
        }
        robot.style.setProperty("--dodge-x", `${originX}px`);
        robot.style.setProperty("--dodge-y", `${originY}px`);
      }
      robotState.penScootTimer = null;
    }, rageReturn ? 3000 : 650);
  }

  function resetPenIrritation(robot) {
    const robotState = robotStates.get(robot);
    window.clearTimeout(robotState.irritationTimer);
    robotState.irritationTimer = null;
    robotState.irritationCount = 0;
    robotState.irritationPositions = [];
    robotState.irritationSlots = [];
    updatePenIrritationSymbols(robot);
    if (!robotState.speechMouthTimer && !robot.classList.contains("is-raging")) {
      robot.classList.remove("is-eyes-closed", "is-mouth-flat");
    }
  }

  function movePenTowardCursor(pen) {
    const penState = robotStates.get(pen);
    if (!penState.penCursorPursuitActive) return;
    const now = performance.now();
    const deltaTime = Math.min(0.05, Math.max(0.001, (now - (penState.penCursorFrameTime ?? now)) / 1000));
    penState.penCursorFrameTime = now;
    const motionDecay = Math.exp(-deltaTime / 0.24);
    penState.penCursorVelocityX *= motionDecay;
    penState.penCursorVelocityY *= motionDecay;
    const bounds = pen.getBoundingClientRect();
    const centerX = bounds.left + bounds.width / 2;
    const centerY = bounds.top + bounds.height / 2;
    let targetSpeed = 0;
    let desiredX = 0;
    let desiredY = 0;
    if (penCursorX !== null && penCursorY !== null) {
      const cursorToPenX = penCursorX - centerX;
      const cursorToPenY = penCursorY - centerY;
      const cursorDistance = Math.hypot(cursorToPenX, cursorToPenY);
      if (cursorDistance > 0) {
        desiredX = cursorToPenX / cursorDistance;
        desiredY = cursorToPenY / cursorDistance;
        targetSpeed = PEN_CURSOR_PURSUIT_MAX_SPEED;
      }
    }
    const margin = 20;
    const edgeRange = 90;
    const leftGap = bounds.left - margin;
    const rightGap = window.innerWidth - margin - bounds.right;
    const topGap = bounds.top - margin;
    const bottomGap = window.innerHeight - margin - bounds.bottom;
    const edgeX = Math.max(0, 1 - leftGap / edgeRange) -
      Math.max(0, 1 - rightGap / edgeRange);
    const edgeY = Math.max(0, 1 - topGap / edgeRange) -
      Math.max(0, 1 - bottomGap / edgeRange);
    desiredX += edgeX * 2.2;
    desiredY += edgeY * 2.2;
    const desiredLength = Math.hypot(desiredX, desiredY);
    if (desiredLength > 0) {
      desiredX /= desiredLength;
      desiredY /= desiredLength;
    }
    const desiredVelocityX = desiredX * targetSpeed;
    const desiredVelocityY = desiredY * targetSpeed;
    let velocityDeltaX = desiredVelocityX - penState.penCursorVelocityX;
    let velocityDeltaY = desiredVelocityY - penState.penCursorVelocityY;
    const velocityDeltaLength = Math.hypot(velocityDeltaX, velocityDeltaY);
    const maxAcceleration = (targetSpeed > 0
      ? PEN_CURSOR_PURSUIT_ACCELERATION
      : PEN_CURSOR_PURSUIT_DECELERATION) * deltaTime;
    if (velocityDeltaLength > maxAcceleration) {
      velocityDeltaX = velocityDeltaX / velocityDeltaLength * maxAcceleration;
      velocityDeltaY = velocityDeltaY / velocityDeltaLength * maxAcceleration;
    }
    penState.penCursorVelocityX += velocityDeltaX;
    penState.penCursorVelocityY += velocityDeltaY;
    const maxLeft = Math.max(margin, window.innerWidth - bounds.width - margin);
    const maxTop = Math.max(margin, window.innerHeight - bounds.height - margin);
    const nextLeft = Math.max(margin, Math.min(maxLeft, bounds.left + penState.penCursorVelocityX * deltaTime));
    const nextTop = Math.max(margin, Math.min(maxTop, bounds.top + penState.penCursorVelocityY * deltaTime));
    if (nextLeft === margin && penState.penCursorVelocityX < 0 ||
        nextLeft === maxLeft && penState.penCursorVelocityX > 0) {
      penState.penCursorVelocityX = 0;
    }
    if (nextTop === margin && penState.penCursorVelocityY < 0 ||
        nextTop === maxTop && penState.penCursorVelocityY > 0) {
      penState.penCursorVelocityY = 0;
    }
    const deltaX = nextLeft - bounds.left;
    const deltaY = nextTop - bounds.top;
    const transform = new DOMMatrixReadOnly(getComputedStyle(pen).transform);
    const determinant = transform.a * transform.d - transform.b * transform.c;
    const translateX = (deltaX * transform.d - deltaY * transform.c) / determinant;
    const translateY = (deltaY * transform.a - deltaX * transform.b) / determinant;
    const [currentX, currentY] = getRobotTranslate(pen);
    pen.style.setProperty("--dodge-x", `${currentX + translateX}px`);
    pen.style.setProperty("--dodge-y", `${currentY + translateY}px`);
    penState.penCursorPursuitFrame = window.requestAnimationFrame(() => movePenTowardCursor(pen));
  }

  function getPenPursuitSlot(helper, penBounds, helperBounds) {
    const isPam = helper.classList.contains("robot-pink");
    const margin = 8;
    const halfW = helperBounds.width / 2;
    const halfH = helperBounds.height / 2;
    const penCenterX = penBounds.left + penBounds.width / 2;
    const penCenterY = penBounds.top + penBounds.height / 2;
    const sideOffset = penBounds.width / 2 + halfW + PEN_PURSUIT_FOLLOW_GAP;
    const minX = margin + halfW;
    const maxX = window.innerWidth - margin - halfW;
    const minY = margin + halfH;
    const maxY = window.innerHeight - margin - halfH;
    let centerX = penCenterX + (isPam ? -sideOffset : sideOffset);
    let centerY = penCenterY;
    if (centerX < minX || centerX > maxX) {
      // No room beside Pen: Pam stacks above him, Dan below him.
      centerX = penCenterX;
      centerY = penCenterY + (isPam ? -1 : 1) *
        (penBounds.height / 2 + halfH + PEN_PURSUIT_FOLLOW_GAP);
    }
    return [
      Math.max(minX, Math.min(maxX, centerX)),
      Math.max(minY, Math.min(maxY, centerY))
    ];
  }

  function followPenDuringPursuit(helper) {
    const helperState = robotStates.get(helper);
    if (!helperState.penPursuitFollowActive) return;
    const pen = document.querySelector(".robot-mint");
    const penState = robotStates.get(pen);
    if (!pen.classList.contains("is-permanently-angry") || helperState.hiddenBehind) {
      abortHelperPursuit(helper);
      return;
    }
    const now = performance.now();
    const deltaTime = Math.min(0.05, Math.max(0.001, (now - (helperState.penPursuitFollowFrameTime ?? now)) / 1000));
    helperState.penPursuitFollowFrameTime = now;
    const helperBounds = helper.getBoundingClientRect();
    const penBounds = pen.getBoundingClientRect();
    const [targetX, targetY] = getPenPursuitSlot(helper, penBounds, helperBounds);
    const toX = targetX - (helperBounds.left + helperBounds.width / 2);
    const toY = targetY - (helperBounds.top + helperBounds.height / 2);
    const distance = Math.hypot(toX, toY);
    // Feed Pen's own velocity forward so the helper locks on instead of trailing.
    const penVelocityX = penState.penCursorPursuitActive ? penState.penCursorVelocityX : 0;
    const penVelocityY = penState.penCursorPursuitActive ? penState.penCursorVelocityY : 0;
    let desiredX = penVelocityX + toX * PEN_PURSUIT_FOLLOW_GAIN;
    let desiredY = penVelocityY + toY * PEN_PURSUIT_FOLLOW_GAIN;
    const desiredSpeed = Math.hypot(desiredX, desiredY);
    if (desiredSpeed > PEN_PURSUIT_FOLLOW_MAX_SPEED) {
      desiredX = desiredX / desiredSpeed * PEN_PURSUIT_FOLLOW_MAX_SPEED;
      desiredY = desiredY / desiredSpeed * PEN_PURSUIT_FOLLOW_MAX_SPEED;
    }
    let deltaVX = desiredX - helperState.penPursuitFollowVelocityX;
    let deltaVY = desiredY - helperState.penPursuitFollowVelocityY;
    const deltaVLength = Math.hypot(deltaVX, deltaVY);
    const maxDeltaV = PEN_PURSUIT_FOLLOW_ACCELERATION * deltaTime;
    if (deltaVLength > maxDeltaV) {
      deltaVX = deltaVX / deltaVLength * maxDeltaV;
      deltaVY = deltaVY / deltaVLength * maxDeltaV;
    }
    helperState.penPursuitFollowVelocityX += deltaVX;
    helperState.penPursuitFollowVelocityY += deltaVY;
    // Never step further than the remaining gap, so the helper cannot overshoot.
    let stepX = helperState.penPursuitFollowVelocityX * deltaTime;
    let stepY = helperState.penPursuitFollowVelocityY * deltaTime;
    const stepLength = Math.hypot(stepX, stepY);
    const stepLimit = Math.max(distance, 0) + Math.hypot(penVelocityX, penVelocityY) * deltaTime;
    if (stepLength > stepLimit && stepLength > 0) {
      stepX = stepX / stepLength * stepLimit;
      stepY = stepY / stepLength * stepLimit;
    }
    const [currentX, currentY] = getRobotTranslate(helper);
    helper.style.setProperty("--dodge-x", `${currentX + stepX}px`);
    helper.style.setProperty("--dodge-y", `${currentY + stepY}px`);
    if (distance <= PEN_PURSUIT_ARRIVAL_DISTANCE) {
      markHelperReachedPen(helper);
      if (!helperState.penPursuitFollowActive) return;
    }
    helperState.penPursuitFollowFrame = window.requestAnimationFrame(() => followPenDuringPursuit(helper));
  }

  function startPenPursuitFollow(helper) {
    const helperState = robotStates.get(helper);
    if (helperState.penPursuitFollowActive) return;
    window.clearTimeout(helperState.penCalmArrivalTimer);
    window.clearTimeout(helperState.penCalmReturnTimer);
    window.clearTimeout(helperState.cleanupTimer);
    helperState.penCalmArrivalTimer = null;
    helperState.penCalmReturnTimer = null;
    helperState.cleanupTimer = null;
    helper.classList.remove("is-calming-pen", "is-calming-return", "is-dodging");
    helper.classList.add("is-pen-pursuit-follower");
    helperState.penPursuitFollowActive = true;
    helperState.penPursuitFollowVelocityX = 0;
    helperState.penPursuitFollowVelocityY = 0;
    helperState.penPursuitFollowFrameTime = performance.now();
    helperState.penPursuitFollowFrame = window.requestAnimationFrame(() => followPenDuringPursuit(helper));
  }

  function stopPenPursuitFollow(helper) {
    const helperState = robotStates.get(helper);
    window.cancelAnimationFrame(helperState.penPursuitFollowFrame);
    helperState.penPursuitFollowFrame = null;
    helperState.penPursuitFollowActive = false;
    helperState.penPursuitFollowVelocityX = 0;
    helperState.penPursuitFollowVelocityY = 0;
    helperState.penPursuitFollowFrameTime = null;
    helper.classList.remove("is-pen-pursuit-follower");
  }

  // Cancels one helper's pursuit without finishing the calming sequence (e.g. Pam goes into hiding).
  function abortHelperPursuit(helper) {
    const key = helper.classList.contains("robot-pink") ? "pam" : "dan";
    const helperState = robotStates.get(helper);
    const wasFollowing = helperState.penPursuitFollowActive;
    stopPenPursuitFollow(helper);
    window.clearTimeout(helperState.penCalmArrivalTimer);
    helperState.penCalmArrivalTimer = null;
    if (!penCalming.helpers.has(key) && !wasFollowing) return;
    penCalming.helpers.delete(key);
    const pen = document.querySelector(".robot-mint");
    if (![...penCalming.helpers.values()].some(record => record.arrived)) {
      pen.classList.remove("is-partially-calmed");
    }
    if (!helperState.hiddenBehind) {
      helper.classList.add("is-calming-return");
      helper.style.setProperty("--dodge-x", "0px");
      helper.style.setProperty("--dodge-y", "0px");
      helperState.penCalmReturnTimer = window.setTimeout(() => {
        helper.classList.remove("is-calming-return");
        helperState.penCalmReturnTimer = null;
      }, 900);
    }
  }

  function startPenRage(robot) {
    const robotState = robotStates.get(robot);
    cancelRobotAnimations(robot, true);
    window.clearTimeout(robotState.irritationTimer);
    window.clearTimeout(robotState.speechMouthTimer);
    window.clearTimeout(robotState.penRageSpeechTimer);
    robotState.irritationTimer = null;
    robotState.speechMouthTimer = null;
    robotState.penRageSpeechTimer = null;
    robotState.penRageDialogueVisible = false;
    robot.classList.remove("is-eyes-closed", "is-mouth-flat");
    robot.classList.add("is-raging", "is-permanently-angry", "is-cursor-pursuing");
    robotState.penCursorPursuitActive = true;
    robotState.penCursorFrameTime = performance.now();
    robotState.penCursorVelocityX = 0;
    robotState.penCursorVelocityY = 0;
    robotState.penCursorPursuitFrame = window.requestAnimationFrame(() => movePenTowardCursor(robot));
    document.querySelector(".robot-pink .robot-body")
      .setAttribute("aria-label", "Move Pam toward Pen to calm him");
    document.querySelector(".robot-blue .robot-body")
      .setAttribute("aria-label", "Move Dan toward Pen to calm him");
    updatePenIrritationSymbols(robot);
    showRobotSpeech(
      robot,
      PEN_RAGE_DIALOGUE,
      6000,
      () => {
        robotState.penRageDialogueVisible = false;
      }
    );
    robotState.penRageDialogueVisible = true;
    robotState.penRageTimer = window.setTimeout(() => {
      window.clearTimeout(robotState.penRageSpeechTimer);
      window.clearTimeout(robotState.penScootTimer);
      robot.classList.remove("is-raging", "is-pen-rage-returning", "is-dodging");
      robotState.penRageTimer = null;
      robotState.penRageSpeechTimer = null;
      robotState.penScootTimer = null;
    }, 9000);
  }

  // Clicking a helper while Pen is enraged activates that helper's pursuit only.
  function beginPenCalming(helper) {
    const pen = document.querySelector(".robot-mint");
    const helperState = robotStates.get(helper);
    const helperKey = helper.classList.contains("robot-pink") ? "pam" : "dan";
    if (
      !pen.classList.contains("is-permanently-angry") ||
      penCalming.helpers.has(helperKey) ||
      helperState.penPursuitFollowActive ||
      helperState.hiddenBehind
    ) return;

    if (helper.classList.contains("robot-blue")) stopDanCursorAvoidance(helper);
    cancelRobotAnimations(helper);
    // Original (layout) position is translate 0,0.
    penCalming.helpers.set(helperKey, {
      robot: helper,
      homeX: 0,
      homeY: 0,
      arrived: false
    });
    startPenPursuitFollow(helper);
  }

  // Called by the pursuit loop when a helper has caught up with Pen.
  function markHelperReachedPen(helper) {
    const key = helper.classList.contains("robot-pink") ? "pam" : "dan";
    const helperRecord = penCalming.helpers.get(key);
    if (!helperRecord || helperRecord.arrived) return;
    helperRecord.arrived = true;

    const pen = document.querySelector(".robot-mint");
    const arrivedCount = [...penCalming.helpers.values()].filter(record => record.arrived).length;
    if (arrivedCount === 1) {
      pen.classList.add("is-partially-calmed");
      return;
    }
    if (arrivedCount !== 2) return;
    completePenCalming(pen);
  }

  function returnCalmingRobotsHome() {
    const records = [...penCalming.helpers.values()];
    records.forEach(({ robot, homeX, homeY }) => {
      const robotState = robotStates.get(robot);
      stopPenPursuitFollow(robot);
      window.clearTimeout(robotState.penCalmArrivalTimer);
      window.clearTimeout(robotState.penCalmReturnTimer);
      window.clearTimeout(robotState.cleanupTimer);
      robotState.penCalmArrivalTimer = null;
      robotState.cleanupTimer = null;
      robot.classList.remove("is-calming-pen");
      robot.classList.add("is-calming-return");
      robot.style.setProperty("--dodge-x", `${homeX}px`);
      robot.style.setProperty("--dodge-y", `${homeY}px`);
      robotState.penCalmReturnTimer = window.setTimeout(() => {
        robot.classList.remove("is-calming-return");
        robot.style.removeProperty("--dodge-x");
        robot.style.removeProperty("--dodge-y");
        robotState.penCalmReturnTimer = null;
      }, 900);
    });
    penCalming.helpers.clear();
  }

  function cancelPenCalmReturn(robot) {
    const robotState = robotStates.get(robot);
    if (!robot.classList.contains("is-calming-return")) return;
    window.clearTimeout(robotState.penCalmReturnTimer);
    robotState.penCalmReturnTimer = null;
    robot.classList.remove("is-calming-return");
  }

  function completePenCalming(pen) {
    const pamFollower = document.querySelector(".robot-pink");
    const danFollower = document.querySelector(".robot-blue");
    if (pamFollower) stopPenPursuitFollow(pamFollower);
    if (danFollower) stopPenPursuitFollow(danFollower);
    const penState = robotStates.get(pen);
    const keepRageDialogue = robotFactOwner === pen && penState.penRageDialogueVisible;
    window.clearTimeout(penState.penRageTimer);
    window.clearTimeout(penState.penRageSpeechTimer);
    window.clearTimeout(penState.penScootTimer);
    window.clearTimeout(penState.irritationTimer);
    window.clearTimeout(penState.speechMouthTimer);
    penState.penRageTimer = null;
    penState.penRageSpeechTimer = null;
    penState.penScootTimer = null;
    penState.irritationTimer = null;
    penState.speechMouthTimer = null;
    if (!keepRageDialogue) penState.penRageDialogueVisible = false;
    penState.penCursorPursuitActive = false;
    window.cancelAnimationFrame(penState.penCursorPursuitFrame);
    penState.penCursorPursuitFrame = null;
    penState.penCursorVelocityX = 0;
    penState.penCursorVelocityY = 0;
    penState.irritationCount = 0;
    penState.irritationPositions = [];
    penState.irritationSlots = [];
    pen.classList.remove(
      "is-raging",
      "is-permanently-angry",
      "is-cursor-pursuing",
      "is-partially-calmed",
      "is-pen-rage-returning",
      "is-dodging",
      "is-irritated",
      "is-eyes-closed",
      "is-mouth-flat",
      "is-mouth-changed"
    );
    pen.classList.add("is-pen-rage-returning");
    pen.style.setProperty("--dodge-x", "0px");
    pen.style.setProperty("--dodge-y", "0px");
    window.setTimeout(() => {
      pen.classList.remove("is-pen-rage-returning");
    }, 3000);
    document.querySelector(".robot-pink .robot-body")
      .setAttribute("aria-label", "Make the robot dodge");
    document.querySelector(".robot-blue .robot-body")
      .setAttribute("aria-label", "Make Dan dodge");
    updatePenIrritationSymbols(pen);
    if (robotFactOwner === pen && !keepRageDialogue) {
      window.clearTimeout(penState.factTimer);
      penState.factTimer = null;
      robotFactBubble.hidden = true;
      robotFactOwner = null;
    }
    returnCalmingRobotsHome();
  }

  function showPenIrritationWarning(robot, level) {
    const robotState = robotStates.get(robot);
    const warnings = [
      ["Hey! Stop that!", "Oi, quit poking me!", "Hands off, buddy!"],
      ["I'm warning you!", "I said knock it off!", "You're testing my patience!"],
      ["Dude, seriously?!", "Are you always this annoying?", "Give it a rest already!"],
      ["Keep it up and see what happens!", "You really don't know when to stop!", "Back off before I lose it!"],
      ["THAT'S IT! I'VE HAD ENOUGH!", "I'm done being patient, you jerk!", "One more and I'm snapping!"]
    ][level - 1];
    const availableWarnings = warnings.filter(
      warning => warning !== robotState.lastPenIrritationWarning
    );
    const warning = availableWarnings[randomInteger(0, availableWarnings.length - 1)];
    robotState.lastPenIrritationWarning = warning;
    showRobotSpeech(robot, warning, 3000);
  }

  function handlePenBodyClick(robot) {
    const robotState = robotStates.get(robot);
    if (
      robotState.hiddenBehind ||
      robot.classList.contains("is-raging") ||
      robot.classList.contains("is-permanently-angry")
    ) return;
    window.clearTimeout(robotState.speechMouthTimer);
    robotState.speechMouthTimer = null;
    const previousSymbolCount = Math.min(5, Math.floor(robotState.irritationCount / 2));
    const previousCount = robotState.irritationCount;
    robotState.irritationCount += 1;
    updatePenIrritationSymbols(robot);
    const symbolCount = Math.min(5, Math.floor(robotState.irritationCount / 2));
    const addedSymbol = symbolCount > previousSymbolCount;
    robot.classList.add("is-eyes-closed", "is-mouth-flat");
    if (robotState.irritationCount >= 10) {
      startPenRage(robot);
      return;
    }
    if (addedSymbol) showPenIrritationWarning(robot, symbolCount);
    scootPen(robot);
    window.clearTimeout(robotState.irritationTimer);
    robotState.irritationTimer = window.setTimeout(() => {
      resetPenIrritation(robot);
    }, 5000);
  }

  document.querySelector("#start-button").addEventListener("click", () => startGame());
  robots.forEach(robot => {
    const robotState = robotStates.get(robot);
    robot.querySelector(".robot-face").addEventListener("click", () => {
      if (robotState.hiddenBehind || isDanChaseLocked(robot)) return;
      if (robot.classList.contains("robot-blue")) {
        shareDanEducationalMessage(robot);
        return;
      }
      if (robot.classList.contains("robot-mint")) {
        sharePenFaceMessage(robot);
        return;
      }
      sharePrimeFact(robot);
    });
    robot.querySelector(".robot-body").addEventListener("click", () => {
      cancelPenCalmReturn(robot);
      if (
        robotState.hiddenBehind ||
        isDanChaseLocked(robot) ||
        isPamEscortLocked(robot) ||
        robotState.penPursuitFollowActive ||
        robot.classList.contains("is-calming-pen") ||
        robot.classList.contains("is-calming-return")
      ) return;
      if (
        (robot.classList.contains("robot-pink") || robot.classList.contains("robot-blue")) &&
        document.querySelector(".robot-mint").classList.contains("is-permanently-angry")
      ) {
        beginPenCalming(robot);
        return;
      }
      if (robot.classList.contains("robot-mint")) {
        handlePenBodyClick(robot);
        return;
      }
      if (robot.classList.contains("robot-blue")) {
        const clickResult = registerDanBodyClick(robot);
        const applyDanClickExpression = () => {
          // Must run after dodgeRobot(): cancelRobotAnimations() strips is-mouth-flat.
          window.clearTimeout(robotState.eyebrowTimer);
          robot.classList.add("is-eyebrow-raised", "is-mouth-flat");
          robotState.eyebrowTimer = window.setTimeout(() => {
            robot.classList.remove("is-eyebrow-raised", "is-mouth-flat");
            robotState.eyebrowTimer = null;
          }, 4000);
        };
        if (clickResult.activatedAvoidance) {
          applyDanClickExpression();
          if (clickResult.message) showRobotSpeech(robot, clickResult.message, 4000);
          return;
        }
        dodgeRobot(robot, 0.5, false, true, true);
        applyDanClickExpression();
        if (clickResult.message) showRobotSpeech(robot, clickResult.message, 4000);
        return;
      }
      dodgeRobot(robot);
    });
    robot.addEventListener("pointerdown", event => {
      cancelPenCalmReturn(robot);
      if (
        !event.isPrimary ||
        event.button !== 0 ||
        robotState.hiddenBehind ||
        robotState.danCursorAvoidanceActive ||
        robotState.penPursuitFollowActive ||
        robot.classList.contains("is-calming-pen") ||
        robot.classList.contains("is-calming-return") ||
        isDanChaseLocked(robot) ||
        isPamEscortLocked(robot) ||
        (robot.classList.contains("robot-blue") &&
          document.querySelector(".robot-mint").classList.contains("is-permanently-angry")) ||
        (robot.classList.contains("robot-mint") && robotState.penDragBlocked) ||
        robot.classList.contains("is-permanently-angry")
      ) return;
      robotDrag = {
        robot,
        startX: event.clientX,
        startY: event.clientY,
        pointerX: event.clientX,
        pointerY: event.clientY,
        originX: 0,
        originY: 0,
        moved: false,
        transform: null,
        bounds: null
      };
    });
    robot.addEventListener("click", event => {
      if (!robotState.clickSuppressed) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      robotState.clickSuppressed = false;
      window.clearTimeout(robotState.clickSuppressionTimer);
      robotState.clickSuppressionTimer = null;
    }, true);
    if (robot.classList.contains("robot-blue")) {
      robot.addEventListener("dragstart", event => event.preventDefault());
    }
    if (robot.classList.contains("robot-blue") || robot.classList.contains("robot-pink")) {
      robot.addEventListener("lostpointercapture", event => {
        // Touch gives the inner button implicit capture; losing *that* (it bubbles up here) is not a lost drag.
        if (event.target !== robot) return;
        if (robotDrag && robotDrag.robot === robot && robotDrag.moved) finishRobotDrag();
      });
    }
    robot.addEventListener("transitionend", event => {
      if (event.target !== robot || event.propertyName !== "translate") return;
      if (robot.classList.contains("is-calming-pen")) finishPenCalmingArrival(robot);
      else finishRobotArrival(robot);
    });
  });
  document.querySelector("#pam-antenna").addEventListener("click", event => {
    event.stopPropagation();
    const pen = document.querySelector(".robot-mint");
    const penState = robotStates.get(pen);
    window.clearTimeout(penState.speechMouthTimer);
    const antennaWarning = [
      "She doesn't like that, keep your cursor away from her antenna!",
      "Bruh she doesn't like her antenna getting touched."
    ][randomInteger(0, 1)];
    pen.classList.add("is-mouth-flat", "is-eyes-closed");
    penState.speechMouthTimer = window.setTimeout(() => {
      if (!pen.classList.contains("is-raging")) {
        pen.classList.remove("is-mouth-flat", "is-eyes-closed");
      }
      penState.speechMouthTimer = null;
    }, 5000);
    showRobotSpeech(pen, antennaWarning, 5000, null, true);
    preparePamToHide(document.querySelector(".robot-pink"));
  });
  window.addEventListener("pointerdown", handleDanTouchTap, true);
  window.addEventListener("pointermove", event => {
    if (event.pointerType === "touch") return;
    const danState = robotStates.get(document.querySelector(".robot-blue"));
    danState.danCursorInputMode = "cursor";
    const now = performance.now();
    if (danState.danCursorPreviousTime !== null) {
      const elapsed = (now - danState.danCursorPreviousTime) / 1000;
      if (elapsed > 0) {
        if (elapsed > 0.4) {
          danState.danCursorVelocityX = 0;
          danState.danCursorVelocityY = 0;
        }
        const smoothing = Math.min(
          0.65,
          Math.max(0.25, 1 - Math.exp(-elapsed / DAN_CURSOR_VELOCITY_SMOOTHING))
        );
        const measuredX = (event.clientX - danState.danCursorPreviousX) / elapsed;
        const measuredY = (event.clientY - danState.danCursorPreviousY) / elapsed;
        danState.danCursorVelocityX += (measuredX - danState.danCursorVelocityX) * smoothing;
        danState.danCursorVelocityY += (measuredY - danState.danCursorVelocityY) * smoothing;
      }
    }
    danState.danCursorX = event.clientX;
    danState.danCursorY = event.clientY;
    danState.danCursorPreviousX = event.clientX;
    danState.danCursorPreviousY = event.clientY;
    danState.danCursorPreviousTime = now;
    danState.danCursorMotionX = danState.danCursorVelocityX;
    danState.danCursorMotionY = danState.danCursorVelocityY;
    penCursorX = event.clientX;
    penCursorY = event.clientY;
  });
  window.addEventListener("pointermove", moveRobotDrag);
  window.addEventListener("pointerup", finishRobotDrag);
  window.addEventListener("pointercancel", finishRobotDrag);
  window.addEventListener("pointerdown", event => {
    const pen = document.querySelector(".robot-mint");
    const penState = pen ? robotStates.get(pen) : null;
    if (penState && penState.penCursorPursuitActive) {
      const penBounds = pen.getBoundingClientRect();
      if (event.clientX >= penBounds.left && event.clientX <= penBounds.right &&
          event.clientY >= penBounds.top && event.clientY <= penBounds.bottom) {
        event.stopImmediatePropagation();
        event.preventDefault();
      }
    }
  }, true);
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