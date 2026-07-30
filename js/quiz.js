// ============================================================
// QuizRush - Quiz Engine
// Core quiz logic with timer, scoring, and state management
// ============================================================

class QuizEngine {
  constructor() {
    this.config = {
      totalQuestions: 20,
      timePerQuestion: 10,
      category: 'all',
      difficulty: 'all'
    };

    this.state = {
      questions: [],
      currentIndex: 0,
      score: 0,
      streak: 0,
      maxStreak: 0,
      correctAnswers: 0,
      answers: [],
      isActive: false,
      timeLeft: 0,
      questionStartTime: 0
    };

    this.timer = null;
    this.timerInterval = null;

    // Event callbacks
    this.onQuestionStart = null;
    this.onTimerTick = null;
    this.onAnswerResult = null;
    this.onQuizEnd = null;
    this.onScoreUpdate = null;
  }

  /**
   * Initialize quiz with configuration
   * @param {Object} config
   */
  init(config) {
    this.config = { ...this.config, ...config };
    
    // Get questions
    this.state.questions = getQuestions(
      this.config.totalQuestions,
      this.config.category,
      this.config.difficulty
    );

    // Reset state
    this.state.currentIndex = 0;
    this.state.score = 0;
    this.state.streak = 0;
    this.state.maxStreak = 0;
    this.state.correctAnswers = 0;
    this.state.answers = [];
    this.state.isActive = false;
    this.state.timeLeft = this.config.timePerQuestion;

    return this.state.questions.length;
  }

  /**
   * Start the quiz (show first question)
   */
  startQuiz() {
    this.state.isActive = true;
    this.showQuestion();
  }

  /**
   * Show current question and start timer
   */
  showQuestion() {
    if (this.state.currentIndex >= this.state.questions.length) {
      this.endQuiz();
      return;
    }

    const question = this.state.questions[this.state.currentIndex];
    this.state.timeLeft = this.config.timePerQuestion;
    this.state.questionStartTime = performance.now();

    // Notify question start
    if (this.onQuestionStart) {
      this.onQuestionStart(question, this.state.currentIndex, this.state.questions.length);
    }

    // Start timer
    this.startTimer();
  }

  /**
   * Start the countdown timer for current question
   */
  startTimer() {
    this.clearTimer();

    // Update every 50ms for smooth animation
    this.timerInterval = setInterval(() => {
      const elapsed = (performance.now() - this.state.questionStartTime) / 1000;
      this.state.timeLeft = Math.max(0, this.config.timePerQuestion - elapsed);

      if (this.onTimerTick) {
        this.onTimerTick(this.state.timeLeft, this.config.timePerQuestion);
      }

      if (this.state.timeLeft <= 0) {
        this.handleTimeout();
      }
    }, 50);
  }

  /**
   * Handle when time runs out
   */
  handleTimeout() {
    this.clearTimer();
    
    const question = this.state.questions[this.state.currentIndex];
    
    this.state.streak = 0;
    this.state.answers.push({
      questionIndex: this.state.currentIndex,
      selectedOption: -1,
      correctOption: question.correct,
      isCorrect: false,
      timeTaken: this.config.timePerQuestion,
      points: 0,
      timedOut: true
    });

    if (this.onAnswerResult) {
      this.onAnswerResult({
        isCorrect: false,
        timedOut: true,
        correctOption: question.correct,
        selectedOption: -1,
        points: 0,
        totalScore: this.state.score,
        streak: this.state.streak
      });
    }

    // Auto-advance after showing result
    setTimeout(() => this.nextQuestion(), 2000);
  }

