// ============================================================
// QuizRush v2 - Main Application Controller
// Supports Practice Mode (bots) + Arena Mode (multiplayer)
// ============================================================

const App = {
  // Module instances
  quiz: null,
  botManager: null,
  leaderboard: null,
  miniLeaderboard: null,
  roomManager: null,
  quizCreator: null,
  powerupManager: null,
  spinnerManager: null,

  // DOM elements
  pages: {},
  elements: {},

  // State
  allPlayers: [],
  currentUserId: null,
  currentMode: 'practice', // 'practice' or 'arena'
  arenaQuestions: [],
  arenaState: {
    currentIndex: -1,
    score: 0,
    streak: 0,
    maxStreak: 0,
    correctCount: 0,
    answers: [],
    timePerQuestion: 10,
    timerInterval: null,
    questionStartTime: 0,
    answered: false
  },

  /**
   * Initialize the application
   */
  init() {
    this.quiz = new QuizEngine();
    this.botManager = new BotManager();
    this.leaderboard = new LeaderboardManager();
    this.miniLeaderboard = new LeaderboardManager();
    this.roomManager = new RoomManager();
    this.quizCreator = new QuizCreator();
    this.powerupManager = new PowerUpManager();
    this.spinnerManager = new SpinnerManager();

    // Init Firebase
    const fbReady = initFirebase();

    this.cacheElements();
    this.bindEvents();
    this.initParticles();
    this.initAvatarPicker();

    // Check URL params for auto-join
    const urlParams = new URLSearchParams(window.location.search);
    const roomCode = urlParams.get('room');

    // Check login
    const user = Auth.getCurrentUser();
    if (user) {
      this.currentUserId = user.id;
      if (roomCode) {
        this.showPage('join');
        document.getElementById('join-room-code').value = roomCode;
      } else {
        this.showPage('lobby');
        this.updateLobbyUI(user);
      }
    } else {
      if (roomCode) {
        // Save room code for after login
        sessionStorage.setItem('pendingRoom', roomCode);
      }
      this.showPage('login');
    }

    // Show/hide multiplayer button based on Firebase
    const arenaButtons = document.querySelectorAll('.requires-firebase');
    arenaButtons.forEach(btn => {
      if (!fbReady) {
        btn.classList.add('disabled-feature');
        btn.title = 'Firebase belum dikonfigurasi';
      }
    });
  },

  /**
   * Cache DOM elements
   */
  cacheElements() {
    this.pages = {
      login: document.getElementById('page-login'),
      lobby: document.getElementById('page-lobby'),
      setup: document.getElementById('page-setup'),
      creator: document.getElementById('page-creator'),
      join: document.getElementById('page-join'),
      waiting: document.getElementById('page-waiting'),
      countdown: document.getElementById('page-countdown'),
      quiz: document.getElementById('page-quiz'),
      results: document.getElementById('page-results')
    };

    // Login
    this.elements.loginUsername = document.getElementById('login-username');
    this.elements.loginError = document.getElementById('login-error');
    this.elements.selectedAvatarDisplay = document.getElementById('selected-avatar-display');
    this.elements.avatarGrid = document.getElementById('avatar-grid');
    this.elements.selectedAvatarId = 0;

    // Lobby
    this.elements.lobbyUsername = document.getElementById('lobby-username');
    this.elements.lobbyAvatar = document.getElementById('lobby-avatar');
    this.elements.lobbyBestScore = document.getElementById('lobby-best-score');
    this.elements.lobbyTotalGames = document.getElementById('lobby-total-games');
    this.elements.lobbyAccuracy = document.getElementById('lobby-accuracy');
    this.elements.lobbyScoreHistory = document.getElementById('lobby-score-history');
    this.elements.multiplayerStatus = document.getElementById('multiplayer-status');

    // Setup (practice)
    this.elements.setupQuestionCount = document.getElementById('setup-question-count');
    this.elements.setupCategory = document.getElementById('setup-category');
    this.elements.setupDifficulty = document.getElementById('setup-difficulty');
    this.elements.setupTime = document.getElementById('setup-time');
    this.elements.setupBotCount = document.getElementById('setup-bot-count');

    // Creator
    this.elements.creatorContainer = document.getElementById('creator-form-container');
    this.elements.creatorError = document.getElementById('creator-error');

    // Join
    this.elements.joinRoomCode = document.getElementById('join-room-code');
    this.elements.joinError = document.getElementById('join-error');

    // Waiting
    this.elements.waitingRoomCode = document.getElementById('waiting-room-code');
    this.elements.waitingTitle = document.getElementById('waiting-title');
    this.elements.waitingPlayers = document.getElementById('waiting-players-list');
    this.elements.waitingCount = document.getElementById('waiting-player-count');
    this.elements.waitingShareLink = document.getElementById('waiting-share-link');

    // Countdown
    this.elements.countdownNumber = document.getElementById('countdown-number');

    // Quiz
    this.elements.quizProgress = document.getElementById('quiz-progress');
    this.elements.quizProgressBar = document.getElementById('quiz-progress-bar');
    this.elements.quizCategory = document.getElementById('quiz-category');
    this.elements.quizDifficulty = document.getElementById('quiz-difficulty');
    this.elements.quizScore = document.getElementById('quiz-score');
    this.elements.quizStreak = document.getElementById('quiz-streak');
    this.elements.quizTimerCircle = document.getElementById('timer-circle-progress');
    this.elements.quizTimerText = document.getElementById('timer-text');
    this.elements.quizQuestion = document.getElementById('quiz-question');
    this.elements.quizOptions = document.getElementById('quiz-options');
    this.elements.quizMiniLeaderboard = document.getElementById('quiz-mini-leaderboard');
    this.elements.quizModeLabel = document.getElementById('quiz-mode-label');

    // Results
    this.elements.resultsLeaderboard = document.getElementById('results-leaderboard');
    this.elements.resultsStats = document.getElementById('results-stats');
    this.elements.resultsBreakdown = document.getElementById('results-breakdown');
  },

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Login
    document.getElementById('btn-login').addEventListener('click', () => this.handleLogin());
    document.getElementById('btn-register').addEventListener('click', () => this.handleRegister());
    this.elements.loginUsername.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleLogin();
    });

    // Lobby
    document.getElementById('btn-practice').addEventListener('click', () => this.showPage('setup'));
    document.getElementById('btn-create-quiz').addEventListener('click', () => this.startCreator());
    document.getElementById('btn-join-arena').addEventListener('click', () => this.showPage('join'));
    document.getElementById('btn-logout').addEventListener('click', () => this.handleLogout());

    // Create Spinner Room directly
    const createSpinnerBtn = document.getElementById('btn-create-spinner-room');
    if (createSpinnerBtn) {
      createSpinnerBtn.addEventListener('click', async () => {
        if (!isMultiplayerAvailable()) {
          alert('Firebase belum dikonfigurasi!');
          return;
        }
        
        const user = Auth.getCurrentUser() || { id: 'user_' + Date.now(), username: 'Pemain', avatarId: 0 };
        const originalText = createSpinnerBtn.innerHTML;
        createSpinnerBtn.innerHTML = '⏳ Membuat Room...';
        createSpinnerBtn.disabled = true;

        try {
          const dummyQuiz = {
            title: "Room Spinner Khusus",
            type: "spinner-only",
            questions: []
          };

          const code = await this.roomManager.createRoom(dummyQuiz, {
            id: user.id,
            name: user.username,
            avatarId: user.avatarId
          });

          if (code) {
            this.currentMode = 'multiplayer';
            this.setupWaitingRoom(code, "Room Spinner Khusus", true);
            this.showPage('waiting');
            
            // Auto-open spinner for host after creating
            setTimeout(() => {
              const waitingSpinnerBtn = document.getElementById('btn-spin-wheel-waiting');
              if (waitingSpinnerBtn) waitingSpinnerBtn.click();
            }, 300);
          } else {
            alert('Gagal membuat room spinner. Silakan periksa koneksi internet Anda dan coba lagi.');
          }
        } catch (err) {
          console.error('Error creating spinner room:', err);
          alert('Gagal membuat room: ' + (err.message || 'Terjadi kesalahan jaringan'));
        } finally {
          createSpinnerBtn.innerHTML = originalText;
          createSpinnerBtn.disabled = false;
        }
      });
    }

    // Spin the Wheel
    const openSpinnerHandler = () => {
      // Auto-preload player names from current session if available
      const preload = [];
      const user = Auth.getCurrentUser();
      
      const fillBtn = document.getElementById('btn-fill-room-players');
      
      if (this.currentMode === 'multiplayer' && this.roomManager && this.roomManager.room) {
        // If in a room, preload with room players
        const onlineNames = this.roomManager.room.players.filter(p => p.isOnline).map(p => p.name);
        preload.push(...onlineNames);
        if (fillBtn) fillBtn.style.display = 'block';
      } else {
        // Not in room, just current user
        if (user) preload.push(user.username);
        if (fillBtn) fillBtn.style.display = 'none';
      }
      
      this.spinnerManager.open(preload);
    };

    document.getElementById('btn-spin-wheel-lobby').addEventListener('click', openSpinnerHandler);
    
    // Check if the waiting room spinner button exists, then add listener
    const waitingSpinnerBtn = document.getElementById('btn-spin-wheel-waiting');
    if (waitingSpinnerBtn) {
      waitingSpinnerBtn.addEventListener('click', openSpinnerHandler);
    }
    
    document.getElementById('btn-fill-room-players').addEventListener('click', () => {
      if (this.currentMode === 'multiplayer' && this.roomManager && this.roomManager.room) {
        const onlineNames = this.roomManager.room.players.filter(p => p.isOnline).map(p => p.name);
        this.spinnerManager.names = onlineNames;
        this.spinnerManager.renderNamesList();
        if (this.spinnerManager.wheel) this.spinnerManager.wheel.setNames(onlineNames);
      }
    });

    document.getElementById('btn-close-spinner').addEventListener('click', () => this.spinnerManager.close());
    document.getElementById('btn-spin-wheel').addEventListener('click', () => this.spinnerManager.spin());
    document.getElementById('btn-add-spinner-name').addEventListener('click', () => {
      const input = document.getElementById('spinner-name-input');
      this.spinnerManager.addName(input.value);
      input.value = '';
      input.focus();
    });
    document.getElementById('spinner-name-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const input = document.getElementById('spinner-name-input');
        this.spinnerManager.addName(input.value);
        input.value = '';
      }
    });
    document.getElementById('btn-clear-spinner').addEventListener('click', () => this.spinnerManager.clearAll());
    // Close modal on overlay click
    document.getElementById('spinner-modal').addEventListener('click', (e) => {
      if (e.target.id === 'spinner-modal') this.spinnerManager.close();
    });
    // Winner overlay buttons
    document.getElementById('btn-close-winner').addEventListener('click', () => this.spinnerManager.closeWinner());
    document.getElementById('btn-spin-again').addEventListener('click', () => {
      this.spinnerManager.closeWinner();
    });
    // Close winner overlay on click outside
    document.getElementById('spinner-winner-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'spinner-winner-overlay') this.spinnerManager.closeWinner();
    });

    // Global Leaderboard refresh
    document.getElementById('btn-refresh-glb').addEventListener('click', () => this.fetchGlobalLeaderboard());

    // Setup (practice)
    document.getElementById('btn-begin-practice').addEventListener('click', () => this.startPracticeQuiz());
    document.getElementById('btn-back-lobby-setup').addEventListener('click', () => this.showPage('lobby'));

    // Creator
    document.getElementById('btn-create-arena').addEventListener('click', () => this.createArena());
    document.getElementById('btn-back-lobby-creator').addEventListener('click', () => this.showPage('lobby'));

    // Join
    document.getElementById('btn-join-room').addEventListener('click', () => this.joinArena());
    document.getElementById('btn-back-lobby-join').addEventListener('click', () => this.showPage('lobby'));
    this.elements.joinRoomCode.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.joinArena();
    });
    
    // QR Scanner
    document.getElementById('btn-scan-qr').addEventListener('click', () => {
      const qrReader = document.getElementById('qr-reader');
      if (qrReader.style.display === 'block') {
        if (this.html5Qrcode) {
          this.html5Qrcode.stop().then(() => {
            this.html5Qrcode.clear();
            this.html5Qrcode = null;
          }).catch(err => console.error(err));
        }
        qrReader.style.display = 'none';
      } else {
        qrReader.style.display = 'block';
        this.html5Qrcode = new Html5Qrcode("qr-reader");
        
        this.html5Qrcode.start(
          { facingMode: "environment" }, // Prefer back camera
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            let code = decodedText;
            try {
              const url = new URL(decodedText);
              const params = new URLSearchParams(url.search);
              if(params.has('room')) code = params.get('room');
            } catch(e) {}
            
            if (code && code.length >= 4) {
               this.elements.joinRoomCode.value = code.toUpperCase().trim();
               
               this.html5Qrcode.stop().then(() => {
                 this.html5Qrcode.clear();
                 this.html5Qrcode = null;
                 qrReader.style.display = 'none';
                 this.joinArena();
               });
            }
          },
          (errorMessage) => {
            // Ignore normal scanning errors
          }
        ).catch((err) => {
          alert("Kamera tidak bisa diakses! Pastikan kamu membuka link via HTTPS atau izinkan akses kamera di browser.");
          qrReader.style.display = 'none';
        });
      }
    });

    // Waiting
    document.getElementById('btn-start-arena').addEventListener('click', () => this.startArenaQuiz());
    document.getElementById('btn-leave-room').addEventListener('click', () => this.leaveRoom());
    document.getElementById('btn-copy-link').addEventListener('click', () => this.copyShareLink());
    
    // QR Code
    document.getElementById('btn-show-qr').addEventListener('click', () => {
      document.getElementById('qr-modal').style.display = 'flex';
      new QRious({
        element: document.getElementById('qr-canvas'),
        value: this.elements.waitingShareLink.value,
        size: 250,
        level: 'H'
      });
    });
    document.getElementById('btn-close-qr').addEventListener('click', () => {
      document.getElementById('qr-modal').style.display = 'none';
    });

    // Results
    document.getElementById('btn-play-again').addEventListener('click', () => {
      if (this.currentMode === 'arena') {
        this.showPage('lobby');
      } else {
        this.showPage('setup');
      }
    });
    document.getElementById('btn-back-lobby-results').addEventListener('click', () => {
      this.showPage('lobby');
      this.updateLobbyUI(Auth.getCurrentUser());
    });
    document.getElementById('btn-toggle-breakdown').addEventListener('click', () => this.toggleBreakdown());
    
    // PDF Export
    document.getElementById('btn-save-pdf').addEventListener('click', () => {
      const element = document.getElementById('results-leaderboard');
      const originalBg = element.style.background;
      // Add dark background so it doesn't render transparent on PDF
      element.style.background = '#0a0a1a';
      element.style.padding = '20px';
      
      const opt = {
        margin:       10,
        filename:     'QuizRush-Leaderboard.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      
      html2pdf().set(opt).from(element).save().then(() => {
        // Restore styling after export
        element.style.background = originalBg;
        element.style.padding = '';
      });
    });

    // Mute button
    const btnMute = document.getElementById('btn-mute');
    if (btnMute) {
      btnMute.addEventListener('click', () => {
        const muted = Sounds.toggleMute();
        btnMute.textContent = muted ? '🔇' : '🔊';
        btnMute.classList.toggle('muted', muted);
      });
    }
  },

  // ==========================================
  // Page Navigation
  // ==========================================

  showPage(pageName) {
    Object.values(this.pages).forEach(page => {
      if (page) page.classList.remove('active');
    });
    if (this.pages[pageName]) {
      this.pages[pageName].classList.add('active');
    }

    if (pageName === 'lobby') {
      const user = Auth.getCurrentUser();
      if (user) this.updateLobbyUI(user);
    }
    if (pageName === 'setup') {
      this.updateSetupUI();
    }
  },

  // ==========================================
  // Authentication
  // ==========================================

  handleLogin() {
    const username = this.elements.loginUsername.value;
    const result = Auth.login(username);

    if (result.success) {
      this.currentUserId = result.user.id;
      this.elements.loginError.textContent = '';
      this.elements.loginError.className = 'auth-message';

      // Check for pending room
      const pendingRoom = sessionStorage.getItem('pendingRoom');
      if (pendingRoom) {
        sessionStorage.removeItem('pendingRoom');
        this.showPage('join');
        document.getElementById('join-room-code').value = pendingRoom;
      } else {
        this.showPage('lobby');
        this.updateLobbyUI(result.user);
      }
    } else {
      this.elements.loginError.textContent = result.message;
      this.elements.loginError.className = 'auth-message error';
      this.shakeElement(this.elements.loginError);
    }
  },

  handleRegister() {
    const username = this.elements.loginUsername.value;
    const avatarId = this.elements.selectedAvatarId;
    const result = Auth.register(username, avatarId);

    if (result.success) {
      this.currentUserId = result.user.id;
      this.elements.loginError.textContent = result.message;
      this.elements.loginError.className = 'auth-message success';
      setTimeout(() => {
        const pendingRoom = sessionStorage.getItem('pendingRoom');
        if (pendingRoom) {
          sessionStorage.removeItem('pendingRoom');
          this.showPage('join');
          document.getElementById('join-room-code').value = pendingRoom;
        } else {
          this.showPage('lobby');
          this.updateLobbyUI(result.user);
        }
      }, 800);
    } else {
      this.elements.loginError.textContent = result.message;
      this.elements.loginError.className = 'auth-message error';
      this.shakeElement(this.elements.loginError);
    }
  },

  handleLogout() {
    if (this.roomManager.roomCode) {
      this.roomManager.leaveRoom();
    }
    Auth.logout();
    this.currentUserId = null;
    this.elements.loginUsername.value = '';
    this.showPage('login');
  },

  // ==========================================
  // Avatar Picker (SVG)
  // ==========================================

  initAvatarPicker() {
    const grid = this.elements.avatarGrid;
    grid.innerHTML = '';

    AVATARS.forEach((avatar, idx) => {
      const btn = document.createElement('button');
      btn.className = 'avatar-option' + (idx === 0 ? ' selected' : '');
      btn.innerHTML = avatar.svg;
      btn.title = avatar.name;
      btn.addEventListener('click', () => {
        grid.querySelectorAll('.avatar-option').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.elements.selectedAvatarId = idx;
        this.elements.selectedAvatarDisplay.innerHTML = avatar.svg;
      });
      grid.appendChild(btn);
    });

    this.elements.selectedAvatarDisplay.innerHTML = AVATARS[0].svg;
    this.elements.selectedAvatarId = 0;
  },

  // ==========================================
  // Lobby
  // ==========================================

  updateLobbyUI(user) {
    this.elements.lobbyUsername.textContent = user.username;
    this.elements.lobbyAvatar.innerHTML = Auth.getUserAvatarSVG(user);
    this.elements.lobbyBestScore.textContent = (user.bestScore || 0).toLocaleString();
    this.elements.lobbyTotalGames.textContent = user.totalGames || 0;

    const accuracy = user.totalQuestions > 0
      ? Math.round((user.totalCorrect / user.totalQuestions) * 100)
      : 0;
    this.elements.lobbyAccuracy.textContent = accuracy + '%';

    // Firebase status
    this.elements.multiplayerStatus.innerHTML = isMultiplayerAvailable()
      ? '<span class="status-online">🟢 Multiplayer Aktif</span>'
      : '<span class="status-offline">🔴 Multiplayer Offline — <a href="SETUP.md" target="_blank">Setup Firebase</a></span>';

    // Score history
    const myScores = Auth.getMyScores(5);
    if (myScores.length > 0) {
      this.elements.lobbyScoreHistory.innerHTML = myScores.map((s, i) => `
        <div class="history-row">
          <span class="history-rank">#${i + 1}</span>
          <span class="history-score">${s.score.toLocaleString()} pts</span>
          <span class="history-accuracy">${s.accuracy}%</span>
          <span class="history-date">${new Date(s.date).toLocaleDateString('id-ID')}</span>
        </div>
      `).join('');
    } else {
      this.elements.lobbyScoreHistory.innerHTML = '<p class="no-data">Belum ada riwayat permainan</p>';
    }

    // Global Leaderboard
    this.fetchGlobalLeaderboard();
  },

  // ==========================================
  // Global Leaderboard (Firebase)
  // ==========================================

  /** Push player's best score to Firebase global leaderboard */
  async submitGlobalScore(user, score) {
    if (!isMultiplayerAvailable() || !user || score <= 0) return;
    const path = `globalLeaderboard/${user.id}`;
    const existing = await FireDB.get(path);
    if (!existing || score > (existing.score || 0)) {
      await FireDB.set(path, {
        username: user.username,
        avatarId: user.avatarId || 0,
        score,
        updatedAt: FireDB.serverTimestamp()
      });
    }
  },

  /** Fetch and render top-10 global scores from Firebase */
  async fetchGlobalLeaderboard() {
    const el = document.getElementById('global-lb-list');
    if (!el) return;

    if (!isMultiplayerAvailable()) {
      el.innerHTML = '<p class="no-data" style="font-size:0.8rem;">Firebase offline — global LB tidak tersedia</p>';
      return;
    }

    el.innerHTML = '<p class="no-data" style="font-size:0.8rem;">⏳ Memuat...</p>';

    try {
      const data = await FireDB.get('globalLeaderboard');
      if (!data) {
        el.innerHTML = '<p class="no-data" style="font-size:0.8rem;">Belum ada skor global. Jadilah yang pertama!</p>';
        return;
      }

      const entries = Object.entries(data)
        .map(([id, v]) => ({ id, ...v }))
        .filter(e => e.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

      const medals = ['🥇', '🥈', '🥉'];
      const currentUser = Auth.getCurrentUser();

      el.innerHTML = entries.map((e, i) => {
        const isMe = currentUser && e.id === currentUser.id;
        return `
          <div class="glb-row ${isMe ? 'glb-me' : ''}">
            <span class="glb-rank">${medals[i] || (i + 1)}</span>
            <span class="glb-avatar">${getAvatarSVG(e.avatarId || 0)}</span>
            <span class="glb-name">${e.username}${isMe ? ' ⭐' : ''}</span>
            <span class="glb-score">${(e.score || 0).toLocaleString()} pts</span>
          </div>
        `;
      }).join('');
    } catch (err) {
      el.innerHTML = '<p class="no-data" style="font-size:0.8rem;">Gagal memuat data.</p>';
    }
  },



  // ==========================================
  // Practice Mode (with Bots)
  // ==========================================

  updateSetupUI() {
    const categories = getCategories();
    const categorySelect = this.elements.setupCategory;
    categorySelect.innerHTML = '<option value="all">Semua Kategori</option>';
    categories.forEach(cat => {
      categorySelect.innerHTML += `<option value="${cat}">${cat}</option>`;
    });
  },

  startPracticeQuiz() {
    this.currentMode = 'practice';

    const config = {
      totalQuestions: parseInt(this.elements.setupQuestionCount.value),
      category: this.elements.setupCategory.value,
      difficulty: this.elements.setupDifficulty.value,
      timePerQuestion: parseInt(this.elements.setupTime.value)
    };
    const botCount = parseInt(this.elements.setupBotCount.value);

    const questionCount = this.quiz.init(config);
    if (questionCount === 0) {
      alert('Tidak cukup soal untuk konfigurasi ini!');
      return;
    }

    this.botManager.createBots(botCount);
    this.botManager.resetBots();

    // Reset power-ups for new game
    this.powerupManager.reset();

    this.miniLeaderboard.init(this.elements.quizMiniLeaderboard);
    this.leaderboard.init(this.elements.resultsLeaderboard);
    this.miniLeaderboard.reset();
    this.leaderboard.reset();

    if (this.elements.quizModeLabel) {
      this.elements.quizModeLabel.textContent = '🤖 Practice Mode';
    }

    this.showPage('countdown');
    this.runCountdown(3, () => {
      this.showPage('quiz');
      this.beginPracticeQuiz();
    });
  },

  beginPracticeQuiz() {
    // Setup power-up callbacks
    this.powerupManager.onFiftyFifty = () => this.applyFiftyFifty();
    this.powerupManager.onAddTime    = () => this.applyAddTime();
    this.powerupManager.onSkip       = () => this.applySkip();

    this.quiz.onQuestionStart = (question, index, total) => {
      this.renderQuestion(question, index, total);
      this.botManager.simulateAnswers(
        this.quiz.config.timePerQuestion,
        question.difficulty,
        () => this.updatePracticePlayers()
      );
    };

    TimerFX.init(this.elements.quizTimerText, this.elements.quizTimerCircle);
    StreakFX.reset();
    EmojiReact.show();

    this.quiz.onTimerTick = (timeLeft, totalTime) => this.updateTimer(timeLeft, totalTime);

    this.quiz.onAnswerResult = (result) => {
      this.showAnswerFeedback(result);
      this.updatePracticePlayers();
    };

    this.quiz.onScoreUpdate = (totalScore, gained) => this.animateScore(totalScore, gained);

    this.quiz.onQuizEnd = (results) => {
      Sounds.play('finish');
      EmojiReact.hide();
      this.showPracticeResults(results);
    };

    this.quiz.startQuiz();
  },

  updatePracticePlayers() {
    const playerData = this.quiz.getPlayerData();
    // Use SVG avatar for player
    const user = Auth.getCurrentUser();
    playerData.avatarHtml = user ? Auth.getUserAvatarSVG(user) : getAvatarSVG(0);

    this.allPlayers = [playerData, ...this.botManager.bots.map(b => ({
      ...b,
      avatarHtml: `<span class="avatar-emoji">${b.avatar}</span>`
    }))];

    this.miniLeaderboard.updateMini(this.allPlayers, this.currentUserId, 5);
  },

  showPracticeResults(results) {
    this.botManager.clearTimers();
    this.showPage('results');

    Auth.updateStats(results.score, results.correctAnswers, results.totalQuestions);

    // 🌍 Submit to global leaderboard
    const user = Auth.getCurrentUser();
    this.submitGlobalScore(user, results.score);

    const playerData = this.quiz.getPlayerData();
    playerData.avatarHtml = user ? Auth.getUserAvatarSVG(user) : getAvatarSVG(0);

    const finalPlayers = [playerData, ...this.botManager.bots.map(b => ({
      ...b,
      avatarHtml: `<span class="avatar-emoji">${b.avatar}</span>`
    }))];

    this.leaderboard.showFinalResults(finalPlayers, this.currentUserId);
    this.renderStats(results);
    this.renderBreakdown(results);

    // 🎊 Confetti if score > 0
    if (results.score > 0) Confetti.start(results.accuracy >= 60 ? 220 : 120);
  },


  // ==========================================
  // Quiz Creator
  // ==========================================

  startCreator() {
    this.quizCreator.reset();
    this.quizCreator.init(this.elements.creatorContainer);
    this.showPage('creator');
  },

  async createArena() {
    const validation = this.quizCreator.validate();
    if (!validation.valid) {
      this.elements.creatorError.textContent = validation.message;
      this.elements.creatorError.className = 'auth-message error';
      return;
    }

    if (!isMultiplayerAvailable()) {
      this.elements.creatorError.textContent = 'Firebase belum dikonfigurasi! Buka SETUP.md untuk panduan.';
      this.elements.creatorError.className = 'auth-message error';
      return;
    }

    const quizData = this.quizCreator.getQuizData();
    const user = Auth.getCurrentUser();

    const btn = document.getElementById('btn-create-arena');
    btn.textContent = '⏳ Membuat Arena...';
    btn.disabled = true;

    const code = await this.roomManager.createRoom(quizData, {
      id: user.id,
      name: user.username,
      avatarId: user.avatarId
    });

    btn.textContent = '🚀 Buat Arena & Dapatkan Link';
    btn.disabled = false;

    if (code) {
      this.setupWaitingRoom(code, quizData.title, true);
      this.showPage('waiting');
    } else {
      this.elements.creatorError.textContent = 'Gagal membuat arena. Cek koneksi internet.';
      this.elements.creatorError.className = 'auth-message error';
    }
  },

  // ==========================================
  // Join Arena
  // ==========================================

  async joinArena() {
    const code = this.elements.joinRoomCode.value.trim().toUpperCase();
    if (!code || code.length < 4) {
      this.elements.joinError.textContent = 'Masukkan kode room yang valid!';
      this.elements.joinError.className = 'auth-message error';
      return;
    }

    if (!isMultiplayerAvailable()) {
      this.elements.joinError.textContent = 'Firebase belum dikonfigurasi!';
      this.elements.joinError.className = 'auth-message error';
      return;
    }

    const user = Auth.getCurrentUser();
    const btn = document.getElementById('btn-join-room');
    btn.textContent = '⏳ Joining...';
    btn.disabled = true;

    this.roomManager.onError = (msg) => {
      this.elements.joinError.textContent = msg;
      this.elements.joinError.className = 'auth-message error';
      btn.textContent = '🚪 Masuk Arena';
      btn.disabled = false;
    };

    const meta = await this.roomManager.joinRoom(code, {
      id: user.id,
      name: user.username,
      avatarId: user.avatarId
    });

    btn.textContent = '🚪 Masuk Arena';
    btn.disabled = false;

    if (meta) {
      this.setupWaitingRoom(code, meta.title, false);
      this.showPage('waiting');
    }
  },

  // ==========================================
  // Waiting Room
  // ==========================================

  setupWaitingRoom(code, title, isHost) {
    this.elements.waitingRoomCode.textContent = code;
    this.elements.waitingTitle.textContent = title;
    this.elements.waitingShareLink.value = this.roomManager.getShareLink();

    // Show/hide host controls
    const startBtn = document.getElementById('btn-start-arena');
    const isSpinnerOnly = title === "Room Spinner Khusus" || title === "Room Spinner";
    startBtn.style.display = (isHost && !isSpinnerOnly) ? 'block' : 'none';

    const hostLabel = document.getElementById('waiting-host-label');
    if (hostLabel) {
      hostLabel.textContent = isHost ? 'Kamu adalah HOST' : 'Menunggu host memulai...';
    }

    // Listen for players
    this.roomManager.onPlayersChanged = (players) => {
      this.elements.waitingCount.textContent = players.length;
      this.elements.waitingPlayers.innerHTML = players.map(p => `
        <div class="waiting-player-row">
          <div class="waiting-player-avatar">${getAvatarSVG(p.avatarId || 0)}</div>
          <span class="waiting-player-name">${p.name}${p.isHost ? ' 👑' : ''}</span>
          <span class="waiting-player-status ${p.isOnline ? 'online' : 'offline'}">${p.isOnline ? '✅' : '❌'}</span>
        </div>
      `).join('');

      // Sync online player names into spinner wheel
      const onlineNames = players.filter(p => p.isOnline).map(p => p.name);
      this.spinnerManager.names = onlineNames;
      this.spinnerManager.renderNamesList();
      if (this.spinnerManager.wheel) {
        this.spinnerManager.wheel.setNames(onlineNames);
      }
    };


    // Listen for status changes
    this.roomManager.onStatusChanged = (status) => {
      if (status === 'countdown') {
        this.currentMode = 'arena';
        this.showPage('countdown');
        this.runCountdown(3, () => {
          this.showPage('quiz');
          this.beginArenaQuiz();
        });
      }
    };
  },

  copyShareLink() {
    const link = this.elements.waitingShareLink.value;
    navigator.clipboard.writeText(link).then(() => {
      const btn = document.getElementById('btn-copy-link');
      btn.textContent = '✅ Copied!';
      setTimeout(() => { btn.textContent = '📋 Copy'; }, 2000);
    }).catch(() => {
      this.elements.waitingShareLink.select();
    });
  },

  async leaveRoom() {
    await this.roomManager.leaveRoom();
    this.roomManager.reset();
    this.showPage('lobby');
  },

  // ==========================================
  // Arena Mode (Multiplayer)
  // ==========================================

  async startArenaQuiz() {
    if (!this.roomManager.isHost) return;
    await this.roomManager.startQuiz();
  },

  async beginArenaQuiz() {
    // Get questions from room
    this.arenaQuestions = await this.roomManager.getQuestions();
    const meta = await this.roomManager.getMeta();

    // Reset arena state
    this.arenaState = {
      currentIndex: -1,
      score: 0,
      streak: 0,
      maxStreak: 0,
      correctCount: 0,
      answers: [],
      timePerQuestion: meta.timePerQuestion || 10,
      timerInterval: null,
      questionStartTime: 0,
      answered: false
    };

    this.miniLeaderboard.init(this.elements.quizMiniLeaderboard);
    this.leaderboard.init(this.elements.resultsLeaderboard);
    this.miniLeaderboard.reset();
    this.leaderboard.reset();

    if (this.elements.quizModeLabel) {
      this.elements.quizModeLabel.textContent = '🌐 Arena Mode';
    }

    TimerFX.init(this.elements.quizTimerText, this.elements.quizTimerCircle);
    StreakFX.reset();
    EmojiReact.show();

    // Listen for player score updates
    this.roomManager.onPlayersChanged = (players) => {
      const mappedPlayers = players.map(p => ({
        id: p.id,
        name: p.name,
        isBot: false,
        avatarHtml: `<span class="avatar-svg-sm">${getAvatarSVG(p.avatarId || 0)}</span>`,
        score: p.score || 0,
        streak: p.streak || 0,
        correctAnswers: p.correctCount || 0,
        totalAnswered: 0
      }));
      this.allPlayers = mappedPlayers;
      this.miniLeaderboard.updateMini(mappedPlayers, this.currentUserId, 5);
    };

    // If host: advance questions
    if (this.roomManager.isHost) {
      this.arenaHostAdvance(0);
    }

    // Listen for question changes (all clients)
    this.roomManager.onQuestionChanged = (qIndex) => {
      if (qIndex >= 0 && qIndex < this.arenaQuestions.length) {
        this.arenaState.currentIndex = qIndex;
        this.arenaState.answered = false;
        const q = this.arenaQuestions[qIndex];
        this.renderQuestion(q, qIndex, this.arenaQuestions.length);
        this.startArenaTimer();
      }
    };

    // Listen for status (reveal, finished)
    this.roomManager.onStatusChanged = (status) => {
      if (status === 'finished') {
        this.showArenaResults();
      }
    };
  },

  async arenaHostAdvance(qIndex) {
    if (!this.roomManager.isHost) return;

    if (qIndex >= this.arenaQuestions.length) {
      await this.roomManager.finishQuiz();
      return;
    }

    await this.roomManager.showQuestion(qIndex);
  },

  startArenaTimer() {
    this.clearArenaTimer();
    const total = this.arenaState.timePerQuestion;
    this.arenaState.questionStartTime = performance.now();

    this.arenaState.timerInterval = setInterval(() => {
      const elapsed = (performance.now() - this.arenaState.questionStartTime) / 1000;
      const timeLeft = Math.max(0, total - elapsed);

      this.updateTimer(timeLeft, total);

      if (timeLeft <= 0) {
        this.clearArenaTimer();
        if (!this.arenaState.answered) {
          this.handleArenaTimeout();
        }
      }
    }, 50);
  },

  async handleArenaAnswer(optionIndex) {
    if (this.arenaState.answered) return;
    this.arenaState.answered = true;
    this.clearArenaTimer();

    const q = this.arenaQuestions[this.arenaState.currentIndex];
    const timeTaken = (performance.now() - this.arenaState.questionStartTime) / 1000;
    const isCorrect = optionIndex === q.correct;

    let points = 0;
    if (isCorrect) {
      const timeLeft = Math.max(0, this.arenaState.timePerQuestion - timeTaken);
      points = Math.round(1000 * (timeLeft / this.arenaState.timePerQuestion));
      const streakBonus = Math.min(this.arenaState.streak * 50, 250);
      points += streakBonus;
      this.arenaState.score += points;
      this.arenaState.streak++;
      this.arenaState.correctCount++;
      if (this.arenaState.streak > this.arenaState.maxStreak) {
        this.arenaState.maxStreak = this.arenaState.streak;
      }
    } else {
      this.arenaState.streak = 0;
    }

    const result = {
      isCorrect,
      correctOption: q.correct,
      selectedOption: optionIndex,
      points,
      totalScore: this.arenaState.score,
      streak: this.arenaState.streak,
      timedOut: false
    };

    this.arenaState.answers.push({
      questionIndex: this.arenaState.currentIndex,
      selectedOption: optionIndex,
      correctOption: q.correct,
      isCorrect,
      timeTaken: Math.round(timeTaken * 100) / 100,
      points,
      timedOut: false
    });

    this.showAnswerFeedback(result);
    this.animateScore(this.arenaState.score, points);

    // Sync to Firebase
    await this.roomManager.submitAnswer(this.arenaState.currentIndex, {
      selected: optionIndex,
      correct: isCorrect,
      timeMs: Math.round(timeTaken * 1000),
      points
    });
    await this.roomManager.updateScore(this.arenaState.score, this.arenaState.streak, this.arenaState.correctCount);

    // If host, advance after delay
    if (this.roomManager.isHost) {
      setTimeout(() => {
        this.arenaHostAdvance(this.arenaState.currentIndex + 1);
      }, 2500);
    }
  },

  handleArenaTimeout() {
    this.arenaState.answered = true;
    this.arenaState.streak = 0;

    const q = this.arenaQuestions[this.arenaState.currentIndex];
    const result = {
      isCorrect: false,
      correctOption: q.correct,
      selectedOption: -1,
      points: 0,
      totalScore: this.arenaState.score,
      streak: 0,
      timedOut: true
    };

    this.arenaState.answers.push({
      questionIndex: this.arenaState.currentIndex,
      selectedOption: -1,
      correctOption: q.correct,
      isCorrect: false,
      timeTaken: this.arenaState.timePerQuestion,
      points: 0,
      timedOut: true
    });

    this.showAnswerFeedback(result);

    // Sync
    this.roomManager.submitAnswer(this.arenaState.currentIndex, {
      selected: -1,
      correct: false,
      timeMs: this.arenaState.timePerQuestion * 1000,
      points: 0
    });
    this.roomManager.updateScore(this.arenaState.score, 0, this.arenaState.correctCount);

    if (this.roomManager.isHost) {
      setTimeout(() => {
        this.arenaHostAdvance(this.arenaState.currentIndex + 1);
      }, 2500);
    }
  },

  clearArenaTimer() {
    if (this.arenaState.timerInterval) {
      clearInterval(this.arenaState.timerInterval);
      this.arenaState.timerInterval = null;
    }
  },

  async showArenaResults() {
    this.clearArenaTimer();
    EmojiReact.hide();
    this.showPage('results');

    const totalQ = this.arenaQuestions.length;
    Auth.updateStats(this.arenaState.score, this.arenaState.correctCount, totalQ);

    // Get final players from Firebase
    const players = await this.roomManager.getPlayers();
    const finalPlayers = players.map(p => ({
      id: p.id,
      name: p.name,
      isBot: false,
      avatarHtml: `<span class="avatar-svg-sm">${getAvatarSVG(p.avatarId || 0)}</span>`,
      score: p.score || 0,
      streak: p.streak || 0,
      correctAnswers: p.correctCount || 0,
      totalAnswered: totalQ
    }));

    this.leaderboard.showFinalResults(finalPlayers, this.currentUserId);

    const results = {
      score: this.arenaState.score,
      correctAnswers: this.arenaState.correctCount,
      totalQuestions: totalQ,
      accuracy: Math.round((this.arenaState.correctCount / totalQ) * 100),
      maxStreak: this.arenaState.maxStreak,
      averageTime: totalQ > 0 ? Math.round((this.arenaState.answers.reduce((s, a) => s + a.timeTaken, 0) / totalQ) * 100) / 100 : 0,
      answers: this.arenaState.answers,
      questions: this.arenaQuestions
    };

    this.renderStats(results);
    this.renderBreakdown(results);

    // 🎊 Confetti for arena winners
    const myPlayer = (await this.roomManager.getPlayers()).find(p => p.id === this.currentUserId);
    if (myPlayer && myPlayer.score > 0) Confetti.start(230);

    // Cleanup room listener
    this.roomManager.stopListening();
  },

  // ==========================================
  // Shared Quiz UI
  // ==========================================

  renderQuestion(question, index, total) {
    this.elements.quizProgress.textContent = `${index + 1} / ${total}`;
    this.elements.quizProgressBar.style.width = `${((index + 1) / total) * 100}%`;

    this.elements.quizCategory.textContent = question.category || 'Custom';
    const diffMap = { easy: '🟢 Mudah', medium: '🟡 Sedang', hard: '🔴 Sulit' };
    this.elements.quizDifficulty.textContent = diffMap[question.difficulty] || '🟡 Sedang';

    const card = document.querySelector('.quiz-question-card');

    const doRender = () => {
      this.elements.quizQuestion.textContent = question.question;
      this.elements.quizQuestion.className = 'quiz-question';

      this.elements.quizOptions.innerHTML = '';
      const labels = ['A', 'B', 'C', 'D'];
      question.options.forEach((option, idx) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option fade-in';
        btn.style.animationDelay = `${idx * 0.07}s`;
        btn.innerHTML = `<span class="option-label">${labels[idx]}</span><span class="option-text">${option}</span>`;
        btn.addEventListener('click', () => {
          if (btn.classList.contains('disabled')) return;
          this.elements.quizOptions.querySelectorAll('.quiz-option').forEach(b => b.classList.add('disabled'));
          btn.classList.add('selected');

          if (this.currentMode === 'practice') {
            this.quiz.submitAnswer(idx);
          } else {
            this.handleArenaAnswer(idx);
          }
        });
        this.elements.quizOptions.appendChild(btn);
      });

      // Render power-up bar (practice mode only)
      if (this.currentMode === 'practice') {
        const puBar = document.getElementById('powerup-bar');
        if (puBar) this.powerupManager.render(puBar);
      }

      // Slide in new question
      if (card) {
        card.classList.remove('slide-in', 'slide-out', 'pulse-correct');
        void card.offsetWidth; // force reflow
        card.classList.add('slide-in');
      }

      this.updateStreakDisplay();
    };

    // If card exists, slide out first then render
    if (card && index > 0) {
      card.classList.add('slide-out');
      setTimeout(doRender, 260);
    } else {
      doRender();
    }
  },

  showAnswerFeedback(result) {
    const options = this.elements.quizOptions.querySelectorAll('.quiz-option');
    const card = document.querySelector('.quiz-question-card');

    if (options[result.correctOption]) options[result.correctOption].classList.add('correct');

    if (result.isCorrect) {
      // Sound + card pulse + confetti
      Sounds.play(this.quiz && this.quiz.state.streak >= 3 ? 'combo' : 'correct');
      if (card) {
        card.classList.add('pulse-correct');
        setTimeout(() => card.classList.remove('pulse-correct'), 700);
        this._spawnConfetti(card);
      }
    } else if (result.skipped) {
      // Skip — no sound here (already played in powerup), show correct
    } else {
      Sounds.play('wrong');
      // Shake the wrong option
      if (!result.timedOut && result.selectedOption >= 0 && options[result.selectedOption]) {
        options[result.selectedOption].classList.add('wrong');
      }
    }

    if (!result.isCorrect && result.selectedOption >= 0 && options[result.selectedOption]) {
      options[result.selectedOption].classList.add('wrong');
    }

    if (result.timedOut) {
      this.elements.quizQuestion.textContent += ' ⏰ Waktu Habis!';
    }
    if (result.points > 0) this.showFloatingPoints(result.points);
    this.updateStreakDisplay();
  },

  // Spawn mini CSS confetti dots around the question card
  _spawnConfetti(card) {
    const colors = ['#a78bfa', '#22c55e', '#06b6d4', '#f59e0b', '#f472b6'];
    const count = 8;
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('div');
      dot.className = 'confetti-dot';
      dot.style.cssText = `
        background: ${colors[i % colors.length]};
        left: ${10 + Math.random() * 80}%;
        top: ${Math.random() * 60}%;
        animation-delay: ${Math.random() * 0.2}s;
        animation-duration: ${0.6 + Math.random() * 0.4}s;
      `;
      card.appendChild(dot);
      setTimeout(() => dot.remove(), 1200);
    }
  },

  updateTimer(timeLeft, totalTime) {
    this.elements.quizTimerText.textContent = Math.ceil(timeLeft);
    const circle = this.elements.quizTimerCircle;
    const circumference = 2 * Math.PI * 45;
    const progress = timeLeft / totalTime;
    circle.style.strokeDasharray = circumference;
    circle.style.strokeDashoffset = circumference * (1 - progress);

    const pct = (timeLeft / totalTime) * 100;
    if (pct > 50) {
      circle.style.stroke = 'var(--color-success)';
      this.elements.quizTimerText.style.color = 'var(--color-success)';
    } else if (pct > 25) {
      circle.style.stroke = 'var(--color-warning)';
      this.elements.quizTimerText.style.color = 'var(--color-warning)';
    } else {
      circle.style.stroke = 'var(--color-danger)';
      this.elements.quizTimerText.style.color = 'var(--color-danger)';
      // Play tick sound only on whole-second intervals when critical
      if (timeLeft <= 3 && Math.abs(timeLeft - Math.round(timeLeft)) < 0.08) {
        Sounds.play('tick');
      }
    }
    if (pct > 25) this.elements.quizTimerText.classList.remove('timer-critical');

    // 🆕 TimerFX dramatic effect
    TimerFX.update(timeLeft, totalTime);
  },

  updateStreakDisplay() {
    const streak = this.currentMode === 'practice' ? this.quiz.state.streak : this.arenaState.streak;
    // 🆕 StreakFX handles all tier visuals
    StreakFX.update(streak, this.elements.quizStreak);
  },

  animateScore(totalScore, gained) {
    this.elements.quizScore.textContent = totalScore.toLocaleString();
    this.elements.quizScore.classList.add('score-pop');
    setTimeout(() => this.elements.quizScore.classList.remove('score-pop'), 400);
  },

  showFloatingPoints(points) {
    const float = document.createElement('div');
    float.className = 'floating-points';
    float.textContent = `+${points}`;
    const container = document.querySelector('.quiz-score-display');
    if (container) {
      container.appendChild(float);
      setTimeout(() => float.remove(), 1500);
    }
  },

  renderStats(results) {
    // SVG icons for each stat card
    const svgTrophy = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>`;
    const svgCheck = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
    const svgChart = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>`;
    const svgClock = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;
    const svgFlame = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`;

    this.elements.resultsStats.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon stat-icon--trophy">${svgTrophy}</div>
          <div class="stat-value">${results.score.toLocaleString()}</div>
          <div class="stat-label">Total Skor</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon--check">${svgCheck}</div>
          <div class="stat-value">${results.correctAnswers}/${results.totalQuestions}</div>
          <div class="stat-label">Jawaban Benar</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon--chart">${svgChart}</div>
          <div class="stat-value">${results.accuracy}%</div>
          <div class="stat-label">Akurasi</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon--clock">${svgClock}</div>
          <div class="stat-value">${results.averageTime}s</div>
          <div class="stat-label">Rata-rata Waktu</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon--flame">${svgFlame}</div>
          <div class="stat-value">${results.maxStreak}x</div>
          <div class="stat-label">Streak Terbaik</div>
        </div>
      </div>
    `;
  },

  renderBreakdown(results) {
    const iconCorrect = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
    const iconTimeout = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;
    const iconWrong   = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

    this.elements.resultsBreakdown.innerHTML = results.answers.map((answer, idx) => {
      const q = results.questions[idx];
      const icon = answer.isCorrect ? iconCorrect : answer.timedOut ? iconTimeout : iconWrong;
      return `
        <div class="breakdown-row ${answer.isCorrect ? 'breakdown-correct' : 'breakdown-wrong'}">
          <span class="breakdown-num">${idx + 1}.</span>
          <span class="breakdown-icon">${icon}</span>
          <span class="breakdown-question">${q.question}</span>
          <span class="breakdown-answer">${answer.isCorrect ? q.options[answer.correctOption] :
            (answer.timedOut ? 'Tidak dijawab' : q.options[answer.selectedOption])}</span>
          ${!answer.isCorrect ? `<span class="breakdown-correct-answer">Jawaban: ${q.options[answer.correctOption]}</span>` : ''}
          <span class="breakdown-points">${answer.points > 0 ? '+' + answer.points : '0'} pts</span>
          <span class="breakdown-time">${answer.timeTaken}s</span>
        </div>
      `;
    }).join('');
  },

  toggleBreakdown() {
    const el = this.elements.resultsBreakdown;
    const btn = document.getElementById('btn-toggle-breakdown');
    el.classList.toggle('visible');
    const isVisible = el.classList.contains('visible');
    btn.innerHTML = isVisible
      ? `<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg> Sembunyikan Detail`
      : `<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg> Lihat Detail Jawaban`;
  },

  // ==========================================
  // Countdown
  // ==========================================

  runCountdown(from, callback) {
    let count = from;
    const el = this.elements.countdownNumber;

    const tick = () => {
      if (count > 0) {
        el.textContent = count;
        el.className = 'countdown-number pop';
        setTimeout(() => { el.className = 'countdown-number'; }, 300);
        Sounds.play('countdown');
        count--;
        setTimeout(tick, 1000);
      } else {
        el.textContent = 'GO!';
        el.className = 'countdown-number pop go';
        Sounds.play('go');
        setTimeout(callback, 600);
      }
    };
    tick();
  },

  // ==========================================
  // Particles
  // ==========================================

  initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];

    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }

    function createParticle() {
      return {
        x: Math.random() * canvas.width, y: Math.random() * canvas.height,
        size: Math.random() * 2.5 + 0.5, speedX: (Math.random() - 0.5) * 0.4,
        speedY: (Math.random() - 0.5) * 0.4, opacity: Math.random() * 0.6 + 0.2,
        hue: Math.random() * 40 + 240  // indigo-violet range 240–280
      };
    }

    function init() { particles = []; for (let i = 0; i < 80; i++) particles.push(createParticle()); }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 65%, 55%, ${p.opacity * 0.45})`; ctx.fill();
        p.x += p.speedX; p.y += p.speedY;
        if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
      });
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath(); ctx.strokeStyle = `hsla(240, 65%, 55%, ${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5; ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y); ctx.stroke();
          }
        }
      }
      requestAnimationFrame(draw);
    }

    resize(); init(); draw();
    window.addEventListener('resize', () => { resize(); init(); });
  },

  // ==========================================
  // Power-Up Handlers
  // ==========================================

  /** 50:50 — Eliminate 2 wrong answer options */
  applyFiftyFifty() {
    if (this.currentMode !== 'practice') return;

    const question = this.quiz.state.questions[this.quiz.state.currentIndex];
    const correctIdx = question.correct;
    const options = Array.from(this.elements.quizOptions.querySelectorAll('.quiz-option'));

    // Collect wrong indices, shuffle, take 2
    const wrong = options
      .map((_, i) => i)
      .filter(i => i !== correctIdx);

    // Shuffle Fisher-Yates
    for (let i = wrong.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [wrong[i], wrong[j]] = [wrong[j], wrong[i]];
    }

    const toEliminate = wrong.slice(0, 2);
    toEliminate.forEach(idx => {
      if (options[idx]) {
        options[idx].classList.add('eliminated');
        options[idx].disabled = true;
      }
    });
  },

  /** Extra Time — Add 5 seconds to current question */
  applyAddTime() {
    if (this.currentMode === 'practice') {
      this.quiz.addTime(5);
    } else {
      // Arena mode: adjust arena state start time
      this.arenaState.questionStartTime -= 5000;
    }

    // Show floating pill notification
    const pill = document.createElement('div');
    pill.className = 'time-added-pill';
    pill.textContent = '+5 Detik! ⏱️';
    document.body.appendChild(pill);
    setTimeout(() => pill.remove(), 1700);
  },

  /** Skip — Skip current question without penalty */
  applySkip() {
    // Show skip toast
    const toast = document.createElement('div');
    toast.className = 'skip-toast';
    toast.textContent = '⏭️ Soal Dilewati!';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 1600);

    // Disable all options first
    this.elements.quizOptions.querySelectorAll('.quiz-option').forEach(b => {
      b.classList.add('disabled');
      b.disabled = true;
    });

    if (this.currentMode === 'practice') {
      this.quiz.skipQuestion();
    }
    // Arena mode skip: just move on
  },

  shakeElement(el) {
    el.classList.add('shake');
    setTimeout(() => el.classList.remove('shake'), 600);
  }
};


document.addEventListener('DOMContentLoaded', () => App.init());
