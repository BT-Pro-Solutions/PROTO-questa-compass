(function () {
  const compassMenu = document.querySelector('.compass-menu');
  const centerEl = document.querySelector('.cm-center');
  const needle = document.querySelector('.cm-needle');
  const needleLine = document.querySelector('.cm-needle-line');
  const edgeHighlight = document.querySelector('.cm-edge-highlight');
  const edgeGlow = document.querySelector('.cm-edge-glow');
  const options = document.querySelectorAll('.cm-option');
  const includesEl = document.querySelector('.cm-includes');
  const includesItemEl = document.querySelector('.cm-includes__item');

  if (!compassMenu || !centerEl || !needle) return;

  const MENU_TOPICS = [
    'careers',
    'education-help',
    'funding',
    'learning-help',
    'education-training',
    'personal-help',
  ];

  const INCLUDES_VISIBLE_MS = 2400;
  const INCLUDES_FADE_MS = 250;
  let includesInterval = null;
  let includesFadeTimer = null;
  let includesSubcats = [];
  let includesSubcatIndex = 0;
  let activeIncludesIndex = null;

  function stopIncludesCycle() {
    if (includesInterval) {
      clearInterval(includesInterval);
      includesInterval = null;
    }
    if (includesFadeTimer) {
      clearTimeout(includesFadeTimer);
      includesFadeTimer = null;
    }
  }

  function setIncludesItem(label, skipFade) {
    if (!includesItemEl) return;
    if (skipFade) {
      includesItemEl.textContent = label;
      includesItemEl.classList.remove('is-fading');
      return;
    }

    includesItemEl.classList.add('is-fading');
    includesFadeTimer = setTimeout(() => {
      includesFadeTimer = null;
      if (activeIncludesIndex === null) return;
      includesItemEl.textContent = label;
      includesItemEl.classList.remove('is-fading');
    }, INCLUDES_FADE_MS);
  }

  function showIncludes(index) {
    if (!includesEl || !includesItemEl) return;

    const topic = MENU_TOPICS[index];
    includesSubcats = (CompassProfile.TOPIC_INTEREST_OPTIONS || {})[topic] || [];
    if (!includesSubcats.length) return;

    stopIncludesCycle();
    activeIncludesIndex = index;
    includesSubcatIndex = 0;
    includesEl.hidden = false;
    includesEl.classList.add('is-active');
    setIncludesItem(includesSubcats[0], true);

    includesInterval = setInterval(() => {
      if (activeIncludesIndex !== index) return;
      includesSubcatIndex = (includesSubcatIndex + 1) % includesSubcats.length;
      setIncludesItem(includesSubcats[includesSubcatIndex]);
    }, INCLUDES_VISIBLE_MS);
  }

  function clearIncludes() {
    stopIncludesCycle();
    activeIncludesIndex = null;
    includesSubcats = [];
    if (includesEl) {
      includesEl.classList.remove('is-active');
      includesEl.hidden = true;
    }
    if (includesItemEl) {
      includesItemEl.textContent = '';
      includesItemEl.classList.remove('is-fading');
    }
  }

  const ITEM_ANGLES = [0, 60, 120, 180, 240, 300];
  const LOCKED_OFFSET = -30;

  let mouseX = 0;
  let mouseY = 0;
  let needleTarget = 0;
  let needleAngle = 0;
  let needleVelocity = 0;
  let isPointerInMenu = false;

  const NEEDLE_ASPECT = 75 / 53;
  const NEEDLE_WIDTH_RATIO = 0.2;
  const NEEDLE_TOP_OFFSET = -0.025;
  const NEEDLE_ORIGIN_RATIO = 0.57;

  function getNeedleTip(displayAngle) {
    const centerRect = centerEl.getBoundingClientRect();
    const centerW = centerRect.width;
    const centerH = centerRect.height;
    const needleH = centerW * NEEDLE_WIDTH_RATIO * NEEDLE_ASPECT;
    const pivotX = centerRect.left + centerW / 2;
    const pivotY =
      centerRect.top +
      centerH / 2 +
      centerH * NEEDLE_TOP_OFFSET +
      needleH * (NEEDLE_ORIGIN_RATIO - 0.5);
    const tipDist = needleH * NEEDLE_ORIGIN_RATIO;
    const angleRad = (displayAngle * Math.PI) / 180;

    return {
      x: pivotX + Math.sin(angleRad) * tipDist,
      y: pivotY - Math.cos(angleRad) * tipDist,
    };
  }

  function updateNeedleLine() {
    if (!needleLine || !isPointerInMenu) return;

    const centerRect = centerEl.getBoundingClientRect();
    const startX = centerRect.left + centerRect.width / 2;
    const startY = centerRect.top + centerRect.height / 2;

    const dx = mouseX - startX;
    const dy = mouseY - startY;
    const length = Math.hypot(dx, dy);

    if (length < 12) {
      needleLine.style.height = '0';
      return;
    }

    const rotation = (Math.atan2(-dx, dy) * 180) / Math.PI;

    needleLine.style.left = `${centerRect.width / 2}px`;
    needleLine.style.top = `${centerRect.height / 2}px`;
    needleLine.style.height = `${length}px`;
    needleLine.style.transform = `rotate(${rotation}deg)`;
  }

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
    showIncludes(index);
  }

  function clearActiveItem() {
    compassMenu.classList.remove('is-link-hover');
    clearIncludes();
  }

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    needleTarget = getMouseAngle();
  });

  function navigateFromCompassTopic(topic) {
    const isLoggedIn = typeof CompassAuth !== 'undefined' && CompassAuth.isLoggedIn();
    if (isLoggedIn || document.body.classList.contains('page-compass')) {
      CompassProfile.setTopic(topic);
      window.location.href = `results.html?topic=${encodeURIComponent(topic)}`;
      return;
    }
    CompassProfile.clearProfile();
    CompassProfile.setTopic(topic);
    window.location.href = `profile-builder.html?topic=${encodeURIComponent(topic)}`;
  }

  options.forEach((option, index) => {
    option.addEventListener('mouseenter', () => setActiveItem(index));
    option.addEventListener('mouseleave', (e) => {
      if (!e.relatedTarget?.closest('.cm-option')) {
        clearActiveItem();
      }
    });
    option.addEventListener('click', (e) => {
      e.preventDefault();
      const topic = MENU_TOPICS[index];
      if (topic) navigateFromCompassTopic(topic);
    });
  });

  compassMenu.addEventListener('mouseenter', () => {
    isPointerInMenu = true;
    compassMenu.classList.add('is-pointer-active');
  });

  compassMenu.addEventListener('mouseleave', () => {
    isPointerInMenu = false;
    compassMenu.classList.remove('is-pointer-active');
    clearActiveItem();
  });

  function animateNeedle() {
    if (document.body.classList.contains('asteroids-active')) {
      requestAnimationFrame(animateNeedle);
      return;
    }

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
    updateNeedleLine();
    requestAnimationFrame(animateNeedle);
  }

  needleTarget = getMouseAngle();
  needleAngle = needleTarget;
  animateNeedle();
})();

