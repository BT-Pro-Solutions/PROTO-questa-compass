(function () {
  const { TOPICS, SECTIONS, getProfile, saveProfile, fieldVisible, fieldPromotedForTopic, sectionExpanded } = CompassProfile;

  const SECTION_COPY = {
    partialHint: '',
    partialSeeMore: 'Show {count} more',
    partialSeeMoreHint: '(unrelated to {topic})',
    collapsedSeeMore: 'Show all {count}',
    collapsedSeeMoreHint: '(unrelated to {topic})',
    showOnlyRelated: 'Show only related fields',
  };

  function formatSectionCopy(template, count, topicName) {
    const fields = count === 1 ? 'field' : 'fields';
    return template
      .replace(/\{count\}/g, String(count))
      .replace(/\{fields\}/g, fields)
      .replace(/\{topic\}/g, topicName);
  }

  function buildSeeMoreHtml(isPartial, count, topicName) {
    const label = formatSectionCopy(
      isPartial ? SECTION_COPY.partialSeeMore : SECTION_COPY.collapsedSeeMore,
      count,
      topicName
    );
    const hintTemplate = isPartial ? SECTION_COPY.partialSeeMoreHint : SECTION_COPY.collapsedSeeMoreHint;
    const hint = hintTemplate ? formatSectionCopy(hintTemplate, count, topicName) : '';
    const hintHtml = hint ? ` <span class="builder-see-more__hint">${hint}</span>` : '';
    return label + hintHtml;
  }

  function formatSeeMoreButton(contentHtml, expanded) {
    const prefix = expanded ? '-' : '+';
    return `<span class="builder-see-more__prefix" aria-hidden="true">${prefix}</span> ${contentHtml}`;
  }

  function getFieldValue(profile, fieldId) {
    const val = profile[fieldId];
    return Array.isArray(val) ? val : val ? [val] : [];
  }

  const params = new URLSearchParams(window.location.search);
  const isUniversalProfile = params.get('mode') === 'universal';
  const topicKey = isUniversalProfile ? null : params.get('topic') || getProfile().topic || 'funding';
  const topic = topicKey ? TOPICS[topicKey] || TOPICS.funding : null;
  const expandAll = params.get('expand') === 'all' || isUniversalProfile;
  const topicName = topic ? topic.title.replace(/^Find\s+/i, '') : '';

  if (topicKey) CompassProfile.setTopic(topicKey);

  const sectionsRoot = document.getElementById('sectionsRoot');
  const topicTitle = document.getElementById('topicTitle');
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
  let allSectionsExpanded = expandAll;
  const manuallyExpandedSections = new Set(expandAll ? Object.keys(SECTIONS) : []);

  let activeMultiselectField = null;
  let pendingSelections = [];

  function updateInfoNoteVisibility() {
    if (isUniversalProfile) return;
    const infoNote = document.querySelector('.builder-info-note');
    if (infoNote) infoNote.hidden = manuallyExpandedSections.size > 0;
  }

  function clearNonPromotedFields(sectionId, section) {
    const updates = {};
    section.fields.forEach((field) => {
      if (!fieldVisible(field, profile)) return;
      if (fieldPromotedForTopic(topicKey, sectionId, field.id)) return;
      updates[field.id] = field.type === 'multiselect' ? [] : '';
    });
    if (Object.keys(updates).length) {
      saveProfile(updates);
      profile = { ...profile, ...updates };
    }
  }

  function collapseSectionToRelated(sectionId) {
    const section = SECTIONS[sectionId];
    if (!section) return;
    clearNonPromotedFields(sectionId, section);
    manuallyExpandedSections.delete(sectionId);
    updateInfoNoteVisibility();
    renderSections();
  }

  function applyUniversalProfileMode() {
    document.body.classList.add('builder-universal');

    const eyebrow = document.querySelector('.builder-intro__eyebrow');
    const introDesc = document.querySelector('.builder-intro__desc');
    const infoNote = document.querySelector('.builder-info-note');
    const jumpBtn = document.getElementById('jumpToResultsBtn');
    const saveBtn = document.getElementById('continueProfileBtn');

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
  } else {
    topicTitle.textContent = topic.title.replace(/^Find\s+/i, '').toUpperCase();
    if (infoNoteTopicName) infoNoteTopicName.textContent = topicName;
  }

  function isSectionFullyOpen(sectionId) {
    if (isUniversalProfile || allSectionsExpanded) return true;
    return sectionExpanded(topicKey, sectionId) || manuallyExpandedSections.has(sectionId);
  }

  function getPromotedFields(sectionId, visibleFields) {
    if (isSectionFullyOpen(sectionId)) return [];
    return visibleFields.filter((f) => fieldPromotedForTopic(topicKey, sectionId, f.id));
  }

  function persistField(id, value) {
    profile[id] = value;
    saveProfile({ [id]: value });
    if (id === 'student-level') renderSections();
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
      input = `<select class="builder-select" name="${field.id}" data-field="${field.id}">
        <option value="">${field.placeholder || 'Select'}</option>
        ${opts}
      </select>`;
    } else {
      input = `<input type="text" class="builder-input" name="${field.id}" data-field="${field.id}" value="${value || ''}" placeholder="${field.placeholder || ''}">`;
    }

    return `
      <div class="builder-field${fullWidthClass}" data-field-wrap="${field.id}">
        <div class="builder-field__head">
          <span class="builder-field__label">${field.label}${field.optional ? ' <em>(optional)</em>' : ''}</span>
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

  function renderSection(sectionId, section) {
    const visibleFields = section.fields.filter((f) => fieldVisible(f, profile));
    if (!visibleFields.length) return '';

    const fullyOpen = isSectionFullyOpen(sectionId);
    const promotedFields = getPromotedFields(sectionId, visibleFields);
    const isPartial = !fullyOpen && promotedFields.length > 0;
    const isCollapsed = !fullyOpen && !isPartial;

    let fieldsToShow = [];
    if (fullyOpen) {
      fieldsToShow = visibleFields;
    } else if (isPartial) {
      fieldsToShow = promotedFields;
    }

    const fieldsHtml = fieldsToShow.map(renderField).join('');
    const hiddenCount = fullyOpen ? 0 : visibleFields.length - fieldsToShow.length;
    const manuallyExpanded = manuallyExpandedSections.has(sectionId);
    const showSeeMore = hiddenCount > 0 || manuallyExpanded;
    const seeMoreExpanded = manuallyExpanded;

    const stateClass = fullyOpen ? 'is-open' : isPartial ? 'is-partial' : 'is-collapsed';
    const seeMoreContent = seeMoreExpanded
      ? SECTION_COPY.showOnlyRelated
      : buildSeeMoreHtml(isPartial, hiddenCount, topicName);
    const seeMoreHtml = formatSeeMoreButton(seeMoreContent, seeMoreExpanded);
    const hintText = isPartial ? SECTION_COPY.partialHint : isCollapsed ? '' : '';

    return `
      <section class="builder-section ${stateClass}" data-section="${sectionId}">
        <div class="builder-section__header">
          <div class="builder-section__title-row">
            <h2 class="builder-section__title">${section.title}</h2>
            ${section.tooltip ? renderTooltip(section.tooltip) : ''}
          </div>
        </div>
        ${hintText ? `<p class="builder-section__hint">${hintText}</p>` : ''}
        ${fieldsHtml ? `<div class="builder-section__fields"><div class="builder-grid">${fieldsHtml}</div></div>` : ''}
        ${showSeeMore ? `<div class="builder-section__footer"><button type="button" class="builder-see-more${seeMoreExpanded ? ' is-expanded' : ''}" data-section="${sectionId}" aria-expanded="${seeMoreExpanded}">${seeMoreHtml}</button></div>` : ''}
      </section>`;
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

  function renderSections() {
    profile = getProfile();
    sectionsRoot.innerHTML = Object.entries(SECTIONS)
      .map(([id, section]) => renderSection(id, section))
      .join('');

    sectionsRoot.querySelectorAll('.builder-select, .builder-input').forEach((el) => {
      el.addEventListener('change', (e) => {
        persistField(e.target.dataset.field, e.target.value);
      });
      el.addEventListener('input', (e) => {
        persistField(e.target.dataset.field, e.target.value);
      });
    });

    bindMultiselectEvents();

    sectionsRoot.querySelectorAll('.builder-see-more').forEach((btn) => {
      btn.addEventListener('click', () => {
        const sectionId = btn.dataset.section;
        if (manuallyExpandedSections.has(sectionId)) {
          collapseSectionToRelated(sectionId);
        } else {
          manuallyExpandedSections.add(sectionId);
          updateInfoNoteVisibility();
          renderSections();
        }
      });
    });

    updateInfoNoteVisibility();
  }

  function hasMinimumProfile() {
    return Boolean(profile['student-level'] && profile.residency);
  }

  function goToResults() {
    window.location.href = `results.html?topic=${encodeURIComponent(topicKey)}`;
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
    if (hasMinimumProfile()) goToResults();
    else alert('Please select at least Student Level and Residency to see results.');
  });

  document.getElementById('continueProfileBtn').addEventListener('click', () => {
    if (isUniversalProfile) {
      saveProfile(profile);
      alert('Profile saved! (prototype demo)');
      return;
    }
    if (hasMinimumProfile()) goToResults();
    else alert('Please select at least Student Level and Residency first.');
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

  profileForm.addEventListener('submit', (e) => e.preventDefault());

  renderSections();
})();
