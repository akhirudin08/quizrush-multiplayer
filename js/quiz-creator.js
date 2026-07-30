// ============================================================
// QuizRush - Quiz Creator
// Create custom quizzes with your own questions
// ============================================================

class QuizCreator {
  constructor() {
    this.title = '';
    this.description = '';
    this.timePerQuestion = 10;
    this.questions = [];
    this.container = null;
  }

  /**
   * Initialize creator with DOM container
   * @param {HTMLElement} container
   */
  init(container) {
    this.container = container;
    this.questions = [];
    this.render();
  }

  /**
   * Render the quiz creator form
   */
  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="creator-form">
        <div class="input-group">
          <label for="creator-title">Judul Kuis *</label>
          <input type="text" id="creator-title" placeholder="Contoh: Kuis Sains SMP" maxlength="60" value="${this.escapeHtml(this.title)}">
        </div>

        <div class="input-group">
          <label for="creator-desc">Deskripsi (opsional)</label>
          <input type="text" id="creator-desc" placeholder="Deskripsi singkat tentang kuis ini..." maxlength="120" value="${this.escapeHtml(this.description)}">
        </div>

        <div class="input-group">
          <label for="creator-time">Waktu per Soal</label>
          <select id="creator-time">
            <option value="5" ${this.timePerQuestion === 5 ? 'selected' : ''}>5 Detik</option>
            <option value="8" ${this.timePerQuestion === 8 ? 'selected' : ''}>8 Detik</option>
            <option value="10" ${this.timePerQuestion === 10 ? 'selected' : ''}>10 Detik</option>
            <option value="15" ${this.timePerQuestion === 15 ? 'selected' : ''}>15 Detik</option>
            <option value="20" ${this.timePerQuestion === 20 ? 'selected' : ''}>20 Detik</option>
            <option value="30" ${this.timePerQuestion === 30 ? 'selected' : ''}>30 Detik</option>
          </select>
        </div>
      </div>

      <div class="creator-questions-header">
        <h3 style="display:flex; align-items:center;"><svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Daftar Soal (${this.questions.length})</h3>
        <div style="display:flex; gap:8px; flex-wrap:wrap; justify-content:flex-end;">
          <button id="btn-import-csv" class="btn btn-secondary btn-sm" title="Import dari CSV">
            <svg class="icon-svg" style="margin-right:4px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>Import CSV
          </button>
          <button id="btn-save-library" class="btn btn-accent btn-sm" title="Simpan ke Library">
            <svg class="icon-svg" style="margin-right:4px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>Simpan
          </button>
          <button id="btn-load-library" class="btn btn-secondary btn-sm" title="Load dari Library">
            <svg class="icon-svg" style="margin-right:4px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>Library
          </button>
          <button id="btn-add-question" class="btn btn-primary btn-sm"><svg class="icon-svg" style="margin-right:4px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Tambah Soal</button>
        </div>
      </div>

      <div id="creator-questions-list" class="creator-questions-list">
        ${this.questions.length === 0 
          ? '<p class="no-data">Belum ada soal. Klik "Tambah Soal" untuk mulai.</p>'
          : this.questions.map((q, i) => this.renderQuestionCard(q, i)).join('')}
      </div>

