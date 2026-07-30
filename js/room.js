// ============================================================
// QuizRush - Room/Arena Management
// Handles multiplayer rooms via Firebase Realtime Database
// ============================================================

class RoomManager {
  constructor() {
    this.roomCode = null;
    this.roomPath = null;
    this.isHost = false;
    this.playerId = null;
    this.unsubscribers = [];
    
    // Callbacks
    this.onPlayersChanged = null;
    this.onStatusChanged = null;
    this.onQuestionChanged = null;
    this.onResponsesChanged = null;
    this.onError = null;
  }

  /**
   * Generate a unique 6-character room code
   */
  generateCode() {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // No confusing chars
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Create a new room (host)
   * @param {Object} quizData - { title, questions, timePerQuestion }
   * @param {Object} hostPlayer - { name, avatarId }
   * @returns {string} Room code
   */
  async createRoom(quizData, hostPlayer) {
    if (!isMultiplayerAvailable()) {
      if (this.onError) this.onError('Firebase belum dikonfigurasi! Buka firebase-config.js dan paste config kamu.');
      return null;
    }

    // Generate unique code (check if exists)
    let code;
    let exists = true;
    let attempts = 0;
    while (exists && attempts < 10) {
      code = this.generateCode();
      const check = await FireDB.get(`rooms/${code}`);
      exists = check !== null;
      attempts++;
    }

    if (exists) {
      if (this.onError) this.onError('Gagal membuat room. Coba lagi.');
      return null;
    }

    this.roomCode = code;
    this.roomPath = `rooms/${code}`;
    this.isHost = true;
    this.playerId = hostPlayer.id || ('host_' + Date.now());

    // Create room data
    const roomData = {
      meta: {
        host: this.playerId,
        title: quizData.title || 'QuizRush Arena',
        status: 'waiting',
        currentQuestion: -1,
        totalQuestions: quizData.questions.length,
        timePerQuestion: quizData.timePerQuestion || 10,
        createdAt: FireDB.serverTimestamp()
      },
      questions: quizData.questions.reduce((obj, q, i) => {
        obj[i] = {
          question: q.question,
          options: q.options,
          correct: q.correct,
          category: q.category || 'Custom',
          difficulty: q.difficulty || 'medium'
        };
        return obj;
      }, {}),
      players: {
        [this.playerId]: {
          name: hostPlayer.name,
          avatarId: hostPlayer.avatarId,
          score: 0,
          streak: 0,
          correctCount: 0,
          isHost: true,
          isOnline: true,
          joinedAt: FireDB.serverTimestamp()
        }
      }
    };

    const success = await FireDB.set(this.roomPath, roomData);
    if (!success) {
      if (this.onError) this.onError('Gagal membuat room di database.');
      return null;
    }

    // Start listening
    this.startListening();

    return code;
  }

  /**
   * Join an existing room (player)
   * @param {string} code - Room code
   * @param {Object} player - { name, avatarId }
   * @returns {Object|null} Room meta data
   */
  async joinRoom(code, player) {
    if (!isMultiplayerAvailable()) {
      if (this.onError) this.onError('Firebase belum dikonfigurasi!');
      return null;
    }

    code = code.toUpperCase().trim();
    this.roomPath = `rooms/${code}`;

    // Check if room exists
    const meta = await FireDB.get(`${this.roomPath}/meta`);
    if (!meta) {
      if (this.onError) this.onError('Room tidak ditemukan! Periksa kode room.');
      return null;
    }

    if (meta.status !== 'waiting') {
      if (this.onError) this.onError('Kuis sudah dimulai! Tidak bisa join.');
      return null;
    }

    this.roomCode = code;
    this.isHost = false;
    this.playerId = player.id || ('player_' + Date.now());

    // Add player to room
    await FireDB.set(`${this.roomPath}/players/${this.playerId}`, {
      name: player.name,
      avatarId: player.avatarId,
      score: 0,
      streak: 0,
      correctCount: 0,
      isHost: false,
      isOnline: true,
      joinedAt: FireDB.serverTimestamp()
    });

    // Start listening
    this.startListening();

    return meta;
  }

  /**
   * Start listening for room updates
   */
  startListening() {
    // Listen for player changes
    const unsubPlayers = FireDB.onValue(`${this.roomPath}/players`, (data) => {
      if (this.onPlayersChanged && data) {
        const players = Object.entries(data).map(([id, p]) => ({
          id,
          ...p
        }));
        this.onPlayersChanged(players);
      }
    });
    this.unsubscribers.push(unsubPlayers);

    // Listen for status changes
    const unsubStatus = FireDB.onValue(`${this.roomPath}/meta/status`, (status) => {
      if (this.onStatusChanged && status) {
        this.onStatusChanged(status);
      }
    });
    this.unsubscribers.push(unsubStatus);

    // Listen for current question changes
    const unsubQuestion = FireDB.onValue(`${this.roomPath}/meta/currentQuestion`, (qIndex) => {
      if (this.onQuestionChanged && qIndex !== null && qIndex >= 0) {
        this.onQuestionChanged(qIndex);
      }
    });
    this.unsubscribers.push(unsubQuestion);
  }

  /**
   * Listen for responses on a specific question
   * @param {number} questionIndex
   */
  listenResponses(questionIndex) {
    const unsub = FireDB.onValue(`${this.roomPath}/responses/${questionIndex}`, (data) => {
      if (this.onResponsesChanged && data) {
        this.onResponsesChanged(questionIndex, data);
      }
    });
    this.unsubscribers.push(unsub);
  }

  // ==========================================
  // Host Actions
  // ==========================================

  /**
   * Start the quiz (host only)
   */
  async startQuiz() {
    if (!this.isHost) return;
    await FireDB.update(`${this.roomPath}/meta`, {
      status: 'countdown',
      startedAt: FireDB.serverTimestamp()
    });
  }

  /**
   * Advance to the next question (host only)
   * @param {number} questionIndex
   */
  async showQuestion(questionIndex) {
    if (!this.isHost) return;
    await FireDB.update(`${this.roomPath}/meta`, {
      status: 'question',
      currentQuestion: questionIndex,
      questionStartedAt: FireDB.serverTimestamp()
    });
  }

  /**
   * Show answer reveal (host only)
   */
  async showReveal() {
    if (!this.isHost) return;
    await FireDB.update(`${this.roomPath}/meta`, {
      status: 'reveal'
    });
  }

  /**
   * End the quiz (host only)
   */
  async finishQuiz() {
    if (!this.isHost) return;
    await FireDB.update(`${this.roomPath}/meta`, {
      status: 'finished',
      finishedAt: FireDB.serverTimestamp()
    });
  }

  // ==========================================
  // Player Actions
  // ==========================================

  /**
   * Submit answer for current question
   * @param {number} questionIndex
   * @param {Object} answerData - { selected, correct, timeMs, points }
   */
  async submitAnswer(questionIndex, answerData) {
    await FireDB.set(`${this.roomPath}/responses/${questionIndex}/${this.playerId}`, answerData);
  }

  /**
   * Update player score
   * @param {number} score
   * @param {number} streak
   * @param {number} correctCount
   */
  async updateScore(score, streak, correctCount) {
    await FireDB.update(`${this.roomPath}/players/${this.playerId}`, {
      score,
      streak,
      correctCount
    });
  }

  // ==========================================
  // Data Retrieval
  // ==========================================

  /**
   * Get room questions
   * @returns {Array}
   */
  async getQuestions() {
    const data = await FireDB.get(`${this.roomPath}/questions`);
    if (!data) return [];
    return Object.values(data);
  }

  /**
   * Get room meta
   * @returns {Object}
   */
  async getMeta() {
    return await FireDB.get(`${this.roomPath}/meta`);
  }

  /**
   * Get all players
   * @returns {Array}
   */
  async getPlayers() {
    const data = await FireDB.get(`${this.roomPath}/players`);
    if (!data) return [];
    return Object.entries(data).map(([id, p]) => ({ id, ...p }));
  }

  /**
   * Get shareable link
   * @returns {string}
   */
  getShareLink() {
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?room=${this.roomCode}`;
  }

  // ==========================================
  // Cleanup
  // ==========================================

  /**
   * Leave the room
   */
  async leaveRoom() {
    if (this.playerId && this.roomPath) {
      await FireDB.update(`${this.roomPath}/players/${this.playerId}`, {
        isOnline: false
      });
    }
    this.stopListening();
  }

  /**
   * Delete the room (host only)
   */
  async deleteRoom() {
    if (this.isHost && this.roomPath) {
      await FireDB.remove(this.roomPath);
    }
    this.stopListening();
  }

  /**
   * Stop all listeners
   */
  stopListening() {
    this.unsubscribers.forEach(unsub => unsub());
    this.unsubscribers = [];
    if (this.roomPath) {
      FireDB.offAll(this.roomPath);
    }
  }

  /**
   * Reset state
   */
  reset() {
    this.stopListening();
    this.roomCode = null;
    this.roomPath = null;
    this.isHost = false;
    this.playerId = null;
  }
}
