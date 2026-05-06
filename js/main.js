/* ══════════════════════════════════════════
   0xDAY CTF | IEEE HIT SB
   main.js — All interactions & logic
══════════════════════════════════════════ */

/* ── CONFIG ── Replace with your actual Google Sheet ID ── */
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTBcEYKXjEJKXOShE3WoYExVrnLy8QjOLb8zOPoKjywV4rEZR_r9K_xK_2np8S7yBmXvNK0sP-L1ay0/pub?gid=82971196&single=true&output=csv';
// Example: https://script.google.com/macros/s/AKfy.../exec
/* ════════════════════════════════
   1. BOOT SEQUENCE
════════════════════════════════ */
const BOOT_LINES = [
  { text: '[SYS]  Booting IEEE HIT SB secure terminal...', cls: 'boot-line-sys',  delay: 0   },
  { text: '[OK]   Kernel initialized',                     cls: 'boot-line-ok',   delay: 280 },
  { text: '[SYS]  Loading certificate registry module...', cls: 'boot-line-sys',  delay: 520 },
  { text: '[OK]   Registry module loaded',                 cls: 'boot-line-ok',   delay: 800 },
  { text: '[SYS]  Connecting to 0xDAY CTF database...',   cls: 'boot-line-sys',  delay: 1050},
  { text: '[OK]   Database connection established',        cls: 'boot-line-ok',   delay: 1350},
  { text: '[SYS]  Verifying system integrity...',          cls: 'boot-line-sys',  delay: 1600},
  { text: '[OK]   All systems nominal',                    cls: 'boot-line-ok',   delay: 1900},
  { text: '[RDY]  System ready — Welcome to 0xDAY CTF',   cls: 'boot-line-sys',  delay: 2150},
];

function runBoot() {
  const bootLines  = document.getElementById('bootLines');
  const bootBar    = document.getElementById('bootBar');
  const bootStatus = document.getElementById('bootStatus');
  const bootScreen = document.getElementById('bootScreen');
  const siteWrap   = document.getElementById('siteWrap');

  const total = BOOT_LINES.length;

  BOOT_LINES.forEach((item, i) => {
    setTimeout(() => {
      const p = document.createElement('p');
      p.className = item.cls;
      p.textContent = item.text;
      bootLines.appendChild(p);

      const pct = Math.round(((i + 1) / total) * 100);
      bootBar.style.width = pct + '%';
      bootStatus.textContent = pct < 100 ? `Loading... ${pct}%` : 'Complete.';
    }, item.delay);
  });

  // After boot completes — fade out boot screen, show site
  const lastDelay = BOOT_LINES[BOOT_LINES.length - 1].delay;

  setTimeout(() => {
    bootStatus.textContent = 'Launching interface...';
  }, lastDelay + 200);

  setTimeout(() => {
    bootScreen.classList.add('fade-out');
    siteWrap.classList.add('visible');

    setTimeout(() => {
      bootScreen.style.display = 'none';
      initAll();
    }, 700);
  }, lastDelay + 700);
}

/* ════════════════════════════════
   2. PARTICLE NETWORK BACKGROUND
════════════════════════════════ */
function initParticles() {
  const canvas = document.getElementById('bgParticles');
  const ctx    = canvas.getContext('2d');

  let W = canvas.width  = window.innerWidth;
  let H = canvas.height = window.innerHeight;

  const COLORS = ['#a855f7', '#e040fb', '#0891b2', '#7c3aed'];
  const COUNT  = Math.min(Math.floor((W * H) / 14000), 80);
  const MAX_DIST = 130;

  let mouse = { x: W / 2, y: H / 2 };

  // Particle class
  class Particle {
    constructor() { this.reset(true); }

    reset(init) {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.45;
      this.vy = (Math.random() - 0.5) * 0.45;
      this.r  = Math.random() * 1.8 + 0.8;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.alpha = Math.random() * 0.5 + 0.3;
    }

    update() {
      // Gentle pull toward mouse
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 200) {
        this.vx += dx * 0.00008;
        this.vy += dy * 0.00008;
      }

      // Speed clamp
      const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      if (speed > 0.8) { this.vx *= 0.8 / speed; this.vy *= 0.8 / speed; }

      this.x += this.vx;
      this.y += this.vy;

      // Wrap edges
      if (this.x < -10) this.x = W + 10;
      if (this.x > W + 10) this.x = -10;
      if (this.y < -10) this.y = H + 10;
      if (this.y > H + 10) this.y = -10;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.alpha;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  const particles = Array.from({ length: COUNT }, () => new Particle());

  function drawLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          const alpha = (1 - dist / MAX_DIST) * 0.25;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = particles[i].color;
          ctx.globalAlpha = alpha;
          ctx.lineWidth   = 0.6;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    drawLines();
    requestAnimationFrame(loop);
  }

  loop();

  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('resize', () => {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  });
}