      ${this.questions.length > 0 ? `
        <div class="creator-summary">
          <span>Total: <strong>${this.questions.length} soal</strong></span>
          <span>Waktu: <strong>~${this.questions.length * this.timePerQuestion} detik</strong></span>
        </div>
      ` : ''}
    `;

    // Bind events
    this.bindEvents();
  }

  /**
   * Render a single question card
   */
  renderQuestionCard(q, index) {
    const labels = ['A', 'B', 'C', 'D'];
    return `
      <div class="creator-q-card" data-index="${index}">
        <div class="creator-q-header">
          <span class="creator-q-num">#${index + 1}</span>
          <div class="creator-q-actions">
            <button class="btn-icon btn-edit-q" data-index="${index}" title="Edit">✏️</button>
            <button class="btn-icon btn-delete-q" data-index="${index}" title="Hapus">🗑️</button>
            ${index > 0 ? `<button class="btn-icon btn-moveup-q" data-index="${index}" title="Geser Atas">⬆️</button>` : ''}
            ${index < this.questions.length - 1 ? `<button class="btn-icon btn-movedown-q" data-index="${index}" title="Geser Bawah">⬇️</button>` : ''}
          </div>
        </div>
        <p class="creator-q-text">${this.escapeHtml(q.question)}</p>
        <div class="creator-q-options">
          ${q.options.map((opt, oi) => `
            <span class="creator-q-opt ${oi === q.correct ? 'correct' : ''}">
              <span class="creator-q-opt-label">${labels[oi]}</span>
              ${this.escapeHtml(opt)}
              ${oi === q.correct ? ' ✅' : ''}
            </span>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Title & description
    const titleInput = document.getElementById('creator-title');
    const descInput = document.getElementById('creator-desc');
    const timeSelect = document.getElementById('creator-time');

    if (titleInput) titleInput.addEventListener('input', (e) => { this.title = e.target.value; });
    if (descInput) descInput.addEventListener('input', (e) => { this.description = e.target.value; });
    if (timeSelect) timeSelect.addEventListener('change', (e) => { this.timePerQuestion = parseInt(e.target.value); });

    // Add question
    const addBtn = document.getElementById('btn-add-question');
    if (addBtn) addBtn.addEventListener('click', () => this.showQuestionModal());

    // Import CSV
    const importBtn = document.getElementById('btn-import-csv');
    if (importBtn) importBtn.addEventListener('click', () => this.triggerCSVImport());

    // Save to Library
    const saveBtn = document.getElementById('btn-save-library');
    if (saveBtn) saveBtn.addEventListener('click', () => this.saveToLibrary());

    // Load from Library
    const loadBtn = document.getElementById('btn-load-library');
    if (loadBtn) loadBtn.addEventListener('click', () => this.showLibraryModal());

    // Edit/Delete/Move buttons
    this.container.querySelectorAll('.btn-edit-q').forEach(btn => {
      btn.addEventListener('click', () => this.showQuestionModal(parseInt(btn.dataset.index)));
    });
    this.container.querySelectorAll('.btn-delete-q').forEach(btn => {
      btn.addEventListener('click', () => this.deleteQuestion(parseInt(btn.dataset.index)));
    });
    this.container.querySelectorAll('.btn-moveup-q').forEach(btn => {
      btn.addEventListener('click', () => this.moveQuestion(parseInt(btn.dataset.index), -1));
    });
    this.container.querySelectorAll('.btn-movedown-q').forEach(btn => {
      btn.addEventListener('click', () => this.moveQuestion(parseInt(btn.dataset.index), 1));
    });
  }

  /**
   * Show modal to add/edit a question
   * @param {number|null} editIndex - Index to edit, null for new
   */
  showQuestionModal(editIndex = null) {
    const isEdit = editIndex !== null;
    const q = isEdit ? this.questions[editIndex] : { question: '', options: ['', '', '', ''], correct: 0 };

    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-card glass-card">
        <h3 class="modal-title" style="display:flex; align-items:center; justify-content:center;"><svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> ${isEdit ? 'Edit Soal #' + (editIndex + 1) : 'Tambah Soal Baru'}</h3>
        
        <div class="input-group">
          <label>Pertanyaan *</label>
          <input type="text" id="modal-question" placeholder="Tulis pertanyaan..." maxlength="200" value="${this.escapeHtml(q.question)}">
        </div>

        <div class="modal-options">
          <label>Pilihan Jawaban * <span class="label-hint">(klik radio untuk tandai jawaban benar)</span></label>
          ${['A', 'B', 'C', 'D'].map((label, i) => `
            <div class="modal-option-row">
              <input type="radio" name="modal-correct" value="${i}" ${i === q.correct ? 'checked' : ''} id="modal-radio-${i}">
              <label for="modal-radio-${i}" class="modal-radio-label">${label}</label>
              <input type="text" class="modal-option-input" data-index="${i}" placeholder="Jawaban ${label}..." maxlength="100" value="${this.escapeHtml(q.options[i] || '')}">
            </div>
          `).join('')}
        </div>

        <p id="modal-error" class="auth-message error"></p>

        <div class="modal-actions">
          <button id="modal-cancel" class="btn btn-secondary">Batal</button>
          <button id="modal-save" class="btn btn-primary">${isEdit ? 'Simpan Perubahan' : 'Tambah Soal'}</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Focus on question input
    setTimeout(() => document.getElementById('modal-question').focus(), 100);

    // Cancel
    overlay.querySelector('#modal-cancel').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

    // Save
    overlay.querySelector('#modal-save').addEventListener('click', () => {
      const question = document.getElementById('modal-question').value.trim();
      const options = Array.from(overlay.querySelectorAll('.modal-option-input')).map(i => i.value.trim());
      const correct = parseInt(overlay.querySelector('input[name="modal-correct"]:checked')?.value ?? 0);

      // Validate
      if (!question) {
        document.getElementById('modal-error').textContent = 'Pertanyaan harus diisi!';
        return;
      }
      if (options.some(o => !o)) {
        document.getElementById('modal-error').textContent = 'Semua pilihan jawaban harus diisi!';
        return;
      }

      const questionData = { question, options, correct };

      if (isEdit) {
        this.questions[editIndex] = questionData;
      } else {
        this.questions.push(questionData);
      }

      overlay.remove();
      this.render();
    });

    // Enter key on inputs
    overlay.querySelectorAll('input[type="text"]').forEach(input => {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') overlay.querySelector('#modal-save').click();
      });
    });
  }

  /**
   * Delete a question
   */
  deleteQuestion(index) {
    this.questions.splice(index, 1);
    this.render();
  }

  /**
   * Move a question up or down
   */
  moveQuestion(index, direction) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= this.questions.length) return;
    [this.questions[index], this.questions[newIndex]] = [this.questions[newIndex], this.questions[index]];
    this.render();
  }

  /**
   * Validate the quiz is ready
   * @returns {Object} { valid, message }
   */
  validate() {
    this.title = document.getElementById('creator-title')?.value.trim() || this.title;
    this.timePerQuestion = parseInt(document.getElementById('creator-time')?.value) || this.timePerQuestion;
    
    if (!this.title) return { valid: false, message: 'Judul kuis harus diisi!' };
    if (this.questions.length < 1) return { valid: false, message: 'Minimal 1 soal diperlukan!' };
    return { valid: true, message: 'OK' };
  }

  /**
   * Get quiz data for creating a room
   * @returns {Object}
   */
  getQuizData() {
    return {
      title: this.title,
      description: this.description,
      timePerQuestion: this.timePerQuestion,
      questions: this.questions
    };
  }

  /**
   * Reset the creator
   */
  reset() {
    this.title = '';
    this.description = '';
    this.timePerQuestion = 10;
    this.questions = [];
  }

  /**
   * Trigger hidden CSV file input
   */
  triggerCSVImport() {
    let input = document.getElementById('csv-file-input');
    if (!input) {
      input = document.createElement('input');
      input.type = 'file';
      input.id = 'csv-file-input';
      input.accept = '.csv,text/csv';
      input.style.display = 'none';
      document.body.appendChild(input);
      input.addEventListener('change', (e) => this.handleCSVFile(e));
    }
    input.value = '';
    input.click();
  }

  /**
   * Parse and import CSV file
   * Format: question,optionA,optionB,optionC,optionD,correctIndex(0-3)
   */
  handleCSVFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split(/\r?\n/).filter(l => l.trim());
      let imported = 0;
      let errors = [];

      // Skip header row if it looks like a header
      const startRow = lines[0].toLowerCase().includes('question') ? 1 : 0;

      for (let i = startRow; i < lines.length; i++) {
        // Handle quoted CSV properly
        const cols = this.parseCSVLine(lines[i]);
        if (cols.length < 6) {
          errors.push(`Baris ${i + 1}: kurang dari 6 kolom`);
          continue;
        }
        const [question, a, b, c, d, correctRaw] = cols;
        const correct = parseInt(correctRaw);
        if (!question.trim() || isNaN(correct) || correct < 0 || correct > 3) {
          errors.push(`Baris ${i + 1}: format salah`);
          continue;
        }
        this.questions.push({
          question: question.trim(),
          options: [a.trim(), b.trim(), c.trim(), d.trim()],
          correct
        });
        imported++;
      }

      this.render();
      const msg = `✅ Berhasil import ${imported} soal!${errors.length ? '\n⚠️ ' + errors.slice(0, 3).join('\n') : ''}`;
      alert(msg);
    };
    reader.readAsText(file, 'UTF-8');
  }

  parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
        else inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        result.push(current); current = '';
      } else {
        current += ch;
      }
    }
    result.push(current);
    return result;
  }

  // ==========================================
  // Quiz Library (localStorage)
  // ==========================================

  getLibrary() {
    const data = localStorage.getItem('quizrush_library');
    return data ? JSON.parse(data) : [];
  }

  saveLibrary(lib) {
    localStorage.setItem('quizrush_library', JSON.stringify(lib));
  }

  saveToLibrary() {
    const title = document.getElementById('creator-title')?.value.trim() || this.title;
    if (!title) { alert('Isi judul kuis dulu!'); return; }
    if (this.questions.length === 0) { alert('Tambah minimal 1 soal dulu!'); return; }

    const lib = this.getLibrary();
    const entry = {
      id: 'qz_' + Date.now(),
      title,
      description: this.description,
      timePerQuestion: parseInt(document.getElementById('creator-time')?.value) || this.timePerQuestion,
      questions: [...this.questions],
      savedAt: new Date().toISOString()
    };
    lib.unshift(entry);
    if (lib.length > 20) lib.splice(20);
    this.saveLibrary(lib);
    alert(`✅ Kuis "${title}" disimpan ke Library!`);
  }

  showLibraryModal() {
    const lib = this.getLibrary();
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    overlay.innerHTML = `
      <div class="modal-card glass-card library-modal-card">
        <h3 class="modal-title">📚 Quiz Library</h3>
        <p style="color:var(--text-secondary); font-size:0.85rem; text-align:center; margin-bottom:16px;">Kuis tersimpan di browser ini</p>
        ${
          lib.length === 0
            ? '<p class="no-data">Belum ada kuis tersimpan.</p>'
            : lib.map(entry => `
              <div class="library-entry">
                <div class="library-entry-info">
                  <div class="library-entry-title">${this.escapeHtml(entry.title)}</div>
                  <div class="library-entry-meta">${entry.questions.length} soal · ${entry.timePerQuestion}s · ${new Date(entry.savedAt).toLocaleDateString('id-ID')}</div>
                </div>
                <div class="library-entry-actions">
                  <button class="btn btn-primary btn-sm btn-load-entry" data-id="${entry.id}">Load</button>
                  <button class="btn btn-danger btn-sm btn-del-entry" data-id="${entry.id}">🗑</button>
                </div>
              </div>
            `).join('')
        }
        <div class="modal-actions" style="justify-content:center; margin-top:16px;">
          <button id="library-close" class="btn btn-secondary">Tutup</button>
        </div>
        <div style="border-top:1px solid var(--glass-border); margin-top:12px; padding-top:10px;">
          <p style="color:var(--text-muted); font-size:0.75rem; text-align:center;">💡 Format CSV: question,A,B,C,D,correctIndex(0-3)</p>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelector('#library-close').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

    overlay.querySelectorAll('.btn-load-entry').forEach(btn => {
      btn.addEventListener('click', () => {
        this.loadFromLibrary(btn.dataset.id);
        overlay.remove();
      });
    });

    overlay.querySelectorAll('.btn-del-entry').forEach(btn => {
      btn.addEventListener('click', () => {
        const lib = this.getLibrary().filter(e => e.id !== btn.dataset.id);
        this.saveLibrary(lib);
        overlay.remove();
        this.showLibraryModal();
      });
    });
  }

  loadFromLibrary(id) {
    const entry = this.getLibrary().find(e => e.id === id);
    if (!entry) return;
    this.title = entry.title;
    this.description = entry.description || '';
    this.timePerQuestion = entry.timePerQuestion || 10;
    this.questions = [...entry.questions];
    this.render();
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
}
