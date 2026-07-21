(function () {
  const { TOPICS, TOPIC_INTEREST_LABELS, getProfile } = CompassProfile;
  const { getOpportunity } = CompassResults;

  const params = new URLSearchParams(window.location.search);
  const topicKey = params.get('topic') || getProfile().topic || 'careers';
  const oppId = params.get('id') || '1';
  const returnUrl = params.get('returnUrl') || `results.html?topic=${encodeURIComponent(topicKey)}`;
  const opp = getOpportunity(oppId);
  const LOGO_PLACEHOLDER = 'assets/logo-circle.svg';

  const CONTACT_ICONS = {
    address: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11z" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="10" r="2.5" stroke="currentColor" stroke-width="2"/></svg>',
    phone: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6.5 4h3l1.5 5-2 1.5a13 13 0 0 0 5 5L15.5 13 20.5 14.5V18a2 2 0 0 1-2 2A16 16 0 0 1 4 6.5 2 2 0 0 1 6.5 4z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
    email: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" stroke-width="2"/><path d="M3 7l9 6 9-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    website: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" stroke="currentColor" stroke-width="2"/></svg>',
    hours: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><path d="M12 7v5l3 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  };

  function topicLabel(key) {
    return TOPIC_INTEREST_LABELS[key] || TOPICS[key]?.title.replace(/^Find\s+/i, '') || key;
  }

  function renderHeroLogo() {
    const heroIcon = document.getElementById('detailHeroIcon');
    const heroLogo = document.getElementById('detailHeroLogo');
    if (!heroIcon || !heroLogo) return;

    const hasLogo = !!opp.logoUrl;
    heroLogo.src = opp.logoUrl || LOGO_PLACEHOLDER;
    heroLogo.alt = opp.providerName ? `${opp.providerName} logo` : 'Resource provider';
    heroIcon.classList.toggle('detail-hero__icon--placeholder', !hasLogo);
  }

  function renderTopicPills() {
    const root = document.getElementById('detailTopicPills');
    if (!root || !opp.topics?.length) return;

    root.innerHTML = `
      <ul class="detail-topic-pills" aria-label="Resource topics">
        ${opp.topics
          .filter((key) => key !== 'funding' && TOPICS[key])
          .map((key) => `<li class="detail-topic-pill">${topicLabel(key)}</li>`)
          .join('')}
      </ul>`;
  }

  function isPhysicalAddress(address) {
    if (!address?.trim()) return false;
    const normalized = address.trim().toLowerCase();
    if (/^(online|virtual|remote|n\/a|none|varies)$/i.test(normalized)) return false;
    return !/(online only|virtual only|remote only|no physical)/i.test(normalized);
  }

  function mapsDirectionsUrl(address) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  }

  function renderContactSection() {
    const root = document.getElementById('detailContact');
    const contact = opp.contact || {};
    if (!root) return;

    const items = [
      {
        key: 'address',
        label: 'Address',
        value: contact.address,
        href: isPhysicalAddress(contact.address) ? mapsDirectionsUrl(contact.address) : null,
      },
      { key: 'phone', label: 'Phone', value: contact.phone, href: contact.phone ? `tel:${contact.phone.replace(/[^\d+]/g, '')}` : null },
      { key: 'email', label: 'Email', value: contact.email, href: contact.email ? `mailto:${contact.email}` : null },
      { key: 'website', label: 'Website', value: contact.website?.replace(/^https?:\/\//, ''), href: contact.website },
      { key: 'hours', label: 'Hours', value: contact.hours },
    ].filter((item) => item.value);

    root.innerHTML = items
      .map((item) => {
        const valueHtml = item.href
          ? `<a href="${item.href}" class="detail-contact__link"${item.key === 'website' || item.key === 'address' ? ' target="_blank" rel="noopener noreferrer"' : ''}>${item.value}</a>`
          : `<span>${item.value}</span>`;
        return `
          <li class="detail-contact__item">
            <span class="detail-contact__icon">${CONTACT_ICONS[item.key]}</span>
            <div class="detail-contact__body">
              <span class="detail-contact__label">${item.label}</span>
              ${valueHtml}
            </div>
          </li>`;
      })
      .join('');
  }

  function renderMap() {
    const container = document.getElementById('detailMap');
    const iframe = document.getElementById('detailMapEmbed');
    const address = opp.contact?.address?.trim();
    if (!container || !iframe || !isPhysicalAddress(address)) return;

    iframe.src = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
    container.hidden = false;
  }

  document.title = `Compass — ${opp.title}`;
  renderHeroLogo();
  renderTopicPills();
  document.getElementById('detailTitle').textContent = opp.title;
  document.getElementById('detailDescription').textContent = opp.description;
  document.getElementById('detailProgramType').textContent = opp.programType || '—';
  document.getElementById('detailLocation').textContent = opp.location || '—';

  document.getElementById('detailEligibility').innerHTML = (opp.eligibility || [])
    .map((level) => `<span class="detail-eligibility__tag">${level}</span>`)
    .join('');

  renderContactSection();
  renderMap();

  const websiteBtn = document.getElementById('detailWebsiteBtn');
  if (websiteBtn) {
    if (opp.contact?.website) {
      websiteBtn.href = opp.contact.website;
    } else {
      websiteBtn.hidden = true;
    }
  }

  const providerSection = document.getElementById('providerOwnershipSection');
  const providerText = document.getElementById('providerOwnershipText');
  const unclaimedCallout = document.getElementById('unclaimedListingCallout');
  const claimBtn = document.getElementById('claimListingBtn');
  const isProvider = typeof CompassAuth !== 'undefined'
    && CompassAuth.isLoggedIn()
    && CompassAuth.getUser().role === 'provider';

  // Always show the claim CTA so new providers are prompted to create an account.
  if (unclaimedCallout) unclaimedCallout.hidden = false;

  if (opp.providerApprovalStatus !== 'unclaimed' && opp.providerName) {
    providerSection.hidden = false;
    providerText.textContent = `Managed by ${opp.providerName}. Listing approved by the Compass Committee.`;
  }

  document.getElementById('backLinkBottom').href = returnUrl;

  const favoriteBtn = document.getElementById('detailFavoriteBtn');
  function syncFavoriteButton(active) {
    favoriteBtn.classList.toggle('is-active', active);
    favoriteBtn.setAttribute('aria-pressed', String(active));
    favoriteBtn.setAttribute('aria-label', active ? 'Remove from favorites' : 'Save to favorites');
    favoriteBtn.querySelector('.favorite-btn__label').textContent = active ? 'Saved' : 'Save';
  }

  syncFavoriteButton(CompassFavorites.isFavorite(oppId));
  favoriteBtn.addEventListener('click', () => {
    syncFavoriteButton(CompassFavorites.toggleFavorite(oppId));
  });

  const claimModal = document.getElementById('claimListingModal');
  const claimModalIntro = document.getElementById('claimModalIntro');
  const claimModalSuccess = document.getElementById('claimModalSuccess');
  const claimCalloutBtn = document.getElementById('claimListingCalloutBtn');

  function resetClaimModal() {
    claimModalIntro.hidden = false;
    claimModalSuccess.hidden = true;
  }

  function openClaimModal() {
    document.getElementById('claimListingIntro').textContent =
      `Review the claim process for “${opp.title}” before submitting your request.`;
    resetClaimModal();
    claimModal.hidden = false;
  }

  function closeClaimModal() {
    claimModal.hidden = true;
    resetClaimModal();
  }

  if (claimCalloutBtn) {
    claimCalloutBtn.addEventListener('click', openClaimModal);
  }
  if (claimBtn) {
    claimBtn.addEventListener('click', openClaimModal);
  }

  document.querySelectorAll('.js-close-claim').forEach((el) => {
    el.addEventListener('click', closeClaimModal);
  });

  document.getElementById('submitClaimBtn').addEventListener('click', () => {
    if (isProvider) {
      claimModalIntro.hidden = true;
      claimModalSuccess.hidden = false;
      return;
    }
    window.location.assign('provider-create-account.html');
  });

  const createAccountModal = document.getElementById('createAccountModal');
  document.querySelectorAll('.js-create-account').forEach((btn) => {
    btn.addEventListener('click', () => { createAccountModal.hidden = false; });
  });
  document.querySelectorAll('.js-close-account').forEach((el) => {
    el.addEventListener('click', () => { createAccountModal.hidden = true; });
  });
  document.getElementById('accountSubmitBtn').addEventListener('click', () => {
    createAccountModal.hidden = true;
    alert('Account created! (prototype demo)');
  });
})();
