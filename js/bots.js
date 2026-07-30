// ============================================================
// QuizRush - Bot Player System
// Simulates competitive multiplayer with AI-driven bots
// ============================================================

const BOT_PROFILES = [
  { name: "Rina", avatar: "👩", baseAccuracy: 0.85, speedRange: [1.5, 4.5] },
  { name: "Budi", avatar: "👨", baseAccuracy: 0.75, speedRange: [2.0, 5.5] },
  { name: "Dewi", avatar: "👩‍🦰", baseAccuracy: 0.90, speedRange: [2.5, 6.0] },
  { name: "Agus", avatar: "🧑", baseAccuracy: 0.70, speedRange: [1.8, 5.0] },
  { name: "Sari", avatar: "👧", baseAccuracy: 0.80, speedRange: [2.2, 5.8] },
  { name: "Dimas", avatar: "👦", baseAccuracy: 0.65, speedRange: [1.5, 4.0] },
  { name: "Putri", avatar: "👩‍🎓", baseAccuracy: 0.88, speedRange: [3.0, 7.0] },
  { name: "Rizky", avatar: "🧔", baseAccuracy: 0.72, speedRange: [1.2, 3.8] },
  { name: "Ayu", avatar: "👩‍💼", baseAccuracy: 0.78, speedRange: [2.5, 6.5] },
  { name: "Fajar", avatar: "🧑‍💻", baseAccuracy: 0.82, speedRange: [2.0, 5.0] },
  { name: "Nadia", avatar: "👩‍🔬", baseAccuracy: 0.92, speedRange: [3.5, 7.5] },
  { name: "Andi", avatar: "🧑‍🎨", baseAccuracy: 0.68, speedRange: [1.0, 3.5] },
];

class BotManager {
  constructor() {
    this.bots = [];
    this.botTimers = [];
  }

  /**
   * Create bot players for the quiz
   * @param {number} count - Number of bots to create (max 10)
   * @returns {Array} Array of bot player objects
   */
  createBots(count = 7) {
    const shuffled = [...BOT_PROFILES].sort(() => Math.random() - 0.5);
    this.bots = shuffled.slice(0, Math.min(count, BOT_PROFILES.length)).map((profile, idx) => ({
      id: `bot_${idx}`,
      name: profile.name,
      avatar: profile.avatar,
      isBot: true,
      baseAccuracy: profile.baseAccuracy,
      speedRange: profile.speedRange,
      score: 0,
      streak: 0,
      correctAnswers: 0,
      totalAnswered: 0,
      answers: []
    }));

    return this.bots;
  }

  /**
   * Simulate bot answers for a question
   * @param {number} totalTime - Total time for the question in seconds
   * @param {string} difficulty - Question difficulty
   * @param {Function} onBotAnswer - Callback when a bot answers (bot, isCorrect, timeTaken)
   */
  simulateAnswers(totalTime, difficulty, onBotAnswer) {
    this.clearTimers();

    this.bots.forEach(bot => {
      // Adjust accuracy based on difficulty
      let accuracy = bot.baseAccuracy;
      if (difficulty === 'hard') accuracy -= 0.15;
      if (difficulty === 'easy') accuracy += 0.08;
      accuracy = Math.max(0.3, Math.min(0.95, accuracy));

      // Random response time within bot's speed range
      const [minSpeed, maxSpeed] = bot.speedRange;
      const responseTime = minSpeed + Math.random() * (maxSpeed - minSpeed);

      // Clamp to total time (bot might not answer in time)
      if (responseTime >= totalTime) {
        // Bot didn't answer in time
        const timer = setTimeout(() => {
          bot.answers.push({ answered: false, correct: false, time: totalTime });
          bot.totalAnswered++;
          bot.streak = 0;
          onBotAnswer(bot, false, totalTime);
        }, totalTime * 1000);
        this.botTimers.push(timer);
        return;
      }

      const isCorrect = Math.random() < accuracy;

      const timer = setTimeout(() => {
        bot.totalAnswered++;
        
        if (isCorrect) {
          const timeLeft = totalTime - responseTime;
          const basePoints = 1000;
          const timeBonus = Math.round(basePoints * (timeLeft / totalTime));
          const streakBonus = Math.min(bot.streak * 50, 250);
          const points = timeBonus + streakBonus;
          
          bot.score += points;
          bot.streak++;
          bot.correctAnswers++;
          bot.answers.push({ answered: true, correct: true, time: responseTime, points });
        } else {
          bot.streak = 0;
          bot.answers.push({ answered: true, correct: false, time: responseTime, points: 0 });
        }

        onBotAnswer(bot, isCorrect, responseTime);
      }, responseTime * 1000);

      this.botTimers.push(timer);
    });
  }

  /**
   * Clear all pending bot timers
   */
  clearTimers() {
    this.botTimers.forEach(timer => clearTimeout(timer));
    this.botTimers = [];
  }

  /**
   * Get all bots sorted by score
   * @returns {Array} Sorted bot array
   */
  getBotsByScore() {
    return [...this.bots].sort((a, b) => b.score - a.score);
  }

  /**
   * Reset all bot scores for a new quiz
   */
  resetBots() {
    this.bots.forEach(bot => {
      bot.score = 0;
      bot.streak = 0;
      bot.correctAnswers = 0;
      bot.totalAnswered = 0;
      bot.answers = [];
    });
  }
}
