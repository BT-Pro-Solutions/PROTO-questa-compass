(function (global) {
  const LISTINGS = [
    {
      id: 'bf-scholarship',
      title: 'Bright Futures Renewable Scholarship',
      description: 'Renewable award for Allen County learners pursuing certificates, associate degrees, or bachelor\'s degrees.',
      meta: 'Funding • Open year-round • Contact: Alex Provider',
      status: 'approved',
      statusLabel: 'Approved by Questa staff',
      statusSort: 3,
      submittedDate: '2026-06-01',
      resourceType: 'Scholarship',
      visibility: 'Live in Compass results',
      keyDates: 'Up to $4,000 • Open year-round',
      contact: 'Alex Provider',
      eligibility: 'Open to adult learners and recent high school graduates who live in Allen County and plan to enroll in an eligible postsecondary program.',
    },
    {
      id: 'bf-emergency',
      title: 'Bright Futures Emergency Grant',
      description: 'Short-term assistance for transportation, books, testing fees, and other student persistence needs.',
      meta: 'Funding • Submitted Jun 8 • Awaiting Questa review',
      status: 'pending',
      statusLabel: 'Pending approval',
      statusSort: 1,
      submittedDate: '2026-06-08',
      resourceType: 'Grant',
      visibility: 'Hidden — pending Questa review',
      keyDates: 'Up to $750 • Rolling applications',
      contact: 'Alex Provider',
      eligibility: 'Available to current postsecondary students facing unexpected financial barriers.',
    },
    {
      id: 'earn-indiana',
      title: 'EARN Indiana',
      description: 'Claim request sent to Questa staff. Editing unlocks after admin approval.',
      meta: 'Claim request • Submitted by Alex Provider',
      status: 'claim',
      statusLabel: 'Claim submitted',
      statusSort: 2,
      submittedDate: '2026-06-05',
      resourceType: 'Work-study program',
      visibility: 'Unclaimed public listing',
      keyDates: 'Open year-round',
      contact: 'Alex Provider',
      eligibility: 'Students with financial need enrolled at eligible Indiana institutions.',
    },
    {
      id: 'leadership-retreat',
      title: 'Corporate Leadership Retreat',
      description: 'Weekend professional development retreat for mid-career managers and team leads.',
      meta: 'Submitted Jun 7 • Not eligible for Compass',
      status: 'rejected',
      statusLabel: 'Unlisted — Changes Required',
      statusSort: 0,
      submittedDate: '2026-06-07',
      resourceType: 'Corporate Training',
      visibility: 'Not listed in Compass',
      keyDates: 'Varies • By application',
      contact: 'Alex Provider',
      eligibility: 'Mid-career professionals employed by participating partner organizations.',
      rejectionTitle: 'This listing needs changes before it can be reviewed again',
      rejectionMessage: 'Questa staff did not approve this submission because it is not a valid resource type for Compass. Compass lists education, career, funding, and personal support resources for learners — not general corporate training retreats.',
      rejectionReasons: [
        'Resource category "Corporate Training" is outside Compass scope',
        'Listing does not serve student or career-seeker audiences',
      ],
    },
  ];

  function getListing(id) {
    return LISTINGS.find((listing) => listing.id === id) || LISTINGS[0];
  }

  global.CompassProviderListings = { LISTINGS, getListing };
})(window);
