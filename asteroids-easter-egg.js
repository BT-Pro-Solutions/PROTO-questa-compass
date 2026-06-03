(function () {
  const card = document.querySelector('.compass-card');
  const compassMenu = document.querySelector('.compass-menu');
  const centerEl = document.querySelector('.cm-center');
  const needle = document.querySelector('.cm-needle');
  const needleLine = document.querySelector('.cm-needle-line');

  if (!card || !compassMenu || !centerEl || !needle) return;

  document.querySelectorAll(
    '.site-header, .site-footer, .compass-card__powered, ' +
    '.compass-card__cta--mobile, .quincy-callout, .cm-options, .cm-description, ' +
    '.cm-center-dividers, .cm-edge-glow, .cm-edge-highlight'
  ).forEach((el) => el.classList.add('asteroids-fade-target'));

  const THRUST = 280;
  const ROT_SPEED = 200;
  const MAX_SPEED = 420;
  const DRAG = 0.995;
  const BULLET_SPEED = 520;
  const BULLET_LENGTH = 48;
  const BULLET_LIFE = 1.2;
  const FIRE_COOLDOWN = 0.22;
  const NEEDLE_PIVOT = 0.57;
  const NEEDLE_ASPECT = 75 / 53;
  const QUINCY_ASPECT = 59 / 56;
  const MIN_SPLIT_SIZE = 72;
  const CHEAT_CODE = 'asteroids';
  const CHEAT_RESET_MS = 2500;

  // Optional audio — drop files in assets/audio/ when ready; game works without them.
  const AUDIO = {
    shoot: 'assets/audio/asteroids-shoot.mp3',
    explode: 'assets/audio/asteroids-explode.mp3',
    thrust: 'assets/audio/asteroids-thrust.mp3',
    music: 'assets/audio/asteroids-music.mp3',
  };

  let active = false;
  let rafId = null;
  let lastTime = 0;
  let bounds = { w: 0, h: 0 };
  let ship = null;
  let quincies = [];
  let bullets = [];
  let keys = {};
  let fireTimer = 0;
  let score = 0;
  let quinciesLayer = null;
  let scoreEl = null;
  let hintEl = null;
  let bulletContainer = null;
  let thrustEl = null;
  let gameOverEl = null;
  let gameOver = false;
  let typedBuffer = '';
  let typedResetTimer = null;
  let wasThrusting = false;

  const audioCache = {};
  const activeLoops = {};

  function loadAudio(src) {
    if (!src) return null;
    if (!audioCache[src]) {
      const audio = new Audio();
      audio.src = src;
      audio.preload = 'auto';
      audioCache[src] = audio;
    }
    return audioCache[src];
  }

  function playSfx(name, { loop = false, volume = 1 } = {}) {
    const src = AUDIO[name];
    if (!src) return null;

    const audio = loadAudio(src);
    if (!audio) return null;

    audio.volume = volume;
    audio.loop = loop;

    audio.play().catch(() => {});

    if (loop) activeLoops[name] = audio;
    return audio;
  }

  function stopSfx(name) {
    const audio = activeLoops[name];
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    delete activeLoops[name];
  }

  function stopAllAudio() {
    Object.keys(activeLoops).forEach(stopSfx);
  }

  function canActivate() {
    if (active) return false;
    if (card.classList.contains('quiz-active')) return false;
    const modal = document.getElementById('createAccountModal');
    if (modal && !modal.hidden) return false;
    return true;
  }

  function isTypingTarget(e) {
    return !!e.target.closest('input, textarea, select, [contenteditable="true"]');
  }

  function resetTypedBuffer() {
    typedBuffer = '';
    if (typedResetTimer) {
      clearTimeout(typedResetTimer);
      typedResetTimer = null;
    }
  }

  function trackCheatKey(key) {
    if (!canActivate() || key.length !== 1) return;

    typedBuffer = (typedBuffer + key.toLowerCase()).slice(-CHEAT_CODE.length);

    if (typedResetTimer) clearTimeout(typedResetTimer);
    typedResetTimer = setTimeout(resetTypedBuffer, CHEAT_RESET_MS);

    if (typedBuffer === CHEAT_CODE) {
      resetTypedBuffer();
      startGame();
    }
  }

  function wrapCoord(val, max) {
    if (val < 0) return val + max;
    if (val >= max) return val - max;
    return val;
  }

  function getShipNeedleSize() {
    const w = Math.min(bounds.w, bounds.h) * 0.08;
    return { w, h: w * NEEDLE_ASPECT };
  }

  function getShipPivot() {
    const size = getShipNeedleSize();
    const tailDist = size.h * (1 - NEEDLE_PIVOT);
    return {
      x: ship.x,
      y: ship.y,
      tipX: ship.x + Math.sin(ship.angleRad) * size.h * NEEDLE_PIVOT,
      tipY: ship.y - Math.cos(ship.angleRad) * size.h * NEEDLE_PIVOT,
      tailX: ship.x - Math.sin(ship.angleRad) * tailDist,
      tailY: ship.y + Math.cos(ship.angleRad) * tailDist,
      size,
    };
  }

  function getShipRadius() {
    return getShipNeedleSize().w * 0.45;
  }

  function getQuincyHitbox(q) {
    const w = q.size;
    const h = q.size * QUINCY_ASPECT;
    const cos = Math.cos(q.angle);
    const sin = Math.sin(q.angle);
    const hw = w / 2;
    const hh = h / 2;
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    for (const [lx, ly] of [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]]) {
      const wx = q.x + lx * cos - ly * sin;
      const wy = q.y + lx * sin + ly * cos;
      minX = Math.min(minX, wx);
      maxX = Math.max(maxX, wx);
      minY = Math.min(minY, wy);
      maxY = Math.max(maxY, wy);
    }

    return { minX, maxX, minY, maxY };
  }

  function pointInAABB(px, py, box) {
    return px >= box.minX && px <= box.maxX && py >= box.minY && py <= box.maxY;
  }

  function circleIntersectsAABB(cx, cy, r, box) {
    const closestX = Math.max(box.minX, Math.min(cx, box.maxX));
    const closestY = Math.max(box.minY, Math.min(cy, box.maxY));
    return Math.hypot(cx - closestX, cy - closestY) < r;
  }

  function createThrustEl() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.classList.add('asteroids-thrust');
    svg.setAttribute('viewBox', '0 0 24 36');
    svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = `
      <polyline class="asteroids-thrust-line" points="12,0 7,32" />
      <polyline class="asteroids-thrust-line" points="12,0 12,34" />
      <polyline class="asteroids-thrust-line" points="12,0 17,30" />
      <polyline class="asteroids-thrust-line asteroids-thrust-line--dim" points="9,6 5,24" />
      <polyline class="asteroids-thrust-line asteroids-thrust-line--dim" points="15,6 19,22" />
    `;
    centerEl.appendChild(svg);
    return svg;
  }

  function updateThrustVisual() {
    if (!thrustEl || !ship) return;

    if (!ship.thrusting) {
      thrustEl.classList.remove('is-active');
      return;
    }

    thrustEl.classList.add('is-active');
    const { tailX, tailY, size } = getShipPivot();
    const deg = (ship.angleRad * 180) / Math.PI;
    const flameW = size.w * 0.55;
    const flameH = size.h * 0.42;

    thrustEl.style.width = `${flameW}px`;
    thrustEl.style.height = `${flameH}px`;
    thrustEl.style.left = `${tailX}px`;
    thrustEl.style.top = `${tailY}px`;
    thrustEl.style.transform = `translate(-50%, 0) rotate(${deg}deg)`;

    thrustEl.querySelectorAll('.asteroids-thrust-line').forEach((line) => {
      const jitter = (Math.random() - 0.5) * 3;
      line.style.transform = `translateX(${jitter}px)`;
    });
  }

  function spawnQuincy(fromEdge) {
    const margin = 50;
    const size = 44 + Math.random() * 52;
    let x;
    let y;
    let vx;
    let vy;

    if (fromEdge) {
      const edge = Math.floor(Math.random() * 4);
      const speed = 40 + Math.random() * 70;
      const aimX = bounds.w * (0.3 + Math.random() * 0.4);
      const aimY = bounds.h * (0.3 + Math.random() * 0.4);

      if (edge === 0) {
        x = -margin;
        y = Math.random() * bounds.h;
      } else if (edge === 1) {
        x = bounds.w + margin;
        y = Math.random() * bounds.h;
      } else if (edge === 2) {
        x = Math.random() * bounds.w;
        y = -margin;
      } else {
        x = Math.random() * bounds.w;
        y = bounds.h + margin;
      }

      const dx = aimX - x;
      const dy = aimY - y;
      const dist = Math.hypot(dx, dy) || 1;
      vx = (dx / dist) * speed;
      vy = (dy / dist) * speed;
    } else {
      x = Math.random() * bounds.w;
      y = Math.random() * bounds.h;
      vx = (Math.random() - 0.5) * 60;
      vy = (Math.random() - 0.5) * 60;
    }

    quincies.push({
      x,
      y,
      vx,
      vy,
      rot: (Math.random() - 0.5) * 1.5,
      angle: Math.random() * Math.PI * 2,
      size,
      canSplit: true,
      el: null,
    });
  }

  function createQuincyEl(quincy) {
    const img = document.createElement('img');
    img.src = 'assets/Quincy-Head.png';
    img.alt = '';
    img.className = 'asteroids-quincy';
    img.draggable = false;
    quinciesLayer.appendChild(img);
    quincy.el = img;
  }

  function updateBounds() {
    const rect = centerEl.getBoundingClientRect();
    bounds = { w: rect.width, h: rect.height };
  }

  function resetShip() {
    ship = {
      x: bounds.w / 2,
      y: bounds.h / 2,
      vx: 0,
      vy: 0,
      angleRad: 0,
      thrusting: false,
    };
  }

  function initQuincies() {
    quincies.forEach((q) => q.el?.remove());
    quincies = [];
    const count = Math.max(4, Math.floor((bounds.w * bounds.h) / 90000));
    for (let i = 0; i < count; i++) {
      spawnQuincy(true);
    }
  }

  function fireBullet() {
    const pivot = getShipPivot();
    const bx = pivot.tipX;
    const by = pivot.tipY;
    const bvx = Math.sin(ship.angleRad) * BULLET_SPEED;
    const bvy = -Math.cos(ship.angleRad) * BULLET_SPEED;

    const line = document.createElement('div');
    line.className = 'cm-needle-line asteroids-bullet';
    line.style.opacity = '1';
    bulletContainer.appendChild(line);

    bullets.push({
      x: bx,
      y: by,
      vx: bvx,
      vy: bvy,
      life: BULLET_LIFE,
      el: line,
    });

    playSfx('shoot', { volume: 0.5 });
  }

  function lineIntersectsAABB(x1, y1, x2, y2, box) {
    if (pointInAABB(x1, y1, box) || pointInAABB(x2, y2, box)) return true;

    const edges = [
      [box.minX, box.minY, box.maxX, box.minY],
      [box.maxX, box.minY, box.maxX, box.maxY],
      [box.maxX, box.maxY, box.minX, box.maxY],
      [box.minX, box.maxY, box.minX, box.minY],
    ];

    return edges.some(([x3, y3, x4, y4]) => segmentsIntersect(x1, y1, x2, y2, x3, y3, x4, y4));
  }

  function segmentsIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
    const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (Math.abs(denom) < 1e-10) return false;
    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;
    return t >= 0 && t <= 1 && u >= 0 && u <= 1;
  }

  function clearBullets() {
    bullets.forEach((b) => b.el?.remove());
    bullets = [];
    fireTimer = 0;
  }

  function triggerGameOver() {
    if (gameOver) return;
    gameOver = true;
    keys = {};
    stopSfx('thrust');
    wasThrusting = false;
    ship.thrusting = false;
    thrustEl?.classList.remove('is-active');
    clearBullets();

    gameOverEl = document.createElement('div');
    gameOverEl.className = 'asteroids-gameover';
    gameOverEl.innerHTML =
      '<p class="asteroids-gameover__title">Game Over</p>' +
      '<p class="asteroids-gameover__hint">Press Space to Retry</p>';
    compassMenu.appendChild(gameOverEl);
  }

  function retryGame() {
    gameOver = false;
    gameOverEl?.remove();
    gameOverEl = null;
    resetShip();
    initQuincies();
    updateShipVisual();
  }

  function destroyQuincy(index) {
    const quincy = quincies[index];
    quincy.el?.remove();
    score += Math.round(quincy.size);

    playSfx('explode', { volume: 0.6 });

    if (quincy.canSplit && quincy.size >= MIN_SPLIT_SIZE) {
      const childSize = quincy.size * 0.65;
      for (let i = 0; i < 2; i++) {
        quincies.push({
          x: quincy.x + (Math.random() - 0.5) * 12,
          y: quincy.y + (Math.random() - 0.5) * 12,
          vx: quincy.vx + (Math.random() - 0.5) * 40,
          vy: quincy.vy + (Math.random() - 0.5) * 40,
          rot: (Math.random() - 0.5) * 2,
          angle: Math.random() * Math.PI * 2,
          size: childSize,
          canSplit: false,
          el: null,
        });
      }
    }

    quincies.splice(index, 1);

    if (quincies.length < 2) {
      spawnQuincy(true);
      spawnQuincy(true);
    }
  }

  function updateShipVisual() {
    const { w } = getShipNeedleSize();
    const deg = (ship.angleRad * 180) / Math.PI;

    needle.style.width = `${w}px`;
    needle.style.left = `${ship.x}px`;
    needle.style.top = `${ship.y}px`;
    needle.style.transform = `translate(-50%, -${NEEDLE_PIVOT * 100}%) rotate(${deg}deg)`;

    updateThrustVisual();

    if (needleLine) {
      needleLine.style.opacity = '0';
      needleLine.style.height = '0';
    }
  }

  function updateBulletVisual(bullet) {
    const dx = bullet.vx;
    const dy = bullet.vy;
    const len = Math.hypot(dx, dy) || 1;
    const rotation = (Math.atan2(-dx, dy) * 180) / Math.PI;
    const tailX = bullet.x - (dx / len) * BULLET_LENGTH;
    const tailY = bullet.y - (dy / len) * BULLET_LENGTH;

    bullet.el.style.left = `${tailX}px`;
    bullet.el.style.top = `${tailY}px`;
    bullet.el.style.height = `${BULLET_LENGTH}px`;
    bullet.el.style.transform = `rotate(${rotation}deg)`;
  }

  function updateQuincyVisual(quincy) {
    if (!quincy.el) createQuincyEl(quincy);
    const h = quincy.size * QUINCY_ASPECT;
    quincy.el.style.width = `${quincy.size}px`;
    quincy.el.style.height = `${h}px`;
    quincy.el.style.left = `${quincy.x}px`;
    quincy.el.style.top = `${quincy.y}px`;
    quincy.el.style.transform = `translate(-50%, -50%) rotate(${(quincy.angle * 180) / Math.PI}deg)`;
  }

  function syncThrustAudio() {
    if (ship.thrusting && !wasThrusting) {
      playSfx('thrust', { loop: true, volume: 0.35 });
    } else if (!ship.thrusting && wasThrusting) {
      stopSfx('thrust');
    }
    wasThrusting = ship.thrusting;
  }

  function tickQuincies(dt) {
    const shipRadius = gameOver ? 0 : getShipRadius();

    for (let i = quincies.length - 1; i >= 0; i--) {
      const q = quincies[i];
      q.x += q.vx * dt;
      q.y += q.vy * dt;
      q.angle += q.rot * dt;

      q.x = wrapCoord(q.x, bounds.w);
      q.y = wrapCoord(q.y, bounds.h);

      updateQuincyVisual(q);

      if (!gameOver && circleIntersectsAABB(ship.x, ship.y, shipRadius, getQuincyHitbox(q))) {
        triggerGameOver();
        return;
      }
    }
  }

  function tick(dt) {
    updateBounds();

    if (!gameOver) {
      if (keys.ArrowLeft) ship.angleRad -= (ROT_SPEED * Math.PI) / 180 * dt;
      if (keys.ArrowRight) ship.angleRad += (ROT_SPEED * Math.PI) / 180 * dt;

      ship.thrusting = !!keys.ArrowUp;
      if (ship.thrusting) {
        ship.vx += Math.sin(ship.angleRad) * THRUST * dt;
        ship.vy -= Math.cos(ship.angleRad) * THRUST * dt;
      }

      syncThrustAudio();

      ship.vx *= DRAG;
      ship.vy *= DRAG;

      const speed = Math.hypot(ship.vx, ship.vy);
      if (speed > MAX_SPEED) {
        ship.vx = (ship.vx / speed) * MAX_SPEED;
        ship.vy = (ship.vy / speed) * MAX_SPEED;
      }

      ship.x += ship.vx * dt;
      ship.y += ship.vy * dt;
      ship.x = wrapCoord(ship.x, bounds.w);
      ship.y = wrapCoord(ship.y, bounds.h);

      fireTimer -= dt;
      if (keys[' '] && fireTimer <= 0) {
        fireBullet();
        fireTimer = FIRE_COOLDOWN;
      }

      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        const prevX = b.x;
        const prevY = b.y;
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.life -= dt;

        if (b.life <= 0 || b.x < -20 || b.x > bounds.w + 20 || b.y < -20 || b.y > bounds.h + 20) {
          b.el.remove();
          bullets.splice(i, 1);
          continue;
        }

        updateBulletVisual(b);

        for (let j = quincies.length - 1; j >= 0; j--) {
          const box = getQuincyHitbox(quincies[j]);
          if (lineIntersectsAABB(prevX, prevY, b.x, b.y, box)) {
            b.el.remove();
            bullets.splice(i, 1);
            destroyQuincy(j);
            break;
          }
        }
      }
    }

    updateShipVisual();
    tickQuincies(dt);

    if (scoreEl) scoreEl.textContent = String(score);
  }

  function loop(now) {
    if (!active) return;
    const dt = Math.min(0.032, (now - lastTime) / 1000 || 0.016);
    lastTime = now;
    tick(dt);
    rafId = requestAnimationFrame(loop);
  }

  function startGame() {
    if (active || !canActivate()) return;
    active = true;
    document.body.classList.add('asteroids-active');
    card.classList.add('asteroids-active');

    quinciesLayer = document.createElement('div');
    quinciesLayer.className = 'asteroids-layer';
    quinciesLayer.setAttribute('aria-hidden', 'true');
    centerEl.appendChild(quinciesLayer);

    bulletContainer = document.createElement('div');
    bulletContainer.className = 'asteroids-bullets';
    centerEl.appendChild(bulletContainer);

    thrustEl = createThrustEl();

    scoreEl = document.createElement('div');
    scoreEl.className = 'asteroids-score';
    scoreEl.textContent = '0';
    compassMenu.appendChild(scoreEl);

    hintEl = document.createElement('p');
    hintEl.className = 'asteroids-hint';
    hintEl.textContent = '← → turn · ↑ thrust · space fire · esc exit';
    compassMenu.appendChild(hintEl);

    playSfx('music', { loop: true, volume: 0.4 });

    requestAnimationFrame(() => {
      updateBounds();
      resetShip();
      initQuincies();
      updateShipVisual();
    });

    score = 0;
    gameOver = false;
    clearBullets();
    wasThrusting = false;

    needle.classList.add('asteroids-ship');

    lastTime = performance.now();
    rafId = requestAnimationFrame(loop);
  }

  function stopGame() {
    if (!active) return;
    active = false;

    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;

    stopAllAudio();
    wasThrusting = false;
    gameOver = false;

    document.body.classList.remove('asteroids-active');
    card.classList.remove('asteroids-active');

    quincies.forEach((q) => q.el?.remove());
    quincies = [];
    bullets.forEach((b) => b.el?.remove());
    bullets = [];

    quinciesLayer?.remove();
    quinciesLayer = null;
    bulletContainer?.remove();
    bulletContainer = null;
    thrustEl?.remove();
    thrustEl = null;
    scoreEl?.remove();
    scoreEl = null;
    hintEl?.remove();
    hintEl = null;
    gameOverEl?.remove();
    gameOverEl = null;

    needle.classList.remove('asteroids-ship');
    needle.style.width = '';
    needle.style.left = '';
    needle.style.top = '';
    needle.style.transform = '';

    if (needleLine) {
      needleLine.style.height = '0';
      needleLine.style.opacity = '';
    }

    window.dispatchEvent(new CustomEvent('asteroids-exit'));
  }

  document.addEventListener('keydown', (e) => {
    if (isTypingTarget(e)) return;

    if (!active) {
      if (e.key.length === 1) trackCheatKey(e.key);
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      stopGame();
      return;
    }

    if (gameOver) {
      if (e.key === ' ' && !e.repeat) {
        e.preventDefault();
        retryGame();
      }
      return;
    }

    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
      e.preventDefault();
      keys[e.key] = true;
    }
  });

  document.addEventListener('keyup', (e) => {
    if (!active) return;
    if (e.key in keys) keys[e.key] = false;
  });

  window.addEventListener('blur', () => {
    keys = {};
    if (active && wasThrusting) {
      stopSfx('thrust');
      wasThrusting = false;
    }
  });

  window.addEventListener('resize', () => {
    if (active) updateBounds();
  });

  window.AsteroidsEasterEgg = { isActive: () => active };
})();
