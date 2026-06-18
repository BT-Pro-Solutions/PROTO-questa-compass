(function () {
  const {
    TOPICS,
    TOPIC_INTEREST_LABELS,
    topicPillIconHtml,
    SECTIONS,
    FUNDING_EXTERNAL_URL,
    getProfile,
    saveProfile,
    clearProfile,
    setTopic,
    setTopics,
    fieldVisible,
    fieldRelatedToTopic,
    fieldRelatedToTopics,
  } = CompassProfile;

  const TOPIC_PILL_ORDER = [
    'personal-help',
    'funding',
    'learning-help',
    'education-training',
    'education-help',
    'careers',
  ];
  const MIN_SELECTED_TOPICS = 1;
  const DEFAULT_TOPIC_KEY = TOPIC_PILL_ORDER[0];

  const OTHER_AREAS_COPY = {
    expand: 'Need help with other areas?',
    collapse: 'Show only related fields',
  };

  const EXTERNAL_LINK_ICON = `<svg class="builder-fund-finder-link__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 3h6v6M10 14 21 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  function expandCollapseCaret(expanded) {
    const d = expanded ? 'M2 7L6 3L10 7' : 'M2 3L6 7L10 3';
    return `<svg class="builder-caret" width="12" height="10" viewBox="0 0 12 10" aria-hidden="true"><path d="${d}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }

  function getFieldValue(profile, fieldId) {
    const val = profile[fieldId];
    return Array.isArray(val) ? val : val ? [val] : [];
  }

  const params = new URLSearchParams(window.location.search);
  const isUniversalProfile = params.get('mode') === 'universal';
  const topicsParam = params.get('topics');
  const topicParam = params.get('topic');
  const fromResults = params.get('from') === 'results';
  const fromProfile = params.get('from') === 'profile';

  function resolveActiveTopicKeys() {
    if (isUniversalProfile) return [];
    if (topicsParam) return topicsParam.split(',').filter((key) => TOPICS[key]);
    if (topicParam && TOPICS[topicParam]) return [topicParam];
    if (fromResults || fromProfile) {
      const stored = getProfile().topic;
      if (stored && TOPICS[stored]) return [stored];
    }
    return [];
  }

  const activeTopicKeys = resolveActiveTopicKeys();
  const topicKey = activeTopicKeys[0] || null;
  const topic = topicKey ? TOPICS[topicKey] : null;
  const isNoTopicMode = !isUniversalProfile && activeTopicKeys.length === 0;
  const isTopicFocusedMode = !isUniversalProfile && !isNoTopicMode;
  const isPillPickerMode = isTopicFocusedMode || isNoTopicMode;
  const isAccordionMode = isUniversalProfile;
  const expandAllSections = params.get('expand') === 'all' && !isAccordionMode;

  if (!fromResults && !fromProfile) {
    clearProfile();
    if (activeTopicKeys.length) {
      if (activeTopicKeys.length === 1) setTopic(activeTopicKeys[0]);
      else setTopics(activeTopicKeys);
    }
  } else if (activeTopicKeys.length) {
    if (activeTopicKeys.length === 1) setTopic(activeTopicKeys[0]);
    else setTopics(activeTopicKeys);
  }

  const sectionsRoot = document.getElementById('sectionsRoot');
  const topicPillsRoot = document.getElementById('topicPillsRoot');
  const topicTitle = document.getElementById('topicTitle');
  const topicDesc = document.getElementById('topicDesc');
  const infoNoteTopicName = document.getElementById('infoNoteTopicName');
  const createAccountModal = document.getElementById('createAccountModal');
  const skipConfirmModal = document.getElementById('skipConfirmModal');
  const profileForm = document.getElementById('profileForm');
  const multiselectModal = document.getElementById('multiselectModal');
  const multiselectTitle = document.getElementById('multiselectTitle');
  const multiselectDesc = document.getElementById('multiselectDesc');
  const multiselectSearch = document.getElementById('multiselectSearch');
  const multiselectCount = document.getElementById('multiselectCount');
  const multiselectSelected = document.getElementById('multiselectSelected');
  const multiselectList = document.getElementById('multiselectList');

  let profile = getProfile();
  let otherAreasExpanded = false;
  let accordionOpenSection = null;

  function resolveSelectedTopicKeys() {
    if (!isPillPickerMode) return [];
    if (expandAllSections) return TOPIC_PILL_ORDER.filter((key) => TOPICS[key]);
    if (activeTopicKeys.length) return [...activeTopicKeys];
    if (fromResults || fromProfile) {
      const stored = getProfile();
      if (Array.isArray(stored.topics) && stored.topics.length) {
        return stored.topics.filter((key) => TOPICS[key]);
      }
    }
    return [DEFAULT_TOPIC_KEY];
  }

  let selectedTopicKeys = resolveSelectedTopicKeys();

  function persistSelectedTopics() {
    if (selectedTopicKeys.length === 1) {
      setTopic(selectedTopicKeys[0]);
    } else {
      setTopics(selectedTopicKeys);
    }
    profile = getProfile();
  }

  if (isPillPickerMode && selectedTopicKeys.length) {
    persistSelectedTopics();
  }

  function getFirstVisibleSectionId() {
    for (const [id, section] of Object.entries(SECTIONS)) {
      if (section.fields.some((f) => fieldVisible(f, profile))) return id;
    }
    return Object.keys(SECTIONS)[0];
  }

  function ensureAccordionSectionValid() {
    if (!isAccordionMode) return;
    const section = SECTIONS[accordionOpenSection];
    const hasVisible =
      section && section.fields.some((field) => fieldVisible(field, profile));
    if (!hasVisible) accordionOpenSection = getFirstVisibleSectionId();
  }

  if (isAccordionMode) {
    accordionOpenSection = getFirstVisibleSectionId();
  }

  let activeMultiselectField = null;
  let pendingSelections = [];

  function updateInfoNoteVisibility() {
    if (isUniversalProfile) return;
    const infoNote = document.querySelector('.builder-info-note');
    if (infoNote) infoNote.hidden = otherAreasExpanded;
  }

  function isFieldRelated(sectionId, field) {
    if (isUniversalProfile) return true;
    if (isPillPickerMode) {
      if (sectionId === 'about-you') return true;
      if (sectionId === 'getting-started') {
        const topicKey = field.id.replace(/-interests$/, '');
        return selectedTopicKeys.includes(topicKey);
      }
      if (!selectedTopicKeys.length) return false;
      return fieldRelatedToTopics(selectedTopicKeys, sectionId, field.id);
    }
    if (!activeTopicKeys.length) return true;
    return fieldRelatedToTopics(activeTopicKeys, sectionId, field.id);
  }

  function clearFieldsForDeselectedTopic(topicKey) {
    const updates = {};
    Object.entries(SECTIONS).forEach(([sectionId, section]) => {
      section.fields.forEach((field) => {
        if (!fieldVisible(field, profile)) return;
        if (!fieldRelatedToTopic(topicKey, sectionId, field.id)) return;
        if (fieldRelatedToTopics(selectedTopicKeys, sectionId, field.id)) return;
        updates[field.id] = field.type === 'multiselect' ? [] : '';
      });
    });
    if (Object.keys(updates).length) {
      saveProfile(updates);
      profile = { ...profile, ...updates };
    }
  }

  function indicateMinimumTopicRequired() {
    const picker = topicPillsRoot?.querySelector('.builder-topic-picker');
    if (!picker) return;
    picker.classList.remove('is-required-hint');
    void picker.offsetWidth;
    picker.classList.add('is-required-hint');
  }

  function toggleTopicPill(topicKey) {
    const index = selectedTopicKeys.indexOf(topicKey);
    if (index >= 0) {
      if (selectedTopicKeys.length <= MIN_SELECTED_TOPICS) {
        indicateMinimumTopicRequired();
        return;
      }
      selectedTopicKeys.splice(index, 1);
      clearFieldsForDeselectedTopic(topicKey);
    } else {
      selectedTopicKeys.push(topicKey);
    }
    persistSelectedTopics();
    renderSections();
  }

  function clearNonRelatedFields() {
    const updates = {};
    Object.entries(SECTIONS).forEach(([sectionId, section]) => {
      section.fields.forEach((field) => {
        if (!fieldVisible(field, profile)) return;
        if (isFieldRelated(sectionId, field)) return;
        updates[field.id] = field.type === 'multiselect' ? [] : '';
      });
    });
    if (Object.keys(updates).length) {
      saveProfile(updates);
      profile = { ...profile, ...updates };
    }
  }

  function collapseOtherAreas() {
    clearNonRelatedFields();
    otherAreasExpanded = false;
    updateInfoNoteVisibility();
    renderSections();
  }

  function applyFullProfileHeader() {
    const eyebrow = document.querySelector('.builder-intro__eyebrow');
    const introDesc = document.querySelector('.builder-intro__desc');
    const infoNote = document.querySelector('.builder-info-note');

    if (eyebrow) eyebrow.hidden = true;
    if (introDesc) introDesc.hidden = true;
    if (infoNote) infoNote.hidden = true;
    if (topicTitle) topicTitle.textContent = 'BUILD YOUR COMPASS PROFILE';
  }

  function applyPillPickerMode() {
    document.body.classList.add('builder-pill-picker', 'builder-single-topic');
    applyFullProfileHeader();
  }

  function applyTopicFocusedMode() {
    applyPillPickerMode();
  }

  function applyNoTopicMode() {
    document.body.classList.add('builder-no-topic');
    applyPillPickerMode();
  }

  function applyUniversalProfileMode() {
    document.body.classList.add('builder-universal');

    const eyebrow = document.querySelector('.builder-intro__eyebrow');
    const introDesc = document.querySelector('.builder-intro__desc');
    const infoNote = document.querySelector('.builder-info-note');
    const intro = document.querySelector('.builder-intro');
    const jumpBtn = document.getElementById('jumpToResultsBtn');
    const saveBtn = document.getElementById('continueProfileBtn');
    const loggedIn =
      typeof CompassAuth !== 'undefined' && CompassAuth.isLoggedIn();

    if (loggedIn && intro) intro.hidden = true;

    if (eyebrow) eyebrow.hidden = true;
    if (introDesc) {
      introDesc.textContent =
        "Complete your profile now so it's ready whenever you explore a Compass topic.";
    }
    if (infoNote) infoNote.hidden = true;
    if (jumpBtn) jumpBtn.textContent = 'Browse a Topic';
    if (saveBtn) saveBtn.textContent = 'Save';

    topicTitle.textContent = 'YOUR PROFILE';
  }

  if (isUniversalProfile) {
    applyUniversalProfileMode();
    profileForm.setAttribute('novalidate', '');
  } else if (isTopicFocusedMode) {
    applyTopicFocusedMode();
  } else if (isNoTopicMode) {
    applyNoTopicMode();
  }

  function persistField(id, value) {
    profile[id] = value;
    saveProfile({ [id]: value });
    updateSectionStatuses();
    if (id === 'student-level') renderSections();
  }

  function isFieldFilled(field) {
    const value = profile[field.id];
    if (field.type === 'multiselect') {
      return Array.isArray(value) ? value.length > 0 : Boolean(value);
    }
    return Boolean(value && String(value).trim());
  }

  function sectionIsComplete(fields) {
    const requiredFields = fields.filter((field) => field.required);
    if (requiredFields.length) {
      return requiredFields.every(isFieldFilled);
    }
    return fields.some(isFieldFilled);
  }

  function getSectionStatusFields(sectionId) {
    const section = SECTIONS[sectionId];
    if (!section) return [];
    return section.fields.filter((f) => fieldVisible(f, profile));
  }

  function statusFieldsAttr(fields) {
    return fields.map((f) => f.id).join(',');
  }

  function renderSectionStatus(fields) {
    const filled = sectionIsComplete(fields);
    const tip = filled ? "You've entered data here." : 'Unfilled';
    const ariaLabel = filled ? 'Section has data entered' : 'Section unfilled';
    const stateClass = filled ? 'builder-section-status--filled' : 'builder-section-status--empty';
    const checkIcon = filled
      ? '<svg class="builder-section-status__check" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>'
      : '';

    return `<span class="builder-section-status ${stateClass}" tabindex="0" role="status" aria-label="${ariaLabel}" data-tip="${tip}">${checkIcon}</span>`;
  }

  function resolveStatusFields(sectionEl) {
    const sectionId = sectionEl.dataset.section;
    const fieldIds = (sectionEl.dataset.statusFields || '').split(',').filter(Boolean);
    if (fieldIds.length) {
      const section = SECTIONS[sectionId];
      if (!section) return [];
      return section.fields.filter((f) => fieldIds.includes(f.id));
    }
    return getSectionStatusFields(sectionId);
  }

  function updateSectionStatuses() {
    sectionsRoot.querySelectorAll('[data-section]').forEach((el) => {
      const html = renderSectionStatus(resolveStatusFields(el));
      const existing = el.querySelector('.builder-section-status');
      if (existing) {
        existing.outerHTML = html;
      } else {
        const row = el.querySelector('.builder-section__title-row, .builder-section__toggle-row');
        if (row) row.insertAdjacentHTML('beforeend', html);
      }
    });
  }

  function renderTooltip(text) {
    return `<button type="button" class="builder-tooltip" aria-label="More info" data-tip="${text}">?</button>`;
  }

  const PILL_REMOVE_ICON =
    '<svg class="builder-pill-remove-icon" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M1.5 1.5l7 7M8.5 1.5l-7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';

  function renderMultiselectPills(values) {
    if (!values.length) {
      return '<span class="builder-multiselect__placeholder">Click to select\u2026</span>';
    }
    return values
      .map(
        (val) =>
          `<span class="builder-multiselect__pill"><span class="builder-multiselect__pill-text">${val}</span><button type="button" class="builder-multiselect__pill-remove" data-remove="${val.replace(/"/g, '&quot;')}" aria-label="Remove ${val.replace(/"/g, '&quot;')}">${PILL_REMOVE_ICON}</button></span>`
      )
      .join('');
  }

  function renderField(field) {
    if (!fieldVisible(field, profile)) return '';

    const value = profile[field.id];
    const helperLink = field.helperLink
      ? `<a href="${field.helperLink.href}" class="builder-helper-link">${field.helperLink.text}</a>`
      : '';
    const helperText = field.helperText
      ? `<p class="builder-helper-text">${field.helperText}</p>`
      : '';
    const fullWidthClass = field.fullWidth ? ' builder-field--full' : '';

    const requiredMark = field.required
      ? ' <span class="builder-field__required" aria-hidden="true">*</span>'
      : '';
    const optionalMark = !field.required
      ? ' <span class="builder-field__optional">(Optional)</span>'
      : '';
    const requiredAttr = field.required ? ' required' : '';

    let input = '';
    if (field.type === 'multiselect') {
      const selected = getFieldValue(profile, field.id);
      input = `
        <div class="builder-multiselect" role="button" tabindex="0" data-field="${field.id}" aria-haspopup="dialog">
          <span class="builder-multiselect__inner">${renderMultiselectPills(selected)}</span>
        </div>`;
    } else if (field.type === 'select') {
      const opts = (field.options || []).map((opt) => {
        const val = typeof opt === 'string' ? opt : opt.value;
        const label = typeof opt === 'string' ? opt : opt.label;
        const selected = value === val ? ' selected' : '';
        return `<option value="${val}"${selected}>${label}</option>`;
      }).join('');
      input = `<select class="builder-select" id="${field.id}" name="${field.id}" data-field="${field.id}"${requiredAttr}>
        <option value="">${field.placeholder || 'Select'}</option>
        ${opts}
      </select>`;
    } else {
      input = `<input type="text" class="builder-input" id="${field.id}" name="${field.id}" data-field="${field.id}" value="${value || ''}" placeholder="${field.placeholder || ''}"${requiredAttr}>`;
    }

    const labelFor = field.type !== 'multiselect' ? ` for="${field.id}"` : '';
    const labelTag = field.type !== 'multiselect' ? 'label' : 'span';

    return `
      <div class="builder-field${fullWidthClass}" data-field-wrap="${field.id}">
        <div class="builder-field__head">
          <${labelTag} class="builder-field__label"${labelFor}>${field.label}${requiredMark}${optionalMark}</${labelTag}>
          ${field.tooltip ? renderTooltip(field.tooltip) : ''}
        </div>
        ${helperText}
        ${input}
        ${helperLink}
      </div>`;
  }

  function findFieldById(fieldId) {
    for (const section of Object.values(SECTIONS)) {
      const field = section.fields.find((f) => f.id === fieldId);
      if (field) return field;
    }
    return null;
  }

  function renderAccordionSection(sectionId, section, visibleFields) {
    const isOpen = accordionOpenSection === sectionId;
    const fieldsHtml = isOpen ? visibleFields.map(renderField).join('') : '';
    const stateClass = isOpen ? 'is-open' : 'is-collapsed';

    return `
      <section class="builder-section builder-section--accordion ${stateClass}" data-section="${sectionId}" data-status-fields="${statusFieldsAttr(visibleFields)}">
        <div class="builder-section__header">
          <div class="builder-section__toggle-row">
            <button type="button" class="builder-section__toggle" data-accordion-toggle="${sectionId}" aria-expanded="${isOpen}" aria-controls="section-fields-${sectionId}">
              <span class="builder-section__toggle-prefix" aria-hidden="true">${expandCollapseCaret(isOpen)}</span>
              <span class="builder-section__title">${section.title}</span>
            </button>
            ${renderSectionStatus(visibleFields)}
          </div>
        </div>
        ${fieldsHtml ? `<div class="builder-section__fields" id="section-fields-${sectionId}"><div class="builder-grid">${fieldsHtml}</div></div>` : ''}
      </section>`;
  }

  function renderSectionHeader(sectionId, section, titleOverride, statusFields) {
    const title = titleOverride || section.title;
    const fields = statusFields || getSectionStatusFields(sectionId);
    return `
      <div class="builder-section__header">
        <div class="builder-section__title-row">
          <h2 class="builder-section__title">${title}</h2>
          ${renderSectionStatus(fields)}
        </div>
      </div>`;
  }

  function renderSectionFields(fields) {
    const fieldsHtml = fields.map(renderField).join('');
    if (!fieldsHtml) return '';
    return `<div class="builder-section__fields"><div class="builder-grid">${fieldsHtml}</div></div>`;
  }

  function renderTopicPills() {
    const soleSelection = selectedTopicKeys.length === MIN_SELECTED_TOPICS;
    const pills = TOPIC_PILL_ORDER.filter((key) => TOPICS[key])
      .map((key) => {
        const label = TOPIC_INTEREST_LABELS[key] || key;
        const selected = selectedTopicKeys.includes(key);
        const locked = selected && soleSelection;
        const stateClass = `${selected ? ' is-selected' : ''}${locked ? ' is-locked' : ''}`;
        const titleAttr = locked ? ' title="Select another topic before removing this one"' : '';
        return `<button type="button" class="builder-topic-pill${stateClass}" data-topic-pill="${key}" aria-pressed="${selected}"${titleAttr}>${topicPillIconHtml(key)}${label}</button>`;
      })
      .join('');

    return `
      <div class="builder-topic-picker">
        <p class="builder-topic-picker__heading">
          <strong>Select all topics of interest</strong>
          <span class="builder-topic-picker__sub">We&rsquo;ll update the profile to ask only what&rsquo;s needed for your topics.</span>
        </p>
        <div class="builder-topic-picker__scroll">
          <button type="button" class="builder-topic-picker__arrow builder-topic-picker__arrow--prev is-dimmed" aria-label="Scroll topics left" disabled>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <div class="builder-topic-picker__pills" role="group" aria-label="Topics of interest">
            ${pills}
          </div>
          <button type="button" class="builder-topic-picker__arrow builder-topic-picker__arrow--next" aria-label="Scroll topics right">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>
      </div>`;
  }

  let topicPillScrollResizeHandler = null;

  function bindTopicPillScrollControls() {
    const scrollWrap = topicPillsRoot?.querySelector('.builder-topic-picker__scroll');
    if (!scrollWrap) return;

    const scroller = scrollWrap.querySelector('.builder-topic-picker__pills');
    const prevBtn = scrollWrap.querySelector('.builder-topic-picker__arrow--prev');
    const nextBtn = scrollWrap.querySelector('.builder-topic-picker__arrow--next');
    if (!scroller || !prevBtn || !nextBtn) return;

    function updateArrows() {
      const isMobile = window.matchMedia('(max-width: 720px)').matches;
      prevBtn.hidden = !isMobile;
      nextBtn.hidden = !isMobile;
      if (!isMobile) return;

      const maxScroll = scroller.scrollWidth - scroller.clientWidth;
      const atStart = scroller.scrollLeft <= 1;
      const atEnd = scroller.scrollLeft >= maxScroll - 1;
      const noOverflow = maxScroll <= 1;

      prevBtn.disabled = atStart || noOverflow;
      nextBtn.disabled = atEnd || noOverflow;
      prevBtn.classList.toggle('is-dimmed', prevBtn.disabled);
      nextBtn.classList.toggle('is-dimmed', nextBtn.disabled);
    }

    prevBtn.addEventListener('click', () => {
      scroller.scrollBy({ left: -scroller.clientWidth * 0.75, behavior: 'smooth' });
    });
    nextBtn.addEventListener('click', () => {
      scroller.scrollBy({ left: scroller.clientWidth * 0.75, behavior: 'smooth' });
    });

    scroller.addEventListener('scroll', updateArrows, { passive: true });

    if (topicPillScrollResizeHandler) {
      window.removeEventListener('resize', topicPillScrollResizeHandler);
    }
    topicPillScrollResizeHandler = updateArrows;
    window.addEventListener('resize', topicPillScrollResizeHandler);

    updateArrows();
  }

  function bindTopicPillEvents() {
    if (!topicPillsRoot) return;
    topicPillsRoot.querySelectorAll('[data-topic-pill]').forEach((btn) => {
      btn.addEventListener('click', () => {
        toggleTopicPill(btn.dataset.topicPill);
      });
    });
    bindTopicPillScrollControls();
  }

  function getInterestFieldsForSelectedTopics() {
    return SECTIONS['getting-started'].fields.filter((field) => {
      if (!fieldVisible(field, profile)) return false;
      const topicKey = field.id.replace(/-interests$/, '');
      return selectedTopicKeys.includes(topicKey);
    });
  }

  function renderPillPickerSection(sectionId, section, fields, options = {}) {
    const { showFundFinder = false, alwaysShow = false } = options;
    const fundFinderCell = showFundFinder ? renderFundFinderField() : '';
    const fieldsHtml = fields.map(renderField).join('');
    if (!fieldsHtml && !fundFinderCell && !alwaysShow) return '';

    return `
      <section class="builder-topic-card__section" data-section="${sectionId}" data-status-fields="${statusFieldsAttr(fields)}">
        ${renderSectionHeader(sectionId, section, null, fields)}
        ${fieldsHtml || fundFinderCell ? `<div class="builder-section__fields"><div class="builder-grid">${fieldsHtml}${fundFinderCell}</div></div>` : ''}
      </section>`;
  }

  function renderPillPickerLayout() {
    const interestFields = getInterestFieldsForSelectedTopics();
    const showFundFinder = selectedTopicKeys.includes('funding');
    const sections = [];

    sections.push(
      renderPillPickerSection(
        'getting-started',
        SECTIONS['getting-started'],
        interestFields,
        { showFundFinder, alwaysShow: true }
      )
    );

    const aboutYouFields = SECTIONS['about-you'].fields.filter((f) => fieldVisible(f, profile));
    sections.push(
      renderPillPickerSection('about-you', SECTIONS['about-you'], aboutYouFields, { alwaysShow: true })
    );

    Object.entries(SECTIONS).forEach(([sectionId, section]) => {
      if (sectionId === 'getting-started' || sectionId === 'about-you') return;
      const visibleFields = section.fields.filter((f) => fieldVisible(f, profile));
      const relatedFields = visibleFields.filter((field) => isFieldRelated(sectionId, field));
      if (!relatedFields.length) return;
      sections.push(renderPillPickerSection(sectionId, section, relatedFields));
    });

    sectionsRoot.innerHTML = `<div class="builder-topic-card">${sections.filter(Boolean).join('')}</div>`;
  }

  function renderFundFinderField() {
    return `
      <div class="builder-field builder-field--fund-finder">
        <div class="builder-field__head" aria-hidden="true">
          <span class="builder-field__label builder-field__label--spacer">&nbsp;</span>
        </div>
        <a href="${FUNDING_EXTERNAL_URL}" class="builder-fund-finder-link" target="_blank" rel="noopener noreferrer">
          Fund Finder
          ${EXTERNAL_LINK_ICON}
        </a>
      </div>`;
  }

  function renderSection(sectionId, section) {
    const visibleFields = section.fields.filter((f) => fieldVisible(f, profile));
    if (!visibleFields.length) return '';

    if (isAccordionMode) {
      return renderAccordionSection(sectionId, section, visibleFields);
    }

    const relatedFields = visibleFields.filter((field) => isFieldRelated(sectionId, field));
    const fieldsToShow = otherAreasExpanded ? visibleFields : relatedFields;
    if (!fieldsToShow.length) return '';

    const fieldsHtml = fieldsToShow.map(renderField).join('');
    const stateClass = otherAreasExpanded ? 'is-open' : relatedFields.length === visibleFields.length ? 'is-open' : 'is-partial';

    return `
      <section class="builder-section ${stateClass}" data-section="${sectionId}" data-status-fields="${statusFieldsAttr(fieldsToShow)}">
        ${renderSectionHeader(sectionId, section, null, fieldsToShow)}
        <div class="builder-section__fields"><div class="builder-grid">${fieldsHtml}</div></div>
      </section>`;
  }

  function countHiddenFields() {
    let count = 0;
    Object.entries(SECTIONS).forEach(([sectionId, section]) => {
      section.fields.forEach((field) => {
        if (!fieldVisible(field, profile)) return;
        if (!isFieldRelated(sectionId, field)) count += 1;
      });
    });
    return count;
  }

  function renderOtherAreasToggle() {
    if (isPillPickerMode) return;

    const toggleRoot = document.getElementById('otherAreasToggle');
    if (!toggleRoot || isUniversalProfile || isAccordionMode) return;

    const hiddenCount = countHiddenFields();
    if (!hiddenCount && !otherAreasExpanded) {
      toggleRoot.hidden = true;
      toggleRoot.innerHTML = '';
      return;
    }

    toggleRoot.hidden = false;
    const label = otherAreasExpanded ? OTHER_AREAS_COPY.collapse : OTHER_AREAS_COPY.expand;
    toggleRoot.innerHTML = `
      <button type="button" class="builder-other-areas-toggle${otherAreasExpanded ? ' is-expanded' : ''}" id="otherAreasBtn" aria-expanded="${otherAreasExpanded}">
        <span class="builder-other-areas-toggle__prefix" aria-hidden="true">${expandCollapseCaret(otherAreasExpanded)}</span>
        ${label}
      </button>`;

    document.getElementById('otherAreasBtn').addEventListener('click', () => {
      if (otherAreasExpanded) {
        collapseOtherAreas();
      } else {
        otherAreasExpanded = true;
        updateInfoNoteVisibility();
        renderSections();
      }
    });
  }

  function renderMultiselectSelectedTags() {
    if (!pendingSelections.length) {
      multiselectSelected.innerHTML = '';
      multiselectSelected.hidden = true;
      return;
    }
    multiselectSelected.hidden = false;
    multiselectSelected.innerHTML = pendingSelections
      .map(
        (val) =>
          `<span class="builder-ms-tag">${val}<button type="button" class="builder-ms-tag__remove" data-ms-remove="${val.replace(/"/g, '&quot;')}" aria-label="Remove ${val.replace(/"/g, '&quot;')}">${PILL_REMOVE_ICON}</button></span>`
      )
      .join('');
  }

  function renderMultiselectList(field, query) {
    const q = query.trim().toLowerCase();
    let optionCount = 0;
    let html = '';

    function renderOption(opt) {
      if (q && !opt.toLowerCase().includes(q)) return;
      optionCount += 1;
      const checked = pendingSelections.includes(opt) ? ' checked' : '';
      const id = `ms-opt-${opt.replace(/[^a-z0-9]/gi, '-').slice(0, 40)}-${optionCount}`;
      html += `
        <label class="builder-ms-option" data-option="${opt.replace(/"/g, '&quot;')}">
          <input type="checkbox" class="builder-ms-option__check" id="${id}" value="${opt.replace(/"/g, '&quot;')}"${checked}>
          <span class="builder-ms-option__label">${opt}</span>
        </label>`;
    }

    if (field.groups) {
      field.groups.forEach((group) => {
        const visibleOpts = group.options.filter((opt) => !q || opt.toLowerCase().includes(q));
        if (!visibleOpts.length) return;
        html += `<div class="builder-ms-group"><p class="builder-ms-group__title">${group.label}</p>`;
        visibleOpts.forEach(renderOption);
        html += '</div>';
      });
    } else {
      (field.options || []).forEach(renderOption);
    }

    multiselectList.innerHTML = html || '<p class="builder-ms-empty">No options match your search.</p>';
    multiselectCount.textContent = `${optionCount} option${optionCount === 1 ? '' : 's'}`;
  }

  function openMultiselectModal(fieldId) {
    const field = findFieldById(fieldId);
    if (!field || field.type !== 'multiselect') return;

    activeMultiselectField = field;
    pendingSelections = [...getFieldValue(profile, fieldId)];

    multiselectTitle.textContent = field.modalTitle || field.label;
    multiselectDesc.textContent = field.modalDescription || '';
    multiselectSearch.value = '';

    renderMultiselectSelectedTags();
    renderMultiselectList(field, '');
    multiselectModal.hidden = false;
    multiselectSearch.focus();
  }

  function closeMultiselectModal() {
    multiselectModal.hidden = true;
    activeMultiselectField = null;
    pendingSelections = [];
  }

  function applyMultiselect() {
    if (!activeMultiselectField) return;
    persistField(activeMultiselectField.id, [...pendingSelections]);
    closeMultiselectModal();
    renderSections();
  }

  function togglePendingSelection(opt, selected) {
    if (selected && !pendingSelections.includes(opt)) {
      pendingSelections.push(opt);
    } else if (!selected) {
      pendingSelections = pendingSelections.filter((v) => v !== opt);
    }
    renderMultiselectSelectedTags();
    renderMultiselectList(activeMultiselectField, multiselectSearch.value);
  }

  function removePendingSelection(opt) {
    pendingSelections = pendingSelections.filter((v) => v !== opt);
    renderMultiselectSelectedTags();
    renderMultiselectList(activeMultiselectField, multiselectSearch.value);
  }

  function removeFieldSelection(fieldId, opt) {
    const current = getFieldValue(profile, fieldId).filter((v) => v !== opt);
    persistField(fieldId, current);
    renderSections();
  }

  function bindMultiselectEvents() {
    sectionsRoot.querySelectorAll('.builder-multiselect').forEach((trigger) => {
      trigger.addEventListener('click', (e) => {
        if (e.target.closest('.builder-multiselect__pill-remove')) return;
        openMultiselectModal(trigger.dataset.field);
      });
      trigger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openMultiselectModal(trigger.dataset.field);
        }
      });
    });

    sectionsRoot.querySelectorAll('.builder-multiselect__pill-remove').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const wrap = btn.closest('[data-field-wrap]');
        removeFieldSelection(wrap.dataset.fieldWrap, btn.dataset.remove);
      });
    });
  }

  function bindAccordionToggles() {
    sectionsRoot.querySelectorAll('[data-accordion-toggle]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        if (e.target.closest('.builder-tooltip')) return;
        const sectionId = btn.dataset.accordionToggle;
        accordionOpenSection = accordionOpenSection === sectionId ? null : sectionId;
        renderSections();
      });
    });
  }

  function bindFieldEvents() {
    sectionsRoot.querySelectorAll('.builder-select, .builder-input').forEach((el) => {
      el.addEventListener('change', (e) => {
        persistField(e.target.dataset.field, e.target.value);
      });
      el.addEventListener('input', (e) => {
        persistField(e.target.dataset.field, e.target.value);
      });
    });
  }

  function renderSections() {
    profile = getProfile();
    ensureAccordionSectionValid();

    if (isPillPickerMode) {
      if (topicPillsRoot) {
        topicPillsRoot.hidden = false;
        topicPillsRoot.innerHTML = renderTopicPills();
        bindTopicPillEvents();
      }
      renderPillPickerLayout();
      bindFieldEvents();
      bindMultiselectEvents();
      return;
    }

    if (topicPillsRoot) {
      topicPillsRoot.hidden = true;
      topicPillsRoot.innerHTML = '';
    }

    sectionsRoot.innerHTML = Object.entries(SECTIONS)
      .map(([id, section]) => renderSection(id, section))
      .join('');

    bindFieldEvents();
    bindMultiselectEvents();

    if (isAccordionMode) bindAccordionToggles();

    renderOtherAreasToggle();
    updateInfoNoteVisibility();
  }

  function goToResults() {
    const keys = (isPillPickerMode ? selectedTopicKeys : activeTopicKeys).filter((key) => key !== 'funding');
    if (!keys.length) {
      window.location.href = 'results.html';
      return;
    }
    const query = keys.length === 1
      ? `topic=${encodeURIComponent(keys[0])}`
      : `topics=${keys.map(encodeURIComponent).join(',')}`;
    window.location.href = `results.html?${query}`;
  }

  function openCreateAccount() {
    createAccountModal.hidden = false;
  }

  function closeCreateAccount() {
    createAccountModal.hidden = true;
  }

  function openSkipConfirmModal() {
    if (skipConfirmModal) skipConfirmModal.hidden = false;
  }

  function closeSkipConfirmModal() {
    if (skipConfirmModal) skipConfirmModal.hidden = true;
  }

  multiselectSearch.addEventListener('input', () => {
    if (activeMultiselectField) {
      renderMultiselectList(activeMultiselectField, multiselectSearch.value);
    }
  });

  multiselectList.addEventListener('change', (e) => {
    if (!e.target.matches('.builder-ms-option__check')) return;
    togglePendingSelection(e.target.value, e.target.checked);
  });

  multiselectSelected.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-ms-remove]');
    if (btn) removePendingSelection(btn.dataset.msRemove);
  });

  document.getElementById('multiselectApplyBtn').addEventListener('click', applyMultiselect);
  document.getElementById('multiselectCancelBtn').addEventListener('click', closeMultiselectModal);
  document.querySelectorAll('.js-close-multiselect').forEach((el) => {
    el.addEventListener('click', closeMultiselectModal);
  });

  document.getElementById('jumpToResultsBtn').addEventListener('click', () => {
    if (isUniversalProfile) {
      window.location.href = 'index.html';
      return;
    }
    openSkipConfirmModal();
  });

  document.getElementById('skipConfirmStayBtn')?.addEventListener('click', closeSkipConfirmModal);
  document.getElementById('skipConfirmBrowseBtn')?.addEventListener('click', goToResults);
  document.querySelectorAll('.js-close-skip-confirm').forEach((el) => {
    el.addEventListener('click', closeSkipConfirmModal);
  });

  profileForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (isUniversalProfile) {
      saveProfile(profile);
      alert('Profile saved! (prototype demo)');
      return;
    }

    goToResults();
  });

  document.querySelectorAll('.js-create-account').forEach((btn) => {
    btn.addEventListener('click', openCreateAccount);
  });

  document.querySelectorAll('.js-close-account').forEach((el) => {
    el.addEventListener('click', closeCreateAccount);
  });

  document.getElementById('accountSubmitBtn').addEventListener('click', () => {
    saveProfile({ accountCreated: true });
    closeCreateAccount();
    alert('Account created! (prototype demo)');
  });

  renderSections();
})();
