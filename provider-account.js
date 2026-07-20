(function () {
  const user = CompassAuth.getUser();
  const orgId = user.organizationId || 'bright-futures';
  const isOwner = CompassAuth.isProviderOwner();

  const flashEl = document.getElementById('providerFlash');
  const memberList = document.getElementById('memberList');
  const requestList = document.getElementById('joinRequestList');
  const requestsSection = document.getElementById('joinRequestsSection');
  const inviteLinkPanel = document.getElementById('inviteLinkPanel');
  const inviteLinkInput = document.getElementById('inviteLinkInput');
  const roleBanner = document.getElementById('accountRoleBanner');

  function showFlash(message) {
    if (!flashEl || !message) return;
    flashEl.hidden = false;
    flashEl.textContent = message;
  }

  function roleLabel(role) {
    return role === 'owner' ? 'Owner' : 'Member';
  }

  function getInviteLink() {
    return new URL('provider-create-account.html', window.location.href).href;
  }

  function hydrateAccountFields() {
    const org = CompassProviderOrgs.getOrganization(orgId);
    document.getElementById('accountOrgName').value = user.organizationName || org?.name || 'Provider Organization';
    document.getElementById('accountOrgRole').value = roleLabel(user.orgRole || 'member');
    document.getElementById('accountContactName').value = `${user.firstName} ${user.lastName}`.trim();
    document.getElementById('accountEmail').value = user.email || '';
    document.getElementById('accountHeroSubtitle').textContent = isOwner
      ? 'As an owner you can manage organization details, teammates, and join requests.'
      : 'You can manage listings for this organization. Only owners can change team access.';

    roleBanner.innerHTML = isOwner
      ? `<p class="provider-role-banner provider-role-banner--owner"><strong>Owner access.</strong> You can approve join requests, change roles, and remove users. All teammates can manage listings.</p>`
      : `<p class="provider-role-banner"><strong>Member access.</strong> You can manage listings, but you cannot approve join requests or change team access.</p>`;

    if (isOwner) {
      requestsSection.hidden = false;
      inviteLinkPanel.hidden = false;
      inviteLinkInput.value = getInviteLink();
    } else {
      document.getElementById('teamSectionDesc').textContent =
        'Your organization team is listed below. Contact an owner if you need a role change.';
    }
  }

  function renderMembers() {
    const members = CompassProviderOrgs.getMembers(orgId);
    if (!members.length) {
      memberList.innerHTML = '<p class="provider-empty-state">No team members yet.</p>';
      return;
    }

    memberList.innerHTML = members.map((member) => {
      const isSelf = member.email && user.email && member.email === user.email;
      const actions = isOwner
        ? `
          <div class="provider-member-card__actions">
            <label class="provider-inline-field">
              <span class="visually-hidden">Role for ${member.firstName}</span>
              <select class="builder-input provider-role-select" data-member-role="${member.id}" ${isSelf ? 'disabled' : ''}>
                <option value="member"${member.role === 'member' ? ' selected' : ''}>Member</option>
                <option value="owner"${member.role === 'owner' ? ' selected' : ''}>Owner</option>
              </select>
            </label>
            ${isSelf
              ? ''
              : `<button type="button" class="builder-btn builder-btn--cancel provider-member-remove" data-remove-member="${member.id}">Remove</button>`}
          </div>`
        : `<span class="provider-role-pill">${roleLabel(member.role)}${isSelf ? ' · You' : ''}</span>`;

      return `
        <article class="provider-member-card">
          <div class="provider-member-card__main">
            <h3 class="provider-member-card__name">${member.firstName} ${member.lastName}</h3>
            <p class="provider-member-card__meta">${member.email}</p>
          </div>
          ${actions}
        </article>`;
    }).join('');
  }

  function renderRequests() {
    if (!isOwner) return;

    const requests = CompassProviderOrgs.getJoinRequests(orgId);
    document.getElementById('joinRequestCount').textContent = String(requests.length);

    if (!requests.length) {
      requestList.innerHTML = '<p class="provider-empty-state">No pending join requests.</p>';
      return;
    }

    requestList.innerHTML = requests.map((request) => `
      <article class="provider-request-card">
        <div class="provider-request-card__main">
          <h3 class="provider-request-card__name">${request.firstName} ${request.lastName}</h3>
          <p class="provider-request-card__meta">${request.email} · Requested ${request.requestedAt}</p>
          ${request.message ? `<p class="provider-request-card__message">${request.message}</p>` : ''}
        </div>
        <div class="provider-request-card__actions">
          <button type="button" class="builder-btn builder-btn--primary" data-approve-request="${request.id}">Approve</button>
          <button type="button" class="builder-btn builder-btn--cancel" data-deny-request="${request.id}">Deny</button>
        </div>
      </article>
    `).join('');
  }

  function refreshTeamUi() {
    renderMembers();
    renderRequests();
  }

  memberList.addEventListener('change', (e) => {
    const select = e.target.closest('[data-member-role]');
    if (!select || !isOwner) return;
    CompassProviderOrgs.updateMemberRole(orgId, select.dataset.memberRole, select.value);
    showFlash('Team member role updated.');
    refreshTeamUi();
  });

  memberList.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-remove-member]');
    if (!btn || !isOwner) return;
    if (!window.confirm('Remove this user from the organization?')) return;
    CompassProviderOrgs.removeMember(orgId, btn.dataset.removeMember);
    showFlash('User removed from the organization.');
    refreshTeamUi();
  });

  requestList?.addEventListener('click', (e) => {
    const approve = e.target.closest('[data-approve-request]');
    const deny = e.target.closest('[data-deny-request]');

    if (approve) {
      CompassProviderOrgs.approveJoinRequest(orgId, approve.dataset.approveRequest, false);
      showFlash('Join request approved. User added as a member.');
      refreshTeamUi();
      return;
    }

    if (deny) {
      CompassProviderOrgs.denyJoinRequest(orgId, deny.dataset.denyRequest);
      showFlash('Join request denied.');
      refreshTeamUi();
    }
  });

  document.getElementById('copyInviteLinkBtn')?.addEventListener('click', async () => {
    const link = inviteLinkInput.value;
    try {
      await navigator.clipboard.writeText(link);
      showFlash('Invite link copied.');
    } catch {
      inviteLinkInput.select();
      showFlash('Copy the invite link from the field above.');
    }
  });

  document.getElementById('saveProviderAccountBtn').addEventListener('click', () => {
    showFlash('Provider account saved. (prototype demo)');
  });

  document.getElementById('openAccountSecurityBtn').addEventListener('click', () => {
    CompassAuth.startKeycloakAuth({
      intent: 'login',
      returnTo: 'provider-account.html',
      cancelTo: 'provider-account.html',
      user,
      flashMessage: 'Returned from account security. (prototype demo)',
    });
  });

  hydrateAccountFields();
  refreshTeamUi();
  showFlash(CompassAuth.consumeFlashMessage());
})();
