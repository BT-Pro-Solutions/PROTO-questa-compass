(function (global) {
  const STORAGE_KEY = 'compass-session';
  const DEFAULT_USER = { initials: 'KT', firstName: 'Kevin', lastName: 'Test', role: 'student' };

  const STUDENT_NAV_ITEMS = [
    {
      id: 'dashboard',
      label: 'My Dashboard',
      href: 'dashboard.html',
      icon: '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><rect x="1" y="1" width="6.5" height="6.5" rx="1" stroke="currentColor" stroke-width="1.5"/><rect x="10.5" y="1" width="6.5" height="6.5" rx="1" stroke="currentColor" stroke-width="1.5"/><rect x="1" y="10.5" width="6.5" height="6.5" rx="1" stroke="currentColor" stroke-width="1.5"/><rect x="10.5" y="10.5" width="6.5" height="6.5" rx="1" stroke="currentColor" stroke-width="1.5"/></svg>',
    },
    {
      id: 'compass',
      label: 'Compass',
      href: 'compass.html',
      icon: '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><circle cx="9" cy="9" r="7.5" stroke="currentColor" stroke-width="1.5"/><path d="M9 3.5L10.8 9H9l1.8 5.5L9 9H7.2L9 3.5z" fill="currentColor"/></svg>',
    },
    {
      id: 'profile',
      label: 'My Profile',
      href: 'profile-builder.html?mode=universal&from=profile',
      icon: '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><circle cx="9" cy="9" r="7.5" stroke="currentColor" stroke-width="1.5"/><circle cx="9" cy="7" r="2.5" stroke="currentColor" stroke-width="1.5"/><path d="M4.5 14c.8-2 2.5-3 4.5-3s3.7 1 4.5 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    },
    {
      id: 'search',
      label: 'Browse',
      href: 'results.html',
      icon: '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><circle cx="7.5" cy="7.5" r="5" stroke="currentColor" stroke-width="1.5"/><path d="M11.5 11.5L16 16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    },
    {
      id: 'account',
      label: 'Account',
      href: 'security.html',
      icon: '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M9 1.5L15 4v5c0 4-2.5 6.5-6 7.5-3.5-1-6-3.5-6-7.5V4L9 1.5z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>',
    },
  ];

  const PROVIDER_NAV_ITEMS = [
    {
      id: 'provider-account',
      label: 'Account',
      href: 'provider-account.html',
      icon: '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><circle cx="9" cy="7" r="3" stroke="currentColor" stroke-width="1.5"/><path d="M3.5 16c.8-3.1 2.8-5 5.5-5s4.7 1.9 5.5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    },
    {
      id: 'provider-services',
      label: 'My Listings',
      href: 'provider-resources.html',
      icon: '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M3 4.5h12M3 9h12M3 13.5h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><rect x="2" y="2" width="14" height="14" rx="2" stroke="currentColor" stroke-width="1.5"/></svg>',
    },
    {
      id: 'provider-search',
      label: 'Browse',
      href: 'results.html',
      icon: '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><circle cx="7.5" cy="7.5" r="5" stroke="currentColor" stroke-width="1.5"/><path d="M11.5 11.5L16 16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    },
  ];

  const ADMIN_NAV_ITEMS = [
    {
      id: 'admin-dashboard',
      label: 'Admin Dashboard',
      href: 'admin-dashboard.html',
      icon: '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><rect x="2" y="2" width="14" height="14" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M5 6h8M5 9h8M5 12h5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    },
  ];

  const PROTECTED_PAGES = [
    'dashboard.html',
    'security.html',
    'compass.html',
    'provider-account.html',
    'provider-resources.html',
    'provider-resource-detail.html',
    'provider-add-listings-bulk.html',
    'admin-dashboard.html',
  ];

  function getSession() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function isLoggedIn() {
    return !!getSession()?.loggedIn;
  }

  function getUser() {
    return { ...DEFAULT_USER, ...(getSession()?.user || {}) };
  }

  function login(user) {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ loggedIn: true, user: { ...DEFAULT_USER, ...user } })
    );
  }

  function logout() {
    sessionStorage.removeItem(STORAGE_KEY);
  }

  function getCurrentPage() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    return path;
  }

  function getActiveNavId() {
    const page = getCurrentPage();
    const params = new URLSearchParams(window.location.search);

    if (page === 'provider-account.html') return 'provider-account';
    if (
      page === 'provider-resources.html'
      || page === 'provider-resource-detail.html'
      || page === 'provider-add-listing.html'
      || page === 'provider-add-listings-bulk.html'
    ) return 'provider-services';
    if (page === 'admin-dashboard.html') return 'admin-dashboard';
    if (page === 'dashboard.html') return 'dashboard';
    if (page === 'compass.html') return 'compass';
    if (page === 'security.html') return 'account';
    if (page === 'results.html') {
      return getUser().role === 'provider' ? 'provider-search' : 'search';
    }
    if (page === 'profile-builder.html' && params.get('mode') === 'universal') return 'profile';
    return null;
  }

  function getNavItemsForRole(role) {
    if (role === 'provider') return PROVIDER_NAV_ITEMS;
    if (role === 'admin') return ADMIN_NAV_ITEMS;
    return STUDENT_NAV_ITEMS;
  }

  function renderUserNav(activeId) {
    const tabs = getNavItemsForRole(getUser().role).map((item) => {
      const isActive = item.id === activeId;
      return `
        <a href="${item.href}" class="user-nav__tab${isActive ? ' is-active' : ''}"${isActive ? ' aria-current="page"' : ''}>
          <span class="user-nav__icon">${item.icon}</span>
          <span class="user-nav__label">${item.label}</span>
        </a>`;
    }).join('');

    return `<nav class="user-nav" aria-label="Account navigation"><div class="user-nav__inner">${tabs}</div></nav>`;
  }

  function renderLoggedInActions(user) {
    const dashboardHref = user.role === 'provider'
      ? 'provider-resources.html'
      : user.role === 'admin'
        ? 'admin-dashboard.html'
        : 'dashboard.html';
    const dashboardLabel = user.role === 'provider'
      ? 'Provider Portal'
      : user.role === 'admin'
        ? 'Admin Dashboard'
        : 'My Dashboard';

    return `
      <button type="button" class="header-search-btn js-open-search" aria-label="Search">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
          <circle cx="9.5" cy="9.5" r="6.5" stroke="currentColor" stroke-width="2"/>
          <path d="M14.5 14.5L20 20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
      <div class="user-menu">
        <button type="button" class="user-avatar" id="userAvatarBtn" aria-haspopup="true" aria-expanded="false" aria-label="Account menu">
          <span class="user-avatar__initials">${user.initials}</span>
        </button>
        <div class="user-menu__dropdown" id="userMenuDropdown" hidden>
          <a href="${dashboardHref}" class="user-menu__item">${dashboardLabel}</a>
          <a href="index.html" class="user-menu__item user-menu__item--logout js-logout">Log Out</a>
        </div>
      </div>`;
  }

  function renderLoggedOutActions() {
    return '<a href="#" class="btn-login js-login">Log In</a>';
  }

  function renderHelpPromptCard() {
    return `
      <h2 class="builder-help-card__title">Need Assistance?</h2>
      <p class="builder-help-card__text">Have a question or need guidance? Connect with a Questa staff member who can help.</p>
      <a href="https://www.questafoundation.org/contact" class="builder-help-card__btn" target="_blank" rel="noopener noreferrer">Get Help</a>`;
  }

  function renderLoginPromptCard() {
    return `
      <div class="builder-login-card__icon-wrap" aria-hidden="true">
        <svg class="builder-login-card__icon" width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="6" y="8" width="24" height="20" rx="3" stroke="currentColor" stroke-width="2"></rect>
                                <circle cx="18" cy="16" r="4" stroke="currentColor" stroke-width="2"></circle>
                                <path d="M12 24c0-2.2 2.7-4 6-4s6 1.8 6 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
                            </svg>
      </div>
      <h2 class="builder-login-card__title">Keep Your Progress</h2>
      <ul class="builder-login-card__list">
        <li><span class="builder-login-card__check" aria-hidden="true">&#10003;</span><span>Save your preferences</span></li>
        <li><span class="builder-login-card__check" aria-hidden="true">&#10003;</span><span>Favorite specific opportunities</span></li>
        <li><span class="builder-login-card__check" aria-hidden="true">&#10003;</span><span>Get notified of new opportunities that match your needs.</span></li>
      </ul>
      <a href="#" class="builder-login-card__btn js-login">Log In</a>
      <p class="builder-login-card__footer">Or, <button class="builder-login-card__link js-create-account" type="button">Create your Free Account</button></p>`;
  }

  function updateAuthPromptCards() {
    document.querySelectorAll('[data-auth-prompt]').forEach((card) => {
      const extraClass = card.dataset.authPromptClass || '';
      const baseClass = isLoggedIn() ? 'builder-help-card' : 'builder-login-card';
      card.className = [baseClass, extraClass].filter(Boolean).join(' ');
      card.innerHTML = isLoggedIn() ? renderHelpPromptCard() : renderLoginPromptCard();
    });
  }

  function updateHeader() {
    const actions = document.querySelector('.site-header__actions');
    if (!actions) return;

    const langBtn = actions.querySelector('.language-btn');
    const createAccountBtn = actions.querySelector('.js-create-account');
    const loggedIn = isLoggedIn();
    const user = getUser();

    actions.querySelectorAll('.js-login, .header-search-btn, .user-menu').forEach((el) => {
      el.remove();
    });

    const staticProviderLink = actions.querySelector('.js-provider-static');
    if (loggedIn && staticProviderLink) {
      staticProviderLink.remove();
    }

    if (!loggedIn && staticProviderLink) {
      document.body.classList.toggle('is-logged-in', false);
      applyLoggedInPageLayout();
      return;
    }

    const fragment = document.createDocumentFragment();
    const temp = document.createElement('div');
    temp.innerHTML = loggedIn ? renderLoggedInActions(user) : renderLoggedOutActions();
    while (temp.firstChild) fragment.appendChild(temp.firstChild);

    if (createAccountBtn) {
      actions.insertBefore(fragment, createAccountBtn);
      createAccountBtn.hidden = loggedIn;
    } else {
      actions.appendChild(fragment);
    }

    document.body.classList.toggle('is-logged-in', loggedIn);
    applyLoggedInPageLayout();
    updateAuthPromptCards();

    if (loggedIn) {
      bindUserMenu();
    }
  }

  function applyLoggedInPageLayout() {
    const loggedIn = isLoggedIn();
    const page = getCurrentPage();
    const params = new URLSearchParams(window.location.search);
    const isLoggedInProfile =
      loggedIn && page === 'profile-builder.html' && params.get('mode') === 'universal';
    const isLoggedInSearch = loggedIn && page === 'results.html';

    const profileHero = document.getElementById('profilePortalHero');
    if (profileHero) profileHero.hidden = !isLoggedInProfile;

    const backLink = document.querySelector('.builder-back');
    const intro = document.querySelector('.builder-intro');
    const breadcrumbs = document.querySelector('.site-breadcrumbs');
    const searchBanner = document.querySelector('.results-search-banner');

    if (isLoggedInProfile) {
      if (backLink) backLink.hidden = true;
      if (intro) intro.hidden = true;
    } else if (page === 'profile-builder.html' && params.get('mode') === 'universal') {
      if (backLink) backLink.hidden = false;
      if (intro) intro.hidden = false;
    }

    if (isLoggedInSearch) {
      breadcrumbs?.setAttribute('hidden', '');
      searchBanner?.setAttribute('hidden', '');
    } else if (page === 'results.html') {
      breadcrumbs?.removeAttribute('hidden');
      searchBanner?.removeAttribute('hidden');
    }
  }

  function handleLogout(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    logout();

    const page = getCurrentPage();
    if (PROTECTED_PAGES.includes(page)) {
      window.location.assign('index.html');
      return;
    }

    updateHeader();
    injectUserNav();
    applyLoggedInPageLayout();
  }

  function bindUserMenu() {
    const btn = document.getElementById('userAvatarBtn');
    const menu = document.getElementById('userMenuDropdown');
    if (!btn || !menu || btn.dataset.menuBound) return;
    btn.dataset.menuBound = '1';

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = !menu.hidden;
      menu.hidden = open;
      btn.setAttribute('aria-expanded', String(!open));
    });

    document.addEventListener('click', () => {
      menu.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
    });

    menu.addEventListener('click', (e) => e.stopPropagation());
  }

  function injectUserNav() {
    const mount = document.querySelector('[data-user-nav]');
    if (!mount) return;

    if (!isLoggedIn()) {
      mount.innerHTML = '';
      return;
    }

    const activeId = mount.dataset.activeNav || getActiveNavId();
    mount.innerHTML = renderUserNav(activeId);
  }

  function bindLoginTriggers() {
    document.addEventListener('click', (e) => {
      const loginBtn = e.target.closest('.js-login');
      if (!loginBtn || loginBtn.classList.contains('js-create-account')) return;

      e.preventDefault();
      login();
      window.location.assign('dashboard.html');
    });
  }

  function bindLogout() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.js-logout');
      if (!btn) return;
      handleLogout(e);
    }, true);
  }

  function getDefaultSearchTopic() {
    if (typeof CompassProfile !== 'undefined') {
      return CompassProfile.getProfile().topic || 'funding';
    }
    return 'funding';
  }

  function renderSearchModal() {
    return `
      <div class="builder-modal search-modal" id="headerSearchModal" hidden>
        <div class="builder-modal__backdrop js-close-search"></div>
        <div class="builder-modal__panel search-modal__panel" role="dialog" aria-labelledby="headerSearchTitle">
          <button type="button" class="builder-modal__close js-close-search" aria-label="Close">&times;</button>
          <h2 class="search-modal__title" id="headerSearchTitle">Already know what you&apos;re looking for?</h2>
          <p class="search-modal__text">Search for keywords below.</p>
          <form class="search-modal__form" id="headerSearchForm">
            <label class="search-modal__field">
              <input type="search" class="search-modal__input" id="headerSearchInput" placeholder="Search Keywords" autocomplete="off">
              <span class="search-modal__icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" stroke-width="1.75"/>
                  <path d="M13 13l4 4" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
                </svg>
              </span>
            </label>
          </form>
        </div>
      </div>`;
  }

  function injectSearchModal() {
    if (document.getElementById('headerSearchModal')) return;
    document.body.insertAdjacentHTML('beforeend', renderSearchModal());
  }

  function openSearchModal() {
    const modal = document.getElementById('headerSearchModal');
    const input = document.getElementById('headerSearchInput');
    if (!modal || !input) return;
    modal.hidden = false;
    input.value = '';
    input.focus();
  }

  function closeSearchModal() {
    const modal = document.getElementById('headerSearchModal');
    if (modal) modal.hidden = true;
  }

  function submitHeaderSearch() {
    const input = document.getElementById('headerSearchInput');
    const keyword = input?.value.trim() || '';
    const topic = getDefaultSearchTopic();
    const url = keyword
      ? `results.html?topic=${encodeURIComponent(topic)}&q=${encodeURIComponent(keyword)}`
      : `results.html?topic=${encodeURIComponent(topic)}`;
    window.location.assign(url);
  }

  function bindSearchModal() {
    if (document.body.dataset.searchModalBound) return;
    document.body.dataset.searchModalBound = '1';

    document.addEventListener('click', (e) => {
      if (e.target.closest('.js-open-search')) {
        e.preventDefault();
        openSearchModal();
      }
      if (e.target.closest('.js-close-search')) {
        closeSearchModal();
      }
    });

    document.getElementById('headerSearchForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      submitHeaderSearch();
    });

    document.addEventListener('keydown', (e) => {
      const modal = document.getElementById('headerSearchModal');
      if (e.key === 'Escape' && modal && !modal.hidden) {
        closeSearchModal();
      }
    });
  }

  function guardProtectedPages() {
    const page = getCurrentPage();
    if (PROTECTED_PAGES.includes(page) && !isLoggedIn()) {
      window.location.replace('index.html');
    }
  }

  function init() {
    guardProtectedPages();
    injectSearchModal();
    bindSearchModal();
    updateHeader();
    injectUserNav();
    bindLoginTriggers();
    bindLogout();
  }

  global.CompassAuth = { isLoggedIn, login, logout, getUser, init };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window);
