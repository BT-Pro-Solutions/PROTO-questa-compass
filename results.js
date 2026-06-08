(function () {
  const { TOPICS, getProfile, saveProfile } = CompassProfile;
  const { PLACEHOLDER_OPPORTUNITIES, getTopicResultsConfig } = CompassResults;

  const params = new URLSearchParams(window.location.search);
  const topicKey = params.get('topic') || getProfile().topic || 'funding';
  const topic = TOPICS[topicKey] || TOPICS.funding;
  const config = getTopicResultsConfig(topicKey);

  const PER_PAGE = 8;
  const MATCH_LABELS = ['Some', 'Fair', 'Strong'];
  const MATCH_THUMB_COLORS = ['#e53935', '#ffb300', '#4caf50'];

  const filtersRoot = document.getElementById('filtersRoot');
  const resultsList = document.getElementById('resultsList');
  const resultsHeading = document.getElementById('resultsHeading');
  const resultsRange = document.getElementById('resultsRange');
  const sortSelect = document.getElementById('sortSelect');
  const filterCount = document.getElementById('filterCount');
  const resultsPagination = document.getElementById('resultsPagination');

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
    filtersRoot.innerHTML = config.filters.map(renderFilter).join('');
    bindMatchStrength();
    filtersRoot.querySelectorAll('select, input[type="checkbox"]').forEach((el) => {
      el.addEventListener('change', updateFilterCount);
    });
    updateFilterCount();
  }

  function updateFilterCount() {
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
    const keyword = document.getElementById('keywordSearch').value.trim();
    if (keyword) count += 1;
    filterCount.textContent = `(${count})`;
  }

  function clearFilters() {
    filtersRoot.querySelectorAll('select').forEach((sel) => {
      sel.selectedIndex = 0;
    });
    filtersRoot.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
      cb.checked = false;
    });
    setMatchStrengthUI(0);
    document.getElementById('keywordSearch').value = '';
    updateFilterCount();
  }

  function detailUrl(id) {
    return `detail.html?topic=${encodeURIComponent(topicKey)}&id=${id}&returnUrl=${encodeURIComponent(`results.html?topic=${topicKey}`)}`;
  }

  function renderResultCard(opp) {
    const matchHtml = config.showMatchStrength
      ? `<span class="results-item__match results-item__match--${opp.match}">${matchLabel(opp.match)}</span>`
      : '';

    return `
      <article class="results-item">
        ${CompassFavorites.favoriteButtonHtml(opp.id)}
        <div class="results-item__body">
          <h3 class="results-item__title">${opp.title}</h3>
          <p class="results-item__meta"><strong>Key dates &amp; amount</strong> ${opp.keyDates}</p>
          <p class="results-item__desc">${opp.desc}</p>
          <a href="${detailUrl(opp.id)}" class="builder-btn builder-btn--secondary results-item__btn">View Full Details</a>
        </div>
        ${matchHtml ? `<div class="results-item__aside">${matchHtml}</div>` : ''}
      </article>`;
  }

  function renderResults() {
    const items = PLACEHOLDER_OPPORTUNITIES;
    const total = config.totalCount;
    const shown = Math.min(items.length, PER_PAGE);

    resultsHeading.textContent = `${config.resultLabel} Found (${total})`;
    resultsRange.textContent = `Showing 1 - ${shown} of ${total} Results`;

    resultsList.innerHTML = items.slice(0, PER_PAGE).map(renderResultCard).join('');
    CompassFavorites.bindFavoriteButtons(resultsList);

    resultsPagination.innerHTML = `
      <button type="button" class="results-pagination__btn" disabled aria-label="Previous page">&laquo;</button>
      <button type="button" class="results-pagination__btn is-active" aria-current="page">1</button>
      <button type="button" class="results-pagination__btn">2</button>
      <button type="button" class="results-pagination__btn">3</button>
      <span class="results-pagination__ellipsis">…</span>
      <button type="button" class="results-pagination__btn">${Math.ceil(total / PER_PAGE)}</button>
      <button type="button" class="results-pagination__btn" aria-label="Next page">&raquo;</button>`;
  }

  function renderSortOptions() {
    sortSelect.innerHTML = config.sortOptions
      .map((opt, i) => {
        const selected = i === 0 ? ' selected' : '';
        return `<option${selected}>${opt}</option>`;
      })
      .join('');
  }

  document.getElementById('clearFiltersBtn').addEventListener('click', clearFilters);
  document.getElementById('keywordSearch').addEventListener('input', updateFilterCount);
  document.getElementById('searchGoBtn').addEventListener('click', updateFilterCount);
  document.getElementById('changeFiltersBtn').addEventListener('click', () => {
    document.getElementById('filtersPanel').scrollIntoView({ behavior: 'smooth' });
  });

  const profileBuilderUrl = `profile-builder.html?topic=${encodeURIComponent(topicKey)}&from=results`;

  document.getElementById('breadcrumbProfileLink').href = profileBuilderUrl;
  document.getElementById('continueProfileLink').href = `${profileBuilderUrl}&expand=all`;

  document.title = `Compass — ${topic.title} Results`;

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

  renderFilters();
  renderSortOptions();
  renderResults();
})();
