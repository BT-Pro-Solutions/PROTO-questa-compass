(function () {
  const {
    TOPICS,
    TOPIC_INTEREST_LABELS,
    SECTIONS,
    FUNDING_EXTERNAL_URL,
    getProfile,
    saveProfile,
    clearProfile,
    setTopic,
    setTopics,
    fieldVisible,
    fieldRelatedToTopics,
  } = CompassProfile;

  const OTHER_AREAS_COPY = {
    expand: 'Need help with other areas?',
    collapse: 'Show only related fields',
  };

  const INFO_ICON = `<svg class="builder-expand-banner__icon" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path fill="currentColor" d="M12 0a11.97 11.97 0 0 1 8.484 3.514A11.97 11.97 0 0 1 24 11.999l-.004.295a11.97 11.97 0 0 1-3.51 8.19A11.97 11.97 0 0 1 12 24a11.97 11.97 0 0 1-8.485-3.516A11.97 11.97 0 0 1 0 11.999a11.97 11.97 0 0 1 3.516-8.485A11.97 11.97 0 0 1 11.999 0zm0 1.846A10.12 10.12 0 0 0 4.82 4.82v.002a10.12 10.12 0 0 0-2.974 7.178v.002a10.12 10.12 0 0 0 2.629 6.817l.344.361.002.002a10.12 10.12 0 0 0 7.178 2.973h.002a10.12 10.12 0 0 0 7.178-2.973l.002-.002a10.12 10.12 0 0 0 2.973-7.178v-.002a10.12 10.12 0 0 0-2.973-7.178l-.002-.002a10.12 10.12 0 0 0-7.178-2.973z"/><path fill="currentColor" fill-rule="evenodd" d="M12 4.8a1.385 1.385 0 1 1 0 2.77 1.385 1.385 0 0 1 0-2.77" clip-rule="evenodd"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12.277 17.539V9.785h-1.108m-.83 7.753h3.876"/></svg>`;

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
  const isAccordionMode = isUniversalProfile;
  const expandAllSections = params.get('expand') === 'all' && !isAccordionMode && !isNoTopicMode;
  const topicName = activeTopicKeys.length === 1
    ? (TOPIC_INTEREST_LABELS[activeTopicKeys[0]] || topic?.title.replace(/^Find\s+/i, '') || '')
    : activeTopicKeys.map((key) => TOPIC_INTEREST_LABELS[key] || key).join(', ');

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
  const topicTitle = document.getElementById('topicTitle');
  const topicDesc = document.getElementById('topicDesc');
  const infoNoteTopicName = document.getElementById('infoNoteTopicName');
  const createAccountModal = document.getElementById('createAccountModal');
  const profileForm = document.getElementById('profileForm');
  const multiselectModal = document.getElementById('multiselectModal');
  const multiselectTitle = document.getElementById('multiselectTitle');
  const multiselectDesc = document.getElementById('multiselectDesc');
  const multiselectSearch = document.getElementById('multiselectSearch');
  const multiselectCount = document.getElementById('multiselectCount');
  const multiselectSelected = document.getElementById('multiselectSelected');
  const multiselectList = document.getElementById('multiselectList');

  let profile = getProfile();
  let otherAreasExpanded = expandAllSections || isNoTopicMode;
  let shouldAnimateExpand = false;
  let accordionOpenSection = null;

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
    if (isUniversalProfile || !activeTopicKeys.length) return true;
    return fieldRelatedToTopics(activeTopicKeys, sectionId, field.id);
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

  function applyTopicFocusedMode() {
    document.body.classList.add('builder-single-topic');
    applyFullProfileHeader();
  }

  function applyNoTopicMode() {
    document.body.classList.add('builder-no-topic');
    applyFullProfileHeader();
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

  function sectionHasFilledFields(fields) {
    return fields.some(isFieldFilled);
  }

  function getSectionStatusFields(sectionId) {
    const section = SECTIONS[sectionId];
    if (!section) return [];
    return section.fields.filter((f) => fieldVisible(f, profile));
  }

  function renderSectionStatus(sectionId) {
    const fields = getSectionStatusFields(sectionId);
    const filled = sectionHasFilledFields(fields);
    const tip = filled ? "You've entered data here." : 'Unfilled';
    const ariaLabel = filled ? 'Section has data entered' : 'Section unfilled';
    const stateClass = filled ? 'builder-section-status--filled' : 'builder-section-status--empty';
    const checkIcon = filled
      ? '<svg class="builder-section-status__check" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>'
      : '';

    return `<span class="builder-section-status ${stateClass}" tabindex="0" role="status" aria-label="${ariaLabel}" data-tip="${tip}">${checkIcon}</span>`;
  }

  function updateSectionStatuses() {
    sectionsRoot.querySelectorAll('[data-section]').forEach((el) => {
      const sectionId = el.dataset.section;
      const html = renderSectionStatus(sectionId);
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

  function renderYouChoseBadge() {
    return '<span class="builder-you-chose">You Chose:</span>';
  }

  function shouldShowYouChoseBadge(field) {
    if (!activeTopicKeys.length || isUniversalProfile || isNoTopicMode) return false;
    return activeTopicKeys.some((key) => field.id === `${key}-interests`);
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
    const optionalMark = field.optional ? ' <em>(optional)</em>' : '';
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
    const youChoseBadge = shouldShowYouChoseBadge(field) ? renderYouChoseBadge() : '';

    return `
      <div class="builder-field${fullWidthClass}" data-field-wrap="${field.id}">
        ${youChoseBadge}
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
      <section class="builder-section builder-section--accordion ${stateClass}" data-section="${sectionId}">
        <div class="builder-section__header">
          <div class="builder-section__toggle-row">
            <button type="button" class="builder-section__toggle" data-accordion-toggle="${sectionId}" aria-expanded="${isOpen}" aria-controls="section-fields-${sectionId}">
              <span class="builder-section__toggle-prefix" aria-hidden="true">${expandCollapseCaret(isOpen)}</span>
              <span class="builder-section__title">${section.title}</span>
            </button>
            ${renderSectionStatus(sectionId)}
          </div>
        </div>
        ${fieldsHtml ? `<div class="builder-section__fields" id="section-fields-${sectionId}"><div class="builder-grid">${fieldsHtml}</div></div>` : ''}
      </section>`;
  }

  function renderSectionHeader(sectionId, section, titleOverride) {
    const title = titleOverride || section.title;
    return `
      <div class="builder-section__header">
        <div class="builder-section__title-row">
          <h2 class="builder-section__title">${title}</h2>
          ${renderSectionStatus(sectionId)}
        </div>
      </div>`;
  }

  function renderSectionFields(fields) {
    const fieldsHtml = fields.map(renderField).join('');
    if (!fieldsHtml) return '';
    return `<div class="builder-section__fields"><div class="builder-grid">${fieldsHtml}</div></div>`;
  }

  function renderTopicCardSection(sectionId, section, fields, titleOverride) {
    return `
      <section class="builder-topic-card__section" data-section="${sectionId}">
        ${renderSectionHeader(sectionId, section, titleOverride)}
        ${renderSectionFields(fields)}
      </section>`;
  }

  function renderStandaloneSection(sectionId, section, fields, titleOverride) {
    const fieldsHtml = fields.map(renderField).join('');
    const showFundFinder = titleOverride === 'Additional Help Topics';
    if (!fieldsHtml && !showFundFinder) return '';

    const fundFinderCell = showFundFinder ? renderFundFinderField() : '';

    return `
      <section class="builder-section is-open" data-section="${sectionId}">
        ${renderSectionHeader(sectionId, section, titleOverride)}
        <div class="builder-section__fields"><div class="builder-grid">${fieldsHtml}${fundFinderCell}</div></div>
      </section>`;
  }

  function getExtraSectionTitle(sectionId) {
    if (sectionId === 'getting-started') return 'Additional Help Topics';
    return null;
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

  function partitionSections() {
    const relatedSections = [];
    const extraSections = [];

    Object.entries(SECTIONS).forEach(([sectionId, section]) => {
      const visibleFields = section.fields.filter((f) => fieldVisible(f, profile));
      if (!visibleFields.length) return;

      const relatedFields = visibleFields.filter((field) => isFieldRelated(sectionId, field));
      const extraFields = visibleFields.filter((field) => !isFieldRelated(sectionId, field));

      if (relatedFields.length) {
        relatedSections.push({ sectionId, section, fields: relatedFields });
      }
      if (extraFields.length) {
        extraSections.push({ sectionId, section, fields: extraFields });
      }
    });

    return { relatedSections, extraSections };
  }

  function renderExpandBanner() {
    return `
      <div class="builder-expand-banner" id="expandBanner">
        <p class="builder-expand-banner__text">
          ${INFO_ICON}
          <span>Need help with other areas besides <strong>${topicName}</strong>?</span>
        </p>
        <button type="button" class="builder-expand-banner__btn" id="expandFullProfileBtn">Show Full Profile</button>
      </div>`;
  }

  function renderTopicFocusedLayout() {
    const { relatedSections, extraSections } = partitionSections();
    const hasExtra = extraSections.length > 0;
    const showBanner = hasExtra && !otherAreasExpanded;

    const topicCardHtml = relatedSections
      .map(({ sectionId, section, fields }) => renderTopicCardSection(sectionId, section, fields))
      .join('');

    const extraSectionsHtml = extraSections
      .map(({ sectionId, section, fields }) =>
        renderStandaloneSection(sectionId, section, fields, getExtraSectionTitle(sectionId)))
      .join('');

    const panelOpenClass = otherAreasExpanded && !shouldAnimateExpand ? ' is-open' : '';
    const panelHidden = !otherAreasExpanded;

    let html = '';
    if (topicCardHtml) {
      html += `<div class="builder-topic-card">${topicCardHtml}</div>`;
    }
    if (showBanner) {
      html += renderExpandBanner();
    }
    if (hasExtra) {
      html += `
        <div class="builder-extra-panel${panelOpenClass}" id="extraSectionsPanel"${panelHidden ? ' hidden' : ''} aria-hidden="${panelHidden}">
          <div class="builder-extra-panel__inner">
            ${extraSectionsHtml}
          </div>
        </div>`;
    }

    sectionsRoot.innerHTML = html;

    const expandBtn = document.getElementById('expandFullProfileBtn');
    if (expandBtn) {
      expandBtn.addEventListener('click', expandFullProfile);
    }

    if (shouldAnimateExpand) {
      const panel = document.getElementById('extraSectionsPanel');
      const banner = document.getElementById('expandBanner');
      if (banner) banner.remove();
      if (panel) {
        panel.hidden = false;
        panel.setAttribute('aria-hidden', 'false');
        requestAnimationFrame(() => {
          panel.classList.add('is-open');
          shouldAnimateExpand = false;
        });
      }
    }
  }

  function expandFullProfile() {
    otherAreasExpanded = true;
    shouldAnimateExpand = true;
    updateInfoNoteVisibility();
    renderSections();
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
      <section class="builder-section ${stateClass}" data-section="${sectionId}">
        ${renderSectionHeader(sectionId, section)}
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
    if (isTopicFocusedMode || isNoTopicMode) return;

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

    if (isTopicFocusedMode) {
      renderTopicFocusedLayout();
      bindFieldEvents();
      bindMultiselectEvents();
      updateInfoNoteVisibility();
      return;
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
    const keys = activeTopicKeys.filter((key) => key !== 'funding');
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
    goToResults();
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
