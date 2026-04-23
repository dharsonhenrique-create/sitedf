/* =========================================================
   DF SOLUÇÕES — Effects Engine
   3D Background (Three.js), Custom Cursor, Tilt, Magnetic,
   Scroll Reveals, Mindmap, Dashboard, Counters, Timeline.
   ========================================================= */

/* -------- 1. THREE.JS 3D BACKGROUND -------- */
(function init3D() {
  const canvas = document.getElementById('bg3d');
  if (!canvas || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 8;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Central wireframe icosahedron — "digital core"
  const geo = new THREE.IcosahedronGeometry(2, 1);
  const wire = new THREE.LineSegments(
    new THREE.WireframeGeometry(geo),
    new THREE.LineBasicMaterial({ color: 0x8B5CF6, transparent: true, opacity: 0.45 })
  );
  scene.add(wire);

  // Orbit ring
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(3.3, 0.008, 8, 120),
    new THREE.MeshBasicMaterial({ color: 0xC026D3, transparent: true, opacity: 0.4 })
  );
  ring.rotation.x = Math.PI / 2.4;
  scene.add(ring);

  // Particle cloud
  const pCount = 300;
  const pGeom = new THREE.BufferGeometry();
  const positions = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount; i++) {
    const r = 4 + Math.random() * 6;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }
  pGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const points = new THREE.Points(
    pGeom,
    new THREE.PointsMaterial({ color: 0xE879F9, size: 0.04, transparent: true, opacity: 0.75, sizeAttenuation: true })
  );
  scene.add(points);

  // Two orbiting dots
  const o1 = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 16), new THREE.MeshBasicMaterial({ color: 0xC026D3 }));
  const o2 = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 16), new THREE.MeshBasicMaterial({ color: 0xE879F9 }));
  scene.add(o1); scene.add(o2);

  let mx = 0, my = 0, tx = 0, ty = 0;
  window.addEventListener('mousemove', e => {
    mx = (e.clientX / window.innerWidth - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  let scrollOffset = 0;
  window.addEventListener('scroll', () => { scrollOffset = window.scrollY * 0.0008; });

  let t = 0;
  function animate() {
    t += 0.005;
    wire.rotation.x += 0.002;
    wire.rotation.y += 0.003;
    ring.rotation.z += 0.004;
    points.rotation.y += 0.0008;
    points.rotation.x += 0.0003;
    o1.position.set(Math.cos(t) * 2.8, Math.sin(t * 0.6) * 0.5, Math.sin(t) * 2.8);
    o2.position.set(Math.cos(-t * 1.4) * 2.5, Math.cos(t * 0.8) * 0.8, Math.sin(-t * 1.4) * 2.5);
    tx += (mx - tx) * 0.05;
    ty += (my - ty) * 0.05;
    camera.position.x = tx * 0.6;
    camera.position.y = -ty * 0.4;
    camera.position.z = 8 - scrollOffset;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();

/* -------- 2. CUSTOM CURSOR -------- */
(function initCursor() {
  if (!window.matchMedia('(pointer: fine)').matches) return;
  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;

  let mx = -100, my = -100, rx = -100, ry = -100;
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px)`;
  });
  (function raf() {
    rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
    ring.style.transform = `translate(${rx}px, ${ry}px)`;
    requestAnimationFrame(raf);
  })();

  const sel = 'a, button, .niche-card, .plan, .service-card, .segment-card, .strategy-card, .challenge-card, .mm-node, .tl-item, .dash-card, .faq-q, input[type="range"]';
  document.querySelectorAll(sel).forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
  });
})();

/* -------- 3. TILT 3D CARDS -------- */
(function initTilt() {
  if (!window.matchMedia('(pointer: fine)').matches) return;
  document.querySelectorAll('[data-tilt]').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      const rx = (y - 0.5) * -6;
      const ry = (x - 0.5) * 6;
      card.style.transform = `perspective(1200px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(2px)`;
      card.style.setProperty('--gx', `${x * 100}%`);
      card.style.setProperty('--gy', `${y * 100}%`);
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
})();

/* -------- 4. MAGNETIC BUTTONS -------- */
(function initMagnetic() {
  if (!window.matchMedia('(pointer: fine)').matches) return;
  document.querySelectorAll('[data-magnetic]').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${x * 0.22}px, ${y * 0.32}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
})();

/* -------- 5. REVEAL ON SCROLL -------- */
(function initReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
})();

/* -------- 6. NAV SCROLL + BURGER -------- */
(function initNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;
  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 30));
  const burger = document.getElementById('navBurger');
  const navLinks = document.getElementById('navLinks');
  if (burger && navLinks) {
    burger.addEventListener('click', () => navLinks.classList.toggle('open'));
    navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));
  }
})();

/* -------- 7. ANIMATED COUNTERS (data-count) -------- */
(function initCounters() {
  const nodes = document.querySelectorAll('[data-count]');
  if (!nodes.length) return;
  const done = new WeakSet();
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting || done.has(entry.target)) return;
      done.add(entry.target);
      const el = entry.target;
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const prefix = el.dataset.prefix || '';
      const decimals = parseInt(el.dataset.decimals || '0');
      const dur = 1800, start = performance.now();
      function tick(t) {
        const p = Math.min((t - start) / dur, 1);
        const val = target * (1 - Math.pow(1 - p, 3));
        el.textContent = prefix + val.toFixed(decimals) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.4 });
  nodes.forEach(n => obs.observe(n));
})();

/* -------- 8. KPI COUNTERS (data-kpi) -------- */
(function initKpis() {
  const nodes = document.querySelectorAll('[data-kpi]');
  if (!nodes.length) return;
  const done = new WeakSet();
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting || done.has(entry.target)) return;
      done.add(entry.target);
      const el = entry.target;
      const target = parseFloat(el.dataset.kpi);
      const suffix = el.dataset.suffix || '';
      const prefix = el.dataset.prefix || '';
      const decimals = parseInt(el.dataset.decimals || '0');
      const dur = 2000, start = performance.now();
      function tick(t) {
        const p = Math.min((t - start) / dur, 1);
        const val = target * (1 - Math.pow(1 - p, 3));
        el.textContent = prefix + val.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.4 });
  nodes.forEach(n => obs.observe(n));
})();

/* -------- 9. MINDMAP ACTIVATION -------- */
(function initMindmap() {
  const mm = document.querySelector('.mindmap');
  if (!mm) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { mm.classList.add('active'); obs.unobserve(mm); } });
  }, { threshold: 0.3 });
  obs.observe(mm);

  // Hover highlighting — connect nodes to their SVG lines
  const nodes = document.querySelectorAll('.mm-node[data-connects]');
  nodes.forEach(node => {
    node.addEventListener('mouseenter', () => {
      const ids = (node.dataset.connects || '').split(',');
      ids.forEach(id => {
        const el = document.getElementById(id.trim());
        if (el) el.classList.add('highlight');
      });
    });
    node.addEventListener('mouseleave', () => {
      document.querySelectorAll('.mm-connection.highlight').forEach(c => c.classList.remove('highlight'));
    });
  });
})();

/* -------- 10. DASHBOARD BARS (data-width) -------- */
(function initDashBars() {
  const fills = document.querySelectorAll('.dash-bar-fill[data-width]');
  if (!fills.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.width = e.target.dataset.width + '%';
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  fills.forEach(b => obs.observe(b));
})();

/* -------- 11. DASHBOARD SVG CHART -------- */
(function initDashChart() {
  const svg = document.getElementById('dashChart');
  if (!svg) return;
  const data = [8, 12, 15, 10, 18, 22, 17, 25, 21, 28, 24, 32, 29, 35, 31, 40, 37, 45, 42, 50, 47, 55, 52, 60, 58, 68, 64, 76, 72, 82];
  const max = Math.max(...data);
  const w = 600, h = 200, pad = 10;
  const step = (w - pad * 2) / (data.length - 1);
  let path = '';
  let area = `M ${pad} ${h - pad}`;
  data.forEach((v, i) => {
    const x = pad + i * step;
    const y = h - pad - ((v / max) * (h - pad * 2));
    path += (i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`);
    area += ` L ${x} ${y}`;
  });
  area += ` L ${w - pad} ${h - pad} Z`;

  svg.innerHTML = `
    <defs>
      <linearGradient id="chartGrd" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#C026D3" stop-opacity="0.4"/>
        <stop offset="100%" stop-color="#8B5CF6" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <path d="${area}" fill="url(#chartGrd)" opacity="0"/>
    <path d="${path}" stroke="#E879F9" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="3000" stroke-dashoffset="3000"/>
  `;

  const obs = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      const line = svg.querySelector('path:last-child');
      const areaPath = svg.querySelector('path:first-of-type');
      line.style.transition = 'stroke-dashoffset 2.5s ease-out';
      areaPath.style.transition = 'opacity 2.5s ease-out';
      line.setAttribute('stroke-dashoffset', '0');
      areaPath.setAttribute('opacity', '1');
      obs.disconnect();
    }
  }, { threshold: 0.3 });
  obs.observe(svg);
})();

