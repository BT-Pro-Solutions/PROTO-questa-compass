(function (global) {
  const STORAGE_KEY = 'compass-session';
  const DEFAULT_USER = { initials: 'KT', firstName: 'Kevin', lastName: 'Test' };

  const USER_NAV_ITEMS = [
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
      label: 'Search',
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

  const PROTECTED_PAGES = ['dashboard.html', 'security.html', 'compass.html'];

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
    return getSession()?.user || DEFAULT_USER;
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

    if (page === 'dashboard.html') return 'dashboard';
    if (page === 'compass.html') return 'compass';
    if (page === 'security.html') return 'account';
    if (page === 'results.html') return 'search';
    if (page === 'profile-builder.html' && params.get('mode') === 'universal') return 'profile';
    return null;
  }

  function renderUserNav(activeId) {
    const tabs = USER_NAV_ITEMS.map((item) => {
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
    return `
      <a href="results.html" class="header-search-btn" aria-label="Search">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
          <circle cx="9.5" cy="9.5" r="6.5" stroke="currentColor" stroke-width="2"/>
          <path d="M14.5 14.5L20 20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </a>
      <div class="user-menu">
        <button type="button" class="user-avatar" id="userAvatarBtn" aria-haspopup="true" aria-expanded="false" aria-label="Account menu">
          <span class="user-avatar__initials">${user.initials}</span>
        </button>
        <div class="user-menu__dropdown" id="userMenuDropdown" hidden>
          <a href="dashboard.html" class="user-menu__item">My Dashboard</a>
          <a href="index.html" class="user-menu__item user-menu__item--logout js-logout">Log Out</a>
        </div>
      </div>`;
  }

  function renderLoggedOutActions() {
    return '<a href="#" class="btn-login js-login">Log In</a>';
  }

  function updateHeader() {
    const actions = document.querySelector('.site-header__actions');
    if (!actions) return;

    const langBtn = actions.querySelector('.language-btn');
    const createAccountBtn = actions.querySelector('.js-create-account');
    const loggedIn = isLoggedIn();
    const user = getUser();

    actions.querySelectorAll('.js-login, .btn-login:not(.js-create-account), .header-search-btn, .user-menu').forEach((el) => {
      el.remove();
    });

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
      const loginBtn = e.target.closest('.js-login, a.btn-login:not(.js-create-account)');
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

  function guardProtectedPages() {
    const page = getCurrentPage();
    if (PROTECTED_PAGES.includes(page) && !isLoggedIn()) {
      window.location.replace('index.html');
    }
  }

  function init() {
    guardProtectedPages();
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
