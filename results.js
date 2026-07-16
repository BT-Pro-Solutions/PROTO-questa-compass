(function () {
  const {
    TOPICS,
    TOPIC_INTEREST_LABELS,
    topicIconHtml,
    MENU_TOPIC_MAP,
    FUNDING_EXTERNAL_URL,
    saveProfile,
    setTopics,
    getProfile,
    findFieldById,
  } = CompassProfile;
  const { getResultsConfig, getAffiliatedListings, getStandardListings } = CompassResults;

  const RESULTS_TOPIC_KEYS = MENU_TOPIC_MAP.filter((key) => key !== 'funding');
  const LOGO_PLACEHOLDER = 'assets/logo-circle.svg';
  const PILL_REMOVE_ICON =
    '<svg class="builder-pill-remove-icon" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M1.5 1.5l7 7M8.5 1.5l-7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';

  const params = new URLSearchParams(window.location.search);
  const searchQuery = params.get('q') || '';

  function resolveSelectedTopicKeys() {
    const topicsParam = params.get('topics');
    if (topicsParam) {
      return topicsParam.split(',').filter((key) => key !== 'funding' && TOPICS[key]);
    }
    const topicParam = params.get('topic');
    if (topicParam && topicParam !== 'funding' && TOPICS[topicParam]) {
      return [topicParam];
    }
    return [];
  }

  const selectedTopicKeys = resolveSelectedTopicKeys();
  const hasTopics = selectedTopicKeys.length > 0;
  const config = hasTopics ? getResultsConfig(selectedTopicKeys) : null;

  const PER_PAGE = 8;

  const profileFiltersRoot = document.getElementById('profileFiltersRoot');
  const resultsList = document.getElementById('resultsList');
  const resultsHeading = document.getElementById('resultsHeading');
  const resultsRange = document.getElementById('resultsRange');
  const resultsPrompt = document.getElementById('resultsPrompt');
  const resultsMainContent = document.getElementById('resultsMainContent');
  const sortSelect = document.getElementById('sortSelect');
  const filterCount = document.getElementById('filterCount');
  const resultsPagination = document.getElementById('resultsPagination');

  const multiselectModal = document.getElementById('multiselectModal');
  const multiselectTitle = document.getElementById('multiselectTitle');
  const multiselectDesc = document.getElementById('multiselectDesc');
  const multiselectSearch = document.getElementById('multiselectSearch');
  const multiselectCount = document.getElementById('multiselectCount');
  const multiselectSelected = document.getElementById('multiselectSelected');
  const multiselectList = document.getElementById('multiselectList');

  let profile = getProfile();
  let activeMultiselectField = null;
  let pendingSelections = [];

  function topicLabel(key) {
    return TOPIC_INTEREST_LABELS[key] || TOPICS[key]?.title.replace(/^Find\s+/i, '') || key;
  }

  function matchLabel(match) {
    if (match === 'strong') return 'Strong Match';
    if (match === 'fair') return 'Fair Match';
    return 'Some Match';
  }

  function getFieldValue(fieldId) {
    const val = profile[fieldId];
    return Array.isArray(val) ? val : val ? [val] : [];
  }

  function persistField(fieldId, value) {
    saveProfile({ [fieldId]: value });
    profile = getProfile();
    updateFilterCount();
  }

  function profileBuilderUrl() {
    if (selectedTopicKeys.length === 1) {
      return `profile-builder.html?topic=${encodeURIComponent(selectedTopicKeys[0])}&from=results`;
    }
    if (selectedTopicKeys.length) {
      return `profile-builder.html?topics=${selectedTopicKeys.map(encodeURIComponent).join(',')}&from=results`;
    }
    return 'profile-builder.html?from=results';
  }

  function buildResultsUrl(topicKeys) {
    let url = 'results.html';
    const parts = [];
    if (topicKeys.length) {
      parts.push(`topics=${topicKeys.map(encodeURIComponent).join(',')}`);
    }
    if (searchQuery) {
      parts.push(`q=${encodeURIComponent(searchQuery)}`);
    }
    if (parts.length) url += `?${parts.join('&')}`;
    return url;
  }

  function navigateToTopics(topicKeys) {
    const nextKeys = topicKeys.filter((key) => key !== 'funding' && TOPICS[key]);
    if (nextKeys.length) setTopics(nextKeys);
    window.location.href = buildResultsUrl(nextKeys);
  }

  function renderSelectField(field) {
    if (!field) return '';
    const value = profile[field.id] || '';
    const opts = (field.options || [])
      .map((opt) => {
        const val = typeof opt === 'string' ? opt : opt.value;
        const label = typeof opt === 'string' ? opt : opt.label;
        const selected = value === val ? ' selected' : '';
        return `<option value="${val}"${selected}>${label}</option>`;
      })
      .join('');

    return `
      <div class="results-filter-group">
        <div class="results-filter-label-row">
          <label class="results-filter-label" for="results-${field.id}">${field.label}</label>
        </div>
        <select class="results-filter-select" id="results-${field.id}" data-profile-field="${field.id}">
          <option value="">${field.placeholder || 'Please Select...'}</option>
          ${opts}
        </select>
      </div>`;
  }

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

  function renderTopicInterestField(topicKey) {
    const field = findFieldById(`${topicKey}-interests`);
    if (!field) return '';
    const selected = getFieldValue(field.id);
    return `
      <div class="results-topic-resources" data-field-wrap="${field.id}">
        <div class="results-filter-label-row">
          <span class="results-filter-label">Specific resources</span>
        </div>
        <div class="builder-multiselect" role="button" tabindex="0" data-field="${field.id}" aria-haspopup="dialog">
          <span class="builder-multiselect__inner">${renderMultiselectPills(selected)}</span>
        </div>
      </div>`;
  }

  const EXTERNAL_LINK_ICON = `<svg class="results-fund-finder-link__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 3h6v6M10 14 21 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  function renderProfileFilters() {
    if (!profileFiltersRoot) return;

    profile = getProfile();
    const studentLevelField = findFieldById('student-level');
    const residencyField = findFieldById('residency');

    const topicItems = RESULTS_TOPIC_KEYS.map((key) => {
      const checked = selectedTopicKeys.includes(key);
      const resources = checked ? renderTopicInterestField(key) : '';
      return `
        <div class="results-topic-item${checked ? ' is-selected' : ''}">
          <label class="results-filter-check results-filter-check--topic">
            <input type="checkbox" class="results-filter-check__input" data-topic-check value="${key}"${checked ? ' checked' : ''}>
            <span class="results-filter-check__box" aria-hidden="true"></span>
            <span class="results-filter-check__text">${topicLabel(key)}</span>
          </label>
          ${resources}
        </div>`;
    }).join('');

    profileFiltersRoot.innerHTML = `
      ${renderSelectField(studentLevelField)}
      ${renderSelectField(residencyField)}
      <div class="results-filter-group results-filter-group--topic">
        <div class="results-filter-label-row">
          <span class="results-filter-label">Main Topics</span>
        </div>
        <div class="results-topic-checks">${topicItems}</div>
        <a href="${FUNDING_EXTERNAL_URL}" class="results-fund-finder-link" target="_blank" rel="noopener noreferrer">
          Fund Finder
          ${EXTERNAL_LINK_ICON}
        </a>
      </div>
      <a href="${profileBuilderUrl()}" class="builder-btn builder-btn--secondary results-more-profile-btn">More Profile Options</a>`;

    bindProfileFilterEvents();
    bindMultiselectEvents();
    updateFilterCount();
  }

  function bindProfileFilterEvents() {
    profileFiltersRoot.querySelectorAll('[data-profile-field]').forEach((el) => {
      el.addEventListener('change', () => {
        persistField(el.dataset.profileField, el.value);
      });
    });

    profileFiltersRoot.querySelectorAll('[data-topic-check]').forEach((input) => {
      input.addEventListener('change', () => {
        const nextKeys = [...profileFiltersRoot.querySelectorAll('[data-topic-check]:checked')].map(
          (el) => el.value
        );
        navigateToTopics(nextKeys);
      });
    });
  }

  function refreshMultiselectTrigger(fieldId) {
    const trigger = profileFiltersRoot?.querySelector(`.builder-multiselect[data-field="${fieldId}"]`);
    if (!trigger) return;
    const inner = trigger.querySelector('.builder-multiselect__inner');
    if (inner) inner.innerHTML = renderMultiselectPills(getFieldValue(fieldId));
    bindMultiselectEvents();
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
      const id = `ms-opt-${opt.replace(/[^a-z0-9]+/gi, '-').slice(0, 40)}-${optionCount}`;
      html += `
        <label class="builder-ms-option" data-option="${opt.replace(/"/g, '&quot;')}">
          <input type="checkbox" class="builder-ms-option__check" id="${id}" value="${opt.replace(/"/g, '&quot;')}"${checked}>
          <span class="builder-ms-option__label">${opt}</span>
        </label>`;
    }

    (field.options || []).forEach(renderOption);
    multiselectList.innerHTML = html || '<p class="builder-ms-empty">No options match your search.</p>';
    multiselectCount.textContent = `${optionCount} option${optionCount === 1 ? '' : 's'}`;
  }

  function openMultiselectModal(fieldId) {
    const field = findFieldById(fieldId);
    if (!field || field.type !== 'multiselect' || !multiselectModal) return;

    activeMultiselectField = field;
    pendingSelections = [...getFieldValue(fieldId)];
    multiselectTitle.textContent = field.modalTitle || field.label;
    multiselectDesc.textContent = field.modalDescription || '';
    multiselectSearch.value = '';
    renderMultiselectSelectedTags();
    renderMultiselectList(field, '');
    multiselectModal.hidden = false;
    multiselectSearch.focus();
  }

  function closeMultiselectModal() {
    if (!multiselectModal) return;
    multiselectModal.hidden = true;
    activeMultiselectField = null;
    pendingSelections = [];
  }

  function applyMultiselect() {
    if (!activeMultiselectField) return;
    const fieldId = activeMultiselectField.id;
    persistField(fieldId, [...pendingSelections]);
    closeMultiselectModal();
    refreshMultiselectTrigger(fieldId);
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
    if (activeMultiselectField) {
      renderMultiselectList(activeMultiselectField, multiselectSearch.value);
    }
  }

  function removeFieldSelection(fieldId, opt) {
    const current = getFieldValue(fieldId).filter((v) => v !== opt);
    persistField(fieldId, current);
    refreshMultiselectTrigger(fieldId);
  }

  function bindMultiselectEvents() {
    if (!profileFiltersRoot) return;

    profileFiltersRoot.querySelectorAll('.builder-multiselect').forEach((trigger) => {
      trigger.onclick = (e) => {
        if (e.target.closest('.builder-multiselect__pill-remove')) return;
        openMultiselectModal(trigger.dataset.field);
      };
      trigger.onkeydown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openMultiselectModal(trigger.dataset.field);
        }
      };
    });

    profileFiltersRoot.querySelectorAll('.builder-multiselect__pill-remove').forEach((btn) => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const wrap = btn.closest('[data-field-wrap]');
        if (!wrap) return;
        removeFieldSelection(wrap.dataset.fieldWrap, btn.dataset.remove);
      };
    });
  }

  function bindMultiselectModalEvents() {
    if (!multiselectModal) return;

    document.querySelectorAll('.js-close-multiselect').forEach((el) => {
      el.addEventListener('click', closeMultiselectModal);
    });
    document.getElementById('multiselectCancelBtn')?.addEventListener('click', closeMultiselectModal);
    document.getElementById('multiselectApplyBtn')?.addEventListener('click', applyMultiselect);

    multiselectSearch?.addEventListener('input', () => {
      if (!activeMultiselectField) return;
      renderMultiselectList(activeMultiselectField, multiselectSearch.value);
    });

    multiselectList?.addEventListener('change', (e) => {
      const input = e.target.closest('.builder-ms-option__check');
      if (!input) return;
      togglePendingSelection(input.value, input.checked);
    });

    multiselectSelected?.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-ms-remove]');
      if (!btn) return;
      removePendingSelection(btn.dataset.msRemove);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && multiselectModal && !multiselectModal.hidden) {
        closeMultiselectModal();
      }
    });
  }

  function getActiveFilterCount() {
    let count = selectedTopicKeys.length;
    if (profile['student-level']) count += 1;
    if (profile.residency) count += 1;
    selectedTopicKeys.forEach((key) => {
      if (getFieldValue(`${key}-interests`).length) count += 1;
    });
    if (searchQuery) count += 1;
    return count;
  }

  function updateFilterCount() {
    if (!filterCount) return;
    filterCount.textContent = `(${getActiveFilterCount()})`;
  }

  function filteredOpportunities() {
    const affiliated = getAffiliatedListings(getProfile());
    const standard = getStandardListings(selectedTopicKeys);
    return [...affiliated, ...standard];
  }

  function detailUrl(opp) {
    const topic =
      (opp.topics || []).find((key) => selectedTopicKeys.includes(key)) ||
      (opp.topics || [])[0] ||
      selectedTopicKeys[0];
    const returnUrl = buildResultsUrl(selectedTopicKeys);
    return `detail.html?topic=${encodeURIComponent(topic)}&id=${opp.id}&returnUrl=${encodeURIComponent(returnUrl)}`;
  }

  function renderProviderLogo(opp) {
    const hasLogo = !!opp.logoUrl;
    const src = opp.logoUrl || LOGO_PLACEHOLDER;
    const alt = opp.providerName ? `${opp.providerName} logo` : 'Resource provider';
    return `
      <div class="results-item__logo${hasLogo ? '' : ' results-item__logo--placeholder'}">
        <img class="results-item__logo-img" src="${src}" alt="${alt.replace(/"/g, '&quot;')}">
      </div>`;
  }

  function renderTopicPills(topicKeys) {
    const visibleKeys = topicKeys.filter((key) => key !== 'funding' && TOPICS[key]);
    if (!visibleKeys.length) return '';
    return `
      <ul class="results-item__topics" aria-label="Resource topics">
        ${visibleKeys.map((key) => `<li class="results-item__topic-pill">${topicIconHtml(key)}${topicLabel(key)}</li>`).join('')}
      </ul>`;
  }

  function renderAffiliationBadge(opp) {
    if (!opp.listingType) return '';
    const label = opp.affiliationLabel || (opp.listingType === 'school' ? 'Your School' : 'Your Community');
    const detail = opp.affiliationDetail
      ? `<span class="results-item__affiliation-detail">${opp.affiliationDetail}</span>`
      : '';
    return `<p class="results-item__affiliation results-item__affiliation--${opp.listingType}"><span class="results-item__affiliation-label">${label}</span>${detail}</p>`;
  }

  function renderResultCard(opp) {
    const matchHtml = config.showMatchStrength
      ? `<span class="results-item__match results-item__match--${opp.match}">${matchLabel(opp.match)}</span>`
      : '';
    const typeClass = opp.listingType ? ` results-item--${opp.listingType}` : '';

    return `
      <article class="results-item${typeClass}">
        ${CompassFavorites.favoriteButtonHtml(opp.id)}
        ${renderProviderLogo(opp)}
        <div class="results-item__body">
          ${renderAffiliationBadge(opp)}
          ${renderTopicPills(opp.topics || [])}
          <h3 class="results-item__title">${opp.title}</h3>
          <p class="results-item__meta"><strong>${opp.location || 'Indiana'}</strong> · ${opp.programType || 'Program'}</p>
          <p class="results-item__desc">${opp.desc}</p>
          <a href="${detailUrl(opp)}" class="builder-btn builder-btn--secondary results-item__btn">View Full Details</a>
        </div>
        ${matchHtml ? `<div class="results-item__aside">${matchHtml}</div>` : ''}
      </article>`;
  }

  function resultsHeadingText(count) {
    if (selectedTopicKeys.length === 1) {
      return `${config.resultLabel} Found (${count})`;
    }
    return `Resources Found (${count})`;
  }

  function renderResults() {
    if (!config) return;
    const items = filteredOpportunities();
    const total = items.length || config.totalCount;
    const shown = Math.min(items.length, PER_PAGE);

    resultsHeading.textContent = resultsHeadingText(total);
    resultsRange.textContent = items.length
      ? `Showing 1 - ${shown} of ${total} Results`
      : 'No results match the selected topics.';

    resultsList.innerHTML = items.length
      ? items.slice(0, PER_PAGE).map(renderResultCard).join('')
      : '<p class="results-empty">Try selecting different main topics or adjusting your filters.</p>';
    CompassFavorites.bindFavoriteButtons(resultsList);

    if (!items.length) {
      resultsPagination.innerHTML = '';
      return;
    }

    resultsPagination.innerHTML = `
      <button type="button" class="results-pagination__btn" disabled aria-label="Previous page">&laquo;</button>
      <button type="button" class="results-pagination__btn is-active" aria-current="page">1</button>
      <button type="button" class="results-pagination__btn">2</button>
      <button type="button" class="results-pagination__btn">3</button>
      <span class="results-pagination__ellipsis">…</span>
      <button type="button" class="results-pagination__btn">${Math.max(1, Math.ceil(total / PER_PAGE))}</button>
      <button type="button" class="results-pagination__btn" aria-label="Next page">&raquo;</button>`;
  }

  function renderSortOptions() {
    if (!config) return;
    sortSelect.innerHTML = config.sortOptions
      .map((opt, i) => {
        const selected = i === 0 ? ' selected' : '';
        return `<option${selected}>${opt}</option>`;
      })
      .join('');
  }

  function applyNoTopicState() {
    document.body.classList.add('results-no-topic');
    resultsPrompt.hidden = false;
    resultsMainContent.hidden = true;
    document.getElementById('breadcrumbProfileLink').href = 'index.html';
    document.title = 'Compass — Browse Results';
  }

  const filtersPanel = document.getElementById('filtersPanel');
  const filtersBackdrop = document.getElementById('filtersBackdrop');
  const closeFiltersBtn = document.getElementById('closeFiltersBtn');
  const mobileFiltersMq = window.matchMedia('(max-width: 860px)');

  function openFiltersDrawer() {
    if (!mobileFiltersMq.matches) {
      filtersPanel.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    document.body.classList.add('results-filters-open');
    filtersBackdrop.hidden = false;
    closeFiltersBtn?.focus();
  }

  function closeFiltersDrawer() {
    document.body.classList.remove('results-filters-open');
    filtersBackdrop.hidden = true;
  }

  document.getElementById('changeFiltersBtn')?.addEventListener('click', openFiltersDrawer);
  closeFiltersBtn?.addEventListener('click', closeFiltersDrawer);
  filtersBackdrop?.addEventListener('click', closeFiltersDrawer);
  document.getElementById('promptFiltersBtn')?.addEventListener('click', openFiltersDrawer);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('results-filters-open')) {
      closeFiltersDrawer();
    }
  });

  if (hasTopics) {
    document.getElementById('breadcrumbProfileLink').href = profileBuilderUrl();
    const titleTopics = selectedTopicKeys.map(topicLabel).join(', ');
    document.title = `Compass — ${titleTopics} Results`;
  } else {
    applyNoTopicState();
    document.getElementById('breadcrumbProfileLink').href = profileBuilderUrl();
  }

  const createAccountModal = document.getElementById('createAccountModal');
  document.querySelectorAll('.js-create-account').forEach((btn) => {
    btn.addEventListener('click', () => {
      createAccountModal.hidden = false;
    });
  });
  document.querySelectorAll('.js-close-account').forEach((el) => {
    el.addEventListener('click', () => {
      createAccountModal.hidden = true;
    });
  });
  document.getElementById('accountSubmitBtn')?.addEventListener('click', () => {
    saveProfile({ accountCreated: true });
    createAccountModal.hidden = true;
    alert('Account created! (prototype demo)');
  });

  bindMultiselectModalEvents();
  renderProfileFilters();
  renderSortOptions();
  renderResults();
})();
