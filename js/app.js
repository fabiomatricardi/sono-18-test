/* ═══════════════════════════════════════════════════════════
   CUCCIAFLIX — Cagno & Penuto
   Un cinema privato per il 22 novembre 2026.
   ═══════════════════════════════════════════════════════════ */

(() => {
  'use strict';

  /* ── contenuti ─────────────────────────────────────────── */

  const VIDEOS = {
    'ADAOK8RKDC4': {
      title: 'La storia di noi',
      sub: 'Il nostro film',
      thumb: 'assets/thumb-storia.webp'
    },
    'ApedpZR86LM': {
      title: 'Nuove avventure…',
      sub: 'Il prossimo capitolo',
      thumb: 'assets/thumb-avventure.webp'
    }
  };

  const ICON = {
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.2v13.6L19 12z"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><path d="M12 20.2s-7.7-4.7-7.7-9.8A4.5 4.5 0 0 1 12 7.2a4.5 4.5 0 0 1 7.7 3.2c0 5.1-7.7 9.8-7.7 9.8z"/></svg>',
    refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.5 12a8.5 8.5 0 1 1-2.7-6.2"/><path d="M20.5 4.2v5.3h-5.3"/></svg>',
    list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M4 6.5h16M4 12h16M4 17.5h10"/></svg>'
  };

  /* ── elementi ──────────────────────────────────────────── */

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const home = $('#home');
  const clockEl = $('#clock');
  const dateEl = $('#dateline');
  const splash = $('#splash');
  const btnStart = $('#btnStart');
  const player = $('#player');
  const playerFrame = $('#playerFrame');
  const playerTitle = $('#playerTitle');
  const playerOpenYT = $('#playerOpenYT');
  const playerClose = $('#btnPlayerClose');
  const letter = $('#letter');
  const letterCard = $('.letter-card', letter);
  const btnLetter = $('#btnLetter');
  const btnLetterClose = $('#btnLetterClose');
  const panel = $('#panel');
  const panelContent = $('#panelContent');
  const panelTitle = $('#panelTitle');
  const panelBackdrop = $('#panelBackdrop');
  const toastEl = $('#toast');

  /* ── preferenze ────────────────────────────────────────── */

  const isStandalone =
    (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
    window.navigator.standalone === true;
  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  document.documentElement.classList.toggle('is-standalone', !!isStandalone);
  document.documentElement.classList.toggle('is-ios', isIOS);

  const PREFS_KEY = 'cucciaflix.v1';
  const prefs = { sound: true, motion: true, brightness: 0 };
  try {
    Object.assign(prefs, JSON.parse(localStorage.getItem(PREFS_KEY) || '{}'));
  } catch (_) { /* modalità privata */ }
  const savePrefs = () => {
    try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); } catch (_) {}
  };

  function applyPrefs() {
    document.body.classList.toggle('no-motion', !prefs.motion);
    home.dataset.brightness = String(prefs.brightness);
  }

  /* ── orologio ──────────────────────────────────────────── */

  const timeFmt = new Intl.DateTimeFormat('it-IT', {
    hour: '2-digit', minute: '2-digit', hour12: false
  });
  const dateFmt = new Intl.DateTimeFormat('it-IT', {
    weekday: 'long', day: 'numeric', month: 'long'
  });

  function paintClock() {
    const now = new Date();
    clockEl.textContent = timeFmt.format(now);
    dateEl.textContent = dateFmt.format(now);
  }
  paintClock();
  window.setInterval(paintClock, 1000);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) paintClock();
  });

  /* ── suono dell'intro (sintetizzato, nessun file audio) ── */

  let audioCtx = null;

  function playSting() {
    if (!prefs.sound) return;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      audioCtx = audioCtx || new Ctx();
      if (audioCtx.state === 'suspended') audioCtx.resume();

      const t0 = audioCtx.currentTime + 0.04;
      const master = audioCtx.createGain();
      master.gain.setValueAtTime(0.0001, t0);
      master.gain.exponentialRampToValueAtTime(0.5, t0 + 0.09);
      master.gain.exponentialRampToValueAtTime(0.0001, t0 + 2.6);

      const comp = audioCtx.createDynamicsCompressor();
      comp.threshold.value = -18;
      comp.ratio.value = 4;
      master.connect(comp);
      comp.connect(audioCtx.destination);

      const notes = [
        { f: 98.00, t: 0.00, d: 1.6, g: 0.55, type: 'sine' },
        { f: 146.83, t: 0.30, d: 1.6, g: 0.48, type: 'sine' },
        { f: 196.00, t: 0.00, d: 1.1, g: 0.10, type: 'triangle' },
        { f: 293.66, t: 0.30, d: 1.1, g: 0.08, type: 'triangle' }
      ];

      notes.forEach((n) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = n.type;
        osc.frequency.setValueAtTime(n.f, t0 + n.t);
        gain.gain.setValueAtTime(0.0001, t0 + n.t);
        gain.gain.exponentialRampToValueAtTime(n.g, t0 + n.t + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + n.t + n.d);
        osc.connect(gain);
        gain.connect(master);
        osc.start(t0 + n.t);
        osc.stop(t0 + n.t + n.d + 0.08);
      });
    } catch (_) { /* l'intro funziona comunque, in silenzio */ }
  }

  /* ── splash ────────────────────────────────────────────── */

  let introDone = false;

  // Su iPhone Safari non esiste la Fullscreen API: lì l'unico vero
  // schermo intero è "Aggiungi a Home". Su iPad/Android invece
  // possiamo entrare in fullscreen e bloccare l'orientamento.
  function tryFullscreen() {
    if (isStandalone) return;
    if (!document.fullscreenEnabled || !document.documentElement.requestFullscreen) return;
    if (!window.matchMedia('(pointer: coarse)').matches) return;

    document.documentElement
      .requestFullscreen({ navigationUI: 'hide' })
      .then(() => {
        if (screen.orientation && screen.orientation.lock) {
          screen.orientation.lock('landscape').catch(() => {});
        }
      })
      .catch(() => {});
  }

  function dismissSplash() {
    if (introDone) return;
    introDone = true;
    playSting();
    tryFullscreen();
    splash.classList.add('is-going');
    splash.setAttribute('aria-hidden', 'true');
    window.setTimeout(() => { splash.style.display = 'none'; }, 1400);
  }

  btnStart.addEventListener('click', dismissSplash);
  splash.addEventListener('click', dismissSplash);

  // utile per i test e per riaprire direttamente il "cinema"
  if (new URLSearchParams(location.search).get('intro') === '0') {
    introDone = true;
    splash.style.display = 'none';
  }

  /* ── player ────────────────────────────────────────────── */

  let currentVideo = null;
  let closeTimer = 0;

  function openPlayer(id) {
    const video = VIDEOS[id];
    if (!video) return;

    window.clearTimeout(closeTimer);
    currentVideo = id;
    playerTitle.textContent = video.title;
    playerOpenYT.href = 'https://youtu.be/' + id;

    const params = new URLSearchParams({
      autoplay: '1',
      rel: '0',
      modestbranding: '1',
      playsinline: '1',
      iv_load_policy: '3',
      color: 'white'
    });
    playerFrame.src = 'https://www.youtube-nocookie.com/embed/' + id + '?' + params.toString();

    player.classList.add('is-open');
    player.setAttribute('aria-hidden', 'false');
  }

  function closePlayer() {
    if (!currentVideo) return;
    currentVideo = null;
    player.classList.remove('is-open');
    player.setAttribute('aria-hidden', 'true');
    closeTimer = window.setTimeout(() => {
      if (!currentVideo) playerFrame.src = 'about:blank';
    }, 460);
  }

  $$('.card').forEach((card) => {
    card.addEventListener('click', () => openPlayer(card.dataset.video));
  });
  playerClose.addEventListener('click', closePlayer);

  /* ── lettera ───────────────────────────────────────────── */

  function openLetter() {
    letter.classList.add('is-open');
    letter.setAttribute('aria-hidden', 'false');
    letterCard.scrollTop = 0;
    window.setTimeout(() => btnLetterClose.focus({ preventScroll: true }), 380);
  }

  function closeLetter() {
    letter.classList.remove('is-open');
    letter.setAttribute('aria-hidden', 'true');
    btnLetter.focus({ preventScroll: true });
  }

  btnLetter.addEventListener('click', openLetter);
  btnLetterClose.addEventListener('click', closeLetter);

  /* ── pannello laterale ─────────────────────────────────── */

  function titlesHTML() {
    const items = Object.entries(VIDEOS).map(([id, v]) => `
      <button class="sheet-item" type="button" data-play="${id}">
        <img src="${v.thumb}" alt="">
        <span class="si-text">
          <span class="si-title">${v.title}</span>
          <span class="si-sub">${v.sub}</span>
        </span>
        <span class="si-play" aria-hidden="true">${ICON.play}</span>
      </button>`).join('');

    return items + `
      <p class="sheet-foot">Due video, una storia sola.<br>Buon anniversario, Penuto.</p>`;
  }

  function settingsHTML() {
    return `
      <div class="setting">
        <span class="setting-label"><b>Effetti sonori</b><small>Il suono dell'intro</small></span>
        <button class="switch" type="button" role="switch" aria-checked="${prefs.sound}" data-toggle="sound" aria-label="Effetti sonori"></button>
      </div>
      <div class="setting">
        <span class="setting-label"><b>Animazioni</b><small>Movimento dello sfondo</small></span>
        <button class="switch" type="button" role="switch" aria-checked="${prefs.motion}" data-toggle="motion" aria-label="Animazioni"></button>
      </div>
      <div class="sheet-sep"></div>
      <button class="sheet-action is-red" type="button" data-action="letter">${ICON.heart} Apri la lettera</button>
      <button class="sheet-action" type="button" data-action="intro">${ICON.refresh} Rivedi l'intro</button>
      <p class="sheet-foot">CUCCIAFLIX · un regalo fatto a mano<br>per Aurelia — 22 novembre 2026.</p>`;
  }

  function openPanel(kind) {
    panelContent.innerHTML = kind === 'titles' ? titlesHTML() : settingsHTML();
    panelTitle.textContent = kind === 'titles' ? 'Tutti i titoli' : 'Impostazioni';
    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
  }

  function closePanel() {
    panel.classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');
  }

  panelContent.addEventListener('click', (event) => {
    const toggle = event.target.closest('[data-toggle]');
    if (toggle) {
      const key = toggle.dataset.toggle;
      prefs[key] = !prefs[key];
      applyPrefs();
      savePrefs();
      toggle.setAttribute('aria-checked', String(prefs[key]));
      return;
    }

    const play = event.target.closest('[data-play]');
    if (play) {
      closePanel();
      openPlayer(play.dataset.play);
      return;
    }

    const action = event.target.closest('[data-action]');
    if (action) {
      const kind = action.dataset.action;
      closePanel();
      if (kind === 'letter') window.setTimeout(openLetter, 160);
      if (kind === 'intro') window.setTimeout(() => location.reload(), 160);
    }
  });

  $('#btnTitles').addEventListener('click', () => openPanel('titles'));
  $('#btnSettings').addEventListener('click', () => openPanel('settings'));
  $('#btnPanelClose').addEventListener('click', closePanel);
  panelBackdrop.addEventListener('click', closePanel);

  /* ── luminosità ────────────────────────────────────────── */

  const BRIGHTNESS_LABEL = ['Luminosità 100%', 'Luminosità 75%', 'Luminosità 55%'];
  $('#btnBrightness').addEventListener('click', () => {
    prefs.brightness = (prefs.brightness + 1) % 3;
    applyPrefs();
    savePrefs();
    toast(BRIGHTNESS_LABEL[prefs.brightness]);
  });

  /* ── toast ─────────────────────────────────────────────── */

  let toastTimer = 0;
  function toast(message) {
    toastEl.textContent = message;
    toastEl.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toastEl.classList.remove('is-visible'), 1800);
  }

  /* ── tastiera (desktop / iPad con tastiera) ────────────── */

  function topLayer() {
    if (letter.classList.contains('is-open')) return closeLetter;
    if (currentVideo) return closePlayer;
    if (panel.classList.contains('is-open')) return closePanel;
    return null;
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      const close = topLayer();
      if (close) close();
      return;
    }
    if (!introDone && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      dismissSplash();
    }
  });

  /* ── service worker ────────────────────────────────────── */

  if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    });
  }

  /* ── avvio ─────────────────────────────────────────────── */

  applyPrefs();
})();
