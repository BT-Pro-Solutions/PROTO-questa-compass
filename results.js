(function () {
  const { TOPICS, TOPIC_INTEREST_LABELS, MENU_TOPIC_MAP, saveProfile, setTopics } = CompassProfile;
  const { PLACEHOLDER_OPPORTUNITIES, getResultsConfig } = CompassResults;

  const RESULTS_TOPIC_KEYS = MENU_TOPIC_MAP.filter((key) => key !== 'funding');
  const LOGO_PLACEHOLDER = 'assets/logo-circle.svg';

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
  const MATCH_LABELS = ['Some', 'Fair', 'Strong'];
  const MATCH_THUMB_COLORS = ['#e53935', '#ffb300', '#4caf50'];

  const filtersRoot = document.getElementById('filtersRoot');
  const topicFilterRoot = document.getElementById('topicFilterRoot');
  const resultsList = document.getElementById('resultsList');
  const resultsHeading = document.getElementById('resultsHeading');
  const resultsRange = document.getElementById('resultsRange');
  const resultsPrompt = document.getElementById('resultsPrompt');
  const resultsMainContent = document.getElementById('resultsMainContent');
  const sortSelect = document.getElementById('sortSelect');
  const filterCount = document.getElementById('filterCount');
  const resultsPagination = document.getElementById('resultsPagination');

  function topicLabel(key) {
    return TOPIC_INTEREST_LABELS[key] || TOPICS[key]?.title.replace(/^Find\s+/i, '') || key;
  }

  function matchLabel(match) {
    if (match === 'strong') return 'Strong Match';
    if (match === 'fair') return 'Fair Match';
    return 'Some Match';
  }

  function renderTooltip(text) {
    if (!text) return '';
    return `<button type="button" class="builder-tooltip" aria-label="More info" data-tip="${text.replace(/"/g, '&quot;')}">?</button>`;
  }

  function renderFilterLabel(filter) {
    const label = filter.label.toUpperCase();
    return `
      <div class="results-filter-label-row">
        <span class="results-filter-label">${label}</span>
        ${renderTooltip(filter.tooltip)}
      </div>`;
  }

  function renderMatchStrengthFilter(filter) {
    const labelsHtml = MATCH_LABELS.map(
      (label, i) =>
        `<button type="button" class="results-match-slider__label${i === 0 ? ' is-active' : ''}" data-match-index="${i}">${label}</button>`
    ).join('');

    return `
      <div class="results-filter-group results-filter-group--match">
        ${renderFilterLabel(filter)}
        ${filter.hint ? `<p class="results-filter-hint">${filter.hint}</p>` : ''}
        <div class="results-match-slider">
          <div class="results-match-slider__track" aria-hidden="true">
            <span class="results-match-slider__tick" style="left: 50%"></span>
            <span class="results-match-slider__tick" style="left: 100%"></span>
          </div>
          <input type="range" class="results-match-slider__input" id="matchStrengthSlider" min="0" max="2" value="0" step="1" aria-label="Match strength" data-filter="match-strength">
          <div class="results-match-slider__labels">${labelsHtml}</div>
        </div>
      </div>`;
  }

  function renderCheckboxFilter(filter) {
    return `
      <div class="results-filter-group results-filter-group--check">
        <div class="results-filter-check-row">
          <label class="results-filter-check">
            <input type="checkbox" class="results-filter-check__input" data-filter="${filter.id}">
            <span class="results-filter-check__box" aria-hidden="true"></span>
            <span class="results-filter-check__text">${filter.label.toUpperCase()}</span>
          </label>
          ${renderTooltip(filter.tooltip)}
        </div>
      </div>`;
  }

  function renderSelectFilter(filter) {
    const opts = filter.options.map((opt) => `<option value="${opt}">${opt}</option>`).join('');
    return `
      <div class="results-filter-group">
        ${renderFilterLabel(filter)}
        <select class="results-filter-select" id="filter-${filter.id}" data-filter="${filter.id}">
          ${opts}
        </select>
      </div>`;
  }

  function renderFilter(filter) {
    if (filter.type === 'match-strength') return renderMatchStrengthFilter(filter);
    if (filter.type === 'toggle' || filter.type === 'checkbox') return renderCheckboxFilter(filter);
    if (filter.type === 'select') return renderSelectFilter(filter);
    return '';
  }

  function setMatchStrengthUI(index) {
    const slider = document.getElementById('matchStrengthSlider');
    if (!slider) return;
    const i = Math.max(0, Math.min(2, Number(index)));
    slider.value = i;
    slider.style.setProperty('--thumb-color', MATCH_THUMB_COLORS[i]);
    filtersRoot.querySelectorAll('.results-match-slider__label').forEach((btn, idx) => {
      btn.classList.toggle('is-active', idx === i);
    });
  }

  function bindMatchStrength() {
    const slider = document.getElementById('matchStrengthSlider');
    if (!slider) return;

    setMatchStrengthUI(0);

    slider.addEventListener('input', () => {
      setMatchStrengthUI(slider.value);
      updateFilterCount();
    });

    filtersRoot.querySelectorAll('.results-match-slider__label').forEach((btn) => {
      btn.addEventListener('click', () => {
        setMatchStrengthUI(btn.dataset.matchIndex);
        updateFilterCount();
      });
    });
  }

  function renderFilters() {
    if (!config) return;
    filtersRoot.innerHTML = config.filters.map(renderFilter).join('');
    bindMatchStrength();
    filtersRoot.querySelectorAll('select, input[type="checkbox"]').forEach((el) => {
      el.addEventListener('change', updateFilterCount);
    });
    updateFilterCount();
  }

  function getActiveFilterCount() {
    let count = 0;
    filtersRoot.querySelectorAll('select').forEach((sel) => {
      const val = sel.value;
      if (val && val !== 'Show All' && val !== 'Select') count += 1;
    });
    filtersRoot.querySelectorAll('input[type="checkbox"]:checked').forEach(() => {
      count += 1;
    });
    const slider = document.getElementById('matchStrengthSlider');
    if (slider && Number(slider.value) > 0) count += 1;
    if (searchQuery) count += 1;
    return count;
  }

  function updateFilterCount() {
    if (!hasTopics) return;
    filterCount.textContent = `(${getActiveFilterCount()})`;
  }

  function clearFilters() {
    filtersRoot.querySelectorAll('select').forEach((sel) => {
      sel.selectedIndex = 0;
    });
    filtersRoot.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
      cb.checked = false;
    });
    setMatchStrengthUI(0);
    updateFilterCount();
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

  function renderTopicFilter() {
    const checkboxes = RESULTS_TOPIC_KEYS.map((key) => {
      const checked = selectedTopicKeys.includes(key) ? ' checked' : '';
      return `
        <label class="results-filter-check results-filter-check--topic">
          <input type="checkbox" class="results-filter-check__input" data-topic-check value="${key}"${checked}>
          <span class="results-filter-check__box" aria-hidden="true"></span>
          <span class="results-filter-check__text">${topicLabel(key)}</span>
        </label>`;
    }).join('');

    topicFilterRoot.innerHTML = `
      <div class="results-filter-group results-filter-group--topic">
        <div class="results-filter-label-row">
          <span class="results-filter-label">MAIN TOPICS</span>
        </div>
        <div class="results-topic-checks">${checkboxes}</div>
      </div>`;

    topicFilterRoot.querySelectorAll('[data-topic-check]').forEach((input) => {
      input.addEventListener('change', () => {
        const nextKeys = [...topicFilterRoot.querySelectorAll('[data-topic-check]:checked')].map(
          (el) => el.value
        );
        navigateToTopics(nextKeys);
      });
    });
  }

  function filteredOpportunities() {
    return PLACEHOLDER_OPPORTUNITIES.filter((opp) =>
      (opp.topics || []).some((topic) => selectedTopicKeys.includes(topic))
    );
  }

  function detailUrl(opp) {
    const topic =
      (opp.topics || []).find((key) => selectedTopicKeys.includes(key)) || selectedTopicKeys[0];
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
        ${visibleKeys.map((key) => `<li class="results-item__topic-pill">${topicLabel(key)}</li>`).join('')}
      </ul>`;
  }

  function renderResultCard(opp) {
    const matchHtml = config.showMatchStrength
      ? `<span class="results-item__match results-item__match--${opp.match}">${matchLabel(opp.match)}</span>`
      : '';

    return `
      <article class="results-item">
        ${CompassFavorites.favoriteButtonHtml(opp.id)}
        ${renderProviderLogo(opp)}
        <div class="results-item__body">
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

  function profileBuilderUrl() {
    if (selectedTopicKeys.length === 1) {
      return `profile-builder.html?topic=${encodeURIComponent(selectedTopicKeys[0])}&from=results`;
    }
    return `profile-builder.html?topics=${selectedTopicKeys.map(encodeURIComponent).join(',')}&from=results`;
  }

  function applyNoTopicState() {
    document.body.classList.add('results-no-topic');
    resultsPrompt.hidden = false;
    resultsMainContent.hidden = true;
    document.getElementById('breadcrumbProfileLink').href = 'index.html';
    document.title = 'Compass — Browse Results';
  }

  document.getElementById('clearFiltersBtn').addEventListener('click', clearFilters);

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

  document.getElementById('changeFiltersBtn').addEventListener('click', openFiltersDrawer);
  closeFiltersBtn?.addEventListener('click', closeFiltersDrawer);
  filtersBackdrop?.addEventListener('click', closeFiltersDrawer);
  document.getElementById('promptFiltersBtn')?.addEventListener('click', openFiltersDrawer);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('results-filters-open')) {
      closeFiltersDrawer();
    }
  });

  if (hasTopics) {
    const builderUrl = profileBuilderUrl();

    document.getElementById('breadcrumbProfileLink').href = builderUrl;
    document.getElementById('continueProfileLink').href = `${builderUrl}&expand=all`;

    if (typeof CompassAuth !== 'undefined'
      && CompassAuth.isLoggedIn()
      && CompassAuth.getUser().role === 'provider') {
      document.getElementById('continueProfileLink').hidden = true;
    }

    const titleTopics = selectedTopicKeys.map(topicLabel).join(', ');
    document.title = `Compass — ${titleTopics} Results`;
  } else {
    applyNoTopicState();
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
  document.getElementById('accountSubmitBtn').addEventListener('click', () => {
    saveProfile({ accountCreated: true });
    createAccountModal.hidden = true;
    alert('Account created! (prototype demo)');
  });

  renderTopicFilter();
  renderFilters();
  renderSortOptions();
  renderResults();
  if (searchQuery && hasTopics) updateFilterCount();
})();
