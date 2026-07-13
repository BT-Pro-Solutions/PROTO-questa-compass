(function () {
  const compassMenu = document.querySelector('.compass-menu');
  const centerEl = document.querySelector('.cm-center');
  const needle = document.querySelector('.cm-needle');
  const needleLine = document.querySelector('.cm-needle-line');
  const edgeHighlight = document.querySelector('.cm-edge-highlight');
  const edgeGlow = document.querySelector('.cm-edge-glow');
  const options = document.querySelectorAll('.cm-option');
  const topicBar = document.getElementById('compassTopicBar');
  const topicBarName = document.querySelector('.compass-topic-bar__name');
  const topicBarDesc = document.querySelector('.compass-topic-bar__desc');
  const topicBarIcon = document.querySelector('.compass-topic-bar__icon');
  const topicBarPills = document.querySelector('.compass-topic-bar__pills');
  const topicBarIncludes = document.querySelector('.compass-topic-bar__includes');
  const ringIcons = document.querySelectorAll('.cm-ring-icon');

  if (!compassMenu || !centerEl || !needle) return;

  const MENU_TOPICS = [
    'careers',
    'education-help',
    'funding',
    'learning-help',
    'education-training',
    'personal-help',
  ];

  function showTopicBar(index) {
    if (!topicBar || !topicBarName || !topicBarDesc) return;

    const topicKey = MENU_TOPICS[index];
    const { TOPIC_INTEREST_LABELS, TOPICS, TOPIC_INTEREST_OPTIONS } = CompassProfile;
    const label = TOPIC_INTEREST_LABELS[topicKey];
    const description = TOPICS[topicKey]?.description;
    const subcats = TOPIC_INTEREST_OPTIONS[topicKey] || [];
    if (!label || !description) return;

    topicBarName.textContent = label;
    topicBarDesc.textContent = description;

    if (topicBarIcon) {
      topicBarIcon.innerHTML = CompassProfile.topicPillIconHtml(topicKey);
    }

    if (topicBarPills && topicBarIncludes) {
      if (subcats.length) {
        topicBarIncludes.hidden = false;
        topicBarPills.innerHTML = subcats
          .map((item) => `<li class="compass-topic-bar__pill">${item}</li>`)
          .join('');
      } else {
        topicBarIncludes.hidden = true;
        topicBarPills.innerHTML = '';
      }
    }

    topicBar.setAttribute('aria-hidden', 'false');
    topicBar.classList.add('is-visible');
  }

  function clearTopicBar() {
    if (!topicBar) return;
    topicBar.classList.remove('is-visible');
    topicBar.setAttribute('aria-hidden', 'true');
    if (topicBarIcon) topicBarIcon.innerHTML = '';
    if (topicBarPills) topicBarPills.innerHTML = '';
    if (topicBarIncludes) topicBarIncludes.hidden = true;
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

  let activeIndex = -1;

  function isDesktopCompass() {
    return window.matchMedia('(min-width: 721px)').matches;
  }

  function getPointerTopicIndex() {
    const rect = centerEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = mouseX - cx;
    const dy = mouseY - cy;
    const dist = Math.hypot(dx, dy);
    const halfW = rect.width / 2;

    const inner = halfW * 0.28;
    const outer = halfW * 1.85;

    if (dist < inner || dist > outer) return null;

    const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    const normalized = ((angle % 360) + 360) % 360;
    return Math.floor(((normalized + 30) % 360) / 60);
  }

  function updateHoverFromPointer() {
    if (!isDesktopCompass() || !isPointerInMenu) return;

    const index = getPointerTopicIndex();
    if (index === null) {
      if (activeIndex !== -1) clearActiveItem();
      return;
    }

    if (index !== activeIndex) setActiveItem(index);
  }

  function setActiveItem(index) {
    activeIndex = index;
    options.forEach((option, i) => {
      option.classList.toggle('is-active', i === index);
    });
    compassMenu.classList.add('is-link-hover');
    edgeHighlight.style.transform = `rotate(${ITEM_ANGLES[index] + LOCKED_OFFSET}deg)`;
    edgeGlow.style.transform = `rotate(${ITEM_ANGLES[index]}deg)`;
    ringIcons.forEach((icon, i) => {
      icon.classList.toggle('is-active', i === index);
    });
    showTopicBar(index);
  }

  function clearActiveItem() {
    activeIndex = -1;
    options.forEach((option) => option.classList.remove('is-active'));
    compassMenu.classList.remove('is-link-hover');
    ringIcons.forEach((icon) => icon.classList.remove('is-active'));
    clearTopicBar();
  }

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    needleTarget = getMouseAngle();
    updateHoverFromPointer();
  });

  let isExitAnimating = false;

  const EXIT_FADE_MS = 600;
  const EXIT_CENTER_MS = 1000;
  const EXIT_SLIDE_MS = 600;

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function getTopicDestination(topic) {
    if (topic === 'funding') return CompassProfile.FUNDING_EXTERNAL_URL;
    const isLoggedIn = typeof CompassAuth !== 'undefined' && CompassAuth.isLoggedIn();
    if (isLoggedIn || document.body.classList.contains('page-compass')) {
      return `results.html?topic=${encodeURIComponent(topic)}`;
    }
    return `profile-builder.html?topic=${encodeURIComponent(topic)}`;
  }

  function prepareTopicProfile(topic) {
    if (topic === 'funding') return;
    const isLoggedIn = typeof CompassAuth !== 'undefined' && CompassAuth.isLoggedIn();
    if (isLoggedIn || document.body.classList.contains('page-compass')) {
      CompassProfile.setTopic(topic);
      return;
    }
    CompassProfile.clearProfile();
    CompassProfile.setTopic(topic);
  }

  async function playTopicExitAnimation(optionEl, url) {
    const compassCard = document.querySelector('.compass-card');
    const textEl = optionEl.querySelector('.cm-option-text');
    const whiteOverlay = document.getElementById('compassExitWhite');

    if (!compassCard || !textEl || !whiteOverlay) {
      window.location.href = url;
      return;
    }

    const rect = textEl.getBoundingClientRect();
    const flyout = document.createElement('div');
    flyout.className = 'compass-topic-flyout';
    flyout.innerHTML = textEl.innerHTML;
    flyout.style.left = `${rect.left + rect.width / 2}px`;
    flyout.style.top = `${rect.top + rect.height / 2}px`;
    document.body.appendChild(flyout);

    document.body.classList.add('compass-exiting');
    compassCard.classList.add('is-topic-exit');
    clearTopicBar();

    await wait(EXIT_FADE_MS);

    flyout.style.left = '50vw';
    flyout.style.top = '50vh';
    flyout.classList.add('is-centered');
    await wait(EXIT_CENTER_MS);

    whiteOverlay.hidden = false;
    whiteOverlay.setAttribute('aria-hidden', 'false');
    whiteOverlay.classList.add('is-visible');
    flyout.style.left = '-20vw';
    flyout.classList.add('is-exit-left');

    await wait(EXIT_SLIDE_MS);
    window.location.href = url;
  }

  async function navigateFromCompassTopic(topic, optionEl) {
    if (isExitAnimating) return;
    isExitAnimating = true;

    const url = getTopicDestination(topic);
    prepareTopicProfile(topic);

    if (optionEl) {
      await playTopicExitAnimation(optionEl, url);
      return;
    }

    window.location.href = url;
  }

  options.forEach((option, index) => {
    option.addEventListener('mouseenter', () => {
      if (isDesktopCompass()) return;
      setActiveItem(index);
    });
    option.addEventListener('mouseleave', (e) => {
      if (isDesktopCompass()) return;
      if (!e.relatedTarget?.closest('.cm-option')) {
        clearActiveItem();
      }
    });
    option.addEventListener('click', (e) => {
      if (isDesktopCompass()) return;
      e.preventDefault();
      const topic = MENU_TOPICS[index];
      if (topic) navigateFromCompassTopic(topic, option);
    });
  });

  compassMenu.addEventListener('click', (e) => {
    if (!isDesktopCompass()) return;
    const index = getPointerTopicIndex();
    if (index === null) return;
    e.preventDefault();
    const topic = MENU_TOPICS[index];
    if (topic) navigateFromCompassTopic(topic, options[index]);
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
    },
    {
      topic: 'careers',
      text: 'Do you want help exploring careers, identifying career paths that fit your interests, or gaining career experience and professional skills?',
    },
    {
      topic: 'education-help',
      text: 'Do you need help preparing for college or training programs, understanding education costs, completing the FAFSA, or earning college credit?',
    },
    {
      topic: 'funding',
      text: 'Are you looking for scholarships, grants, or other financial aid to help pay for education or training?',
    },
    {
      topic: 'education-training',
      text: 'Are you looking for colleges, universities, training programs, apprenticeships, or other education opportunities after high school?',
    },
    {
      topic: 'personal-help',
      text: 'Do you need support with personal needs like transportation, childcare, wellness, housing, or social connections to help you succeed in school or training?',
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

  const FUNDING_EXTERNAL_URL = CompassProfile.FUNDING_EXTERNAL_URL;

  function navigateToTopicsProfile(topics) {
    CompassProfile.clearProfile();
    CompassProfile.setTopics(topics);
    const query = topics.length === 1
      ? `topic=${encodeURIComponent(topics[0])}`
      : `topics=${topics.map(encodeURIComponent).join(',')}`;
    window.location.href = `profile-builder.html?${query}`;
  }

  function navigateToTopicProfile(topic) {
    navigateToTopicsProfile([topic]);
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
  const backBtn     = document.querySelector('.quiz-back-btn');

  if (!card) return;

  let currentIndex = 0;
  let selectedTopics = [];
  let quizAnimating = false;

  const QUIZ_SLIDE_OUT_MS = 220;
  const QUIZ_SLIDE_IN_MS = 280;

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function clearQuizSlideClasses(panel) {
    if (!panel) return;
    panel.classList.remove(
      'quiz-panel-animating',
      'quiz-slide-out-forward',
      'quiz-slide-out-back',
      'quiz-slide-in-forward',
      'quiz-slide-in-back'
    );
  }

  async function animateQuizPanel(panel, direction, updateFn) {
    if (!panel || prefersReducedMotion()) {
      updateFn();
      return;
    }

    quizAnimating = true;
    clearQuizSlideClasses(panel);
    panel.classList.add('quiz-panel-animating');
    panel.classList.add(direction === 'back' ? 'quiz-slide-out-back' : 'quiz-slide-out-forward');
    await wait(QUIZ_SLIDE_OUT_MS);

    updateFn();

    panel.classList.remove('quiz-slide-out-forward', 'quiz-slide-out-back');
    // Force a reflow so the enter animation always restarts
    void panel.offsetWidth;
    panel.classList.add(direction === 'back' ? 'quiz-slide-in-back' : 'quiz-slide-in-forward');
    await wait(QUIZ_SLIDE_IN_MS);

    clearQuizSlideClasses(panel);
    quizAnimating = false;
  }

  function renderQuestion(index) {
    const q = QUESTIONS[index];
    quizNum.textContent = `(${index + 1} of ${QUESTIONS.length})`;
    quizQuestion.textContent = q.text;
    quizContent.hidden = false;
    quizFinal.hidden = true;
    quizFinal.classList.remove('quiz-final--has-topics');
    updateYesButtonState(index);
  }

  function updateYesButtonState(index) {
    if (!quizYes) return;
    const topic = QUESTIONS[index]?.topic;
    const isSelected = Boolean(topic && selectedTopics.includes(topic));
    quizYes.classList.toggle('is-active', isSelected);
    quizYes.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
  }

  function showQuestion(index, { animate = false, direction = 'forward' } = {}) {
    if (!animate) {
      clearQuizSlideClasses(quizContent);
      renderQuestion(index);
      return Promise.resolve();
    }
    return animateQuizPanel(quizContent, direction, () => renderQuestion(index));
  }

  async function goBackQuestion() {
    if (quizAnimating) return;
    if (currentIndex <= 0) {
      closeQuiz();
      return;
    }
    currentIndex -= 1;
    await showQuestion(currentIndex, { animate: true, direction: 'back' });
  }

  function renderQuizComplete() {
    quizContent.hidden = true;
    quizFinal.hidden = false;

    const titleEl = quizFinal.querySelector('.quiz-final__title');
    const descEl = quizFinal.querySelector('.quiz-final__desc');
    const topicsEl = quizFinal.querySelector('.quiz-final__topics');
    const fundFinderEl = document.getElementById('quizFundFinder');
    const fundFinderLink = document.getElementById('quizFundFinderLink');
    const createBtn = quizFinal.querySelector('.js-quiz-create-profile');
    const universalBtn = quizFinal.querySelector('.js-quiz-universal-profile');
    const hasFunding = selectedTopics.includes('funding');

    if (fundFinderLink) fundFinderLink.href = FUNDING_EXTERNAL_URL;

    if (selectedTopics.length) {
      quizFinal.classList.add('quiz-final--has-topics');
      if (titleEl) titleEl.textContent = 'Great — we found a few areas to focus on!';
      if (descEl) {
        descEl.textContent = 'Based on your answers, we\u2019ll tailor your profile for the topics below.';
      }
      if (topicsEl) {
        topicsEl.hidden = false;
        topicsEl.innerHTML = selectedTopics
          .map((key) => {
            const label = CompassProfile.TOPIC_INTEREST_LABELS[key] || key;
            return `<li>${label}</li>`;
          })
          .join('');
      }
      if (fundFinderEl) fundFinderEl.hidden = !hasFunding;
      if (createBtn) {
        createBtn.hidden = false;
        createBtn.textContent = 'Build My Profile';
      }
      if (universalBtn) universalBtn.hidden = true;
    } else {
      quizFinal.classList.remove('quiz-final--has-topics');
      if (titleEl) titleEl.textContent = 'All Done!';
      if (descEl) {
        descEl.textContent = 'We\u2019ve explored all topics, but you can still create a profile to use for future searches.';
      }
      if (topicsEl) topicsEl.hidden = true;
      if (fundFinderEl) fundFinderEl.hidden = true;
      if (createBtn) createBtn.hidden = true;
      if (universalBtn) universalBtn.hidden = false;
    }
  }

  async function showQuizComplete() {
    if (quizAnimating) return;
    if (prefersReducedMotion()) {
      renderQuizComplete();
      return;
    }

    quizAnimating = true;

    clearQuizSlideClasses(quizContent);
    quizContent.classList.add('quiz-panel-animating', 'quiz-slide-out-forward');
    await wait(QUIZ_SLIDE_OUT_MS);

    clearQuizSlideClasses(quizContent);
    renderQuizComplete();

    clearQuizSlideClasses(quizFinal);
    quizFinal.classList.add('quiz-panel-animating', 'quiz-slide-in-forward');
    await wait(QUIZ_SLIDE_IN_MS);
    clearQuizSlideClasses(quizFinal);
    quizAnimating = false;
  }

  function openQuiz() {
    currentIndex = 0;
    selectedTopics = [];
    quizAnimating = false;
    clearQuizSlideClasses(quizContent);
    clearQuizSlideClasses(quizFinal);
    showQuestion(0);

    card.classList.add('quiz-active');
    quizView.setAttribute('aria-hidden', 'false');
    document.getElementById('compassTopicBar')?.classList.remove('is-visible');
    document.getElementById('compassTopicBar')?.setAttribute('aria-hidden', 'true');

    if (backBtn) backBtn.hidden = false;
  }

  function closeQuiz() {
    quizAnimating = false;
    clearQuizSlideClasses(quizContent);
    clearQuizSlideClasses(quizFinal);
    card.classList.remove('quiz-active');
    quizView.setAttribute('aria-hidden', 'true');

    if (backBtn) backBtn.hidden = true;
  }

  async function advanceQuestion() {
    if (quizAnimating) return;
    currentIndex += 1;
    if (currentIndex >= QUESTIONS.length) {
      await showQuizComplete();
    } else {
      await showQuestion(currentIndex, { animate: true, direction: 'forward' });
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

  // "No" button clears a prior Yes for this topic, then advances
  document.querySelectorAll('.js-quiz-no').forEach((el) => {
    el.addEventListener('click', () => {
      if (quizAnimating) return;
      const topic = QUESTIONS[currentIndex]?.topic;
      if (topic) {
        selectedTopics = selectedTopics.filter((t) => t !== topic);
      }
      updateYesButtonState(currentIndex);
      advanceQuestion();
    });
  });

  document.querySelectorAll('.js-quiz-back').forEach((el) => {
    el.addEventListener('click', goBackQuestion);
  });

  if (quizYes) {
    quizYes.addEventListener('click', () => {
      if (quizAnimating) return;
      const { topic } = QUESTIONS[currentIndex];
      if (!selectedTopics.includes(topic)) {
        selectedTopics.push(topic);
      }
      updateYesButtonState(currentIndex);
      advanceQuestion();
    });
  }

  document.querySelectorAll('.js-quiz-create-profile').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      if (selectedTopics.length) {
        navigateToTopicsProfile(selectedTopics);
        return;
      }
      CompassProfile.clearProfile();
      window.location.href = 'profile-builder.html?mode=universal&expand=all';
    });
  });

  document.querySelectorAll('.js-quiz-universal-profile').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      CompassProfile.clearProfile();
      window.location.href = 'profile-builder.html?mode=universal&expand=all';
    });
  });

})();
