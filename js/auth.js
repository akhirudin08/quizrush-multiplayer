// ============================================================
// QuizRush v2 - Authentication System
// LocalStorage-based user management with SVG avatars
// ============================================================

const Auth = {
  STORAGE_KEY: 'quizrush_users',
  SESSION_KEY: 'quizrush_session',
  SCORES_KEY: 'quizrush_scores',

  /**
   * Get all registered users
   */
  getUsers() {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveUsers(users) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
  },

  /**
   * Register a new user
   */
  register(username, avatarId) {
    username = username.trim();

    if (username.length < 2 || username.length > 15) {
      return { success: false, message: 'Username harus 2-15 karakter!' };
    }

    if (!/^[a-zA-Z0-9_\s]+$/.test(username)) {
      return { success: false, message: 'Username hanya boleh huruf, angka, spasi, dan underscore!' };
    }

    const users = this.getUsers();
    if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
      return { success: false, message: 'Username sudah dipakai! Pilih yang lain.' };
    }

    const user = {
      id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      username,
      avatarId: avatarId !== undefined ? avatarId : 0,
      createdAt: new Date().toISOString(),
      bestScore: 0,
      totalGames: 0,
      totalCorrect: 0,
      totalQuestions: 0
    };

    users.push(user);
    this.saveUsers(users);
    this.setSession(user);

    return { success: true, message: 'Registrasi berhasil!', user };
  },

  /**
   * Login an existing user
   */
  login(username) {
    username = username.trim();
    const users = this.getUsers();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());

    if (!user) {
      return { success: false, message: 'Username tidak ditemukan! Silakan register dulu.' };
    }

    this.setSession(user);
    return { success: true, message: `Selamat datang kembali, ${user.username}!`, user };
  },

  setSession(user) {
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(user));
  },

  getCurrentUser() {
    const data = localStorage.getItem(this.SESSION_KEY);
    return data ? JSON.parse(data) : null;
  },

  logout() {
    localStorage.removeItem(this.SESSION_KEY);
  },

  /**
   * Get user's avatar SVG
   */
  getUserAvatarSVG(user) {
    if (!user) return getAvatarSVG(0);
    return getAvatarSVG(user.avatarId || 0);
  },

  /**
   * Update user stats after a quiz
   */
  updateStats(score, correctAnswers, totalQuestions) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return;

    const users = this.getUsers();
    const userIdx = users.findIndex(u => u.id === currentUser.id);
    if (userIdx === -1) return;

    users[userIdx].totalGames++;
    users[userIdx].totalCorrect += correctAnswers;
    users[userIdx].totalQuestions += totalQuestions;
    if (score > users[userIdx].bestScore) {
      users[userIdx].bestScore = score;
    }

    this.saveUsers(users);
    this.setSession(users[userIdx]);

    this.saveScore(score, correctAnswers, totalQuestions);
  },

  saveScore(score, correct, total) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return;

    const scores = this.getScoreHistory();
    scores.push({
      userId: currentUser.id,
      username: currentUser.username,
      avatarId: currentUser.avatarId,
      score,
      correct,
      total,
      accuracy: Math.round((correct / total) * 100),
      date: new Date().toISOString()
    });

    if (scores.length > 100) scores.splice(0, scores.length - 100);
    localStorage.setItem(this.SCORES_KEY, JSON.stringify(scores));
  },

  getScoreHistory() {
    const data = localStorage.getItem(this.SCORES_KEY);
    return data ? JSON.parse(data) : [];
  },

  getTopScores(limit = 10) {
    return this.getScoreHistory()
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  },

  getMyScores(limit = 5) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return [];

    return this.getScoreHistory()
      .filter(s => s.userId === currentUser.id)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
};
