(function (global) {
  const STORAGE_KEY = 'compass-profile';
  const FUNDING_EXTERNAL_URL = 'https://compass.questafoundation.org/fund-finder';

  const TOPIC_INTEREST_OPTIONS = {
    'learning-help': [
      'Academic / Study Skills',
      'English Language Skills',
      'High School Completion (HSE / GED)',
      'Tutoring / Study Tables',
    ],
    careers: [
      'Apprenticeships',
      'Job Shadowing',
      'Information about Careers',
      'Internships / Co-ops / Work-Based Learning',
      'Self-Assessment for Careers',
      'Skill Development',
    ],
    'education-help': [
      'Campus Visits',
      'College Bridge / College Success Program',
      'College Credit for Prior Experience',
      'College or Training Application Process',
      'College or Training Exploration',
      'Early College Classes / Dual Credit',
      'Transition Planning (time off and re-entry)',
      'FAFSA Help',
      'Financial Literacy',
    ],
    funding: [
      'Scholarships',
      'Grants',
      'Work-Study / Earn Programs',
      'Loan Forgiveness',
      'Employer Tuition Assistance',
      'Emergency / Gap Funding',
    ],
    'education-training': [
      'Certificate Programs',
      'Associate Degree',
      'Bachelor Degree',
      'Master Degree',
      'Doctoral Degree',
      'Employer-Provided Training',
      'Journeyperson Card',
      'Licensure',
    ],
    'personal-help': [
      'Childcare',
      'Clubs & Athletics',
      'Documentation / License',
      'Guidance / Support Services',
      'Housing',
      'Legal',
      'Mentoring',
      'Social Connections',
      'Transportation',
      'Wellness - Mental and Physical Health',
    ],
  };

  const TOPIC_INTEREST_LABELS = {
    'learning-help': 'Learning Help',
    careers: 'Careers',
    'education-help': 'Education Readiness',
    funding: 'Funding',
    'education-training': 'Education & Training',
    'personal-help': 'Personal Help',
  };

  function buildTopicInterestFields() {
    return Object.entries(TOPIC_INTEREST_OPTIONS).map(([topicKey, options]) => {
      const label = TOPIC_INTEREST_LABELS[topicKey];
      return {
        id: `${topicKey}-interests`,
        label: `${label} Interests`,
        tooltip: `Select the ${label.toLowerCase()} resources that match what you\u2019re looking for.`,
        type: 'multiselect',
        modalTitle: `Select ${label} Interests`,
        modalDescription: `Choose the ${label.toLowerCase()} sub-categories that apply to you. You can select more than one.`,
        placeholder: `Select ${label.toLowerCase()} interests\u2026`,
        options,
      };
    });
  }

  const TOPICS = {
    'learning-help': {
      title: 'Find Learning Help',
      description: 'Get help to develop the academic skills to succeed in further education.',
      expandedSections: ['about-you'],
      promotedFieldsBySection: {
        'getting-started': ['learning-help-interests'],
      },
    },
    careers: {
      title: 'Find Careers',
      description: 'Get help to explore potential careers and related education, develop professional skills, and get career experience.',
      expandedSections: ['about-you'],
      promotedFieldsBySection: {
        'getting-started': ['careers-interests'],
      },
    },
    'education-help': {
      title: 'Find Education Readiness',
      description: 'Get help to explore college and training options, prepare for success in further education, plan for education expenses, complete the FAFSA, and/or leverage college credit opportunities.',
      expandedSections: ['about-you', 'education-interests'],
      promotedFieldsBySection: {
        'getting-started': ['education-help-interests'],
      },
    },
    funding: {
      title: 'Find Funding',
      description: 'Get help to find scholarships and other financial aid.',
      expandedSections: ['about-you', 'education-interests', 'financial-aid'],
      promotedFieldsBySection: {
        'getting-started': ['funding-interests'],
        'identity-groups': ['race', 'ethnicity', 'gender', 'designed-for'],
      },
    },
    'education-training': {
      title: 'Find Education & Training',
      description: 'Get help to identify colleges and training programs for your goals.',
      expandedSections: ['about-you'],
      promotedFieldsBySection: {
        'getting-started': ['education-training-interests'],
        'education-interests': [
          'field-of-study',
          'training-provider',
          'additional-training-provider',
        ],
      },
    },
    'personal-help': {
      title: 'Find Personal Help',
      description: 'Get help with personal needs (such as childcare, transportation, wellness, or social connections) to succeed in further education.',
      expandedSections: ['about-you'],
      promotedFieldsBySection: {
        'getting-started': ['personal-help-interests'],
      },
    },
  };

  const SECTIONS = {
    'getting-started': {
      title: 'Add detailed interests',
      fields: buildTopicInterestFields(),
    },
    'about-you': {
      title: 'About you',
      fields: [
        {
          id: 'student-level',
          label: 'Student Level',
          tooltip: 'Your current stage of education helps us show the most relevant resources.',
          type: 'select',
          placeholder: 'Please Select...',
          required: true,
          options: [
            { value: 'hs', label: 'Attending High School' },
            { value: 'young-adult', label: 'Young Adult (18–24) Learner' },
            { value: 'adult', label: 'Adult (25+) Learner' },
          ],
        },
        {
          id: 'residency',
          label: 'Residency',
          tooltip: 'Many opportunities are limited to residents of specific counties or states.',
          type: 'select',
          placeholder: 'Please Select...',
          required: true,
          options: ['Allen County, IN', 'Adams County, IN', 'DeKalb County, IN', 'Other Indiana', 'Out of State'],
        },
        {
          id: 'hs-attending',
          label: 'High School Attending',
          tooltip: 'Select the high school you currently attend or most recently attended.',
          type: 'select',
          placeholder: 'Select',
          showWhen: { studentLevel: ['hs'] },
          options: ['Northrop High School', 'Snider High School', 'Homestead High School', 'Other'],
        },
        {
          id: 'hs-gpa',
          label: 'High School GPA',
          tooltip: 'Enter your cumulative GPA on a 4.0 scale.',
          type: 'select',
          placeholder: 'Select',
          helperLink: { text: "Can't find your GPA? Try converting it here.", href: '#' },
          showWhen: { studentLevel: ['hs'] },
          options: ['4.0', '3.5 – 3.99', '3.0 – 3.49', '2.5 – 2.99', 'Below 2.5'],
        },
        {
          id: 'enrollment-status',
          label: 'Enrollment Status',
          tooltip: 'Are you currently enrolled in a college or training program?',
          type: 'select',
          placeholder: 'Select',
          showWhen: { studentLevel: ['young-adult', 'adult'] },
          options: ['Currently Enrolled', 'Accepted — Not Yet Enrolled', 'Not Currently Enrolled'],
        },
        {
          id: 'college-gpa',
          label: 'College GPA',
          tooltip: 'Your cumulative college GPA, if applicable.',
          type: 'select',
          placeholder: 'Select',
          showWhen: { studentLevel: ['young-adult', 'adult'] },
          options: ['4.0', '3.5 – 3.99', '3.0 – 3.49', '2.5 – 2.99', 'Below 2.5', 'N/A'],
        },
      ],
    },
    'education-interests': {
      title: 'Your Education Preferences',
      fields: [
        {
          id: 'program-types',
          label: 'Program Types',
          tooltip: 'Types of programs you are interested in, such as certificate, associate, or bachelor\u2019s.',
          type: 'multiselect',
          modalTitle: 'Select Program Types',
          modalDescription: 'Choose the program type(s) you are currently pursuing or plan to pursue.',
          placeholder: 'Select program types\u2026',
          options: [
            'Certificate Programs',
            'Associate Degree',
            'Bachelor Degree',
            'Master Degree',
            'Doctoral Degree',
            'Employer-Provided Training',
            'Journeyperson Card',
            'Licensure',
          ],
        },
        {
          id: 'field-of-study',
          label: 'Field of Study or Trades',
          tooltip: 'The subject area or trade you want to pursue.',
          type: 'multiselect',
          modalTitle: 'Select Fields of Study',
          modalDescription: 'Select the major(s), subject(s), or skilled trade(s) you are currently taking or plan to study.',
          placeholder: 'Select fields of study\u2026',
          groups: [
            {
              label: 'AGRICULTURAL/ANIMAL/PLANT/VETERINARY SCIENCE AND RELATED FIELDS',
              options: ['Agriculture, General', 'Animal Sciences', 'Plant Sciences'],
            },
            {
              label: 'ARCHITECTURE AND RELATED SERVICES',
              options: ['Architecture', 'Landscape Architecture', 'Real Estate Development'],
            },
            {
              label: 'AREA, ETHNIC, CULTURAL, GENDER, AND GROUP STUDIES',
              options: ['Ethnic, Cultural Minority, Gender, and Group Studies', 'Women\u2019s Studies'],
            },
            {
              label: 'BIOLOGICAL AND BIOMEDICAL SCIENCES',
              options: [
                'Biochemistry, Biophysics and Molecular Biology',
                'Biology, General',
                'Genetics',
                'Marine Biology and Biological Oceanography',
                'Neuroscience',
                'Zoology/Animal Biology',
              ],
            },
            {
              label: 'HEALTH PROFESSIONS AND RELATED PROGRAMS',
              options: ['Nursing', 'Health Services Administration', 'Public Health'],
            },
            {
              label: 'SKILLED TRADES',
              options: ['Electrical Trades', 'Plumbing', 'HVAC', 'Welding'],
            },
          ],
        },
        {
          id: 'college-interest',
          label: 'College Interest',
          tooltip: 'Schools you are considering or currently attending.',
          type: 'multiselect',
          modalTitle: 'Select Colleges',
          modalDescription: 'Choose the college(s) or university(ies) you are interested in or currently attending.',
          placeholder: 'Select colleges\u2026',
          options: [
            'Ivy Tech Community College',
            'Purdue University Fort Wayne',
            'Indiana University Bloomington',
            'Manchester University',
            'University of Alaska Anchorage',
            'University of Alaska Southeast',
            'Ball State University',
          ],
        },
        {
          id: 'training-provider',
          label: 'Training Provider',
          tooltip: 'Organizations that offer the training or certification you need.',
          type: 'multiselect',
          modalTitle: 'Select Training Providers',
          modalDescription: 'Choose the training provider(s) you are interested in or currently enrolled with.',
          placeholder: 'Select training providers\u2026',
          options: [
            'Ivy Tech Community College',
            'Lincoln Tech',
            'Elevator Constructors Local 44',
            'NE Indiana Apprenticeship Hub',
            'Local Apprenticeship Program',
          ],
        },
        {
          id: 'additional-training-provider',
          label: 'Additional Training Provider',
          helperText: 'Unable to find your training provider in the list? Enter it here!',
          type: 'text',
          placeholder: 'Enter provider name',
          fullWidth: true,
        },
      ],
    },
    'identity-groups': {
      title: 'Identity Groups',
      fields: [
        { id: 'race', label: 'Race', tooltip: 'Used to match identity-specific opportunities.', type: 'select', placeholder: 'Select', optional: true, options: ['American Indian or Alaska Native', 'Asian', 'Black or African American', 'White', 'Prefer not to say'] },
        { id: 'ethnicity', label: 'Ethnicity', tooltip: 'Used to match identity-specific opportunities.', type: 'select', placeholder: 'Select', optional: true, options: ['Hispanic or Latino', 'Not Hispanic or Latino', 'Prefer not to say'] },
        { id: 'gender', label: 'Gender', tooltip: 'Some programs are designed for specific gender identities.', type: 'select', placeholder: 'Select', optional: true, options: ['Female', 'Male', 'Non-binary', 'Prefer not to say'] },
        { id: 'designed-for', label: 'Specifically Designed For', tooltip: 'Communities a program may specifically serve.', type: 'select', placeholder: 'Select', optional: true, options: ['First-generation college students', 'Single parents', 'Foster youth', 'Other'] },
        { id: 'career-interests', label: 'Career Interests', tooltip: 'Career areas you want to explore.', type: 'select', placeholder: 'Select', optional: true, options: ['Healthcare', 'Technology', 'Skilled Trades', 'Business', 'Arts & Design'] },
        { id: 'health-related', label: 'Health Related', tooltip: 'Health or wellness areas where you need support.', type: 'select', placeholder: 'Select', optional: true, options: ['Mental wellness', 'Substance recovery support', 'Disability services', 'General wellness'] },
        { id: 'military', label: 'Military / Public Service', tooltip: 'Military or public service affiliations.', type: 'select', placeholder: 'Select', optional: true, options: ['Active duty', 'Veteran', 'National Guard / Reserve', 'Public service employee', 'None'] },
      ],
    },
    'financial-aid': {
      title: 'Your Financial Aid Preferences',
      fields: [
        { id: 'gpa-requirement', label: 'GPA Requirement', tooltip: 'Filter by whether an opportunity has a GPA minimum.', type: 'select', placeholder: 'Select', options: ['Show all', 'No GPA requirement only', 'Has GPA requirement'] },
        { id: 'financial-need', label: 'Financial Need Requirement', tooltip: 'Filter by need-based vs merit-based opportunities.', type: 'select', placeholder: 'Select', options: ['Show all', 'Need-based only', 'Merit-based only'] },
        { id: 'multi-year', label: 'Multi-Year / Renewable', tooltip: 'Show only funding that renews across multiple years.', type: 'select', placeholder: 'Select', options: ['Show all', 'Renewable only', 'One-time only'] },
        { id: 'accepting-applications', label: 'Accepting Applications', tooltip: 'Show only opportunities currently accepting applications.', type: 'select', placeholder: 'Select', options: ['Show all', 'Accepting now only'] },
        { id: 'funding-type', label: 'Funding Opportunity Type', tooltip: 'Scholarship, grant, loan forgiveness, etc.', type: 'select', placeholder: 'Select', options: ['Show all', 'Scholarship', 'Grant', 'Loan Forgiveness', 'Work-study'] },
        { id: 'show-questa-only', label: 'Show Only Questa', tooltip: 'Limit results to Questa Foundation opportunities.', type: 'select', placeholder: 'Select', options: ['No', 'Yes'] },
      ],
    },
  };

  const QUIZ_TOPIC_MAP = [
    'learning-help',
    'careers',
    'education-help',
    'funding',
    'education-training',
    'personal-help',
  ];

  const MENU_TOPIC_MAP = [
    'careers',
    'education-help',
    'funding',
    'learning-help',
    'education-training',
    'personal-help',
  ];

  function getProfile() {
    try {
      return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}');
    } catch {
      return {};
    }
  }

  function saveProfile(data) {
    const existing = getProfile();
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...existing, ...data }));
  }

  function clearProfile() {
    sessionStorage.removeItem(STORAGE_KEY);
  }

  function startTopic(topic) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ topic }));
  }

  function setTopic(topic) {
    saveProfile({ topic, topics: [topic] });
  }

  function setTopics(topics) {
    const list = Array.isArray(topics) ? topics.filter(Boolean) : [];
    saveProfile({ topics: list, topic: list[0] || 'funding' });
  }

  function getTopics() {
    const profile = getProfile();
    if (Array.isArray(profile.topics) && profile.topics.length) return profile.topics;
    if (profile.topic) return [profile.topic];
    return ['funding'];
  }

  function getTopic() {
    return getTopics()[0] || 'funding';
  }

  function fieldRelatedToTopic(topicKey, sectionId, fieldId) {
    const topic = TOPICS[topicKey];
    if (!topic) return false;
    if (topic.expandedSections.includes(sectionId)) return true;
    const promoted = topic.promotedFieldsBySection[sectionId];
    return Array.isArray(promoted) && promoted.includes(fieldId);
  }

  function fieldRelatedToTopics(topicKeys, sectionId, fieldId) {
    return topicKeys.some((key) => fieldRelatedToTopic(key, sectionId, fieldId));
  }

  function fieldVisible(field, profile) {
    if (!field.showWhen) return true;
    const level = profile['student-level'];
    if (field.showWhen.studentLevel && level) {
      return field.showWhen.studentLevel.includes(level);
    }
    if (field.showWhen.studentLevel && !level) return false;
    return true;
  }

  function fieldPromotedForTopic(topicKey, sectionId, fieldId) {
    const topic = TOPICS[topicKey];
    if (!topic) return false;
    const promoted = topic.promotedFieldsBySection[sectionId];
    return Array.isArray(promoted) && promoted.includes(fieldId);
  }

  function getPromotedFieldIds(topicKey, sectionId) {
    const topic = TOPICS[topicKey];
    if (!topic) return [];
    return topic.promotedFieldsBySection[sectionId] || [];
  }

  function identityFieldPromoted(topicKey, fieldId) {
    return fieldPromotedForTopic(topicKey, 'identity-groups', fieldId);
  }

  function sectionExpanded(topicKey, sectionId) {
    const topic = TOPICS[topicKey];
    if (!topic) return false;
    return topic.expandedSections.includes(sectionId);
  }

  global.CompassProfile = {
    TOPICS,
    TOPIC_INTEREST_OPTIONS,
    TOPIC_INTEREST_LABELS,
    SECTIONS,
    QUIZ_TOPIC_MAP,
    MENU_TOPIC_MAP,
    FUNDING_EXTERNAL_URL,
    getProfile,
    saveProfile,
    clearProfile,
    startTopic,
    setTopic,
    setTopics,
    getTopic,
    getTopics,
    fieldVisible,
    fieldPromotedForTopic,
    fieldRelatedToTopic,
    fieldRelatedToTopics,
    getPromotedFieldIds,
    identityFieldPromoted,
    sectionExpanded,
  };
})(window);
