(function () {
  const AGREEMENT_STORAGE_KEY = 'compass-provider-agreement';
  const flashEl = document.getElementById('providerFlash');
  const agreementPanel = document.getElementById('agreementPanel');
  const joinOrgPanel = document.getElementById('joinOrgPanel');
  const joinSuccessPanel = document.getElementById('joinSuccessPanel');

  const JOIN_AUTH_PROFILE = {
    firstName: 'Riley',
    lastName: 'Chen',
    email: 'riley.chen@example.com',
  };

  function showFlash(message) {
    if (!flashEl || !message) return;
    flashEl.hidden = false;
    flashEl.textContent = message;
  }

  function getInitials(firstName, lastName) {
    const a = (firstName || '').trim().charAt(0);
    const b = (lastName || '').trim().charAt(0);
    return ((a + b) || 'P').toUpperCase();
  }

  function readAgreementFields() {
    const form = document.getElementById('compassAgreementForm');
    if (!form) return null;

    const value = (name) => form.elements[name]?.value?.trim() || '';
    const multi = (typeof CompassProviderAddListingForm !== 'undefined'
      && CompassProviderAddListingForm.getFormData)
      ? CompassProviderAddListingForm.getFormData()
      : {};

    return {
      primaryCategories: multi.primaryCategories || [],
      contactFirstName: value('contactFirstName'),
      contactLastName: value('contactLastName'),
      contactEmail: value('contactEmail'),
      contactTitle: value('contactTitle'),
      organization: value('organization'),
      authorizedSignature: value('authorizedSignature'),
      dateMonth: value('dateMonth'),
      dateDay: value('dateDay'),
      dateYear: value('dateYear'),
      agreementSigned: !!form.elements.agreementCommitment?.checked,
    };
  }

  function saveAgreementDraft(data) {
    try {
      sessionStorage.setItem(AGREEMENT_STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* ignore quota / private mode */
    }
  }

  function showJoinPanel(org) {
    agreementPanel.hidden = true;
    joinSuccessPanel.hidden = true;
    joinOrgPanel.hidden = false;
    document.querySelector('.portal-hero__title').textContent = 'Join Organization';
    document.querySelector('.portal-hero__subtitle').textContent =
      'Request access to an organization that already participates in Compass.';
    document.getElementById('joinOrgDesc').textContent =
      `You’re requesting to join ${org.name}. This organization already signed the Compass Agreement — an owner will approve your access.`;
    document.getElementById('joinOrgCard').innerHTML = `
      <article class="provider-org-result provider-org-result--selected">
        <div class="provider-org-result__main">
          <h3 class="provider-org-result__name">${org.name}</h3>
          <p class="provider-org-result__meta">${org.type} · ${org.location} · ${org.listingsCount} listings</p>
        </div>
      </article>`;

    document.getElementById('joinOrgSubmitBtn').onclick = () => {
      CompassProviderOrgs.addJoinRequest(org.id, {
        firstName: JOIN_AUTH_PROFILE.firstName,
        lastName: JOIN_AUTH_PROFILE.lastName,
        email: JOIN_AUTH_PROFILE.email,
        message: '',
      });

      CompassAuth.login({
        initials: getInitials(JOIN_AUTH_PROFILE.firstName, JOIN_AUTH_PROFILE.lastName),
        firstName: JOIN_AUTH_PROFILE.firstName,
        lastName: JOIN_AUTH_PROFILE.lastName,
        email: JOIN_AUTH_PROFILE.email,
        role: 'provider',
        orgRole: 'member',
        organizationId: org.id,
        organizationName: org.name,
      });

      sessionStorage.setItem(
        'compass-flash',
        `Welcome! Your request to join ${org.name} is pending owner approval.`
      );
      window.location.assign('provider-account.html');
    };
  }

  document.getElementById('agreementSubmitBtn')?.addEventListener('click', () => {
    const data = readAgreementFields();
    if (!data) return;

    // Prototype: fill gaps so Continue always proceeds
    const firstName = data.contactFirstName || 'Alex';
    const lastName = data.contactLastName || 'Provider';
    const email = data.contactEmail || 'alex@brightfutures.org';
    const orgName = data.organization || 'New Provider Organization';
    const orgId = `org-${Date.now()}`;

    saveAgreementDraft({
      ...data,
      contactFirstName: firstName,
      contactLastName: lastName,
      contactEmail: email,
      organization: orgName,
      agreementSigned: true,
    });

    CompassAuth.login({
      initials: getInitials(firstName, lastName),
      firstName,
      lastName,
      email,
      role: 'provider',
      orgRole: 'owner',
      organizationId: orgId,
      organizationName: orgName,
      agreementSigned: true,
    });

    sessionStorage.setItem(
      'compass-flash',
      `${orgName} created. Agreement signed — welcome to your provider account.`
    );
    window.location.assign('provider-account.html');
  });

  const params = new URLSearchParams(window.location.search);

  if (params.get('status') === 'joined') {
    agreementPanel.hidden = true;
    joinOrgPanel.hidden = true;
    joinSuccessPanel.hidden = false;
    document.querySelector('.portal-hero__title').textContent = 'Join Request Sent';
    document.querySelector('.portal-hero__subtitle').textContent =
      'An organization owner can approve you from the Account page.';
    const flash = CompassAuth.consumeFlashMessage();
    if (flash) {
      document.getElementById('joinSuccessText').textContent =
        `${flash} An organization owner can approve you from the Account page.`;
    }
  } else if (params.get('join')) {
    const org = CompassProviderOrgs.getOrganization(params.get('join'));
    if (org) {
      showJoinPanel(org);
    } else {
      showFlash('That invite link is invalid or expired. You can still sign the Compass Agreement to create a new organization.');
      CompassProviderAddListingForm.init({ mode: 'agreement' });
    }
  } else {
    CompassProviderAddListingForm.init({ mode: 'agreement' });
    const flash = CompassAuth.consumeFlashMessage();
    showFlash(flash);
  }
})();
