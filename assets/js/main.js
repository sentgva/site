/* Amazona — интерактив лендинга:
   полёт через вольер при скролле, свой курсор, наклон карточек, перья, взгляд птиц за курсором. */
(function () {
  'use strict';

  const { PARROTS, parrotSVG, feather } = window.AMAZONA;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const rub = (n) => n.toLocaleString('ru-RU') + ' ₽';
  const byId = (id) => PARROTS.find((p) => p.id === id);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const paletteOf = (p) => p.feathers || [p.c.body, p.c.wing, p.c.belly, p.c.tip, p.c.crest || p.c.head];

  document.documentElement.classList.add('js');
  document.getElementById('year').textContent = new Date().getFullYear();

  let W = window.innerWidth;
  let H = window.innerHeight;
  const mouse = { x: W / 2, y: H * 0.4, active: false };
  let eyesDirty = true;

  window.addEventListener('resize', () => { W = window.innerWidth; H = window.innerHeight; eyesDirty = true; });
  window.addEventListener('pointermove', (e) => {
    mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true; eyesDirty = true;
  }, { passive: true });
  window.addEventListener('pointerdown', (e) => {
    mouse.x = e.clientX; mouse.y = e.clientY; eyesDirty = true;
  }, { passive: true });
  window.addEventListener('scroll', () => { eyesDirty = true; }, { passive: true });

  /* ---------- Перья ---------- */
  let feathersAlive = 0;

  function spawnFeather(x, y, color, power = 1) {
    if (reduceMotion || feathersAlive > 60) return;
    const el = document.createElement('span');
    el.className = 'feather';
    el.style.color = color;
    el.innerHTML = '<svg viewBox="0 0 20 48" aria-hidden="true"><use href="#i-feather"/></svg>';
    document.body.appendChild(el);
    feathersAlive++;

    const r0 = Math.random() * 360;
    const dx = (Math.random() - 0.5) * 140 * power;
    const dy = (40 + Math.random() * 100) * power;
    const s = 0.7 + Math.random() * 0.6;
    const anim = el.animate([
      { transform: `translate(${x}px, ${y}px) translate(-50%, -50%) rotate(${r0}deg) scale(${s * 0.4})`, opacity: 0 },
      { opacity: 1, offset: 0.12 },
      { transform: `translate(${x + dx}px, ${y + dy}px) translate(-50%, -50%) rotate(${r0 + (Math.random() - 0.5) * 320}deg) scale(${s})`, opacity: 0 }
    ], { duration: 1200 + Math.random() * 700, easing: 'cubic-bezier(.15, .7, .3, 1)' });
    anim.onfinish = () => { el.remove(); feathersAlive--; };
  }

  function burst(x, y, palette, n) {
    for (let i = 0; i < n; i++) spawnFeather(x, y, pick(palette), 1.3);
  }

  /* ---------- Каталог ---------- */
  const grid = document.getElementById('grid');

  function cardHTML(p) {
    const dots = Array.from({ length: 5 }, (_, i) => `<i class="${i < p.talk ? 'on' : ''}"></i>`).join('');
    return `<article class="card" data-size="${p.size}" data-id="${p.id}" style="--tint:${p.tint}">
  <div class="card-stage">
    <span class="badge${p.status === 'В наличии' ? ' is-in' : ''}">${p.status}</span>
    <span class="cites" title="Приложение CITES">CITES ${p.cites}</span>
    <span class="bubble" aria-hidden="true">${p.say}</span>
    <div class="card-photo"><img src="${p.photo}" alt="${p.alt}" width="800" height="1000" loading="lazy" decoding="async"></div>
  </div>
  <div class="card-body">
    <p class="latin">${p.latin}</p>
    <h3>${p.name}</h3>
    <dl class="specs">
      <div><dt>Длина</dt><dd>${p.length} см</dd></div>
      <div><dt>Живёт</dt><dd>до ${p.life} лет</dd></div>
      <div><dt>Речь</dt><dd class="talk" role="img" aria-label="Способность к речи: ${p.talk} из 5">${dots}</dd></div>
    </dl>
    <div class="card-foot">
      <p class="price"><small>от</small> ${rub(p.price)}</p>
      <button class="btn btn-ghost btn-sm" type="button" data-book="${p.id}">Забронировать</button>
    </div>
  </div>
</article>`;
  }

  grid.innerHTML = PARROTS.map(cardHTML).join('');
  const cards = [...grid.querySelectorAll('.card')];

  // Фильтры по размеру
  const chips = [...document.querySelectorAll('.chip')];
  chips.forEach((chip) => {
    const f = chip.dataset.filter;
    const n = f === 'all' ? PARROTS.length : PARROTS.filter((p) => p.size === f).length;
    chip.insertAdjacentHTML('beforeend', `<span class="count">${n}</span>`);
    chip.addEventListener('click', () => {
      chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
      let shown = 0;
      cards.forEach((card) => {
        const show = f === 'all' || card.dataset.size === f;
        card.hidden = !show;
        if (show && !reduceMotion) {
          card.classList.remove('pop');
          void card.offsetWidth;
          card.style.animationDelay = (shown * 0.05) + 's';
          card.classList.add('pop');
        }
        if (show) shown++;
      });
      eyesDirty = true;
    });
  });

  // Наклон, блик, перья и приветствие при наведении
  cards.forEach((card) => {
    const p = byId(card.dataset.id);
    const palette = paletteOf(p);
    const stage = card.querySelector('.card-stage');
    let lastSpawn = 0, lx = 0, ly = 0;

    card.addEventListener('pointerenter', (e) => {
      card.classList.add('is-hover');
      if (e.pointerType === 'mouse') burst(e.clientX, e.clientY, palette, 4);
    });
    card.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse' || reduceMotion) return;
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      card.style.setProperty('--rx', ((0.5 - py) * 9).toFixed(2) + 'deg');
      card.style.setProperty('--ry', ((px - 0.5) * 11).toFixed(2) + 'deg');
      card.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
      card.style.setProperty('--my', (py * 100).toFixed(1) + '%');
      card.style.setProperty('--px', ((px - 0.5) * 16).toFixed(1) + 'px');
      card.style.setProperty('--py', ((py - 0.5) * 10).toFixed(1) + 'px');

      const now = performance.now();
      if (now - lastSpawn > 80 && Math.hypot(e.clientX - lx, e.clientY - ly) > 16 && stage.contains(e.target)) {
        spawnFeather(e.clientX, e.clientY, pick(palette));
        lastSpawn = now; lx = e.clientX; ly = e.clientY;
      }
    });
    card.addEventListener('pointerleave', () => {
      card.classList.remove('is-hover');
      ['--rx', '--ry', '--mx', '--my', '--px', '--py'].forEach((v) => card.style.removeProperty(v));
    });
    stage.addEventListener('click', (e) => {
      burst(e.clientX, e.clientY, palette, 12);
      if (e.pointerType !== 'mouse') {
        card.classList.add('is-hover');
        clearTimeout(card._t);
        card._t = setTimeout(() => card.classList.remove('is-hover'), 1800);
      }
    });
  });

  /* ---------- Заявка ---------- */
  const form = document.getElementById('booking-form');
  const fName = document.getElementById('f-name');
  const fPhone = document.getElementById('f-phone');
  const fBird = document.getElementById('f-bird');
  const fields = form.querySelector('.form-fields');
  const done = document.getElementById('form-done');

  fBird.innerHTML = '<option value="">Пока не решили, нужна консультация</option>' +
    PARROTS.map((p) => `<option value="${p.id}">${p.name}, от ${rub(p.price)}</option>`).join('');

  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-book]');
    if (!btn) return;
    fBird.value = btn.dataset.book;
    if (!done.hidden) { done.hidden = true; fields.hidden = false; }
    document.getElementById('booking').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    setTimeout(() => fName.focus({ preventScroll: true }), reduceMotion ? 0 : 700);
  });

  function setError(input, errId, bad) {
    input.closest('.field').classList.toggle('has-error', bad);
    input.setAttribute('aria-invalid', String(bad));
    document.getElementById(errId).hidden = !bad;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = fName.value.trim();
    const digits = fPhone.value.replace(/\D/g, '');
    const badName = name.length < 2;
    const badPhone = digits.length < 10;
    setError(fName, 'f-name-err', badName);
    setError(fPhone, 'f-phone-err', badPhone);
    if (badName) { fName.focus(); return; }
    if (badPhone) { fPhone.focus(); return; }

    // Здесь подключается отправка: fetch('/api/lead', { method: 'POST', body: new FormData(form) })
    const bird = byId(fBird.value);
    document.getElementById('form-done-text').textContent = bird
      ? `Спасибо, ${name}! Мы перезвоним в течение часа и расскажем всё про птицу «${bird.name}».`
      : `Спасибо, ${name}! Мы перезвоним в течение часа и поможем выбрать птицу.`;

    const r = form.querySelector('.btn-sun').getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2, ['#E0402A', '#1F6FD1', '#F5B82E', '#2F9E5B'], 16);
    fields.hidden = true;
    done.hidden = false;
  });

  document.getElementById('form-again').addEventListener('click', () => {
    form.reset();
    done.hidden = true;
    fields.hidden = false;
    fName.focus();
  });

  [fName, fPhone].forEach((input) => input.addEventListener('input', () => {
    if (input.getAttribute('aria-invalid') === 'true') setError(input, input.id + '-err', false);
  }));

  // Авторы фотографий (лицензии CC BY и CC BY-SA требуют указывать автора)
  document.getElementById('credits').innerHTML = PARROTS.map((p) =>
    `<li>${p.name}: <a href="${p.credit.source}" target="_blank" rel="noopener">${p.credit.author}</a>, ` +
    `<a href="${p.credit.licenseUrl}" target="_blank" rel="noopener">${p.credit.license}</a></li>`).join('');

  // Ара-талисман, который выглядывает из-за формы
  document.getElementById('booking-parrot').innerHTML = parrotSVG(byId('macao'));

  /* ---------- Полёт через вольер ---------- */
  const fly = document.querySelector('.fly');
  const world = fly.querySelector('.fly-world');
  const intro = fly.querySelector('.fly-intro');
  const outro = fly.querySelector('.fly-outro');
  const hud = fly.querySelector('.fly-hud');
  const hudCount = hud.querySelector('.hud-count');
  const hudName = hud.querySelector('.hud-name');
  const hudBar = hud.querySelector('.hud-bar');

  const DEPTH = 6600;             // сколько пикселей «пролетает» камера за всю секцию
  const FRAMES = ['ararauna', 'galerita', 'eclectus', 'lorikeet', 'macao'];
  const items = [];

  // Детерминированный случайный генератор, чтобы листья всегда стояли одинаково
  let seed = 11;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

  function leafSVG(type) {
    if (type === 'blade') {
      let veins = '';
      [48, 76, 104, 132, 158].forEach((y) => {
        veins += `<path d="M50 ${y}C56 ${y - 5} 62 ${y - 10} 67 ${y - 17}"/><path d="M50 ${y}C44 ${y - 5} 38 ${y - 10} 33 ${y - 17}"/>`;
      });
      return '<svg viewBox="0 0 100 200" aria-hidden="true">' +
        '<path d="M50 4C84 42 94 112 50 196C6 112 16 42 50 4Z" fill="currentColor"/>' +
        '<path d="M50 14C51 80 51 140 50 192" stroke="rgba(0,0,0,.18)" stroke-width="2.5" fill="none"/>' +
        `<g stroke="rgba(0,0,0,.12)" stroke-width="1.5" fill="none">${veins}</g></svg>`;
    }
    let leaflets = '';
    for (let i = 0; i < 12; i++) {
      const t = i / 11;
      const y = 184 - t * 164;
      const L = 36 * Math.sin(Math.PI * (0.12 + t * 0.8)) + 8;
      leaflets += `<path d="${feather(50, y, 50 - L, y - 20, 5)}"/><path d="${feather(50, y, 50 + L, y - 20, 5)}"/>`;
    }
    return '<svg viewBox="0 0 100 200" aria-hidden="true">' +
      `<g fill="currentColor">${leaflets}</g>` +
      '<path d="M50 198C50 140 50 80 50 12" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round"/></svg>';
  }

  if (!reduceMotion) {
    const leafCount = W < 720 ? 24 : 42;
    for (let i = 0; i < leafCount; i++) {
      const el = document.createElement('div');
      el.className = 'fly-item leaf';
      el.innerHTML = leafSVG(rnd() < 0.45 ? 'frond' : 'blade');
      el.style.width = (120 + rnd() * 220).toFixed(0) + 'px';
      el.style.color = `var(--leaf-${1 + Math.floor(rnd() * 3)})`;
      const side = i % 2 ? 1 : -1;
      items.push({
        el, kind: 'leaf',
        x: side * (0.1 + rnd() * 0.6),
        y: (rnd() - 0.5) * 1.2,
        z: -DEPTH - 200 + (i / leafCount) * (DEPTH + 700) + rnd() * 150,
        r: rnd() * 360,
        spin: (rnd() - 0.5) * 0.03
      });
      world.appendChild(el);
    }

    const fx = [0.25, -0.26, 0.25, -0.24, 0.2];
    const fy = [0.03, -0.02, 0.04, 0, 0.02];
    const fr = [-4, 3, -3, 4, -2];
    FRAMES.forEach((id, i) => {
      const p = byId(id);
      const el = document.createElement('figure');
      el.className = 'fly-item frame';
      el.style.setProperty('--tint', p.tint);
      el.innerHTML = `<img src="${p.photo}" alt="" width="800" height="1000" decoding="async"><figcaption><strong>${p.name}</strong><span>${p.latin} · до ${p.life} лет</span></figcaption>`;
      items.push({
        el, kind: 'frame', idx: i, name: p.name,
        x: fx[i], y: fy[i],
        mx: i % 2 ? -0.08 : 0.08, my: i === 0 ? 0.27 : 0.06,
        z: -1100 - i * 1100, r: fr[i]
      });
      world.appendChild(el);
    });
  }

  const frames = items.filter((it) => it.kind === 'frame');
  const introStart = performance.now();
  let wx = 0, wy = 0;
  let lastHud = -1;

  function updateFly(now) {
    const rect = fly.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > H) return;
    const total = Math.max(1, fly.offsetHeight - H);
    const p = clamp(-rect.top / total, 0, 1);

    // При загрузке камера «подлетает» к сцене
    const t = clamp((now - introStart) / 1600, 0, 1);
    const ease = 1 - Math.pow(1 - t, 3);
    const cam = p * DEPTH - (1 - ease) * 900;

    // Сцена чуть поворачивается за мышью
    const tx = mouse.active ? (mouse.y / H - 0.5) * -4 : 0;
    const ty = mouse.active ? (mouse.x / W - 0.5) * 6 : 0;
    wx = lerp(wx, tx, 0.06);
    wy = lerp(wy, ty, 0.06);
    world.style.transform = `rotateX(${wx.toFixed(3)}deg) rotateY(${wy.toFixed(3)}deg)`;

    const narrow = W < 720;
    for (const it of items) {
      const z = it.z + cam;
      let o = 1;
      if (z < -2600) o = 0;
      else if (z < -1400) o = (z + 2600) / 1200;           // выплывает из «тумана»
      if (z > 250) o *= clamp(1 - (z - 250) / 550, 0, 1);  // пролетаем мимо
      if (o <= 0.001) {
        if (it.vis !== false) { it.el.style.visibility = 'hidden'; it.vis = false; }
        continue;
      }
      if (it.vis === false) { it.el.style.visibility = ''; }
      it.vis = true;
      const x = (narrow && it.mx != null ? it.mx : it.x) * W;
      const y = (narrow && it.my != null ? it.my : it.y) * H;
      const rot = it.r + (it.spin ? cam * it.spin : 0);
      it.el.style.transform = `translate(-50%, -50%) translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px) rotate(${rot.toFixed(2)}deg)`;
      it.el.style.opacity = o.toFixed(3);
    }

    intro.style.opacity = clamp(1 - p * 12, 0, 1).toFixed(3);
    intro.style.transform = `scale(${(1 + p * 3).toFixed(3)})`;
    intro.style.visibility = p > 0.1 ? 'hidden' : '';

    const oo = clamp((p - 0.9) / 0.08, 0, 1);
    outro.style.opacity = oo.toFixed(3);
    outro.style.transform = `scale(${(0.92 + oo * 0.08).toFixed(3)})`;
    outro.style.pointerEvents = oo > 0.5 ? 'auto' : 'none';

    if (frames.length) {
      let cur = frames.findIndex((f) => f.z + cam < 420);
      if (cur < 0) cur = frames.length - 1;
      if (cur !== lastHud) {
        hudCount.textContent = `0${cur + 1} / 0${frames.length}`;
        hudName.textContent = frames[cur].name;
        lastHud = cur;
      }
      hud.style.opacity = p > 0.03 && p < 0.88 ? '1' : '0';
      hudBar.style.setProperty('--p', p.toFixed(4));
    }
    eyesDirty = true;
  }

  /* ---------- Взгляд птиц за курсором ---------- */
  const eyes = [...document.querySelectorAll('.parrot-svg')].map((svg) => ({ svg, pupil: svg.querySelector('.pt-pupil') }));

  function updateEyes() {
    const rects = eyes.map((e) => e.svg.getBoundingClientRect());
    rects.forEach((r, i) => {
      if (r.width === 0 || r.bottom < 0 || r.top > H) return;
      const ex = r.left + r.width * 0.63;
      const ey = r.top + r.height * (62 / 280);
      const dx = mouse.x - ex, dy = mouse.y - ey;
      const d = Math.hypot(dx, dy) || 1;
      const k = Math.min(2.4, d / 40);
      eyes[i].pupil.setAttribute('transform', `translate(${(dx / d * k).toFixed(2)} ${(dy / d * k).toFixed(2)})`);
    });
  }

  /* ---------- Как купить: птичка летит по линии ---------- */
  const steps = document.querySelector('.steps-track');
  const stepItems = [...steps.querySelectorAll('.steps-list li')];

  function updateSteps() {
    const r = steps.getBoundingClientRect();
    if (r.bottom < -200 || r.top > H + 200) return;
    const p = clamp((H * 0.8 - r.top) / (r.height + H * 0.3), 0, 1);
    steps.style.setProperty('--prog', p.toFixed(4));
    stepItems.forEach((li, i) => li.classList.toggle('is-done', p >= i / (stepItems.length - 1) - 0.02));
  }

  /* ---------- Появление блоков ---------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('in'));
  }

  /* ---------- Курсор ---------- */
  let cursorTick = null;
  if (finePointer && !reduceMotion) {
    document.documentElement.classList.add('has-cursor');
    const cursor = document.querySelector('.cursor');
    const ring = cursor.querySelector('.cursor-ring');
    const dot = cursor.querySelector('.cursor-dot');
    let rx = mouse.x, ry = mouse.y;

    cursorTick = () => {
      rx = lerp(rx, mouse.x, 0.2);
      ry = lerp(ry, mouse.y, 0.2);
      ring.style.transform = `translate3d(${rx.toFixed(1)}px, ${ry.toFixed(1)}px, 0)`;
      dot.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0)`;
    };

    document.addEventListener('pointerover', (e) => {
      const stage = e.target.closest('.card-stage');
      const field = e.target.closest('input, textarea, select');
      const link = e.target.closest('a, button, summary, label');
      cursor.classList.toggle('is-card', !!stage);
      cursor.classList.toggle('is-field', !!field);
      cursor.classList.toggle('is-link', !!link && !stage && !field);
      if (stage) cursor.style.setProperty('--ring-c', stage.closest('.card').style.getPropertyValue('--tint'));
    });
    document.documentElement.addEventListener('mouseleave', () => cursor.classList.add('is-away'));
    document.documentElement.addEventListener('mouseenter', () => cursor.classList.remove('is-away'));
  }

  /* ---------- Главный цикл ---------- */
  function frame(now) {
    if (cursorTick) cursorTick();
    if (!reduceMotion) updateFly(now);
    updateSteps();
    if (eyesDirty) { updateEyes(); eyesDirty = false; }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
