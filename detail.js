(function () {
  const { TOPICS, getProfile } = CompassProfile;
  const { getTopicResultsConfig, getOpportunity } = CompassResults;

  const params = new URLSearchParams(window.location.search);
  const topicKey = params.get('topic') || getProfile().topic || 'funding';
  const topic = TOPICS[topicKey] || TOPICS.funding;
  const config = getTopicResultsConfig(topicKey);
  const oppId = params.get('id') || '1';
  const returnUrl = params.get('returnUrl') || `results.html?topic=${encodeURIComponent(topicKey)}`;
  const opp = getOpportunity(oppId);

  function matchLabel(match) {
    if (match === 'strong') return 'Strong Match';
    if (match === 'fair') return 'Fair Match';
    return 'Some Match';
  }

  const detailLabels = {
    funding: 'Funding Opportunity Details',
    careers: 'Career Resource Details',
    'education-help': 'Education Resource Details',
    'learning-help': 'Learning Resource Details',
    'education-training': 'Training Program Details',
    'personal-help': 'Personal Support Details',
  };

  document.title = `Compass — ${opp.title}`;
  document.getElementById('detailTitle').textContent = opp.title;
  document.getElementById('detailSubtitle').textContent = detailLabels[topicKey] || 'Resource Details';
  document.getElementById('detailAmount').textContent = opp.amount;
  document.getElementById('detailType').textContent = opp.type;
  document.getElementById('detailDescription').textContent = opp.description;

  const statusEl = document.getElementById('detailStatus');
  if (opp.status === 'open') {
    statusEl.textContent = 'Open';
    statusEl.className = 'detail-card__status detail-card__status--open';
  } else {
    statusEl.textContent = 'Closed';
    statusEl.className = 'detail-card__status detail-card__status--closed';
  }

  document.getElementById('detailEligibility').innerHTML = opp.eligibility
    .map((level) => `<li>${level}</li>`)
    .join('');

  const matchEl = document.getElementById('detailMatch');
  if (config.showMatchStrength) {
    matchEl.hidden = false;
    matchEl.textContent = matchLabel(opp.match);
    matchEl.className = `detail-match detail-match--${opp.match}`;
  }

  document.getElementById('backLink').href = returnUrl;
  document.getElementById('backLinkBottom').href = returnUrl;

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
