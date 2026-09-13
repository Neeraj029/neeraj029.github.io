/* ══════════════════════════════════════════════════════
   NEERAJ'S RETRO PORTFOLIO — INTERACTIVE ENGINE
   ══════════════════════════════════════════════════════
   Hidden features:
   - Konami code (↑↑↓↓←→←→BA) → Matrix rain
   - Press ~ → Secret section
   - Click the name 5x → Cycle themes
   - Check the console → ASCII art
   - Tab away → Title changes
   ══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ─── CONFIG ───
  const BOOT_LINES = [
    { text: '[  <span class="ok">OK</span>  ] Starting kernel modules...', delay: 80 },
    { text: '[  <span class="ok">OK</span>  ] Loading display driver v3.14...', delay: 100 },
    { text: '[  <span class="ok">OK</span>  ] Initializing network interface...', delay: 120 },
    { text: '[  <span class="ok">OK</span>  ] Mounting /dev/portfolio...', delay: 90 },
    { text: '[  <span class="ok">OK</span>  ] Loading user profile: <span class="info">neeraj</span>', delay: 150 },
    { text: '[  <span class="ok">OK</span>  ] Compiling assets... done', delay: 200 },
    { text: '[  <span class="ok">OK</span>  ] Starting web server on port 443...', delay: 100 },
    { text: '', delay: 150 },
    { text: '<span class="info">System ready.</span> Welcome to <span class="ok">NeerajOS</span> v2.0', delay: 300 },
  ];

  const TAGLINES = [
    'Fueled by caffeine, powered by curiosity.',
    'I turn coffee into code.',
    'sudo make me a sandwich.',
    'while(alive) { code(); eat(); sleep(3); }',
    '404: social life not found.',
    'It works on my machine ¯\\_(ツ)_/¯',
    'console.log("hello, world");',
  ];

  const THEMES = ['green', 'amber', 'cyan'];

  const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];


  // ─── STATE ───
  let bootComplete = false;
  let matrixActive = false;
  let matrixAnimId = null;
  let konamiIndex = 0;
  let nameClickCount = 0;
  let startTime = Date.now();
  let originalTitle = document.title;
  let currentThemeIndex = 0;

  // ─── DOM REFS ───
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  // ─── INIT ───
  document.addEventListener('DOMContentLoaded', () => {
    runBoot();
    initConsoleEasterEggs();
    initTabVisibility();
    initKonamiCode();
    initStatusBar();
    initScrollAnimations();
    initNavHighlight();
    initNameClicker();
    initSecretKey();
    setCompileDate();
  });


  // ═══════════════════════════════════════
  // BOOT SEQUENCE
  // ═══════════════════════════════════════

  function runBoot() {
    const bootEl = $('#boot');
    const logEl = $('#boot-log');
    let lineIndex = 0;
    let skipped = false;

    function skipBoot() {
      if (skipped) return;
      skipped = true;
      bootEl.classList.add('done');
      showMain();
      document.removeEventListener('keydown', skipBoot);
      document.removeEventListener('click', skipBoot);
    }

    document.addEventListener('keydown', skipBoot);
    document.addEventListener('click', skipBoot);

    function nextLine() {
      if (skipped) return;
      if (lineIndex >= BOOT_LINES.length) {
        setTimeout(skipBoot, 800);
        return;
      }
      const line = BOOT_LINES[lineIndex];
      const div = document.createElement('div');
      div.innerHTML = line.text;
      div.style.opacity = '0';
      logEl.appendChild(div);

      // Fade in each line
      requestAnimationFrame(() => {
        div.style.transition = 'opacity 0.15s';
        div.style.opacity = '1';
      });

      lineIndex++;
      setTimeout(nextLine, line.delay);
    }

    setTimeout(nextLine, 400);
  }

  function showMain() {
    const main = $('#main');
    main.classList.remove('hidden');
    bootComplete = true;

    // Start typing tagline after a brief delay
    setTimeout(() => {
      typeText($('#typed-tagline'), TAGLINES[Math.floor(Math.random() * TAGLINES.length)], 45);
    }, 300);

    // Trigger fade-in for initially visible sections
    setTimeout(() => {
      $$('.fade-in-section').forEach(el => {
        if (isElementInViewport(el)) {
          el.classList.add('visible');
        }
      });
    }, 100);

    // Animate skill bars
    setTimeout(animateSkillBars, 600);
  }


  // ═══════════════════════════════════════
  // TYPING EFFECT
  // ═══════════════════════════════════════

  function typeText(element, text, speed) {
    let i = 0;
    element.textContent = '';
    function type() {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        setTimeout(type, speed + Math.random() * 30);
      }
    }
    type();
  }


  // ═══════════════════════════════════════
  // KONAMI CODE → MATRIX RAIN
  // ═══════════════════════════════════════

  function initKonamiCode() {
    document.addEventListener('keydown', (e) => {
      if (e.key === KONAMI[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === KONAMI.length) {
          konamiIndex = 0;
          toggleMatrix();
        }
      } else {
        konamiIndex = 0;
      }
    });
  }

  function toggleMatrix() {
    const canvas = $('#matrix-canvas');
    if (matrixActive) {
      matrixActive = false;
      canvas.classList.add('hidden');
      if (matrixAnimId) cancelAnimationFrame(matrixAnimId);
    } else {
      matrixActive = true;
      canvas.classList.remove('hidden');
      startMatrixRain(canvas);
    }
  }

  function startMatrixRain(canvas) {
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = new Array(columns).fill(1);
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*()_+-=[]{}|;:,.<>?アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';

    const style = getComputedStyle(document.documentElement);
    const matrixColor = style.getPropertyValue('--fg').trim();

    function draw() {
      if (!matrixActive) return;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = matrixColor;
      ctx.font = fontSize + 'px JetBrains Mono, monospace';

      for (let i = 0; i < drops.length; i++) {
        const text = chars.charAt(Math.floor(Math.random() * chars.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      matrixAnimId = requestAnimationFrame(draw);
    }

    draw();

    // Handle resize
    window.addEventListener('resize', () => {
      if (matrixActive) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    });
  }


  // ═══════════════════════════════════════
  // THEME CYCLING
  // ═══════════════════════════════════════

  function cycleTheme() {
    currentThemeIndex = (currentThemeIndex + 1) % THEMES.length;
    document.documentElement.dataset.theme = THEMES[currentThemeIndex];
  }


  // ═══════════════════════════════════════
  // NAME CLICK → THEME CYCLE
  // ═══════════════════════════════════════

  function initNameClicker() {
    const nameEl = $('#hero-name');
    const navName = $('#nav-name');

    [nameEl, navName].forEach(el => {
      if (!el) return;
      el.addEventListener('click', () => {
        nameClickCount++;
        if (nameClickCount >= 5) {
          nameClickCount = 0;
          cycleTheme();
        }
      });
    });
  }


  // ═══════════════════════════════════════
  // TAB VISIBILITY
  // ═══════════════════════════════════════

  function initTabVisibility() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        document.title = '// come back, I have cookies 🍪';
      } else {
        document.title = originalTitle;
      }
    });
  }


  // ═══════════════════════════════════════
  // CONSOLE EASTER EGGS
  // ═══════════════════════════════════════

  function initConsoleEasterEggs() {
    const asciiArt = `
%c
 ╔═══════════════════════════════════════════════╗
 ║                                               ║
 ║   Hey there, fellow developer! 👋             ║
 ║                                               ║
 ║   Looking at the source, huh?                 ║
 ║   I respect that. Here's some secrets:        ║
 ║                                               ║
 ║   🎮 Try the Konami code on the page          ║
 ║   🔑 Press ~ to reveal secrets               ║
 ║   🎨 Click the name 5 times for themes        ║
 ║                                               ║
 ║   Built with vanilla JS, no frameworks.       ║
 ║   Because real devs don't need React          ║
 ║   for a portfolio. Fight me. 😤               ║
 ║                                               ║
 ╚═══════════════════════════════════════════════╝
`;
    console.log(asciiArt, 'color: #33ff33; font-family: monospace; font-size: 11px;');
    console.log('%c💡 Hint: There are 7 hidden features on this page. Can you find them all?', 'color: #ffb000; font-size: 13px;');
    console.log('%c🔢 01001000 01100101 01101100 01101100 01101111 = "Hello" in binary', 'color: #666; font-size: 10px;');
  }


  // ═══════════════════════════════════════
  // SECRET SECTION (~ KEY)
  // ═══════════════════════════════════════

  function initSecretKey() {
    document.addEventListener('keydown', (e) => {
      if (e.key === '`' || e.key === '~') {
        e.preventDefault();
        toggleSecret();
      }
    });
  }

  function toggleSecret() {
    const secret = $('#secret');
    if (!secret) return;
    secret.classList.toggle('hidden');
    if (!secret.classList.contains('hidden')) {
      secret.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }




  // ═══════════════════════════════════════
  // SCROLL ANIMATIONS
  // ═══════════════════════════════════════

  function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    $$('.fade-in-section').forEach(el => observer.observe(el));
  }


  // ═══════════════════════════════════════
  // NAV HIGHLIGHT ON SCROLL
  // ═══════════════════════════════════════

  function initNavHighlight() {
    const sections = ['about', 'skills', 'projects', 'contact'];
    const links = $$('.nav-link');

    function update() {
      let current = '';
      sections.forEach(id => {
        const section = document.getElementById(id);
        if (section) {
          const rect = section.getBoundingClientRect();
          if (rect.top <= 120) {
            current = id;
          }
        }
      });

      links.forEach(link => {
        link.classList.toggle('active', link.dataset.section === current);
      });
    }

    window.addEventListener('scroll', update, { passive: true });
  }


  // ═══════════════════════════════════════
  // STATUS BAR
  // ═══════════════════════════════════════

  function initStatusBar() {
    function update() {
      const uptimeEl = $('#sb-uptime');
      const clockEl = $('#sb-clock');

      if (uptimeEl) uptimeEl.textContent = '⏱ uptime: ' + formatUptime();
      if (clockEl) {
        const now = new Date();
        clockEl.textContent = now.toLocaleTimeString('en-US', { hour12: false });
      }
    }

    update();
    setInterval(update, 1000);
  }

  function formatUptime() {
    const diff = Math.floor((Date.now() - startTime) / 1000);
    if (diff < 60) return diff + 's';
    if (diff < 3600) return Math.floor(diff / 60) + 'm ' + (diff % 60) + 's';
    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    return h + 'h ' + m + 'm';
  }


  // ═══════════════════════════════════════
  // SKILL BAR ANIMATION
  // ═══════════════════════════════════════

  function animateSkillBars() {
    $$('.skill-bar-fill').forEach(bar => {
      bar.classList.add('animated');
    });
  }


  // ═══════════════════════════════════════
  // COMPILE DATE
  // ═══════════════════════════════════════

  function setCompileDate() {
    const el = $('#compile-date');
    if (el) {
      const now = new Date();
      el.textContent = now.toISOString().split('T')[0];
    }
  }


  // ═══════════════════════════════════════
  // SCROLL TO SECTION
  // ═══════════════════════════════════════

  function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }


  // ═══════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════

  function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
      rect.top < (window.innerHeight || document.documentElement.clientHeight) &&
      rect.bottom >= 0
    );
  }

})();