  /**
   * Submit player's answer
   * @param {number} optionIndex - Index of selected option (0-3)
   * @returns {Object} Result of the answer
   */
  submitAnswer(optionIndex) {
    if (!this.state.isActive) return null;

    this.clearTimer();

    const question = this.state.questions[this.state.currentIndex];
    const timeTaken = (performance.now() - this.state.questionStartTime) / 1000;
    const isCorrect = optionIndex === question.correct;

    let points = 0;
    if (isCorrect) {
      const timeLeft = Math.max(0, this.config.timePerQuestion - timeTaken);
      const basePoints = 1000;
      const timeBonus = Math.round(basePoints * (timeLeft / this.config.timePerQuestion));
      const streakBonus = Math.min(this.state.streak * 50, 250);
      points = timeBonus + streakBonus;

      this.state.score += points;
      this.state.streak++;
      this.state.correctAnswers++;
      if (this.state.streak > this.state.maxStreak) {
        this.state.maxStreak = this.state.streak;
      }
    } else {
      this.state.streak = 0;
    }

    const result = {
      questionIndex: this.state.currentIndex,
      selectedOption: optionIndex,
      correctOption: question.correct,
      isCorrect,
      timeTaken: Math.round(timeTaken * 100) / 100,
      points,
      timedOut: false
    };

    this.state.answers.push(result);

    const callbackData = {
      ...result,
      totalScore: this.state.score,
      streak: this.state.streak
    };

    if (this.onAnswerResult) {
      this.onAnswerResult(callbackData);
    }

    if (this.onScoreUpdate) {
      this.onScoreUpdate(this.state.score, points);
    }

    // Auto-advance after showing result
    setTimeout(() => this.nextQuestion(), 2000);

    return callbackData;
  }

  /**
   * Move to next question
   */
  nextQuestion() {
    this.state.currentIndex++;
    
    if (this.state.currentIndex >= this.state.questions.length) {
      this.endQuiz();
    } else {
      this.showQuestion();
    }
  }

  /**
   * End the quiz
   */
  endQuiz() {
    this.clearTimer();
    this.state.isActive = false;

    const totalTime = this.state.answers.reduce((sum, a) => sum + a.timeTaken, 0);
    const avgTime = totalTime / this.state.answers.length;

    const results = {
      score: this.state.score,
      correctAnswers: this.state.correctAnswers,
      totalQuestions: this.state.questions.length,
      accuracy: Math.round((this.state.correctAnswers / this.state.questions.length) * 100),
      maxStreak: this.state.maxStreak,
      averageTime: Math.round(avgTime * 100) / 100,
      answers: this.state.answers,
      questions: this.state.questions
    };

    if (this.onQuizEnd) {
      this.onQuizEnd(results);
    }

    return results;
  }

  /**
   * Get current quiz state
   */
  getState() {
    return { ...this.state };
  }

  /**
   * Get player data for leaderboard
   */
  getPlayerData() {
    const user = Auth.getCurrentUser();
    return {
      id: user ? user.id : 'player',
      name: user ? user.username : 'Player',
      avatar: user ? user.avatar : '🦊',
      isBot: false,
      score: this.state.score,
      streak: this.state.streak,
      correctAnswers: this.state.correctAnswers,
      totalAnswered: this.state.answers.length,
      answers: this.state.answers
    };
  }

  /**
   * Add extra seconds to the current question timer (Extra Time power-up)
   * @param {number} seconds
   */
  addTime(seconds) {
    if (!this.state.isActive) return;
    // Extend by adjusting the question start time backwards
    this.state.questionStartTime -= seconds * 1000;
    // Also update timeLeft immediately so the UI reflects it
    const elapsed = (performance.now() - this.state.questionStartTime) / 1000;
    this.state.timeLeft = Math.min(
      Math.max(0, this.config.timePerQuestion - elapsed),
      this.config.timePerQuestion
    );
  }

  /**
   * Skip the current question without penalty (Skip power-up)
   */
  skipQuestion() {
    if (!this.state.isActive) return;
    this.clearTimer();

    const question = this.state.questions[this.state.currentIndex];

    // Record as skipped (treated like a timeout but flagged separately)
    this.state.streak = 0;
    this.state.answers.push({
      questionIndex: this.state.currentIndex,
      selectedOption: -1,
      correctOption: question.correct,
      isCorrect: false,
      timeTaken: 0,
      points: 0,
      timedOut: false,
      skipped: true
    });

    if (this.onAnswerResult) {
      this.onAnswerResult({
        isCorrect: false,
        timedOut: false,
        skipped: true,
        correctOption: question.correct,
        selectedOption: -1,
        points: 0,
        totalScore: this.state.score,
        streak: this.state.streak
      });
    }

    setTimeout(() => this.nextQuestion(), 1500);
  }

  /**
   * Clear the timer
   */
  clearTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}
