// TrueThings website: the card player on the question pages.
// Reads its deck from <script type="application/json" id="deck-data"> and
// renders into #player. Without JavaScript the page still shows the first card
// and the full list of questions below it.
(function () {
  'use strict';

  var root = document.getElementById('player');
  var dataEl = document.getElementById('deck-data');
  if (!root || !dataEl) return;
  var deck = JSON.parse(dataEl.textContent);
  var t = deck.labels;
  var CTA_EVERY = 12;

  var cards = deck.cards.slice();
  var order = [];       // what the player walks through: card indexes and 'cta' markers
  var pos = 0;
  var seen = 0;

  function shuffle(list) {
    for (var i = list.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = list[i]; list[i] = list[j]; list[j] = tmp;
    }
    return list;
  }

  function build() {
    var idx = shuffle(cards.map(function (_, i) { return i; }));
    order = [];
    idx.forEach(function (n, i) {
      order.push(n);
      if ((i + 1) % CTA_EVERY === 0 && i < idx.length - 1) order.push('cta');
    });
    order.push('end');
    pos = 0;
  }

  var stack = root.querySelector('.player-stack');
  var nextBtn = root.querySelector('[data-act="next"]');
  var prevBtn = root.querySelector('[data-act="prev"]');
  var shuffleBtn = root.querySelector('[data-act="shuffle"]');
  var bar = root.querySelector('.player-progress span');
  var live = root.querySelector('[data-live]');

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function cardNumber(at) {
    var n = 0;
    for (var i = 0; i <= at && i < order.length; i++) if (typeof order[i] === 'number') n++;
    return n;
  }

  function render(direction) {
    var item = order[pos];
    var old = stack.querySelector('.player-card.front');
    if (old) {
      old.classList.remove('front');
      old.classList.add(direction === 'back' ? 'leave-right' : 'leave-left');
      setTimeout(function () { old.remove(); }, 280);
    }
    var card = el('div', 'player-card front enter');
    if (typeof item === 'number') {
      var top = el('div', 'pc-top');
      top.appendChild(el('span', '', deck.title));
      top.appendChild(el('span', 'pc-count', cardNumber(pos) + ' / ' + cards.length));
      card.appendChild(top);
      card.appendChild(el('p', 'pc-q', cards[item]));
      card.appendChild(el('p', 'pc-hint', deck.instruction));
      nextBtn.textContent = t.next;
      live.textContent = cards[item];
    } else {
      card.classList.add('cta');
      var head = el('div', 'pc-top');
      head.appendChild(el('span', '', item === 'end' ? t.endKicker : t.ctaKicker));
      card.appendChild(head);
      card.appendChild(el('p', 'pc-q', item === 'end' ? t.endTitle : t.ctaTitle));
      card.appendChild(el('p', 'pc-hint', t.ctaText));
      var actions = el('div', 'pc-actions');
      var store = el('a', 'btn btn-primary', t.ctaButton);
      store.href = deck.storeUrl;
      store.setAttribute('data-cta', 'deck-player');
      actions.appendChild(store);
      card.appendChild(actions);
      nextBtn.textContent = item === 'end' ? t.again : t.keepPlaying;
      live.textContent = item === 'end' ? t.endTitle : t.ctaTitle;
    }
    stack.appendChild(card);
    prevBtn.disabled = pos === 0;
    var done = Math.min(cardNumber(pos), cards.length);
    bar.style.width = (done / cards.length * 100) + '%';
  }

  function next() {
    if (order[pos] === 'end') { build(); render('fwd'); return; }
    if (pos < order.length - 1) { pos++; seen++; render('fwd'); }
  }
  function prev() {
    if (pos > 0) { pos--; render('back'); }
  }

  nextBtn.addEventListener('click', next);
  prevBtn.addEventListener('click', prev);
  shuffleBtn.addEventListener('click', function () { build(); render('fwd'); });

  root.addEventListener('keydown', function (e) {
    if (e.target.closest('a')) return;
    if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); next(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
  });

  // Swipe on touch screens: left = next, right = back.
  var startX = null;
  stack.addEventListener('pointerdown', function (e) { startX = e.clientX; });
  stack.addEventListener('pointerup', function (e) {
    if (startX == null) return;
    var dx = e.clientX - startX;
    startX = null;
    if (Math.abs(dx) < 50) return;
    if (dx < 0) next(); else prev();
  });

  root.classList.add('ready');
  stack.innerHTML = '';
  var b1 = el('div', 'player-card back2'); var b2 = el('div', 'player-card back');
  stack.appendChild(b1); stack.appendChild(b2);
  build();
  render('fwd');
})();
