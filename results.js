(function () {
  const { TOPICS, getProfile, saveProfile } = CompassProfile;
  const { PLACEHOLDER_OPPORTUNITIES, getTopicResultsConfig } = CompassResults;

  const params = new URLSearchParams(window.location.search);
  const topicKey = params.get('topic') || getProfile().topic || 'funding';
  const topic = TOPICS[topicKey] || TOPICS.funding;
  const config = getTopicResultsConfig(topicKey);

  const PER_PAGE = 8;
  let activeFilters = 0;

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

  function renderFilter(filter) {
    if (filter.type === 'match-strength') {
      const options = filter.options
        .map(
          (opt, i) =>
            `<label class="results-filter-option"><input type="radio" name="match-strength" value="${opt}"${i === 2 ? ' checked' : ''}> ${opt}</label>`
        )
        .join('');
      return `
        <div class="results-filter-group">
          <span class="results-filter-label">${filter.label}</span>
          ${filter.hint ? `<p class="results-filter-hint">${filter.hint}</p>` : ''}
          <div class="results-filter-radios">${options}</div>
        </div>`;
    }

    if (filter.type === 'toggle') {
      return `
        <div class="results-filter-group results-filter-group--row">
          <label class="results-filter-toggle">
            <input type="checkbox" data-filter="${filter.id}">
            <span>${filter.label}</span>
          </label>
        </div>`;
    }

    if (filter.type === 'select') {
      const opts = filter.options
        .map((opt) => `<option value="${opt}">${opt}</option>`)
        .join('');
      return `
        <div class="results-filter-group">
          <label class="results-filter-label" for="filter-${filter.id}">${filter.label}</label>
          <select class="results-filter-select" id="filter-${filter.id}" data-filter="${filter.id}">
            ${opts}
          </select>
        </div>`;
    }

    return '';
  }

  function renderFilters() {
    filtersRoot.innerHTML = config.filters.map(renderFilter).join('');
    filtersRoot.querySelectorAll('select, input').forEach((el) => {
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
    const keyword = document.getElementById('keywordSearch').value.trim();
    if (keyword) count += 1;
    activeFilters = count;
    filterCount.textContent = `(${count})`;
  }

  function clearFilters() {
    filtersRoot.querySelectorAll('select').forEach((sel) => {
      sel.selectedIndex = 0;
    });
    filtersRoot.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
      cb.checked = false;
    });
    const strongRadio = filtersRoot.querySelector('input[name="match-strength"][value="Strong"]');
    if (strongRadio) strongRadio.checked = true;
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
        <div class="results-item__body">
          <h3 class="results-item__title">${opp.title}</h3>
          <p class="results-item__meta"><strong>Key dates &amp; amount</strong> ${opp.keyDates}</p>
          <p class="results-item__desc">${opp.desc}</p>
          <a href="${detailUrl(opp.id)}" class="results-item__link">View Full Details</a>
        </div>
        ${matchHtml}
      </article>`;
  }

  function renderResults() {
    const items = PLACEHOLDER_OPPORTUNITIES;
    const total = config.totalCount;
    const shown = Math.min(items.length, PER_PAGE);

    resultsHeading.textContent = `${config.resultLabel} Found (${total})`;
    resultsRange.textContent = `Showing 1 - ${shown} of ${total} Results`;

    resultsList.innerHTML = items.slice(0, PER_PAGE).map(renderResultCard).join('');

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
    sortSelect.innerHTML = config.sortOptions.map((opt, i) => {
      const selected = i === 0 ? ' selected' : '';
      return `<option${selected}>${opt}</option>`;
    }).join('');
  }

  document.getElementById('clearFiltersBtn').addEventListener('click', clearFilters);
  document.getElementById('keywordSearch').addEventListener('input', updateFilterCount);
  document.getElementById('searchGoBtn').addEventListener('click', updateFilterCount);
  document.getElementById('changeFiltersBtn').addEventListener('click', () => {
    document.getElementById('filtersPanel').scrollIntoView({ behavior: 'smooth' });
  });

  document.getElementById('continueProfileLink').href =
    `profile-builder.html?topic=${encodeURIComponent(topicKey)}&expand=all`;

  document.title = `Compass — ${topic.title} Results`;

  const createAccountModal = document.getElementById('createAccountModal');
  document.querySelectorAll('.js-create-account').forEach((btn) => {
    btn.addEventListener('click', () => { createAccountModal.hidden = false; });
  });
  document.querySelectorAll('.js-close-account').forEach((el) => {
    el.addEventListener('click', () => { createAccountModal.hidden = true; });
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
