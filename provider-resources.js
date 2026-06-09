(function () {
  const { LISTINGS } = CompassProviderListings;
  const listRoot = document.getElementById('providerResourceList');
  const sortSelect = document.getElementById('listingsSortSelect');

  function statusClass(status) {
    if (status === 'approved') return 'provider-status--approved';
    if (status === 'pending') return 'provider-status--pending';
    if (status === 'claim') return 'provider-status--review';
    if (status === 'rejected') return 'provider-status--rejected';
    return 'provider-status--pending';
  }

  function sortListings(mode) {
    const items = [...LISTINGS];

    if (mode === 'newest') {
      return items.sort((a, b) => b.submittedDate.localeCompare(a.submittedDate));
    }

    if (mode === 'alphabetical') {
      return items.sort((a, b) => a.title.localeCompare(b.title));
    }

    return items.sort((a, b) => {
      if (a.statusSort !== b.statusSort) return a.statusSort - b.statusSort;
      return b.submittedDate.localeCompare(a.submittedDate);
    });
  }

  function renderListings(mode) {
    listRoot.innerHTML = sortListings(mode).map((listing) => `
      <a href="provider-resource-detail.html?id=${encodeURIComponent(listing.id)}" class="provider-resource-card">
        <div class="provider-resource-card__main">
          <span class="provider-status ${statusClass(listing.status)}">${listing.statusLabel}</span>
          <h3>${listing.title}</h3>
          <p>${listing.description}</p>
          <p class="provider-resource-card__meta">${listing.meta}</p>
        </div>
      </a>`).join('');
  }

  sortSelect.addEventListener('change', () => {
    renderListings(sortSelect.value);
  });

  renderListings(sortSelect.value);
})();
