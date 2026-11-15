(function () {
  'use strict';
  var CFG = window.AURELIA || {};
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- nav ---------- */
  var tg = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.nav');
  if (tg && nav) {
    tg.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      tg.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- reveal on scroll ---------- */
  var io = ('IntersectionObserver' in window)
    ? new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
        });
      }, { threshold: 0.15 })
    : null;
  document.querySelectorAll('.reveal,.node').forEach(function (el) {
    if (io) io.observe(el); else el.classList.add('in');
  });

  /* ---------- starfield ---------- */
  (function () {
    var c = document.getElementById('stars');
    if (!c) return;
    var ctx = c.getContext('2d');
    var w, h, dpr, stars = [], tx = 0, ty = 0, mx = 0, my = 0, raf = null;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth; h = window.innerHeight;
      c.width = w * dpr; c.height = h * dpr;
      c.style.width = w + 'px'; c.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.max(40, Math.round((w * h) / 9500));
      stars = [];
      for (var i = 0; i < n; i++) {
        stars.push({
          x: Math.random() * w, y: Math.random() * h,
          r: Math.random() * 1.3 + 0.4,
          z: Math.random() * 0.9 + 0.1,
          p: Math.random() * 6.28,
          s: Math.random() * 0.0018 + 0.0006,
          sp: Math.random() < 0.13,
          hue: Math.random() < 0.35 ? '238,134,196' : '244,224,241'
        });
      }
      if (reduce) draw(0);
    }

    function sparkle(x, y, r) {
      var k = r * 0.22;
      ctx.beginPath();
      ctx.moveTo(x, y - r);
      ctx.lineTo(x + k, y - k); ctx.lineTo(x + r, y); ctx.lineTo(x + k, y + k);
      ctx.lineTo(x, y + r); ctx.lineTo(x - k, y + k); ctx.lineTo(x - r, y);
      ctx.lineTo(x - k, y - k); ctx.closePath(); ctx.fill();
    }

    function draw(t) {
      ctx.clearRect(0, 0, w, h);
      tx += (mx - tx) * 0.04; ty += (my - ty) * 0.04;
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        if (!reduce) { s.y -= s.z * 0.12; if (s.y < -10) { s.y = h + 10; s.x = Math.random() * w; } }
        var a = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * s.s * 6 + s.p));
        var x = s.x + tx * s.z * 28, y = s.y + ty * s.z * 28;
        ctx.fillStyle = 'rgba(' + s.hue + ',' + (a * (s.sp ? 0.95 : 0.7)).toFixed(3) + ')';
        if (s.sp) { sparkle(x, y, s.r * 4.2); }
        else { ctx.beginPath(); ctx.arc(x, y, s.r, 0, 6.2832); ctx.fill(); }
      }
    }

    function loop(t) { draw(t); raf = requestAnimationFrame(loop); }
    function start() { if (!reduce && !raf) raf = requestAnimationFrame(loop); }
    function stop() { if (raf) { cancelAnimationFrame(raf); raf = null; } }

    window.addEventListener('resize', resize);
    if (!reduce) {
      window.addEventListener('pointermove', function (e) {
        mx = (e.clientX / w - 0.5) * 2; my = (e.clientY / h - 0.5) * 2;
      }, { passive: true });
      document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
    }
    resize(); start();
  })();

  /* ---------- constellation (values) ---------- */
  document.querySelectorAll('.node-head').forEach(function (b) {
    b.addEventListener('click', function () {
      var li = b.closest('.node');
      var open = li.classList.toggle('open');
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  /* ---------- forms ---------- */
  document.querySelectorAll('form[data-form]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = f.querySelector('button[type=submit]');
      var msg = f.querySelector('.form-msg');
      var ep = CFG.formEndpoint || '';
      if (!ep || ep.indexOf('YOUR_FORM_ID') > -1) {
        msg.textContent = 'This form is not connected yet. Add your Formspree form ID in js/config.js.';
        msg.className = 'form-msg err';
        return;
      }
      var label = btn.textContent;
      btn.disabled = true; btn.textContent = 'Sending...';
      var fd = new FormData(f);
      fd.append('_subject', f.getAttribute('data-subject') || 'New enquiry');
      fetch(ep, { method: 'POST', body: fd, headers: { Accept: 'application/json' } })
        .then(function (r) {
          if (!r.ok) throw new Error('bad');
          var t = document.getElementById(f.getAttribute('data-thanks'));
          f.classList.add('hidden');
          if (t) {
            t.classList.remove('hidden');
            var call = t.querySelector('[data-call]');
            if (call) {
              if (CFG.callLink) { call.href = CFG.callLink; } else { call.classList.add('hidden'); }
            }
            t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
          }
        })
        .catch(function () {
          msg.textContent = 'Something went wrong. Please try again, or email us directly.';
          msg.className = 'form-msg err';
          btn.disabled = false; btn.textContent = label;
        });
    });
  });

  /* ---------- audit quiz ---------- */
  var root = document.getElementById('quiz-root');
  if (root) {
    var Q = [
      { key: 'platform', q: 'Where does most of your traffic come from?', o: ['X', 'Instagram', 'TikTok', 'Reddit', 'Somewhere else', 'I am just starting out'] },
      { key: 'audience', q: 'Roughly how big is your audience there?', o: ['Under 1k', '1k to 10k', '10k to 50k', '50k or more', 'Not sure'] },
      { key: 'blocker', q: 'What feels hardest right now?', o: ['Getting enough traffic', 'Staying consistent', 'Chatting with fans', 'Knowing what content to make', 'Leaks and protection', 'Burnout'] },
      { key: 'account', q: 'Do you already have a creator account?', o: ['Yes, it is live', 'Not yet, I need help setting up'] },
      { key: 'visibility', q: 'How would you like to appear?', o: ['Fully anonymous', 'Face visible', 'Not sure yet'] }
    ];
    var RES = {
      'Getting enough traffic': ['Traffic and funnel', 'We would look at your content mix, posting rhythm and where people drop off before they reach your page.'],
      'Staying consistent': ['Consistency and planning', 'We would build you a realistic content plan you can keep up with, shaped around what you enjoy making.'],
      'Chatting with fans': ['Fan conversations', 'We would look at how your audience is currently looked after and where a dedicated manager could give you time back.'],
      'Knowing what content to make': ['Content direction', 'We would review what is working, what is not, and set a clear direction that fits your comfort levels.'],
      'Leaks and protection': ['Leak protection', 'We would talk through DMCA takedown support, monitoring, and how to keep your content under your control.'],
      'Burnout': ['Sustainable growth', 'We would look at where your time is going and what we can take off your plate, so growth does not cost you your wellbeing.']
    };
    var ans = {}, step = 0;
    var qWrap = document.getElementById('quiz-q');
    var bar = document.getElementById('quiz-bar');
    var result = document.getElementById('result');

    function el(tag, cls, text) {
      var n = document.createElement(tag);
      if (cls) n.className = cls;
      if (text) n.textContent = text;
      return n;
    }

    function render() {
      qWrap.innerHTML = '';
      bar.style.width = (step / Q.length * 100) + '%';
      var cur = Q[step];
      qWrap.appendChild(el('span', 'q-count', 'Question ' + (step + 1) + ' of ' + Q.length));
      var h = el('h2', '', cur.q);
      h.tabIndex = -1;
      qWrap.appendChild(h);
      var box = el('div', 'opts');
      cur.o.forEach(function (label) {
        var b = el('button', 'opt', label);
        b.type = 'button';
        b.addEventListener('click', function () {
          ans[cur.key] = label;
          if (step < Q.length - 1) { step++; render(); } else { finish(); }
        });
        box.appendChild(b);
      });
      qWrap.appendChild(box);
      if (step > 0) {
        var back = el('button', 'back', 'Back');
        back.type = 'button';
        back.addEventListener('click', function () { step--; render(); });
        qWrap.appendChild(back);
      }
    }

    function finish() {
      bar.style.width = '100%';
      var r = RES[ans.blocker] || RES['Burnout'];
      document.getElementById('res-title').textContent = 'Where we would start: ' + r[0];
      document.getElementById('res-text').textContent = r[1];
      Object.keys(ans).forEach(function (k) {
        var i = document.getElementById('h-' + k);
        if (i) i.value = ans[k];
      });
      root.classList.add('hidden');
      result.classList.remove('hidden');
      result.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    }
    render();
  }

  /* ---------- boundaries picker ---------- */
  var picker = document.getElementById('picker');
  if (picker) {
    var out = document.getElementById('b-list');
    var hidden = document.getElementById('b-value');
    function update() {
      var lines = [];
      picker.querySelectorAll('fieldset').forEach(function (fs) {
        var chosen = [];
        fs.querySelectorAll('input:checked').forEach(function (i) { chosen.push(i.value); });
        if (chosen.length) lines.push(fs.getAttribute('data-label') + ': ' + chosen.join(', '));
      });
      out.innerHTML = '';
      if (!lines.length) {
        var li = document.createElement('li');
        li.className = 'none';
        li.textContent = 'Nothing chosen yet. Pick what feels right and we will keep to it.';
        out.appendChild(li);
      } else {
        lines.forEach(function (t) {
          var li = document.createElement('li');
          li.textContent = t;
          out.appendChild(li);
        });
      }
      if (hidden) hidden.value = lines.join(' | ');
    }
    picker.addEventListener('change', update);
    update();
  }
})();
