(function (global) {
  const STORAGE_KEY = 'compass-favorites';

  function getFavorites() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      const ids = raw ? JSON.parse(raw) : [];
      return Array.isArray(ids) ? ids.map(String) : [];
    } catch {
      return [];
    }
  }

  function saveFavorites(ids) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }

  function isFavorite(id) {
    return getFavorites().includes(String(id));
  }

  function toggleFavorite(id) {
    const key = String(id);
    const favorites = getFavorites();
    const index = favorites.indexOf(key);
    if (index === -1) {
      favorites.push(key);
    } else {
      favorites.splice(index, 1);
    }
    saveFavorites(favorites);
    return isFavorite(key);
  }

  function favoriteButtonHtml(id, extraClass) {
    const active = isFavorite(id);
    return `
      <button type="button"
        class="favorite-btn${active ? ' is-active' : ''}${extraClass ? ` ${extraClass}` : ''}"
        data-favorite-id="${id}"
        aria-label="${active ? 'Remove from favorites' : 'Save to favorites'}"
        aria-pressed="${active}">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
          <path class="favorite-btn__icon" d="M11 19.35S3.5 14.28 3.5 8.88C3.5 6.47 5.47 4.5 7.88 4.5c1.54 0 3.04.74 3.62 1.9.58-1.16 2.08-1.9 3.62-1.9 2.41 0 4.38 1.97 4.38 4.38 0 5.4-7.5 10.47-7.5 10.47z" stroke="currentColor" stroke-width="1.75"/>
        </svg>
      </button>`;
  }

  function bindFavoriteButtons(root, onToggle) {
    (root || document).querySelectorAll('.favorite-btn[data-favorite-id]').forEach((btn) => {
      if (btn.dataset.favoriteBound) return;
      btn.dataset.favoriteBound = '1';
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const id = btn.dataset.favoriteId;
        const active = toggleFavorite(id);
        btn.classList.toggle('is-active', active);
        btn.setAttribute('aria-pressed', String(active));
        btn.setAttribute('aria-label', active ? 'Remove from favorites' : 'Save to favorites');
        if (onToggle) onToggle(id, active, btn);
      });
    });
  }

  global.CompassFavorites = {
    getFavorites,
    isFavorite,
    toggleFavorite,
    favoriteButtonHtml,
    bindFavoriteButtons,
  };
})(window);
