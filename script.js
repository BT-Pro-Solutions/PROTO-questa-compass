(function () {
  const compassMenu = document.querySelector('.compass-menu');
  const centerEl = document.querySelector('.cm-center');
  const needle = document.querySelector('.cm-needle');
  const edgeHighlight = document.querySelector('.cm-edge-highlight');
  const edgeGlow = document.querySelector('.cm-edge-glow');
  const options = document.querySelectorAll('.cm-option');
  const descriptions = document.querySelectorAll('.cm-description-item');

  const ITEM_ANGLES = [0, 60, 120, 180, 240, 300];
  const LOCKED_OFFSET = -30;

  let mouseX = 0;
  let mouseY = 0;
  let needleTarget = 0;
  let needleAngle = 0;
  let needleVelocity = 0;

  function normalizeAngle(deg) {
    let angle = deg % 360;
    if (angle > 180) angle -= 360;
    if (angle < -180) angle += 360;
    return angle;
  }

  function getMouseAngle() {
    const rect = centerEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = mouseX - cx;
    const dy = mouseY - cy;

    if (dx === 0 && dy === 0) return needleTarget;

    return Math.atan2(dy, dx) * (180 / Math.PI) + 90;
  }

  function setActiveItem(index) {
    compassMenu.classList.add('is-link-hover');
    edgeHighlight.style.transform = `rotate(${ITEM_ANGLES[index] + LOCKED_OFFSET}deg)`;
    edgeGlow.style.transform = `rotate(${ITEM_ANGLES[index]}deg)`;
    descriptions.forEach((item, i) => {
      item.classList.toggle('is-active', i === index);
    });
  }

  function clearActiveItem() {
    compassMenu.classList.remove('is-link-hover');
    descriptions.forEach((item) => item.classList.remove('is-active'));
  }

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    needleTarget = getMouseAngle();
  });

  options.forEach((option, index) => {
    option.addEventListener('mouseenter', () => setActiveItem(index));
    option.addEventListener('mouseleave', (e) => {
      if (!e.relatedTarget?.closest('.cm-option')) {
        clearActiveItem();
      }
    });
  });

  compassMenu.addEventListener('mouseleave', clearActiveItem);

  function animateNeedle() {
    const spring = 0.1;
    const damping = 0.78;
    const wobbleStrength = 0.55;

    const diff = normalizeAngle(needleTarget - needleAngle);
    needleVelocity += diff * spring;
    needleVelocity *= damping;

    const wobble =
      Math.sin(performance.now() * 0.012) *
      wobbleStrength *
      Math.min(1, Math.abs(needleVelocity) * 4 + Math.abs(diff) * 0.02);

    needleAngle += needleVelocity;
    const displayAngle = needleAngle + wobble;

    needle.style.transform = `rotate(${displayAngle}deg)`;
    requestAnimationFrame(animateNeedle);
  }

  needleTarget = getMouseAngle();
  needleAngle = needleTarget;
  animateNeedle();
})();
