// ============================================================
// QuizRush - 4-Player Ludo Arena (LudoRush)
// Supports Human vs Humans / Human vs AI Bots (1-4 Players)
// Interactive 15x15 Ludo Board, 3D Dice Roll, Token Animations,
// Safe Zones, Capture Mechanics, Winning Podium & Quiz Bonus Mode!
// ============================================================

const LudoGameManager = (() => {
  // Player Color Configuration
  const PLAYERS_CONFIG = [
    { color: 'green', name: 'Hijau', badge: '🟢', startPos: 0, homeEntryPos: 50, homeBaseId: 'green-base' },
    { color: 'yellow', name: 'Kuning', badge: '🟡', startPos: 13, homeEntryPos: 11, homeBaseId: 'yellow-base' },
    { color: 'blue', name: 'Biru', badge: '🔵', startPos: 26, homeEntryPos: 24, homeBaseId: 'blue-base' },
    { color: 'red', name: 'Merah', badge: '🔴', startPos: 39, homeEntryPos: 37, homeBaseId: 'red-base' }
  ];

  // 52 Main Track Squares + Safe Spots (Indexes: 0, 8, 13, 21, 26, 34, 39, 47)
  const SAFE_SPOTS = [0, 8, 13, 21, 26, 34, 39, 47];

  // Internal Game State
  let state = {
    active: false,
    playerCount: 4,
    botCount: 3,
    currentTurnIndex: 0,
    diceValue: 0,
    diceRolled: false,
    consecutiveSixes: 0,
    isRolling: false,
    players: [], // Array of { id, color, name, isBot, avatarSvg, tokens: [ {id, pos, stepCount} ], rank: null }
    rankings: [],
    history: []
  };

  // Bot Names & Avatars
  const BOT_NAMES = ['Bot Astra', 'Bot Nova', 'Bot Titan', 'Bot Spark', 'Bot Echo', 'Bot Zeno'];

  // Initialize Ludo Board UI & Event Listeners
  function init() {
    createBoardGrid();
    setupEventListeners();
  }

  // Generate 15x15 Board Elements dynamically
  function createBoardGrid() {
    const boardContainer = document.getElementById('ludo-board');
    if (!boardContainer) return;

    boardContainer.innerHTML = '';

    // Star safe spots coordinates
    const STAR_COORDS = [
      {r: 6, c: 1}, {r: 1, c: 8}, {r: 8, c: 13}, {r: 13, c: 6},
      {r: 2, c: 6}, {r: 6, c: 12}, {r: 12, c: 8}, {r: 8, c: 2}
    ];

    // Create 15x15 cell grid
    for (let r = 0; r < 15; r++) {
      for (let c = 0; c < 15; c++) {
        // Skip base and center zones (will be created as large blocks below)
        if ((r < 6 && c < 6) || (r < 6 && c > 8) || (r > 8 && c > 8) || (r > 8 && c < 6) || (r >= 6 && r <= 8 && c >= 6 && c <= 8)) {
          continue;
        }

        const cell = document.createElement('div');
        cell.className = 'ludo-cell';
        cell.dataset.row = r;
        cell.dataset.col = c;
        // Explicitly set grid row and column (1-indexed for CSS Grid)
        cell.style.gridRow = r + 1;
        cell.style.gridColumn = c + 1;
        
        // Home stretch paths
        if (r === 7 && c >= 1 && c <= 5) cell.classList.add('cell-green-path');
        else if (c === 7 && r >= 1 && r <= 5) cell.classList.add('cell-yellow-path');
        else if (r === 7 && c >= 9 && c <= 13) cell.classList.add('cell-blue-path');
        else if (c === 7 && r >= 9 && r <= 13) cell.classList.add('cell-red-path');

        // Check Star safe spots
        if (STAR_COORDS.some(st => st.r === r && st.c === c)) {
          cell.classList.add('cell-star');
        }

        // Color starting cells
        if (r === 6 && c === 1) cell.classList.add('cell-green-start');
        else if (r === 1 && c === 8) cell.classList.add('cell-yellow-start');
        else if (r === 8 && c === 13) cell.classList.add('cell-blue-start');
        else if (r === 13 && c === 6) cell.classList.add('cell-red-start');

        boardContainer.appendChild(cell);
      }
    }

    // Add Base Zones as large grid areas (Matched to Screenshot 2)
    const bases = [
      { id: 'zone-green-base', class: 'zone-green-base', area: '1 / 1 / 7 / 7' },       // Top-Left
      { id: 'zone-yellow-base', class: 'zone-yellow-base', area: '1 / 10 / 7 / 16' },   // Top-Right
      { id: 'zone-blue-base', class: 'zone-blue-base', area: '10 / 10 / 16 / 16' },     // Bottom-Right
      { id: 'zone-red-base', class: 'zone-red-base', area: '10 / 1 / 16 / 7' },         // Bottom-Left
      { id: 'zone-center', class: 'zone-center', area: '7 / 7 / 10 / 10' }
    ];

    bases.forEach(b => {
      const el = document.createElement('div');
      el.className = b.class;
      el.id = b.id;
      el.style.gridArea = b.area;
      boardContainer.appendChild(el);
    });

    renderBases();
  }

  // Render player home bases with token slots
  function renderBases() {
    PLAYERS_CONFIG.forEach(cfg => {
      const baseArea = document.getElementById(`zone-${cfg.color}-base`);
      if (baseArea && !baseArea.querySelector('.base-box')) {
        const baseBox = document.createElement('div');
        baseBox.className = `base-box base-box-${cfg.color}`;
        baseBox.innerHTML = `
          <div class="base-slots">
            <div class="token-slot" id="slot-${cfg.color}-0"></div>
            <div class="token-slot" id="slot-${cfg.color}-1"></div>
            <div class="token-slot" id="slot-${cfg.color}-2"></div>
            <div class="token-slot" id="slot-${cfg.color}-3"></div>
          </div>
        `;
        baseArea.appendChild(baseBox);
      }
    });
  }

  // Map 52 main track step indices to (row, col) on 15x15 board
  function getMainTrackCoords(trackIndex) {
    // 52-step standard Ludo path coordinates (row 0..14, col 0..14)
    const PATH = [
      // Red Track Start (0..5)
      {r: 6, c: 1}, {r: 6, c: 2}, {r: 6, c: 3}, {r: 6, c: 4}, {r: 6, c: 5},
      // Up to Green Home (6..11)
      {r: 5, c: 6}, {r: 4, c: 6}, {r: 3, c: 6}, {r: 2, c: 6}, {r: 1, c: 6}, {r: 0, c: 6},
      // Green Start Column (12..13)
      {r: 0, c: 7}, {r: 0, c: 8},
      // Down Green (14..18)
      {r: 1, c: 8}, {r: 2, c: 8}, {r: 3, c: 8}, {r: 4, c: 8}, {r: 5, c: 8},
      // Right to Yellow (19..24)
      {r: 6, c: 9}, {r: 6, c: 10}, {r: 6, c: 11}, {r: 6, c: 12}, {r: 6, c: 13}, {r: 6, c: 14},
      // Yellow Start Row (25..26)
      {r: 7, c: 14}, {r: 8, c: 14},
      // Left Yellow (27..31)
      {r: 8, c: 13}, {r: 8, c: 12}, {r: 8, c: 11}, {r: 8, c: 10}, {r: 8, c: 9},
      // Down to Blue (32..37)
      {r: 9, c: 8}, {r: 10, c: 8}, {r: 11, c: 8}, {r: 12, c: 8}, {r: 13, c: 8}, {r: 14, c: 8},
      // Blue Start Column (38..39)
      {r: 14, c: 7}, {r: 14, c: 6},
      // Up Blue (40..44)
      {r: 13, c: 6}, {r: 12, c: 6}, {r: 11, c: 6}, {r: 10, c: 6}, {r: 9, c: 6},
      // Left Red (45..50)
      {r: 8, c: 5}, {r: 8, c: 4}, {r: 8, c: 3}, {r: 8, c: 2}, {r: 8, c: 1}, {r: 8, c: 0},
      // Red Start Turn (51)
      {r: 7, c: 0}
    ];

    return PATH[trackIndex % 52];
  }

  // Home Stretch Paths (6 steps to home center for each color)
  function getHomeStretchCoords(color, stretchIndex) {
    // stretchIndex: 0..5 (0 = entry step, 5 = center victory)
    const HOME_PATHS = {
      green: [
        {r: 7, c: 1}, {r: 7, c: 2}, {r: 7, c: 3}, {r: 7, c: 4}, {r: 7, c: 5}, {r: 7, c: 6}
      ],
      yellow: [
        {r: 1, c: 7}, {r: 2, c: 7}, {r: 3, c: 7}, {r: 4, c: 7}, {r: 5, c: 7}, {r: 6, c: 7}
      ],
      blue: [
        {r: 7, c: 13}, {r: 7, c: 12}, {r: 7, c: 11}, {r: 7, c: 10}, {r: 7, c: 9}, {r: 7, c: 8}
      ],
      red: [
        {r: 13, c: 7}, {r: 12, c: 7}, {r: 11, c: 7}, {r: 10, c: 7}, {r: 9, c: 7}, {r: 8, c: 7}
      ]
    };

    return HOME_PATHS[color][Math.min(stretchIndex, 5)];
  }

  // Setup UI Event Listeners
  function setupEventListeners() {
    const btnStartGame = document.getElementById('btn-ludo-start');
    if (btnStartGame) {
      btnStartGame.addEventListener('click', confirmAndStartNewGame);
    }

    const btnRollDice = document.getElementById('btn-ludo-roll');
    if (btnRollDice) {
      btnRollDice.addEventListener('click', onHumanRollDice);
    }

    const diceDisplay = document.getElementById('ludo-dice-box');
    if (diceDisplay) {
      diceDisplay.style.cursor = 'pointer';
      diceDisplay.addEventListener('click', onHumanRollDice);
    }

    const modeSelect = document.getElementById('ludo-player-config');
    if (modeSelect) {
      modeSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val === '1v3bot') { state.playerCount = 4; state.botCount = 3; }
        else if (val === '2v2bot') { state.playerCount = 4; state.botCount = 2; }
        else if (val === '4human') { state.playerCount = 4; state.botCount = 0; }
        else if (val === '2human') { state.playerCount = 2; state.botCount = 0; }
        confirmAndStartNewGame();
      });
    }

    const btnFs = document.getElementById('btn-ludo-fullscreen');
    if (btnFs) {
      btnFs.addEventListener('click', () => toggleFullscreen(true));
    }

    const btnExitFs = document.getElementById('btn-exit-ludo-fullscreen');
    if (btnExitFs) {
      btnExitFs.addEventListener('click', () => toggleFullscreen(false));
    }
  }

  // Toggle Fullscreen Mobile Arena Mode
  function toggleFullscreen(enable) {
    const ludoCard = document.getElementById('ludo-fullscreen-container');
    const banner = document.getElementById('ludo-fullscreen-banner');
    
    if (enable) {
      if (ludoCard) ludoCard.classList.add('ludo-fullscreen-card');
      if (banner) banner.style.display = 'flex';
      
      try {
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
      } catch (e) {}

      alert('📱 Mode Layar Penuh (Fullscreen) AKTIF!\n\nPetunjuk: Untuk keluar dari layar penuh, klik tombol "❌ Keluar Layar Penuh" di bagian atas atau tekan tombol ESC/Back di HP Anda.');
    } else {
      if (ludoCard) ludoCard.classList.remove('ludo-fullscreen-card');
      if (banner) banner.style.display = 'none';

      try {
        if (document.exitFullscreen && document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
      } catch (e) {}
    }
  }

  // Confirmation before restarting an active match
  function confirmAndStartNewGame() {
    if (state.active && state.players && state.players.length > 0) {
      const hasMoves = state.players.some(p => p.tokens.some(t => t.stepCount > -1));
      if (hasMoves) {
        const confirmReset = confirm('⚡ Game Ludo sedang berjalan! Apakah Anda yakin ingin memulai Game Baru dari awal?');
        if (!confirmReset) return;
      }
    }
    startNewGame();
  }

  // Start a New Game Session
  function startNewGame() {
    const mainUser = (window.Auth && Auth.user && Auth.user.username) ? Auth.user.username : 'Pemain 1';
    const mainAvatar = (window.Auth && Auth.user) ? getAvatarSVG(Auth.user.avatarId || 0) : getAvatarSVG(0);

    state.players = [];
    state.rankings = [];
    state.currentTurnIndex = 0;
    state.diceValue = 0;
    state.diceRolled = false;
    state.consecutiveSixes = 0;
    state.active = true;

    // Build Players list
    const activeColors = state.playerCount === 2 ? ['red', 'yellow'] : ['red', 'green', 'yellow', 'blue'];
    let botIdx = 0;

    activeColors.forEach((color, index) => {
      let isBot = false;
      let name = '';
      let avatar = '';

      if (index === 0) {
        name = mainUser;
        avatar = mainAvatar;
        isBot = false;
      } else if (state.botCount > 0 && index >= (activeColors.length - state.botCount)) {
        isBot = true;
        name = BOT_NAMES[botIdx % BOT_NAMES.length];
        avatar = getAvatarSVG((botIdx + 1) % 6);
        botIdx++;
      } else {
        isBot = false;
        name = `Pemain ${index + 1}`;
        avatar = getAvatarSVG(index % 6);
      }

      state.players.push({
        id: index,
        color: color,
        name: name,
        isBot: isBot,
        avatarSvg: avatar,
        tokens: [
          { id: 0, stepCount: -1 }, // -1 = inside home base
          { id: 1, stepCount: -1 },
          { id: 2, stepCount: -1 },
          { id: 3, stepCount: -1 }
        ],
        rank: null
      });

      // Update name display
      const nameEl = document.getElementById(`ludo-name-${color}`);
      if (nameEl) nameEl.innerHTML = `${PLAYERS_CONFIG.find(c=>c.color===color).badge} ${name}`;
    });

    logMessage(`🎮 Game Ludo Dimulai! Giliran ${state.players[0].name}. Klik kocok dadu!`);
    renderTokens();
    updateTurnUI();

    // Sound effect
    if (window.Sounds) Sounds.play('click');

    // If first player is bot, trigger bot turn
    if (state.players[0].isBot) {
      setTimeout(handleBotTurn, 800);
    }
  }

  // Handle Human Clicking Roll Dice
  function onHumanRollDice() {
    if (!state.active) {
      startNewGame();
      setTimeout(rollDice, 300);
      return;
    }
    const curPlayer = state.players[state.currentTurnIndex];
    if (!curPlayer || curPlayer.isBot || state.diceRolled || state.isRolling) return;

    rollDice();
  }

  // Core Dice Rolling Logic with 3D animation
  function rollDice() {
    state.isRolling = true;
    const btnRoll = document.getElementById('btn-ludo-roll');
    if (btnRoll) btnRoll.disabled = true;

    if (window.Sounds) Sounds.play('dice');

    // Animate Dice Cube
    const diceDisplay = document.getElementById('ludo-dice-box');
    if (diceDisplay) diceDisplay.classList.add('rolling');

    setTimeout(() => {
      // Generated random 1..6
      const roll = Math.floor(Math.random() * 6) + 1;
      state.diceValue = roll;
      state.diceRolled = true;
      state.isRolling = false;

      if (diceDisplay) {
        diceDisplay.classList.remove('rolling');
        diceDisplay.setAttribute('data-value', roll);
        diceDisplay.innerHTML = `<span class="dice-val-num">${roll}</span>`;
      }

      logMessage(`🎲 ${state.players[state.currentTurnIndex].name} melempar dadu: <strong>${roll}</strong>!`);

      // Handle 3 consecutive 6s penalty
      if (roll === 6) {
        state.consecutiveSixes++;
        if (state.consecutiveSixes >= 3) {
          logMessage(`⚠️ ${state.players[state.currentTurnIndex].name} dapat dadu 6 tiga kali berturut-turut! Giliran hangus.`);
          state.consecutiveSixes = 0;
          setTimeout(nextTurn, 1200);
          return;
        }
      } else {
        state.consecutiveSixes = 0;
      }

      // Check valid moves for current player
      const movableTokens = getMovableTokens(state.players[state.currentTurnIndex], roll);

      if (movableTokens.length === 0) {
        logMessage(`❌ Tidak ada bidak yang dapat dipindahkan.`);
        setTimeout(nextTurn, 1200);
      } else if (movableTokens.length === 1 && state.players[state.currentTurnIndex].isBot) {
        // Auto move if 1 choice for bot
        setTimeout(() => moveToken(movableTokens[0]), 600);
      } else if (state.players[state.currentTurnIndex].isBot) {
        // Bot smart choice
        setTimeout(() => {
          const chosen = chooseBestBotToken(movableTokens, roll);
          moveToken(chosen);
        }, 800);
      } else {
        // Human choice: highlight tokens
        highlightMovableTokens(movableTokens);
      }
    }, 600);
  }

  // Calculate movable tokens given a dice roll
  function getMovableTokens(player, roll) {
    const movable = [];
    player.tokens.forEach(tok => {
      if (tok.stepCount === 56) return; // already finished

      if (tok.stepCount === -1) {
        // Need a 6 to get out of base
        if (roll === 6) movable.push(tok);
      } else {
        // Must not exceed 56 (home center)
        if (tok.stepCount + roll <= 56) movable.push(tok);
      }
    });
    return movable;
  }

  // Highlight Movable Tokens for Human Player
  function highlightMovableTokens(tokens) {
    clearHighlights();
    logMessage(`👉 Klik bidak berkedip (${tokens.length} pilihan) untuk melangkah!`);
    tokens.forEach(tok => {
      const el = document.getElementById(`token-${state.players[state.currentTurnIndex].color}-${tok.id}`);
      if (el) {
        el.classList.add('token-movable');
        const executeMove = (e) => {
          if (e) e.stopPropagation();
          clearHighlights();
          moveToken(tok);
        };
        el.onclick = executeMove;
        if (el.parentElement) {
          el.parentElement.onclick = executeMove;
          el.parentElement.style.cursor = 'pointer';
        }
      }
    });
  }

  function clearHighlights() {
    document.querySelectorAll('.ludo-token').forEach(el => {
      el.classList.remove('token-movable');
      el.onclick = null;
      if (el.parentElement) el.parentElement.onclick = null;
    });
  }

  // Move Selected Token
  function moveToken(token) {
    const curPlayer = state.players[state.currentTurnIndex];
    const roll = state.diceValue;

    if (token.stepCount === -1 && roll === 6) {
      // Step out of base to start (stepCount = 0)
      token.stepCount = 0;
      logMessage(`🚀 ${curPlayer.name} mengeluarkan bidak ke arena!`);
    } else {
      token.stepCount += roll;
      logMessage(`👣 ${curPlayer.name} memindahkan bidak ${roll} langkah.`);
    }

    if (window.Sounds) Sounds.play('correct');

    renderTokens();

    // Check Capture & Victory
    setTimeout(() => {
      let captureOccurred = false;
      let extraRollGranted = false;

      // Check if token landed on main track square (stepCount <= 50)
      if (token.stepCount >= 0 && token.stepCount <= 50) {
        const absPos = getAbsoluteTrackIndex(curPlayer.color, token.stepCount);
        
        // If not a safe spot, check capturing opponents
        if (!SAFE_SPOTS.includes(absPos)) {
          state.players.forEach(otherP => {
            if (otherP.color !== curPlayer.color) {
              otherP.tokens.forEach(otherTok => {
                if (otherTok.stepCount >= 0 && otherTok.stepCount <= 50) {
                  const otherAbsPos = getAbsoluteTrackIndex(otherP.color, otherTok.stepCount);
                  if (absPos === otherAbsPos) {
                    // CAPTURE! Knock opponent token back to home base!
                    otherTok.stepCount = -1;
                    captureOccurred = true;
                    logMessage(`💥 ${curPlayer.name} MEMAKAN bidak ${otherP.name}! Bidak dipukul mundur ke rumah!`);
                    if (window.Sounds) Sounds.play('powerup');
                  }
                }
              });
            }
          });
        }
      }

      // Re-render after capture
      renderTokens();

      // Check if player won
      if (checkPlayerFinished(curPlayer)) {
        if (!curPlayer.rank) {
          curPlayer.rank = state.rankings.length + 1;
          state.rankings.push(curPlayer);
          logMessage(`🏆 SELEBAT! ${curPlayer.name} meraih Juara ${curPlayer.rank}! 🎉`);
          if (window.Confetti) Confetti.start(120);
        }
      }

      // Check overall game finish
      if (state.rankings.length >= state.players.length - 1) {
        finishGame();
        return;
      }

      // Determine Extra Roll
      if (roll === 6 || captureOccurred) {
        extraRollGranted = true;
        logMessage(`⭐ ${curPlayer.name} mendapat KESEMPATAN LEMPAR DADU LAGI!`);

        // Trigger Quiz Bonus popup if Quiz Mode is ON
        if (state.quizMode && !curPlayer.isBot) {
          showLudoQuizBonus(token, () => {
            resetForNextTurn(true);
          });
          return;
        }
      }

      resetForNextTurn(extraRollGranted);
    }, 400);
  }

  function getAbsoluteTrackIndex(color, stepCount) {
    const cfg = PLAYERS_CONFIG.find(c => c.color === color);
    return (cfg.startPos + stepCount) % 52;
  }

  // Check if player has all 4 tokens at finish (stepCount = 56)
  function checkPlayerFinished(player) {
    return player.tokens.every(t => t.stepCount === 56);
  }

  // AI Bot Smart Token Selection
  function chooseBestBotToken(movableTokens, roll) {
    const curPlayer = state.players[state.currentTurnIndex];

    // Priority 1: Move token out of home base if roll is 6
    const baseTok = movableTokens.find(t => t.stepCount === -1);
    if (baseTok && roll === 6) return baseTok;

    // Priority 2: Token that can capture an opponent
    for (const tok of movableTokens) {
      const nextStep = tok.stepCount === -1 ? 0 : tok.stepCount + roll;
      if (nextStep <= 50) {
        const targetAbs = getAbsoluteTrackIndex(curPlayer.color, nextStep);
        if (!SAFE_SPOTS.includes(targetAbs)) {
          let canCapture = false;
          state.players.forEach(op => {
            if (op.color !== curPlayer.color) {
              op.tokens.forEach(opt => {
                if (opt.stepCount >= 0 && opt.stepCount <= 50) {
                  if (getAbsoluteTrackIndex(op.color, opt.stepCount) === targetAbs) {
                    canCapture = true;
                  }
                }
              });
            }
          });
          if (canCapture) return tok;
        }
      }
    }

    // Priority 3: Token that can enter Home Finish (step 56)
    const finishTok = movableTokens.find(t => t.stepCount + roll === 56);
    if (finishTok) return finishTok;

    // Priority 4: Token farthest along track
    movableTokens.sort((a, b) => b.stepCount - a.stepCount);
    return movableTokens[0];
  }

  // Prepare UI and turn pointer for next action
  function resetForNextTurn(samePlayerExtraTurn) {
    state.diceRolled = false;
    clearHighlights();

    if (!samePlayerExtraTurn) {
      nextTurn();
    } else {
      updateTurnUI();
      if (state.players[state.currentTurnIndex].isBot) {
        setTimeout(handleBotTurn, 800);
      }
    }
  }

  // Advance turn to next active player
  function nextTurn() {
    state.diceRolled = false;
    state.consecutiveSixes = 0;

    let loops = 0;
    do {
      state.currentTurnIndex = (state.currentTurnIndex + 1) % state.players.length;
      loops++;
    } while (state.players[state.currentTurnIndex].rank !== null && loops < 5);

    updateTurnUI();

    if (state.players[state.currentTurnIndex].isBot && state.active) {
      setTimeout(handleBotTurn, 900);
    }
  }

  // Handle Bot Automated Turn
  function handleBotTurn() {
    if (!state.active) return;
    const curPlayer = state.players[state.currentTurnIndex];
    if (!curPlayer.isBot || state.diceRolled) return;

    rollDice();
  }

  function doRenderTokens() {
    state.players.forEach(player => {
      player.tokens.forEach(tok => {
        let tokenEl = document.getElementById(`token-${player.color}-${tok.id}`);
        if (!tokenEl) {
          tokenEl = document.createElement('div');
          tokenEl.id = `token-${player.color}-${tok.id}`;
          tokenEl.className = `ludo-token token-${player.color}`;
          tokenEl.style.viewTransitionName = `token-${player.color}-${tok.id}`;
          tokenEl.innerHTML = `<div class="token-pin"></div>`;
        }

        tokenEl.classList.remove('finished-token');
        tokenEl.style.transform = '';

        let targetParent = null;

        if (tok.stepCount === -1) {
          // Inside Home Base slot
          targetParent = document.getElementById(`slot-${player.color}-${tok.id}`);
        } else if (tok.stepCount <= 50) {
          // On 52 Main Track
          const absIdx = getAbsoluteTrackIndex(player.color, tok.stepCount);
          const coords = getMainTrackCoords(absIdx);
          targetParent = document.querySelector(`.ludo-cell[data-row="${coords.r}"][data-col="${coords.c}"]`);
        } else if (tok.stepCount < 56) {
          // On Home Stretch
          const stretchIdx = tok.stepCount - 51;
          const coords = getHomeStretchCoords(player.color, stretchIdx);
          targetParent = document.querySelector(`.ludo-cell[data-row="${coords.r}"][data-col="${coords.c}"]`);
        } else {
          // Finished inside center victory triangle
          targetParent = document.querySelector(`.zone-center`);
          tokenEl.classList.add('finished-token');
        }

        if (targetParent && tokenEl.parentElement !== targetParent) {
          targetParent.appendChild(tokenEl);
        }
      });
    });

    // Fix overlap by translating if multiple tokens in same cell
    document.querySelectorAll('.ludo-cell').forEach(cell => {
       const tokens = Array.from(cell.querySelectorAll('.ludo-token'));
       if (tokens.length > 1) {
           tokens.forEach((t, i) => {
               const offset = (i - (tokens.length - 1)/2) * 6;
               t.style.transform = `translate(${offset}px, ${offset}px) scale(0.85)`;
           });
       }
    });
  }

  // Render Token Elements on 15x15 Board Grid & Home Bases
  function renderTokens() {
    if (document.startViewTransition) {
       document.startViewTransition(() => doRenderTokens());
    } else {
       doRenderTokens();
    }
  }

  // Update Current Turn Indicator UI
  function updateTurnUI() {
    const curPlayer = state.players[state.currentTurnIndex];
    if (!curPlayer) return;

    const turnCard = document.getElementById('ludo-turn-card');
    if (turnCard) {
      turnCard.style.borderColor = `var(--ludo-${curPlayer.color})`;
      turnCard.innerHTML = `
        <div class="turn-avatar">${curPlayer.avatarSvg}</div>
        <div class="turn-details">
          <span class="turn-label">GILIRAN MAIN</span>
          <h4 class="turn-name" style="color: var(--ludo-${curPlayer.color});">${PLAYERS_CONFIG.find(c=>c.color===curPlayer.color).badge} ${curPlayer.name} ${curPlayer.isBot ? '(BOT)' : ''}</h4>
        </div>
      `;
    }

    const diceBox = document.getElementById('ludo-dice-box');
    const baseArea = document.getElementById(`zone-${curPlayer.color}-base`);
    if (diceBox && baseArea) {
      diceBox.dataset.color = curPlayer.color;
      if (diceBox.parentElement !== baseArea) {
        baseArea.appendChild(diceBox);
      }
      if (!curPlayer.isBot && !state.diceRolled && !state.isRolling) {
         diceBox.classList.add('can-roll');
      } else {
         diceBox.classList.remove('can-roll');
      }
    }

    const btnRoll = document.getElementById('btn-ludo-roll');
    if (btnRoll) {
      btnRoll.disabled = curPlayer.isBot || state.diceRolled || state.isRolling;
    }
  }

  // Trigger Ludo Quiz Bonus Modal
  function showLudoQuizBonus(movedToken, callback) {
    const quizModal = document.getElementById('ludo-quiz-modal');
    if (!quizModal || !window.QuestionsManager) {
      if (callback) callback();
      return;
    }

    const q = QuestionsManager.getRandomQuestion('all', 'all');
    if (!q) { if (callback) callback(); return; }

    const qTitle = document.getElementById('ludo-quiz-q');
    const qOpts = document.getElementById('ludo-quiz-options');

    qTitle.textContent = q.question;
    qOpts.innerHTML = '';

    q.options.forEach((optText, index) => {
      const btn = document.createElement('button');
      btn.className = 'btn btn-secondary ludo-quiz-opt';
      btn.style.cssText = 'padding: 12px; margin: 4px 0; border-radius: 10px; font-weight: 600; font-size: 0.95rem; text-align: left;';
      btn.textContent = optText;
      btn.onclick = () => {
        quizModal.style.display = 'none';
        if (index === q.correctAnswer) {
          if (movedToken && movedToken.stepCount >= 0 && movedToken.stepCount < 56) {
            movedToken.stepCount = Math.min(56, movedToken.stepCount + 2);
            renderTokens();
            logMessage(`⚡ KUIS BENAR! Bidak Anda maju +2 LANGKAH BONUS EKSTRA! 🚀`);
          } else {
            logMessage(`⚡ KUIS BENAR! Jawaban tepat!`);
          }
          if (window.Sounds) Sounds.play('correct');
        } else {
          logMessage(`❌ Jawaban kuis kurang tepat.`);
          if (window.Sounds) Sounds.play('wrong');
        }
        if (callback) callback();
      };
      qOpts.appendChild(btn);
    });

    quizModal.style.display = 'flex';
  }

  // Finish Game & Show Winner Podium Modal
  function finishGame() {
    state.active = false;
    logMessage(`🎉 PERMAINAN SELESAI! Terima kasih telah bermain LudoRush!`);

    const winModal = document.getElementById('ludo-win-modal');
    const winList = document.getElementById('ludo-win-list');
    if (winModal && winList) {
      winList.innerHTML = state.rankings.map((p, idx) => `
        <div class="winner-row winner-rank-${idx + 1}">
          <span class="winner-medal">${idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</span>
          <div class="winner-avatar">${p.avatarSvg}</div>
          <span class="winner-name">${p.name}</span>
          <span class="winner-badge">Juara ${idx + 1}</span>
        </div>
      `).join('');

      winModal.style.display = 'flex';
      if (window.Confetti) Confetti.start(250);
    }
  }

  // Log Message Feed
  function logMessage(msg) {
    const logBox = document.getElementById('ludo-log-box');
    if (logBox) {
      const item = document.createElement('div');
      item.className = 'ludo-log-item';
      item.innerHTML = msg;
      logBox.prepend(item);

      // Keep max 15 log items
      while (logBox.children.length > 15) {
        logBox.removeChild(logBox.lastChild);
      }
    }
  }

  return {
    init,
    startNewGame
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  LudoGameManager.init();
});