/* ════════════════════════════════
   3. TYPEWRITER EFFECT
════════════════════════════════ */
function typewrite(el, text, speed = 55, cb) {
  el.textContent = '';
  let i = 0;
  const timer = setInterval(() => {
    el.textContent += text[i];
    i++;
    if (i >= text.length) {
      clearInterval(timer);
      if (cb) cb();
    }
  }, speed);
}

function initTypewriters() {
  const tagEl  = document.getElementById('heroTag');
  const subEl  = document.getElementById('heroSubtitle');

  typewrite(tagEl, 'IEEE HIT STUDENT BRANCH PRESENTS', 45, () => {
    setTimeout(() => {
      typewrite(subEl, 'INTRODUCTION TO CYBERSECURITY', 60);
    }, 200);
  });
}

/* ════════════════════════════════
   4. GLITCH O
════════════════════════════════ */
function initGlitchO() {
  const o    = document.getElementById('glitchO');
  const rest = document.getElementById('glitchRest');
  if (!o) return;

  function trigger() {
    [o, rest].forEach(el => {
      el.classList.remove('playing');
      void el.offsetWidth;
      el.classList.add('playing');
      setTimeout(() => el.classList.remove('playing'), 700);
    });
  }

  setTimeout(trigger, 200);
  o.addEventListener('mouseenter', trigger);
  rest.addEventListener('mouseenter', trigger);

  function scheduleRandom() {
    const delay = 5000 + Math.random() * 4000;
    setTimeout(() => { trigger(); scheduleRandom(); }, delay);
  }
  scheduleRandom();
}

/* ════════════════════════════════
   5. NAVBAR
════════════════════════════════ */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const toggle = document.getElementById('navToggle');
  const links  = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  });

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('open');
    links.classList.toggle('open');
  });

  // Close menu on link click
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      toggle.classList.remove('open');
      links.classList.remove('open');
    });
  });
}

/* ════════════════════════════════
   6. SCROLL REVEAL
════════════════════════════════ */
function initReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal, .reveal-group').forEach(el => obs.observe(el));
}

/* ════════════════════════════════
   7. CSV PARSER
════════════════════════════════ */
function parseCSV(text) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = parseCSVLine(lines[0]);
  return lines.slice(1).map(line => {
    const vals = parseCSVLine(line);
    const obj  = {};
    headers.forEach((h, i) => { obj[h.trim().toLowerCase()] = (vals[i] || '').trim(); });
    return obj;
  });
}

function parseCSVLine(line) {
  const result = []; let cur = ''; let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') { inQ = !inQ; }
    else if (c === ',' && !inQ) { result.push(cur); cur = ''; }
    else { cur += c; }
  }
  result.push(cur);
  return result;
}

