(function () {
  const searchInput = document.getElementById('orgSearchInput');
  const resultsEl = document.getElementById('orgSearchResults');
  const statusEl = document.getElementById('orgSearchStatus');
  const createNewBtn = document.getElementById('createNewOrgBtn');
  const selectedOrgCard = document.getElementById('selectedOrgCard');
  const flashEl = document.getElementById('providerFlash');

  let selectedOrg = null;
  let searchTimer = null;

  // Simulated identity returned from account creation (not collected in Compass)
  const JOIN_AUTH_PROFILE = {
    firstName: 'Riley',
    lastName: 'Chen',
    email: 'riley.chen@example.com',
  };

  const CREATE_AUTH_PROFILE = {
    initials: 'AP',
    firstName: 'Alex',
    lastName: 'Provider',
    email: 'alex@brightfutures.org',
  };

  function showFlash(message) {
    if (!flashEl || !message) return;
    flashEl.hidden = false;
    flashEl.textContent = message;
  }

  function showStep(step) {
    document.querySelectorAll('[data-signup-step]').forEach((el) => {
      el.hidden = el.dataset.signupStep !== step;
    });
  }

  function hideNoMatchButton() {
    createNewBtn.hidden = true;
  }

  function showNoMatchButton() {
    createNewBtn.hidden = false;
  }

  function renderOrgCard(org, { selectable = false } = {}) {
    return `
      <article class="provider-org-result${selectable ? '' : ' provider-org-result--selected'}">
        <div class="provider-org-result__main">
          <h3 class="provider-org-result__name">${org.name}</h3>
          <p class="provider-org-result__meta">${org.type} · ${org.location} · ${org.listingsCount} listings</p>
        </div>
        ${selectable ? `<button type="button" class="builder-btn builder-btn--secondary provider-org-result__btn" data-select-org="${org.id}">Select</button>` : ''}
      </article>`;
  }

  function renderResults(query) {
    const q = query.trim();
    if (q.length < 2) {
      resultsEl.hidden = true;
      resultsEl.innerHTML = '';
      statusEl.textContent = 'Type at least 2 characters to search.';
      hideNoMatchButton();
      return;
    }

    statusEl.textContent = 'Searching existing providers…';

    window.setTimeout(() => {
      const matches = CompassProviderOrgs.searchOrganizations(q);
      showNoMatchButton();

      if (!matches.length) {
        resultsEl.hidden = false;
        resultsEl.innerHTML = `
          <div class="provider-org-empty">
            <p>No existing organizations matched “${q}”.</p>
            <p>You can set up a new organization and become its owner.</p>
          </div>`;
        statusEl.textContent = 'No matches found.';
        return;
      }

      statusEl.textContent = `${matches.length} possible match${matches.length === 1 ? '' : 'es'} found.`;
      resultsEl.hidden = false;
      resultsEl.innerHTML = matches.map((org) => renderOrgCard(org, { selectable: true })).join('');
    }, 280);
  }

  function openJoinStep(org) {
    selectedOrg = org;
    selectedOrgCard.innerHTML = renderOrgCard(org);
    showStep('join');
  }

  function openCreateStep(prefName) {
    selectedOrg = null;
    if (prefName) {
      document.getElementById('createOrgName').value = prefName;
    }
    showStep('create');
  }

  searchInput.addEventListener('input', () => {
    window.clearTimeout(searchTimer);
    searchTimer = window.setTimeout(() => renderResults(searchInput.value), 180);
  });

  resultsEl.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-select-org]');
    if (!btn) return;
    const org = CompassProviderOrgs.getOrganization(btn.dataset.selectOrg);
    if (org) openJoinStep(org);
  });

  createNewBtn.addEventListener('click', () => {
    openCreateStep(searchInput.value.trim());
  });

  document.querySelectorAll('.js-signup-back').forEach((btn) => {
    btn.addEventListener('click', () => showStep('search'));
  });

  document.getElementById('submitJoinBtn').addEventListener('click', () => {
    if (!selectedOrg) return;

    CompassAuth.startKeycloakAuth({
      intent: 'register',
      returnTo: 'provider-create-account.html?status=joined',
      cancelTo: 'provider-create-account.html',
      user: null,
      joinRequest: {
        organizationId: selectedOrg.id,
        firstName: JOIN_AUTH_PROFILE.firstName,
        lastName: JOIN_AUTH_PROFILE.lastName,
        email: JOIN_AUTH_PROFILE.email,
        message: '',
      },
      flashMessage: `Join request sent to ${selectedOrg.name}.`,
    });
  });

  document.getElementById('submitCreateBtn').addEventListener('click', () => {
    const orgName = document.getElementById('createOrgName').value.trim() || 'New Provider Organization';
    const orgId = `org-${Date.now()}`;

    CompassAuth.startKeycloakAuth({
      intent: 'register',
      returnTo: 'provider-resources.html',
      cancelTo: 'provider-create-account.html',
      user: {
        ...CREATE_AUTH_PROFILE,
        role: 'provider',
        orgRole: 'owner',
        organizationId: orgId,
        organizationName: orgName,
      },
      flashMessage: `${orgName} created. You are the organization owner.`,
    });
  });

  hideNoMatchButton();

  const params = new URLSearchParams(window.location.search);
  if (params.get('status') === 'joined') {
    showStep('joined');
    const flash = CompassAuth.consumeFlashMessage();
    if (flash) {
      document.getElementById('joinSuccessText').textContent =
        `${flash} An organization owner can approve you from the Account page.`;
    }
  } else {
    const flash = CompassAuth.consumeFlashMessage();
    showFlash(flash);
  }
})();
