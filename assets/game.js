'use strict';

class TrueThingsGame {
  constructor(opts) {
    this.questions  = opts.questions;
    this.freeLimit  = opts.freeLimit  ?? 7;
    this.mode       = opts.mode       ?? 'quiz'; // 'quiz' | 'binary'
    this.ctaUrl     = opts.ctaUrl     ?? '#';
    this.lang       = opts.lang       ?? 'en';
    this.labels     = opts.labels     ?? null;
    this.current    = 0;
    this.busy       = false;

    this.wrap    = document.getElementById(opts.containerId);
    this.gate    = document.getElementById('tt-gate');
    this.skipBtn = document.getElementById('tt-gate-skip');

    if (!this.wrap) { console.error('TrueThingsGame: container not found'); return; }

    this._render();
    this._bindGate();
  }

  _render() {
    this.wrap.innerHTML = `
      <div class="game-progress-wrap">
        <div class="game-progress-bar">
          <div class="game-progress-fill" id="_tt_fill"></div>
        </div>
        <span class="game-progress-label" id="_tt_label"></span>
      </div>
      <div class="game-card-wrap">
        <div class="game-card" id="_tt_card">
          <p class="game-question" id="_tt_q"></p>
        </div>
      </div>
      <div class="game-actions" id="_tt_actions"></div>
    `;
    this._update();
  }

  _update() {
    const fill    = document.getElementById('_tt_fill');
    const label   = document.getElementById('_tt_label');
    const q       = document.getElementById('_tt_q');

    const pct = (this.current / this.freeLimit) * 100;
    fill.style.width          = pct + '%';
    label.textContent         = (this.current + 1) + ' / ' + this.freeLimit;
    q.textContent             = this.questions[this.current] || '';
    this._renderActions();
  }

  _renderActions() {
    const el = document.getElementById('_tt_actions');
    if (this.mode === 'quiz') {
      const label = this.lang === 'de' ? 'Weiter →' : 'Next →';
      el.innerHTML = `<button class="game-btn-next" onclick="window.ttGame.next()">${label}</button>`;
    } else {
      const yes = this.labels?.yes ?? (this.lang === 'de' ? 'Ja 😬' : 'Yes 😬');
      const no  = this.labels?.no  ?? (this.lang === 'de' ? 'Nein 😌' : 'No 😌');
      el.innerHTML = `
        <button class="game-btn game-btn-no"  onclick="window.ttGame.answer('no')">${no}</button>
        <button class="game-btn game-btn-yes" onclick="window.ttGame.answer('yes')">${yes}</button>
      `;
    }
  }

  next() {
    if (this.busy) return;
    this._advance();
  }

  answer(val) {
    if (this.busy) return;
    this.busy = true;
    const btn = document.querySelector('.game-btn-' + val);
    if (btn) {
      btn.classList.add('game-btn-pressed');
      document.querySelectorAll('.game-btn').forEach(b => b.disabled = true);
    }
    setTimeout(() => { this.busy = false; this._advance(); }, 480);
  }

  _advance() {
    const card = document.getElementById('_tt_card');
    card.classList.add('game-card-exit');
    setTimeout(() => {
      this.current++;
      if (this.current >= this.freeLimit) {
        this._showGate();
        return;
      }
      card.classList.remove('game-card-exit');
      this._update();
      void card.offsetWidth; // force reflow
      card.classList.add('game-card-enter');
      setTimeout(() => card.classList.remove('game-card-enter'), 400);
    }, 200);
  }

  _showGate() {
    const fill  = document.getElementById('_tt_fill');
    if (fill) fill.style.width = '100%';
    const label = document.getElementById('_tt_label');
    if (label) label.textContent = this.freeLimit + ' / ' + this.freeLimit;
    if (this.gate) this.gate.classList.add('tt-gate-visible');
  }

  _bindGate() {
    if (!this.skipBtn) return;
    this.skipBtn.addEventListener('click', () => {
      if (this.gate) this.gate.classList.remove('tt-gate-visible');
      const list = document.getElementById('questions-list');
      if (list) list.scrollIntoView({ behavior: 'smooth' });
    });
  }
}
