(function (global) {
  const PLACEHOLDER_OPPORTUNITIES = [
    {
      id: 1,
      title: 'WorkOne Northeast Career Center',
      programType: 'Career Counseling Center',
      location: 'Fort Wayne, IN',
      desc: 'Free career coaching, résumé help, and job search support for northeast Indiana residents exploring next steps after high school or training.',
      description:
        'WorkOne Northeast helps job seekers and students connect with career pathways, local employers, and training programs. Career advisors offer one-on-one coaching, interview prep, and referrals to regional apprenticeship and certification options.',
      eligibility: ['High School', 'Young Adult Learner', 'Adult Learner'],
      topics: ['careers', 'education-training'],
      match: 'strong',
      providerName: null,
      logoUrl: null,
      providerApprovalStatus: 'unclaimed',
      contact: {
        address: '201 E Rudisill Blvd, Suite 102, Fort Wayne, IN 46806',
        phone: '(260) 427-1146',
        email: 'northeast@workone.in.gov',
        website: 'https://www.in.gov/dwd/workone/',
        hours: 'Mon–Fri, 8:00 am–4:30 pm',
      },
    },
    {
      id: 2,
      title: 'Ivy Tech Fort Wayne — Student Success Center',
      programType: 'Campus Support Program',
      location: 'Fort Wayne, IN',
      desc: 'On-campus tutoring, academic coaching, and enrollment guidance for students preparing for college-level coursework.',
      description:
        'The Student Success Center at Ivy Tech Fort Wayne offers tutoring, study skills workshops, and academic advising for new and returning learners. Staff help students build confidence before and during their first semesters.',
      eligibility: ['High School', 'Young Adult Learner', 'Adult Learner'],
      topics: ['learning-help', 'education-help'],
      match: 'strong',
      providerName: 'Ivy Tech Community College',
      logoUrl: null,
      providerApprovalStatus: 'approved',
      contact: {
        address: '3800 N Anthony Blvd, Fort Wayne, IN 46805',
        phone: '(260) 480-4160',
        email: 'fw-studentsuccess@ivytech.edu',
        website: 'https://www.ivytech.edu',
        hours: 'Mon–Thu, 8:00 am–6:00 pm; Fri, 8:00 am–5:00 pm',
      },
    },
    {
      id: 3,
      title: 'Questa College & Career Navigation',
      programType: 'Education Readiness Program',
      location: 'Fort Wayne, IN',
      desc: 'Guidance on college fit, application timelines, and FAFSA preparation for Allen County students and families.',
      description:
        'Questa advisors help students compare postsecondary options, understand admissions requirements, and prepare for enrollment. Sessions cover campus visits, application essays, and financial planning conversations beyond scholarships.',
      eligibility: ['High School', 'Young Adult Learner'],
      topics: ['education-help', 'careers'],
      match: 'strong',
      providerName: 'Questa Education Foundation',
      logoUrl: null,
      providerApprovalStatus: 'approved',
      contact: {
        address: '8200 Jefferson Blvd, Fort Wayne, IN 46804',
        phone: '(260) 407-6494',
        email: 'info@questafoundation.org',
        website: 'https://www.questafoundation.org',
        hours: 'Mon–Fri, 9:00 am–5:00 pm',
      },
    },
    {
      id: 4,
      title: 'NE Indiana Apprenticeship Hub',
      programType: 'Apprenticeship Placement',
      location: 'Fort Wayne, IN',
      desc: 'Connects learners with registered apprenticeships in skilled trades, healthcare pathways, and advanced manufacturing across the region.',
      description:
        'The Apprenticeship Hub helps students and career changers explore earn-while-you-learn programs. Coaches explain eligibility, union and employer pathways, and how to apply for openings with local training partners.',
      eligibility: ['High School', 'Young Adult Learner', 'Adult Learner'],
      topics: ['education-training', 'careers'],
      match: 'fair',
      providerName: null,
      logoUrl: null,
      providerApprovalStatus: 'unclaimed',
      contact: {
        address: '1825 W Main St, Fort Wayne, IN 46808',
        phone: '(260) 555-0180',
        email: 'start@apprenticeshiphub.org',
        website: 'https://example.org/apprenticeship-hub',
        hours: 'Tue–Thu, 10:00 am–6:00 pm; Sat by appointment',
      },
    },
    {
      id: 5,
      title: 'Boys & Girls Clubs of Fort Wayne — Teen Career Club',
      programType: 'Youth Development Program',
      location: 'Fort Wayne, IN',
      desc: 'After-school career exploration, mentorship, and workplace readiness activities for teens ages 14–18.',
      description:
        'Teen Career Club members meet weekly for mentorship, job shadowing introductions, and workshops on workplace communication. The program partners with local employers for site visits and summer internship referrals.',
      eligibility: ['High School', 'Young Adult Learner'],
      topics: ['careers', 'personal-help'],
      match: 'fair',
      providerName: null,
      logoUrl: null,
      providerApprovalStatus: 'unclaimed',
      contact: {
        address: '2609 Fairfield Ave, Fort Wayne, IN 46807',
        phone: '(260) 744-0998',
        email: 'teens@bgcfw.org',
        website: 'https://www.bgcfw.org',
        hours: 'Mon–Fri, 2:30 pm–7:00 pm during the school year',
      },
    },
    {
      id: 6,
      title: 'Parkview Behavioral Health — Student Wellness Clinic',
      programType: 'Counseling & Wellness',
      location: 'Fort Wayne, IN',
      desc: 'Short-term counseling and wellness referrals for students managing stress, anxiety, or life transitions during school or training.',
      description:
        'Licensed clinicians provide confidential support for students navigating academic pressure, family changes, or mental wellness concerns. Walk-in hours and telehealth options are available for ages 16 and up.',
      eligibility: ['High School', 'Young Adult Learner', 'Adult Learner'],
      topics: ['personal-help', 'learning-help'],
      match: 'some',
      providerName: 'Parkview Health',
      logoUrl: null,
      providerApprovalStatus: 'approved',
      contact: {
        address: '1720 Beacon St, Fort Wayne, IN 46805',
        phone: '(260) 373-7500',
        email: 'studentwellness@parkview.com',
        website: 'https://www.parkview.com',
        hours: 'Mon–Fri, 8:00 am–8:00 pm; Sat, 9:00 am–1:00 pm',
      },
    },
    {
      id: 7,
      title: 'Literacy Alliance — Adult Learning Lab',
      programType: 'Academic Skills Program',
      location: 'Fort Wayne, IN',
      desc: 'Reading, math, and digital literacy support for adult learners preparing to enter college, training, or a new career.',
      description:
        'The Adult Learning Lab offers small-group instruction and one-on-one tutoring for learners building foundational skills. Coaches help participants set goals for GED completion, college placement tests, or workplace certifications.',
      eligibility: ['Adult Learner', 'Young Adult Learner'],
      topics: ['learning-help', 'education-training'],
      match: 'strong',
      providerName: 'The Literacy Alliance',
      logoUrl: null,
      providerApprovalStatus: 'approved',
      contact: {
        address: '709 E State Blvd, Fort Wayne, IN 46805',
        phone: '(260) 426-7323',
        email: 'learn@literacyalliance.org',
        website: 'https://www.literacyalliance.org',
        hours: 'Mon–Thu, 9:00 am–7:00 pm; Fri, 9:00 am–3:00 pm',
      },
    },
    {
      id: 8,
      title: 'United Way 211 — Northeast Indiana',
      programType: 'Community Resource Line',
      location: 'Allen County, IN',
      desc: 'Free phone and text support connecting residents with childcare, transportation, food, and other services that help students stay in school.',
      description:
        'Dial 211 to speak with a community resource specialist who can locate local programs for basic needs, transportation assistance, childcare, and family support. Specialists follow up to make sure callers connect with the right provider.',
      eligibility: ['High School', 'Young Adult Learner', 'Adult Learner'],
      topics: ['personal-help', 'education-help'],
      match: 'strong',
      providerName: 'United Way of Allen County',
      logoUrl: null,
      providerApprovalStatus: 'approved',
      contact: {
        address: '334 E Berry St, Fort Wayne, IN 46802',
        phone: '211',
        email: 'help@uwnein.org',
        website: 'https://www.uwnein.org/211',
        hours: '24 hours a day, 7 days a week',
      },
    },
    {
      id: 901,
      listingType: 'school',
      affiliationLabel: 'Your School',
      affiliationDetail: 'Warsaw High School',
      schoolMatch: 'Warsaw High School',
      title: 'Warsaw High School Career & College Center',
      programType: 'School-Based Resource Hub',
      location: 'Warsaw, IN',
      desc: 'On-campus support for Warsaw High School students exploring careers, college options, apprenticeships, and personal needs — regardless of which Compass topics you selected.',
      description:
        'The Career & College Center connects Warsaw High School students with counseling, college visits, FAFSA help, career exploration, and referrals to community partners. Services span learning help, careers, education readiness, training pathways, and personal support.',
      eligibility: ['High School'],
      topics: ['learning-help', 'careers', 'education-help', 'education-training', 'personal-help'],
      match: 'strong',
      providerName: 'Warsaw Community Schools',
      logoUrl: null,
      providerApprovalStatus: 'approved',
      contact: {
        address: '1 Tiger Lane, Warsaw, IN 46580',
        phone: '(574) 555-0190',
        email: 'careercenter@warsaw.k12.in.us',
        website: 'https://example.org/warsaw-career-center',
        hours: 'Mon–Fri, 7:30 am–3:30 pm during the school year',
      },
    },
    {
      id: 902,
      listingType: 'community',
      affiliationLabel: 'Your Community',
      affiliationDetail: 'Kosciusko County',
      residencyMatch: 'Kosciusko County, IN',
      title: 'Kosciusko County Community Resource Directory',
      programType: 'Community Resource Directory',
      location: 'Kosciusko County, IN',
      desc: 'County-curated directory of local personal help, basic needs, wellness, transportation, and family support services for Kosciusko County residents.',
      description:
        'Kosciusko County maintains a community resource directory highlighting trusted providers for childcare, housing, transportation, wellness, social connections, and other personal supports. Compass surfaces this directory for county residents alongside topic-based results.',
      eligibility: ['High School', 'Young Adult Learner', 'Adult Learner'],
      topics: ['personal-help'],
      match: 'strong',
      providerName: 'Kosciusko County Community Services',
      logoUrl: null,
      providerApprovalStatus: 'approved',
      contact: {
        address: '121 N Lake St, Warsaw, IN 46580',
        phone: '(574) 555-0144',
        email: 'resources@kosciuskocounty.in.gov',
        website: 'https://example.org/kosciusko-resources',
        hours: 'Mon–Fri, 8:00 am–4:30 pm',
      },
    },
  ];

  const AFFILIATED_LISTING_TYPES = ['school', 'community'];

  const REFINE_FILTERS = [
    {
      type: 'select',
      id: 'distance',
      label: 'Distance from Me',
      tooltip: 'How far you are willing to travel for in-person programs and services.',
      options: ['Any distance', 'Within 5 miles', 'Within 10 miles', 'Within 25 miles', 'Within 50 miles'],
    },
    {
      type: 'select',
      id: 'program-cost',
      label: 'Program Cost',
      tooltip: 'Filter by whether a program is free, subsidized, or paid.',
      options: ['Any cost', 'Free', 'Low cost / subsidized', 'Paid program'],
    },
    {
      type: 'select',
      id: 'format',
      label: 'Format',
      tooltip: 'How the program or service is delivered.',
      options: ['Any format', 'In-person', 'Online', 'Hybrid'],
    },
    {
      type: 'select',
      id: 'schedule',
      label: 'Schedule',
      tooltip: 'When sessions or services are typically available.',
      options: ['Any schedule', 'Weekday daytime', 'Weekday evening', 'Weekends', 'Flexible / self-paced'],
    },
    {
      type: 'checkbox',
      id: 'accepting-now',
      label: 'Accepting Participants Now',
      tooltip: 'Show only programs currently enrolling or accepting new participants.',
    },
    {
      type: 'checkbox',
      id: 'transportation',
      label: 'Transportation Provided',
      tooltip: 'Programs that offer transportation assistance or are accessible by public transit.',
    },
  ];

  const DEFAULT_RESULTS_CONFIG = {
    resultLabel: 'Resources',
    totalCount: 87,
    showMatchStrength: false,
    sortOptions: ['Name', 'Recently Added', 'Relevance', 'Distance'],
    filters: REFINE_FILTERS,
  };

  const TOPIC_RESULTS = {
    careers: {
      resultLabel: 'Career Programs',
      totalCount: 24,
      showMatchStrength: false,
      sortOptions: ['Name', 'Recently Added', 'Relevance', 'Distance'],
      filters: REFINE_FILTERS,
    },
    'education-help': {
      resultLabel: 'Education Programs',
      totalCount: 18,
      showMatchStrength: false,
      sortOptions: ['Name', 'Recently Added', 'Relevance', 'Distance'],
      filters: REFINE_FILTERS,
    },
    'learning-help': {
      resultLabel: 'Learning Programs',
      totalCount: 12,
      showMatchStrength: false,
      sortOptions: ['Name', 'Recently Added', 'Distance'],
      filters: REFINE_FILTERS,
    },
    'education-training': {
      resultLabel: 'Training Programs',
      totalCount: 31,
      showMatchStrength: false,
      sortOptions: ['Name', 'Recently Added', 'Relevance', 'Distance'],
      filters: REFINE_FILTERS,
    },
    'personal-help': {
      resultLabel: 'Personal Support Programs',
      totalCount: 15,
      showMatchStrength: false,
      sortOptions: ['Name', 'Recently Added', 'Distance'],
      filters: REFINE_FILTERS,
    },
  };

  function getResultsConfig(topicKeys) {
    if (topicKeys.length === 1 && TOPIC_RESULTS[topicKeys[0]]) {
      return TOPIC_RESULTS[topicKeys[0]];
    }
    return DEFAULT_RESULTS_CONFIG;
  }

  function getOpportunity(id) {
    return PLACEHOLDER_OPPORTUNITIES.find((o) => String(o.id) === String(id)) || PLACEHOLDER_OPPORTUNITIES[0];
  }

  function getAffiliatedListings(profile = {}) {
    return PLACEHOLDER_OPPORTUNITIES.filter((opp) => {
      if (!AFFILIATED_LISTING_TYPES.includes(opp.listingType)) return false;
      // Demo: always include affiliated listings regardless of profile selections.
      return true;
    });
  }

  function getStandardListings(topicKeys) {
    return PLACEHOLDER_OPPORTUNITIES.filter(
      (opp) =>
        !AFFILIATED_LISTING_TYPES.includes(opp.listingType) &&
        (opp.topics || []).some((topic) => topicKeys.includes(topic))
    );
  }

  global.CompassResults = {
    PLACEHOLDER_OPPORTUNITIES,
    TOPIC_RESULTS,
    DEFAULT_RESULTS_CONFIG,
    REFINE_FILTERS,
    AFFILIATED_LISTING_TYPES,
    getResultsConfig,
    getOpportunity,
    getAffiliatedListings,
    getStandardListings,
  };
})(window);
