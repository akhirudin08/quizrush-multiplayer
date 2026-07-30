// ============================================================
// QuizRush - Leaderboard System
// Real-time leaderboard with animated rank changes
// ============================================================

class LeaderboardManager {
  constructor() {
    this.previousRanks = new Map();
    this.container = null;
  }

  /**
   * Initialize leaderboard with container element
   * @param {HTMLElement} container
   */
  init(container) {
    this.container = container;
  }

  /**
   * Update the leaderboard display
   * @param {Array} players - All players (user + bots) with current scores
   * @param {string} currentUserId - The current player's ID
   * @param {boolean} animate - Whether to animate rank changes
   */
  update(players, currentUserId, animate = true) {
    if (!this.container) return;

    // Sort by score descending, then by name for ties
    const sorted = [...players].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.name.localeCompare(b.name);
    });

    // Determine rank changes
    const rankChanges = new Map();
    sorted.forEach((player, index) => {
      const prevRank = this.previousRanks.get(player.id || player.name);
      if (prevRank !== undefined) {
        rankChanges.set(player.id || player.name, prevRank - index); // positive = moved up
      }
      this.previousRanks.set(player.id || player.name, index);
    });

    // Build leaderboard HTML
    this.container.innerHTML = sorted.map((player, index) => {
      const isCurrentUser = player.id === currentUserId || (!player.isBot && !player.id);
      const rankChange = rankChanges.get(player.id || player.name) || 0;
      const rankIcon = this.getRankIcon(index);
      const changeClass = rankChange > 0 ? 'rank-up' : rankChange < 0 ? 'rank-down' : '';
      const animClass = animate ? 'lb-animate' : '';

      return `
        <div class="lb-row ${isCurrentUser ? 'lb-current-user' : ''} ${animClass} ${changeClass}" 
             style="animation-delay: ${index * 0.05}s">
          <div class="lb-rank">
            ${rankIcon || `<span class="lb-rank-num">${index + 1}</span>`}
          </div>
          <div class="lb-avatar">${player.avatar}</div>
          <div class="lb-info">
            <span class="lb-name">${player.name || player.username}${isCurrentUser ? ' (Kamu)' : ''}</span>
            <span class="lb-streak">${player.streak > 1 ? '🔥'.repeat(Math.min(player.streak, 5)) : ''}</span>
          </div>
          <div class="lb-score-area">
            <span class="lb-score">${player.score.toLocaleString()}</span>
            ${rankChange !== 0 ? `<span class="lb-change ${changeClass}">${rankChange > 0 ? '▲' + rankChange : '▼' + Math.abs(rankChange)}</span>` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * Show mini leaderboard (during quiz - compact version)
   * @param {Array} players 
   * @param {string} currentUserId
   * @param {number} maxShow - Max players to show
   */
  updateMini(players, currentUserId, maxShow = 5) {
    if (!this.container) return;

    const sorted = [...players].sort((a, b) => b.score - a.score);
    
    // Always show current user + top players
    const currentUserIdx = sorted.findIndex(p => p.id === currentUserId || (!p.isBot && !p.id));
    let displayPlayers = sorted.slice(0, maxShow);
    
    // If current user is not in top N, add them
    if (currentUserIdx >= maxShow) {
      displayPlayers = [...sorted.slice(0, maxShow - 1), sorted[currentUserIdx]];
    }

    this.container.innerHTML = displayPlayers.map((player, displayIdx) => {
      const actualRank = sorted.indexOf(player) + 1;
      const isCurrentUser = player.id === currentUserId || (!player.isBot && !player.id);
      const rankIcon = this.getRankIcon(actualRank - 1);

      return `
        <div class="lb-mini-row ${isCurrentUser ? 'lb-current-user' : ''}">
          <span class="lb-mini-rank">${rankIcon || actualRank}</span>
          <span class="lb-mini-avatar">${player.avatar}</span>
          <span class="lb-mini-name">${player.name || player.username}</span>
          <span class="lb-mini-score">${player.score.toLocaleString()}</span>
        </div>
      `;
    }).join('');
  }

  /**
   * Show final results with celebration animation
   * @param {Array} players
   * @param {string} currentUserId
   */
  showFinalResults(players, currentUserId) {
    if (!this.container) return;

    const sorted = [...players].sort((a, b) => b.score - a.score);
    const currentUserRank = sorted.findIndex(p => p.id === currentUserId || (!p.isBot && !p.id)) + 1;

    this.container.innerHTML = `
      <div class="final-header">
        <h2 class="final-title">🏆 Hasil Akhir</h2>
        <p class="final-rank-text">Peringkat Kamu: <strong>#${currentUserRank}</strong> dari ${sorted.length} pemain</p>
      </div>
      <div class="final-podium">
        ${sorted.slice(0, 3).map((player, idx) => {
          const isCurrentUser = player.id === currentUserId || (!player.isBot && !player.id);
          const podiumClass = ['podium-gold', 'podium-silver', 'podium-bronze'][idx];
          return `
            <div class="podium-item ${podiumClass} ${isCurrentUser ? 'podium-you' : ''}" style="animation-delay: ${(2 - idx) * 0.3}s">
              <div class="podium-avatar">${player.avatar}</div>
              <div class="podium-medal">${['🥇', '🥈', '🥉'][idx]}</div>
              <div class="podium-name">${player.name || player.username}${isCurrentUser ? ' (Kamu!)' : ''}</div>
              <div class="podium-score">${player.score.toLocaleString()} pts</div>
            </div>
          `;
        }).join('')}
      </div>
      <div class="final-full-list">
        ${sorted.map((player, index) => {
          const isCurrentUser = player.id === currentUserId || (!player.isBot && !player.id);
          return `
            <div class="final-row ${isCurrentUser ? 'lb-current-user' : ''}" style="animation-delay: ${index * 0.08}s">
              <span class="final-row-rank">${this.getRankIcon(index) || (index + 1)}</span>
              <span class="final-row-avatar">${player.avatar}</span>
              <span class="final-row-name">${player.name || player.username}${isCurrentUser ? ' ⭐' : ''}</span>
              <span class="final-row-correct">${player.correctAnswers || 0}/${player.totalAnswered || 0}</span>
              <span class="final-row-score">${player.score.toLocaleString()}</span>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  /**
   * Get rank icon for top 3
   * @param {number} index - 0-based rank index
   * @returns {string|null}
   */
  getRankIcon(index) {
    const icons = ['🥇', '🥈', '🥉'];
    return icons[index] || null;
  }

  /**
   * Reset leaderboard state
   */
  reset() {
    this.previousRanks.clear();
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}