/* -------- 12. DASHBOARD LIVE VALUE TICKER -------- */
(function initDashLive() {
  const el = document.querySelector('[data-live-count]');
  if (!el) return;
  let val = parseInt(el.dataset.liveCount);
  const obs = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      setInterval(() => {
        if (Math.random() > 0.55) {
          val += 1;
          el.textContent = val;
          el.classList.remove('tick');
          void el.offsetWidth;
          el.classList.add('tick');
        }
      }, 2800);
      obs.disconnect();
    }
  }, { threshold: 0.3 });
  obs.observe(el);
})();

/* -------- 13. TIMELINE SCROLL PROGRESS -------- */
(function initTimeline() {
  const tl = document.querySelector('.timeline');
  const progress = document.querySelector('.tl-progress');
  const items = document.querySelectorAll('.tl-item');
  if (!tl || !items.length) return;

  function update() {
    const r = tl.getBoundingClientRect();
    const start = r.top - window.innerHeight * 0.4;
    const end = r.bottom - window.innerHeight * 0.6;
    const total = end - start;
    let p = 0;
    if (r.top < window.innerHeight * 0.4 && r.bottom > window.innerHeight * 0.6) {
      p = Math.max(0, Math.min(1, -start / total));
    } else if (r.top < window.innerHeight * 0.4) {
      p = 1;
    }
    if (progress) progress.style.height = (p * 100) + '%';

    items.forEach(item => {
      const ir = item.getBoundingClientRect();
      if (ir.top < window.innerHeight * 0.65 && ir.bottom > window.innerHeight * 0.25) {
        item.classList.add('active');
      }
    });
  }
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();

/* -------- 14. FAQ ACCORDION -------- */
window.toggleFaq = function(btn) { btn.parentElement.classList.toggle('open'); };

/* -------- 15. ROI CALCULATORS -------- */
window.updateCalcOdonto = function() {
  const q = parseInt(document.getElementById('calcSlider').value);
  const fat = q * 5000; const profit = fat - 2500;
  document.getElementById('calcNum').textContent = q;
  document.getElementById('calcFat').textContent = 'R$ ' + fat.toLocaleString('pt-BR');
  document.getElementById('calcProfit').textContent = 'R$ ' + profit.toLocaleString('pt-BR');
};
window.updateCalcImob = function() {
  const q = parseInt(document.getElementById('calcSlider').value);
  const fat = q * 8000; const profit = fat - 2500;
  document.getElementById('calcNum').textContent = q;
  document.getElementById('calcFat').textContent = 'R$ ' + fat.toLocaleString('pt-BR');
  document.getElementById('calcProfit').textContent = 'R$ ' + profit.toLocaleString('pt-BR');
};

/* -------- 16. CONTACT FORM → WHATSAPP -------- */
window.sendToWhatsApp = function(event, phone) {
  event.preventDefault();
  const form = event.target;
  const nome = form.querySelector('[name="nome"]').value.trim();
  const tel = form.querySelector('[name="telefone"]').value.trim();
  const segmento = form.querySelector('[name="segmento"]') ? form.querySelector('[name="segmento"]').value : '';
  const plano = form.querySelector('[name="plano"]') ? form.querySelector('[name="plano"]').value : '';
  const msg = form.querySelector('[name="mensagem"]').value.trim();

  if (!nome || !tel) { alert('Por favor preencha nome e telefone.'); return false; }

  let texto = `Olá, DF Soluções! 👋\n\n`;
  texto += `*Nome:* ${nome}\n`;
  texto += `*Telefone:* ${tel}\n`;
  if (segmento) texto += `*Segmento:* ${segmento}\n`;
  if (plano)    texto += `*Plano de interesse:* ${plano}\n`;
  if (msg)      texto += `\n*Mensagem:*\n${msg}\n`;
  texto += `\n_Enviado pelo site dfpublicidade.com.br_`;

  const url = `https://wa.me/${phone}?text=${encodeURIComponent(texto)}`;
  window.open(url, '_blank');
  return false;
};