function esc(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ════════════════════════════════
   8. CERTIFICATE VERIFICATION
════════════════════════════════ */
function initVerify() {
  const input     = document.getElementById('certInput');
  const btn       = document.getElementById('verifyBtn');
  const resultWrap= document.getElementById('resultWrap');
  const resultCard= document.getElementById('resultCard');
  const resetBtn  = document.getElementById('resetBtn');

  async function run() {
    const id = input.value.trim().toUpperCase();
    if (!id) { input.focus(); return; }

    btn.disabled = true;
    btn.textContent = '...';
    resultWrap.style.display = 'block';

    // Loading state
    resultCard.className = 'result-card s-loading';
    resultCard.innerHTML = `
      <div class="r-status c-load">
        <div class="r-dot spin"></div>
        SCANNING REGISTRY...
      </div>
      <div style="font-family:var(--mono);font-size:0.8rem;color:var(--t3)">
        Querying database for <span style="color:var(--t1)">${esc(id)}</span>
      </div>
    `;

    try {
const res  = await fetch(SHEET_URL);
if (!res.ok) throw new Error('fetch_failed');
const csv  = await res.text();
const rows = csv.trim().split('\n').slice(1); // skip header row

const cert = rows.map(row => row.split(',')).find(cols => 
  (cols[5] || '').trim().toUpperCase() === id
);

if (cert) {
  renderSuccess(resultCard, {
    name:     cert[0].trim(),
    email:    cert[1].trim(),
    roll:     cert[2].trim(),
    dept:     cert[3].trim(),
    year:     cert[4].trim(),
    certId:   cert[5].trim(),
    certType: cert[6].trim(),
    rank:     cert[7].trim(),
    date:     cert[8].trim(),
    event:    '0xDAY CTF 2026'
  }, id);
} else {
  renderError(resultCard, id);
}
    } catch (err) {
      renderNetworkError(resultCard);
    }

    btn.disabled = false;
    btn.textContent = 'RUN';
  }

  function getType(id, cert) {
    const t = (cert['certificate type'] || cert['type'] || '').toLowerCase();
    if (id.startsWith('WIN') || t.includes('win')) return 'win';
    if (id.startsWith('APT') || t.includes('apt') || t.includes('apprent')) return 'apt';
    return 'par';
  }

  function renderSuccess(card, cert, id) {
    const type     = getType(id, cert);
const name     = cert.name     || 'N/A';
const certType = cert.certType || '';
const date     = cert.date     || 'May 2026';
const position = cert.rank     || '';

    const cfg = {
      win: { cls:'s-win', dotCls:'gold',   statusCls:'c-win', statusTxt:'★ WINNER — VERIFIED',      valCls:'gold',   badge:'👑' },
      apt: { cls:'s-apt', dotCls:'cyan',   statusCls:'c-apt', statusTxt:'✔ CERTIFICATE VERIFIED',   valCls:'cyan',   badge:''  },
      par: { cls:'s-par', dotCls:'purple', statusCls:'c-par', statusTxt:'✔ CERTIFICATE VERIFIED',   valCls:'purple', badge:''  },
    }[type];

    card.className = `result-card ${cfg.cls}`;
    card.innerHTML = `
      ${cfg.badge ? `<div class="r-win-badge">${cfg.badge}</div>` : ''}
      <div class="r-status ${cfg.statusCls}">
        <div class="r-dot ${cfg.dotCls}"></div>
        ${cfg.statusTxt}
      </div>
      <div class="r-name">${esc(name)}</div>
      <div class="r-event">IEEE HIT STUDENT BRANCH · 0xDAY CTF 2026</div>
      <div class="r-fields">
        <div class="r-field">
          <div class="r-field-label">CERTIFICATE ID</div>
          <div class="r-field-value ${cfg.valCls}">${esc(id)}</div>
        </div>
        <div class="r-field">
          <div class="r-field-label">CERTIFICATE TYPE</div>
          <div class="r-field-value">${esc(certType)}</div>
        </div>
        <div class="r-field">
          <div class="r-field-label">ISSUED BY</div>
          <div class="r-field-value">IEEE HIT SB</div>
        </div>
        <div class="r-field">
          <div class="r-field-label">DATE</div>
          <div class="r-field-value">${esc(date)}</div>
        </div>
        ${position ? `
        <div class="r-field">
          <div class="r-field-label">POSITION</div>
          <div class="r-field-value ${cfg.valCls}">${esc(position)}</div>
        </div>` : ''}
      </div>
    `;
  }

  function renderError(card, id) {
    card.className = 'result-card s-err';
    card.innerHTML = `
      <div class="r-status c-err">
        <div class="r-dot red"></div>
        CERTIFICATE NOT FOUND
      </div>
      <div class="r-error-title">ERROR 404 — ID NOT IN REGISTRY</div>
      <div class="r-error-msg">
        No record found for certificate ID 
        <code style="background:rgba(239,68,68,.12);padding:.1rem .4rem;border-radius:3px;font-family:var(--mono)">${esc(id)}</code>.<br/><br/>
        Double-check the ID printed on your certificate. IDs are case-insensitive. 
        Contact IEEE HIT SB if you believe this is an error.
      </div>
    `;
  }

  function renderNetworkError(card) {
    card.className = 'result-card s-err';
    card.innerHTML = `
      <div class="r-status c-err">
        <div class="r-dot red"></div>
        CONNECTION FAILED
      </div>
      <div class="r-error-msg">
        Unable to reach the certificate database. Please check your internet connection and try again.
      </div>
    `;
  }

  function renderDemo(card, id) {
    const type = id.startsWith('WIN') ? 'win' : id.startsWith('APT') ? 'apt' : id.startsWith('PAR') ? 'par' : null;
    if (!type) { renderError(card, id); return; }

const fakeCert = {
  name:     'Your Name Here',
  certType: type === 'win' ? 'Winner Certificate' : type === 'apt' ? 'Apprenticeship Certificate' : 'Participation Certificate',
  date:     '9th May 2026',
  rank:     type === 'win' ? '1st Place' : '',
};

    renderSuccess(card, fakeCert, id);
    card.innerHTML += `
      <div style="margin-top:1rem;padding-top:.75rem;border-top:1px solid rgba(255,255,255,.06);font-family:var(--mono);font-size:.62rem;color:var(--t4)">
        ⚠ DEMO MODE — Replace SHEET_ID in main.js to enable live verification
      </div>
    `;
    
  }

  function reset() {
    input.value = '';
    resultWrap.style.display = 'none';
    input.focus();
  }

  btn.addEventListener('click', run);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') run(); });
  resetBtn.addEventListener('click', reset);
}

/* ════════════════════════════════
   9. AUTO-VERIFY FROM URL PARAM
   QR links to: yoursite.com?id=APT-00042
════════════════════════════════ */
function checkURLParam() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id') || params.get('cert') || params.get('certid');
  if (id) {
    const input = document.getElementById('certInput');
    input.value = id.toUpperCase();
    setTimeout(() => {
      document.getElementById('verify').scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => document.getElementById('verifyBtn').click(), 600);
    }, 500);
  }
}
function initSlider() {
  const slider   = document.getElementById('slider');
  const prevBtn  = document.getElementById('sliderPrev');
  const nextBtn  = document.getElementById('sliderNext');
  const dotsWrap = document.getElementById('sliderDots');
  if (!slider) return;

  const slides = document.querySelectorAll('.slide');
  const total  = slides.length;
  let current  = 0;

  // Build dots
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });

  function goTo(index) {
    current = (index + total) % total;
    slider.style.transform = `translateX(-${current * 100}%)`;
    document.querySelectorAll('.slider-dot')
      .forEach((d, i) => d.classList.toggle('active', i === current));
  }

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  // Keyboard arrows
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  goTo(current - 1);
    if (e.key === 'ArrowRight') goTo(current + 1);
  });
}
/* ════════════════════════════════
   INIT ALL (called after boot)
════════════════════════════════ */
function initAll() {
  initParticles();
  initTypewriters();
  initGlitchO();
  initNavbar();
  initReveal();
  initVerify();
  initSlider(); // ← add this
  checkURLParam();
}

/* ════════════════════════════════
   START
════════════════════════════════ */
window.addEventListener('DOMContentLoaded', () => {
  runBoot();
});
