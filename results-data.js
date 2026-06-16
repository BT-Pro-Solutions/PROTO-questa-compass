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
      providerName: 'WorkOne Northeast',
      logoUrl: null,
      providerApprovalStatus: 'approved',
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
      providerName: 'NE Indiana Apprenticeship Hub',
      logoUrl: null,
      providerApprovalStatus: 'approved',
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
      providerName: 'Boys & Girls Clubs of Fort Wayne',
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
  ];

  const DEFAULT_RESULTS_CONFIG = {
    resultLabel: 'Resources',
    totalCount: 87,
    showMatchStrength: false,
    sortOptions: ['Name', 'Recently Added', 'Relevance'],
    filters: [
      {
        type: 'select',
        id: 'residency',
        label: 'Residency',
        tooltip: 'Filter by county or region of residency.',
        options: ['Show All', 'Allen County', 'Adams County', 'DeKalb County', 'Other Indiana'],
      },
      {
        type: 'select',
        id: 'student-level',
        label: 'Student Level',
        tooltip: 'Your current stage of education.',
        options: ['Show All', 'High School', 'Young Adult', 'Adult Learner'],
      },
      {
        type: 'select',
        id: 'program-types',
        label: 'Program Type',
        tooltip: 'Types of programs or services offered.',
        options: ['Show All', 'Counseling Center', 'Campus Program', 'Apprenticeship', 'Wellness', 'Community Line'],
      },
    ],
  };

  const TOPIC_RESULTS = {
    careers: {
      resultLabel: 'Career Programs',
      totalCount: 24,
      showMatchStrength: false,
      sortOptions: ['Name', 'Recently Added', 'Relevance'],
      filters: [
        {
          type: 'select',
          id: 'residency',
          label: 'Residency',
          tooltip: 'Filter by county or region of residency.',
          options: ['Show All', 'Allen County', 'Adams County', 'DeKalb County', 'Other Indiana'],
        },
        {
          type: 'select',
          id: 'career-interests',
          label: 'Career Interests',
          tooltip: 'Career areas you want to explore.',
          options: ['Show All', 'Healthcare', 'Technology', 'Skilled Trades', 'Business'],
        },
        {
          type: 'select',
          id: 'student-level',
          label: 'Student Level',
          tooltip: 'Your current stage of education.',
          options: ['Show All', 'High School', 'Young Adult', 'Adult Learner'],
        },
      ],
    },
    'education-help': {
      resultLabel: 'Education Programs',
      totalCount: 18,
      showMatchStrength: false,
      sortOptions: ['Name', 'Recently Added', 'Relevance'],
      filters: [
        {
          type: 'select',
          id: 'program-types',
          label: 'Program Type',
          tooltip: 'Types of education support offered.',
          options: ['Show All', 'Navigation', 'Campus Support', 'Community Line'],
        },
        {
          type: 'select',
          id: 'college-interest',
          label: 'College Interest',
          tooltip: 'Schools you are considering or currently attending.',
          options: ['Show All', 'Ivy Tech', 'Purdue Fort Wayne', 'Indiana University'],
        },
        {
          type: 'select',
          id: 'residency',
          label: 'Residency',
          tooltip: 'Filter by county or region of residency.',
          options: ['Show All', 'Allen County', 'Other Indiana'],
        },
      ],
    },
    'learning-help': {
      resultLabel: 'Learning Programs',
      totalCount: 12,
      showMatchStrength: false,
      sortOptions: ['Name', 'Recently Added'],
      filters: [
        {
          type: 'select',
          id: 'student-level',
          label: 'Student Level',
          tooltip: 'Your current stage of education.',
          options: ['Show All', 'High School', 'Young Adult', 'Adult Learner'],
        },
        {
          type: 'select',
          id: 'residency',
          label: 'Residency',
          tooltip: 'Filter by county or region of residency.',
          options: ['Show All', 'Allen County', 'Other Indiana'],
        },
      ],
    },
    'education-training': {
      resultLabel: 'Training Programs',
      totalCount: 31,
      showMatchStrength: false,
      sortOptions: ['Name', 'Recently Added', 'Relevance'],
      filters: [
        {
          type: 'select',
          id: 'program-types',
          label: 'Program Type',
          tooltip: 'Types of training programs you are pursuing.',
          options: ['Show All', 'Apprenticeship', 'Certificate', 'Workforce Center'],
        },
        {
          type: 'select',
          id: 'training-provider',
          label: 'Training Provider',
          tooltip: 'Organizations that offer training or certification.',
          options: ['Show All', 'Ivy Tech', 'NE Indiana Apprenticeship Hub', 'WorkOne'],
        },
        {
          type: 'select',
          id: 'residency',
          label: 'Residency',
          tooltip: 'Filter by county or region of residency.',
          options: ['Show All', 'Allen County', 'Other Indiana'],
        },
      ],
    },
    'personal-help': {
      resultLabel: 'Personal Support Programs',
      totalCount: 15,
      showMatchStrength: false,
      sortOptions: ['Name', 'Recently Added'],
      filters: [
        {
          type: 'select',
          id: 'residency',
          label: 'Residency',
          tooltip: 'Filter by county or region of residency.',
          options: ['Show All', 'Allen County', 'Other Indiana'],
        },
        {
          type: 'select',
          id: 'health-related',
          label: 'Support Type',
          tooltip: 'Areas where you need personal or wellness support.',
          options: ['Show All', 'Mental wellness', 'Basic needs', 'Youth support', 'Family services'],
        },
      ],
    },
  };

  function getResultsConfig(topicKeys) {
    if (topicKeys.length === 1 && TOPIC_RESULTS[topicKeys[0]]) {
      return TOPIC_RESULTS[topicKeys[0]];
    }
    return DEFAULT_RESULTS_CONFIG;
  }

  function getOpportunity(id) {
    return PLACEHOLDER_OPPORTUNITIES.find((o) => o.id === Number(id)) || PLACEHOLDER_OPPORTUNITIES[0];
  }

  global.CompassResults = {
    PLACEHOLDER_OPPORTUNITIES,
    TOPIC_RESULTS,
    DEFAULT_RESULTS_CONFIG,
    getResultsConfig,
    getOpportunity,
  };
})(window);
