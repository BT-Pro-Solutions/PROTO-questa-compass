(function (global) {
  const STORAGE_KEY = 'compass-profile';

  const TOPICS = {
    'learning-help': {
      title: 'Find Learning Help',
      expandedSections: ['about-you'],
      promotedFieldsBySection: {},
    },
    careers: {
      title: 'Find Careers',
      expandedSections: ['about-you'],
      promotedFieldsBySection: {
        'identity-groups': ['career-interests'],
      },
    },
    'education-help': {
      title: 'Find Education Help',
      expandedSections: ['about-you'],
      promotedFieldsBySection: {
        'education-interests': ['program-types', 'college-interest', 'field-of-study'],
      },
    },
    funding: {
      title: 'Find Funding',
      expandedSections: ['about-you', 'education-interests', 'financial-aid'],
      promotedFieldsBySection: {
        'identity-groups': ['race', 'ethnicity', 'gender', 'designed-for'],
      },
    },
    'education-training': {
      title: 'Find Education & Training',
      expandedSections: ['about-you'],
      promotedFieldsBySection: {
        'education-interests': [
          'program-types',
          'field-of-study',
          'training-provider',
          'additional-training-provider',
        ],
      },
    },
    'personal-help': {
      title: 'Find Personal Help',
      expandedSections: ['about-you'],
      promotedFieldsBySection: {
        'identity-groups': ['health-related'],
      },
    },
  };

  const SECTIONS = {
    'about-you': {
      title: 'About you',
      tooltip: 'Tell us about your background.',
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
      title: 'Your Education Interests',
      tooltip: 'Let us know what learning options are on your radar. You can skip anything that doesn\u2019t fit your goals.',
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
            'Certificate',
            'Associate Degree',
            'Bachelor\u2019s Degree',
            'Master\u2019s Degree',
            'Doctorate Degree',
            'Apprenticeship',
            'Licensure',
            'Workforce Training',
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
      tooltip: 'Optional details that help match you with resources designed for specific communities.',
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
      tooltip: 'Fine-tune what funding opportunities appear in your results.',
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
    saveProfile({ topic });
  }

  function getTopic() {
    return getProfile().topic || 'funding';
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
    SECTIONS,
    QUIZ_TOPIC_MAP,
    MENU_TOPIC_MAP,
    getProfile,
    saveProfile,
    clearProfile,
    startTopic,
    setTopic,
    getTopic,
    fieldVisible,
    fieldPromotedForTopic,
    getPromotedFieldIds,
    identityFieldPromoted,
    sectionExpanded,
  };
})(window);