// ============================================================
// Quiz / Guiding Questions
// ============================================================
(function () {
  const QUESTIONS = [
    {
      topic: 'learning-help',
      text: 'Do you need help building the academic skills or confidence needed to succeed in college, training, or other education after high school?',
      yesLabel: 'YES — Find Learning Help',
    },
    {
      topic: 'careers',
      text: 'Are you looking for help discovering a career path that fits your skills, interests, or experience?',
      yesLabel: 'YES — Find Careers',
    },
    {
      topic: 'education-help',
      text: 'Are you looking for guidance on applying to or enrolling in a college, university, or higher education program?',
      yesLabel: 'YES — Find Education Help',
    },
    {
      topic: 'funding',
      text: 'Do you need help finding scholarships, grants, financial aid, or other funding for your education?',
      yesLabel: 'YES — Find Funding',
    },
    {
      topic: 'education-training',
      text: 'Are you interested in vocational training, apprenticeships, or professional certification programs?',
      yesLabel: 'YES — Find Education & Training',
    },
    {
      topic: 'personal-help',
      text: 'Are you looking for resources to support your personal development, mental wellness, or everyday life skills?',
      yesLabel: 'YES — Find Personal Help',
    },
  ];

  const MENU_TOPICS = [
    'careers',
    'education-help',
    'funding',
    'learning-help',
    'education-training',
    'personal-help',
  ];

  function navigateToTopicProfile(topic) {
    CompassProfile.clearProfile();
    CompassProfile.setTopic(topic);
    window.location.href = `profile-builder.html?topic=${encodeURIComponent(topic)}`;
  }

  const card        = document.querySelector('.compass-card');
  const quizView    = document.getElementById('quizView');
  const quizContent = document.getElementById('quizContent');
  const quizFinal   = document.getElementById('quizFinal');
  const quizNum     = document.getElementById('quizNum');
  const quizQuestion= document.getElementById('quizQuestion');
  const quizYes     = document.getElementById('quizYes');
  const backBtns    = document.querySelectorAll('.js-quiz-close');
  const openTriggers= document.querySelectorAll('.js-quiz-open');
  const ctaDesktop  = document.querySelector('.compass-card__cta--desktop');
  const backBtn     = document.querySelector('.quiz-back-btn');

  if (!card) return;

  let currentIndex = 0;

  function showQuestion(index) {
    const q = QUESTIONS[index];
    quizNum.textContent      = `(${index + 1} of ${QUESTIONS.length})`;
    quizQuestion.textContent = q.text;
    quizYes.textContent      = q.yesLabel;

    quizContent.hidden = false;
    quizFinal.hidden   = true;
  }

  function openQuiz() {
    currentIndex = 0;
    showQuestion(0);

    card.classList.add('quiz-active');
    quizView.setAttribute('aria-hidden', 'false');

    if (ctaDesktop) ctaDesktop.hidden = true;
    if (backBtn)    backBtn.hidden    = false;
  }

  function closeQuiz() {
    card.classList.remove('quiz-active');
    quizView.setAttribute('aria-hidden', 'true');

    if (ctaDesktop) ctaDesktop.hidden = false;
    if (backBtn)    backBtn.hidden    = true;
  }

  function advanceQuestion() {
    currentIndex += 1;
    if (currentIndex >= QUESTIONS.length) {
      quizContent.hidden = true;
      quizFinal.hidden   = false;
    } else {
      showQuestion(currentIndex);
    }
  }

  // Open triggers: both "Not sure where to start?" links and the Quincy callout
  openTriggers.forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      openQuiz();
    });
  });

  // Close triggers: "Back To Main" and "Browse Topics"
  backBtns.forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      closeQuiz();
    });
  });

  // "No" button advances to next question
  document.querySelectorAll('.js-quiz-no').forEach((el) => {
    el.addEventListener('click', advanceQuestion);
  });

  if (quizYes) {
    quizYes.addEventListener('click', () => {
      navigateToTopicProfile(QUESTIONS[currentIndex].topic);
    });
  }

  document.querySelectorAll('.js-quiz-create-profile').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      CompassProfile.clearProfile();
      window.location.href = 'profile-builder.html?mode=universal&expand=all';
    });
  });

})();
