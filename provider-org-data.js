(function (global) {
  const MEMBERS_KEY = 'compass-provider-members';
  const REQUESTS_KEY = 'compass-provider-join-requests';

  const ORGANIZATIONS = [
    {
      id: 'bright-futures',
      name: 'Bright Futures Community Foundation',
      type: 'Community foundation',
      location: 'Fort Wayne, IN',
      listingsCount: 4,
      aliases: ['bright futures', 'brightfutures', 'bfcf'],
    },
    {
      id: 'ivy-tech',
      name: 'Ivy Tech Community College',
      type: 'Training provider',
      location: 'Fort Wayne, IN',
      listingsCount: 12,
      aliases: ['ivy tech', 'ivytech'],
    },
    {
      id: 'parkview',
      name: 'Parkview Health',
      type: 'Support service provider',
      location: 'Fort Wayne, IN',
      listingsCount: 3,
      aliases: ['parkview'],
    },
    {
      id: 'workone',
      name: 'WorkOne Northeast',
      type: 'Support service provider',
      location: 'Fort Wayne, IN',
      listingsCount: 6,
      aliases: ['workone', 'work one', 'work one northeast'],
    },
    {
      id: 'community-foundation-ne',
      name: 'Community Foundation of Greater Fort Wayne',
      type: 'Community foundation',
      location: 'Fort Wayne, IN',
      listingsCount: 8,
      aliases: ['cfgfw', 'community foundation', 'greater fort wayne'],
    },
    {
      id: 'united-way',
      name: 'United Way of Allen County',
      type: 'Support service provider',
      location: 'Fort Wayne, IN',
      listingsCount: 2,
      aliases: ['united way', 'uwac'],
    },
    {
      id: 'ipfw-scholarships',
      name: 'Purdue Fort Wayne Scholarship Office',
      type: 'Scholarship provider',
      location: 'Fort Wayne, IN',
      listingsCount: 5,
      aliases: ['pfw', 'purdue fort wayne', 'ipfw'],
    },
    {
      id: 'goodwill',
      name: 'Goodwill Industries of Northeast Indiana',
      type: 'Training provider',
      location: 'Fort Wayne, IN',
      listingsCount: 4,
      aliases: ['goodwill', 'goodwill industries'],
    },
  ];

  const DEFAULT_MEMBERS = {
    'bright-futures': [
      {
        id: 'alex',
        firstName: 'Alex',
        lastName: 'Provider',
        email: 'alex@brightfutures.org',
        role: 'owner',
        status: 'active',
      },
      {
        id: 'jordan',
        firstName: 'Jordan',
        lastName: 'Lee',
        email: 'jordan@brightfutures.org',
        role: 'member',
        status: 'active',
      },
      {
        id: 'sam',
        firstName: 'Sam',
        lastName: 'Rivera',
        email: 'sam@brightfutures.org',
        role: 'member',
        status: 'active',
      },
    ],
  };

  const DEFAULT_REQUESTS = {
    'bright-futures': [
      {
        id: 'req-casey',
        firstName: 'Casey',
        lastName: 'Morgan',
        email: 'casey.morgan@example.com',
        message: 'I manage scholarship outreach for our Fort Wayne office and need access to update listings.',
        requestedAt: '2026-07-14',
      },
    ],
  };

  function readStore(key, fallback) {
    try {
      const raw = sessionStorage.getItem(key);
      if (!raw) return JSON.parse(JSON.stringify(fallback));
      return JSON.parse(raw);
    } catch {
      return JSON.parse(JSON.stringify(fallback));
    }
  }

  function writeStore(key, value) {
    sessionStorage.setItem(key, JSON.stringify(value));
  }

  function normalize(text) {
    return String(text || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function scoreMatch(query, org) {
    const q = normalize(query);
    if (!q || q.length < 2) return 0;

    const name = normalize(org.name);
    const haystack = [name, ...(org.aliases || []).map(normalize)].join(' ');

    if (name === q) return 100;
    if (name.startsWith(q)) return 90;
    if (haystack.includes(q)) return 75;

    const tokens = q.split(' ').filter(Boolean);
    const tokenHits = tokens.filter((token) => haystack.includes(token)).length;
    if (!tokenHits) return 0;
    return Math.round((tokenHits / tokens.length) * 60);
  }

  function searchOrganizations(query, limit = 6) {
    return ORGANIZATIONS
      .map((org) => ({ ...org, score: scoreMatch(query, org) }))
      .filter((org) => org.score > 0)
      .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
      .slice(0, limit);
  }

  function getOrganization(id) {
    return ORGANIZATIONS.find((org) => org.id === id) || null;
  }

  function getMembers(orgId) {
    const store = readStore(MEMBERS_KEY, DEFAULT_MEMBERS);
    return store[orgId] ? [...store[orgId]] : [];
  }

  function saveMembers(orgId, members) {
    const store = readStore(MEMBERS_KEY, DEFAULT_MEMBERS);
    store[orgId] = members;
    writeStore(MEMBERS_KEY, store);
  }

  function getJoinRequests(orgId) {
    const store = readStore(REQUESTS_KEY, DEFAULT_REQUESTS);
    return store[orgId] ? [...store[orgId]] : [];
  }

  function saveJoinRequests(orgId, requests) {
    const store = readStore(REQUESTS_KEY, DEFAULT_REQUESTS);
    store[orgId] = requests;
    writeStore(REQUESTS_KEY, store);
  }

  function addJoinRequest(orgId, request) {
    const requests = getJoinRequests(orgId);
    const next = {
      id: request.id || `req-${Date.now()}`,
      firstName: request.firstName,
      lastName: request.lastName,
      email: request.email,
      message: request.message || '',
      requestedAt: request.requestedAt || new Date().toISOString().slice(0, 10),
    };
    requests.unshift(next);
    saveJoinRequests(orgId, requests);
    return next;
  }

  function approveJoinRequest(orgId, requestId, asOwner = false) {
    const requests = getJoinRequests(orgId);
    const request = requests.find((item) => item.id === requestId);
    if (!request) return null;

    saveJoinRequests(orgId, requests.filter((item) => item.id !== requestId));

    const members = getMembers(orgId);
    members.push({
      id: `member-${Date.now()}`,
      firstName: request.firstName,
      lastName: request.lastName,
      email: request.email,
      role: asOwner ? 'owner' : 'member',
      status: 'active',
    });
    saveMembers(orgId, members);
    return request;
  }

  function denyJoinRequest(orgId, requestId) {
    const requests = getJoinRequests(orgId).filter((item) => item.id !== requestId);
    saveJoinRequests(orgId, requests);
  }

  function updateMemberRole(orgId, memberId, role) {
    const members = getMembers(orgId).map((member) => (
      member.id === memberId ? { ...member, role } : member
    ));
    saveMembers(orgId, members);
  }

  function removeMember(orgId, memberId) {
    const members = getMembers(orgId).filter((member) => member.id !== memberId);
    saveMembers(orgId, members);
  }

  function addMember(orgId, member) {
    const members = getMembers(orgId);
    const next = {
      id: member.id || `member-${Date.now()}`,
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      role: member.role || 'member',
      status: 'active',
    };
    members.push(next);
    saveMembers(orgId, members);
    return next;
  }

  const DEMO_USERS = {
    owner: {
      initials: 'AP',
      firstName: 'Alex',
      lastName: 'Provider',
      email: 'alex@brightfutures.org',
      role: 'provider',
      orgRole: 'owner',
      organizationId: 'bright-futures',
      organizationName: 'Bright Futures Community Foundation',
    },
    member: {
      initials: 'JL',
      firstName: 'Jordan',
      lastName: 'Lee',
      email: 'jordan@brightfutures.org',
      role: 'provider',
      orgRole: 'member',
      organizationId: 'bright-futures',
      organizationName: 'Bright Futures Community Foundation',
    },
  };

  global.CompassProviderOrgs = {
    ORGANIZATIONS,
    DEMO_USERS,
    searchOrganizations,
    getOrganization,
    getMembers,
    getJoinRequests,
    addJoinRequest,
    approveJoinRequest,
    denyJoinRequest,
    updateMemberRole,
    removeMember,
    addMember,
  };
})(window);
