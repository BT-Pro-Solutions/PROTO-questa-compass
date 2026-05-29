(function () {
  const TOPICS = [
    {
      description: 'Find a <em>career</em> that fits your talents.',
    },
    {
      description: 'Find <em>education help</em> for your next step.',
    },
    {
      description: 'Find <em>funding</em> to reach your goals.',
    },
    {
      description: 'Find <em>learning help</em> to build new skills.',
    },
    {
      description: 'Find <em>education &amp; training</em> programs near you.',
    },
    {
      description: 'Find <em>personal help</em> and support resources.',
    },
  ];

  const ITEM_ANGLES = [0, 60, 120, 180, 240, 300];
  const LOCKED_OFFSET = -30;

  const compassMenu = document.querySelector('.compass-menu');
  const centerEl = document.querySelector('.cm-center');
  const needle = document.querySelector('.cm-needle');
  const lockedRotation = document.querySelector('.cm-locked-rotation');
  const outerArc = document.querySelector('.cm-outer-arc');
  const description = document.querySelector('.cm-description');
  const lines = document.querySelectorAll('.cm-center-line');
  const options = document.querySelectorAll('.cm-option');
  const topicBtns = document.querySelectorAll('.topic-btn');

  let activeIndex = 0;
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
    if (!centerEl) return needleTarget;

    const rect = centerEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = mouseX - cx;
    const dy = mouseY - cy;

    if (dx === 0 && dy === 0) return needleTarget;

    return Math.atan2(dy, dx) * (180 / Math.PI) + 90;
  }

  function rotateArcs(index) {
    const rotation = ITEM_ANGLES[index] + LOCKED_OFFSET;
    const transform = `rotate(${rotation}deg)`;

    if (lockedRotation) lockedRotation.style.transform = transform;
    if (outerArc) outerArc.style.transform = transform;
  }

  function setActiveLines(index) {
    lines.forEach((line, i) => {
      line.classList.toggle('cm-center-line-active', i === index);
    });
  }

  function setActiveOptions(index) {
    options.forEach((option, i) => {
      option.classList.toggle('is-active', i === index);
    });
  }

  function setActiveTopicBtns(index) {
    topicBtns.forEach((btn) => {
      btn.classList.toggle('is-active', Number(btn.dataset.index) === index);
    });
  }

  function setDescription(index) {
    if (description) {
      description.innerHTML = TOPICS[index].description;
    }
  }

  function setActiveItem(index, fromHover) {
    activeIndex = index;
    rotateArcs(index);
    setActiveLines(index);
    setActiveOptions(index);
    setActiveTopicBtns(index);
    setDescription(index);

    if (compassMenu) {
      compassMenu.classList.add(fromHover ? 'is-link-hover' : 'has-active');
      if (fromHover) compassMenu.classList.add('has-active');
    }
  }

  function clearHoverState() {
    if (compassMenu) {
      compassMenu.classList.remove('is-link-hover');
    }
    setActiveItem(activeIndex, false);
  }

  if (compassMenu && centerEl && needle) {
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      needleTarget = getMouseAngle();
    });

    options.forEach((option, index) => {
      option.addEventListener('mouseenter', () => setActiveItem(index, true));
      option.addEventListener('mouseleave', (e) => {
        if (!e.relatedTarget?.closest('.cm-option')) {
          clearHoverState();
        }
      });
      option.addEventListener('click', (e) => {
        e.preventDefault();
        setActiveItem(index, false);
      });
    });

    compassMenu.addEventListener('mouseleave', clearHoverState);

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
  }

  topicBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      setActiveItem(Number(btn.dataset.index), false);
    });
  });

  setActiveItem(0, false);
})();
