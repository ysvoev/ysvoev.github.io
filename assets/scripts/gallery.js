(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════════════
     НАСТРОЙКИ — можно переопределить через window.GalleryConfig
     ═══════════════════════════════════════════════════════════ */
  const CONFIG = Object.assign({
    // ── Геометрия кольца ──
    orbit: 800,
    spacing: -200,      // пиксельный зазор между карточками (0 = вплотную)
    depth: 100,
    lean: -400,
    offsetY: -80,

    // ── Размер карточек ──
    cardH: 640,
    cardW: 640,
    imageFit: 'contain', // 'contain' | 'cover' | 'none'

    // ── Наклон карточек ──
    angles: [-4.2, 2.6, -1.4, 3.8, 1.7],

    // ── Парение ──
    float: 40,
    floatLift: 16,
    floatSway: 1.4,
    periods: [4.7, 5.9, 6.7, 5.3, 7.1, 6.1],

    // ── Взаимодействие ──
    wheelThreshold: 8,
    wheelSettleMs: 0,
    wheelPull: 200,
    pull: 80,
    toss: 40,
    most: 20,
    turnMs: 1200,

    // ── Автопрокрутка ──
    autoplay: true,
    autoplayDelay: 4000,

    // ── Видео ──
    videoMuted: true,        // mute в галерее (обязательно для autoplay в браузере)
    videoLoop: true,         // зацикливать
    videoAutoplay: true,     // играть сразу при открытии
    videoControls: false,    // показывать нативные controls в галерее
    pausePageVideos: true,   // паузить видео на странице при открытии галереи
    openOnVideoClick: true,  // открывать галерею по клику на <video> на странице

    zoneW: 40,
  }, window.GalleryConfig || {});

  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const mix   = (a, b, t) => a + (b - a) * t;

  let galleryEl = null;
  let ringEl = null;
  let items = [];          // { el, type: 'img'|'video', src }
  let slots = [];
  let turn = 0;
  let isOpen = false;
  let suppressClick = false;
  let glideRaf = 0;
  let animating = false;
  let pointer = null;

  let autoplayTimer = 0;
  let wheelSettleTimer = 0;
  let pagePausedVideos = [];  // видео на странице, которые мы поставили на паузу

  /* ── Сбор медиа ─────────────────────────────────────────── */
  function getImgSrc(img) {
    return img.getAttribute('data-src') || img.currentSrc || img.src || '';
  }
  function getVideoSrc(video) {
    const ds = video.getAttribute('data-src');
    if (ds) return ds;
    const s = video.getAttribute('src');
    if (s) return s;
    const source = video.querySelector('source');
    if (source) {
      return source.getAttribute('data-src') || source.getAttribute('src') || '';
    }
    return '';
  }

  function collectItems() {
    const out = [];
    for (const el of document.querySelectorAll('img, video')) {
      if (el.closest('.gallery')) continue;
      if (el.classList.contains('photo')) continue;
      if (el.tagName === 'IMG') {
        out.push({ el, type: 'img', src: getImgSrc(el) });
      } else {
        const src = getVideoSrc(el);
        if (!src) continue;
        out.push({ el, type: 'video', src });
      }
    }
    return out;
  }

  /* ── DOM ────────────────────────────────────────────────── */
  function build() {
    galleryEl = document.createElement('div');
    galleryEl.className = 'gallery';
    galleryEl.hidden = true;
    galleryEl.style.setProperty('--card-w', (CONFIG.cardW || 400) + 'px');
    galleryEl.style.setProperty('--card-h', (CONFIG.cardH || 640) + 'px');
    galleryEl.style.setProperty('--zone-pad', CONFIG.zoneW + 'px');

    ringEl = document.createElement('div');
    ringEl.className = 'ring';
    galleryEl.appendChild(ringEl);

    ['prev', 'current', 'next'].forEach(pos => {
      const z = document.createElement('div');
      z.className = 'zone ' + pos;
      z.dataset.zone = pos;
      galleryEl.appendChild(z);
    });

    document.body.appendChild(galleryEl);
  }

  function buildSlides() {
    ringEl.innerHTML = '';
    slots = [];
    const n = items.length;
    for (let i = 0; i < n; i++) {
      const item = items[i];
      const slot = document.createElement('div');
      slot.className = 'slot';
      slot.dataset.index = i;

      const floatEl = document.createElement('div');
      floatEl.className = 'float';
      floatEl.dataset.fit = CONFIG.imageFit;

      if (CONFIG.float > 0) {
        const lift = (CONFIG.float / 100) * CONFIG.floatLift;
        const sway = (CONFIG.float / 100) * CONFIG.floatSway;
        floatEl.style.setProperty('--lift', lift.toFixed(2) + 'px');
        floatEl.style.setProperty('--sway', sway.toFixed(2) + 'deg');
        floatEl.style.animationDuration = CONFIG.periods[i % CONFIG.periods.length] + 's';
        floatEl.style.animationDelay = (-Math.random() * 5).toFixed(2) + 's';
      } else {
        floatEl.style.animation = 'none';
      }

      let el;
      if (item.type === 'video') {
        el = document.createElement('video');
        el.src = item.src;
        el.muted = !!CONFIG.videoMuted;
        el.loop = !!CONFIG.videoLoop;
        el.autoplay = !!CONFIG.videoAutoplay;
        el.playsInline = true;
        el.setAttribute('playsinline', '');
        el.preload = CONFIG.videoAutoplay ? 'auto' : 'metadata';
        el.draggable = false;
        el.disablePictureInPicture = true;
        if (CONFIG.videoControls) el.controls = true;
      } else {
        el = document.createElement('img');
        el.alt = '';
        el.src = item.src;
        el.draggable = false;
      }

      floatEl.appendChild(el);
      slot.appendChild(floatEl);
      ringEl.appendChild(slot);
      slots.push(slot);
    }

    // видео стартуем после вставки в DOM
    if (CONFIG.videoAutoplay) {
      slots.forEach(s => {
        const v = s.querySelector('video');
        if (v) v.play().catch(() => {});
      });
    }
  }

  /* ── Раскладка кольца ───────────────────────────────────── */
  function paint() {
    const n = slots.length;
    if (n === 0) return;

    const step = (Math.PI * 2) / n;

    let effOrbit = CONFIG.orbit;
    if (typeof CONFIG.spacing === 'number' && n >= 3) {
      const sinStep = Math.sin(step);
      if (sinStep > 0.001) {
        const fN = (Math.cos(step) + 1) / 2;
        const sN = mix(1 - Math.min(CONFIG.depth, 150) / 200, 1, fN);
        const centerDist = CONFIG.cardW * (1 + sN) / 2 + CONFIG.spacing;
        effOrbit = Math.max(1, centerDist / sinStep);
      }
    }

    for (let i = 0; i < n; i++) {
      const el = slots[i];
      const th = (i - turn) * step;
      const f  = (Math.cos(th) + 1) / 2;
      const x  = Math.sin(th) * effOrbit;
      const y  = -(1 - f) * CONFIG.lean + CONFIG.offsetY;
      const s  = mix(1 - Math.min(CONFIG.depth, 150) / 200, 1, f);
      const z  = Math.round(f * 100);
      const a  = CONFIG.angles.length
                 ? CONFIG.angles[i % CONFIG.angles.length]
                 : 0;

      el.style.transform =
        `translate(-50%, -50%) translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) ` +
        `rotate(${a}deg) scale(${s.toFixed(4)})`;
      el.style.zIndex = String(z);
    }
  }

  /* ── Плавный доводчик ───────────────────────────────────── */
  function cancelGlide() {
    if (glideRaf) { cancelAnimationFrame(glideRaf); glideRaf = 0; }
    animating = false;
  }

  function glide(to) {
    cancelGlide();
    const from = turn;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || from === to) { turn = to; paint(); return; }

    animating = true;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / CONFIG.turnMs);
      turn = mix(from, to, 1 - Math.pow(1 - p, 4));
      paint();
      if (p < 1) glideRaf = requestAnimationFrame(tick);
      else { glideRaf = 0; animating = false; }
    };
    glideRaf = requestAnimationFrame(tick);
  }

  function go(dir) {
    if (items.length <= 1) return;
    glide(Math.round(turn) + dir);
  }

  /* ── Автопрокрутка ──────────────────────────────────────── */
  function scheduleAutoplay() {
    clearTimeout(autoplayTimer);
    if (!CONFIG.autoplay || items.length <= 1) return;
    autoplayTimer = setTimeout(() => {
      if (isOpen && !pointer && !animating) go(1);
      scheduleAutoplay();
    }, CONFIG.autoplayDelay);
  }

  /* ── Открытие / закрытие ────────────────────────────────── */
  function open(idx) {
    items = collectItems();
    if (items.length === 0) return;
    if (idx < 0 || idx >= items.length) idx = 0;

    // паузим видео на странице
    if (CONFIG.pausePageVideos) {
      pagePausedVideos = [];
      for (const v of document.querySelectorAll('video')) {
        if (v.closest('.gallery')) continue;
        if (!v.paused) {
          try { v.pause(); pagePausedVideos.push(v); } catch (e) {}
        }
      }
    }

    turn = idx;
    buildSlides();
    galleryEl.hidden = false;
    paint();

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    isOpen = true;

    scheduleAutoplay();
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;
    cancelGlide();
    clearTimeout(autoplayTimer);
    clearTimeout(wheelSettleTimer);

    // паузим все видео внутри галереи
    if (ringEl) {
      ringEl.querySelectorAll('video').forEach(v => {
        try { v.pause(); } catch (e) {}
      });
    }

    galleryEl.hidden = true;
    ringEl.innerHTML = '';
    slots = [];
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';

    // возобновляем видео на странице
    if (CONFIG.pausePageVideos && pagePausedVideos.length) {
      pagePausedVideos.forEach(v => {
        try { v.play().catch(() => {}); } catch (e) {}
      });
      pagePausedVideos = [];
    }
  }

  /* ── Перетаскивание ─────────────────────────────────────── */
  function onPointerDown(e) {
    if (!isOpen) return;
    if (items.length <= 1) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    cancelGlide();
    clearTimeout(wheelSettleTimer);
    clearTimeout(autoplayTimer);

    pointer = {
      id: e.pointerId,
      x0: e.clientX,
      turn0: turn,
      last: e.clientX,
      lastT: e.timeStamp,
      vx: 0,
      moved: false,
    };
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  }

  function onPointerMove(e) {
    if (!pointer || e.pointerId !== pointer.id) return;
    const dx = e.clientX - pointer.x0;
    if (!pointer.moved && Math.abs(dx) > 5) pointer.moved = true;

    const dt = Math.max(1, e.timeStamp - pointer.lastT);
    pointer.vx = (pointer.vx + (e.clientX - pointer.last) / dt) / 2;
    pointer.last = e.clientX;
    pointer.lastT = e.timeStamp;

    if (pointer.moved) {
      turn = pointer.turn0 - dx / CONFIG.pull;
      paint();
    }
  }

  function onPointerUp(e) {
    if (!pointer || e.pointerId !== pointer.id) return;
    const p = pointer;
    pointer = null;
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
    window.removeEventListener('pointercancel', onPointerUp);

    if (p.moved) {
      suppressClick = true;
      setTimeout(() => { suppressClick = false; }, 80);
      const carry = clamp(
        (-p.vx * CONFIG.toss) / CONFIG.pull,
        -CONFIG.most, CONFIG.most
      );
      glide(Math.round(turn + carry));
    }

    scheduleAutoplay();
  }

  /* ── Клики ──────────────────────────────────────────────── */
  function onClick(e) {
    if (suppressClick) { suppressClick = false; return; }

    if (isOpen && galleryEl.contains(e.target)) {
      const zone = e.target.closest('.zone');
      if (zone) {
        const pos = zone.dataset.zone;
        if (pos === 'current') close();
        else if (pos === 'next') go(1);
        else if (pos === 'prev') go(-1);
      }
      return;
    }

    const media = e.target.closest('img, video');
    if (!media) return;
    if (media.classList.contains('photo')) return;
    if (media.closest('a')) return;
    if (media.tagName === 'VIDEO' && !CONFIG.openOnVideoClick) return;

    const all = collectItems();
    const idx = all.findIndex(it => it.el === media);
    if (idx === -1) return;

    // видео без controls — стопим нативное «плей/пауза» по клику
    if (media.tagName === 'VIDEO') e.preventDefault();

    open(idx);
  }

  /* ── Клавиатура ─────────────────────────────────────────── */
  function onKey(e) {
    if (!isOpen) return;
    if (e.key === 'Escape') {
      e.preventDefault(); e.stopPropagation(); close();
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault(); e.stopPropagation(); go(1); scheduleAutoplay();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault(); e.stopPropagation(); go(-1); scheduleAutoplay();
    } else if (e.key === ' ' || e.code === 'Space') {
      // пробел — пауза/плей всех видео в галерее
      e.preventDefault(); e.stopPropagation();
      const anyPlaying = Array.from(ringEl.querySelectorAll('video'))
        .some(v => !v.paused);
      ringEl.querySelectorAll('video').forEach(v => {
        try { anyPlaying ? v.pause() : v.play().catch(() => {}); } catch (err) {}
      });
    }
  }

  /* ── Колесо = драг ──────────────────────────────────────── */
  function onWheel(e) {
    if (!isOpen) return;
    const absY = Math.abs(e.deltaY);
    const absX = Math.abs(e.deltaX);
    if (absY < CONFIG.wheelThreshold && absX < CONFIG.wheelThreshold) return;

    e.preventDefault();

    const delta = absY > absX ? e.deltaY : e.deltaX;
    const pull = CONFIG.wheelPull > 0 ? CONFIG.wheelPull : CONFIG.pull;

    cancelGlide();
    turn += delta / pull;
    paint();

    scheduleAutoplay();

    clearTimeout(wheelSettleTimer);
    wheelSettleTimer = setTimeout(() => {
      glide(Math.round(turn));
    }, CONFIG.wheelSettleMs);
  }

  /* ── Init ───────────────────────────────────────────────── */
  function init() {
    build();
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey, true);
    document.addEventListener('wheel', onWheel, { passive: false });
    galleryEl.addEventListener('pointerdown', onPointerDown);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();