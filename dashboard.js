(function () {
  const { getFavorites, bindFavoriteButtons } = CompassFavorites;
  const { PLACEHOLDER_OPPORTUNITIES } = CompassResults;
  const { TOPIC_INTEREST_LABELS } = CompassProfile;

  const listRoot = document.getElementById('savedResourcesList');
  const emptyRoot = document.getElementById('savedResourcesEmpty');

  function topicLabel(key) {
    return TOPIC_INTEREST_LABELS[key] || key;
  }

  function detailUrl(opp) {
    const topic = (opp.topics || [])[0] || 'careers';
    return `detail.html?topic=${encodeURIComponent(topic)}&id=${opp.id}&returnUrl=${encodeURIComponent('dashboard.html')}`;
  }

  function renderSavedResources() {
    if (!listRoot) return;

    const favoriteIds = getFavorites();
    const saved = PLACEHOLDER_OPPORTUNITIES.filter((opp) => favoriteIds.includes(String(opp.id)));

    if (!saved.length) {
      listRoot.innerHTML = '';
      if (emptyRoot) emptyRoot.hidden = false;
      return;
    }

    if (emptyRoot) emptyRoot.hidden = true;
    listRoot.innerHTML = saved
      .map((opp) => {
        const topics = (opp.topics || []).map(topicLabel).join(', ');
        return `
          <li class="saved-resource-item">
            <div class="saved-resource-item__body">
              <h3 class="saved-resource-item__title">
                <a href="${detailUrl(opp)}">${opp.title}</a>
              </h3>
              <p class="saved-resource-item__meta">${opp.location || 'Indiana'} · ${opp.programType || 'Program'}</p>
              ${topics ? `<p class="saved-resource-item__topics">${topics}</p>` : ''}
            </div>
            ${CompassFavorites.favoriteButtonHtml(opp.id, 'saved-resource-item__favorite')}
          </li>`;
      })
      .join('');

    bindFavoriteButtons(listRoot, () => renderSavedResources());
  }

  function initFundingTabs() {
    const tabs = document.querySelectorAll('.saved-tabs--funding .saved-tabs__tab');
    const panel = document.getElementById('fundingSavedPanel');
    if (!tabs.length || !panel) return;

    const emptyCopy = {
      'due-soon': "You don't have any opportunity deadlines (within a week) approaching.",
      won: "You haven't marked any funding opportunities as won yet.",
      applied: "You haven't marked any funding opportunities as applied yet.",
      saved: "You haven't saved any funding opportunities yet.",
    };

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        tabs.forEach((t) => {
          t.classList.remove('is-active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('is-active');
        tab.setAttribute('aria-selected', 'true');

        const key = tab.dataset.fundingTab || 'due-soon';
        const emptyEl = panel.querySelector('.saved-panel__empty');
        if (emptyEl) emptyEl.textContent = emptyCopy[key] || emptyCopy['due-soon'];
      });
    });
  }

  function initFundingViews() {
    document.querySelectorAll('.saved-panel--funding .saved-view-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.saved-panel--funding .saved-view-btn').forEach((b) => {
          b.classList.remove('is-active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('is-active');
        btn.setAttribute('aria-pressed', 'true');
      });
    });
  }

  renderSavedResources();
  initFundingTabs();
  initFundingViews();
})();
