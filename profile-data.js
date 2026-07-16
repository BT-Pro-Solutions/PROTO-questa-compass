(function (global) {
  const STORAGE_KEY = 'compass-profile';
  const FUNDING_EXTERNAL_URL = 'https://compass.questafoundation.org/fund-finder/about-me/GettingStarted';

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

  const TOPIC_ICONS = {
    careers: 'assets/icon-careers.svg',
    'education-help': 'assets/icon-education-readiness.svg',
    funding: 'assets/icon-funding.svg',
    'learning-help': 'assets/icon-learning-help.svg',
    'education-training': 'assets/icon-education-and-training.svg',
    'personal-help': 'assets/icon-personal-help.svg',
  };

  const TOPIC_ICON_SVGS = {
    careers: {
      viewBox: '0 0 20 19',
      markup:
        '<path d="M8 0H12C12.5304 0 13.0391 0.210714 13.4142 0.585786C13.7893 0.960859 14 1.46957 14 2V4H18C18.5304 4 19.0391 4.21071 19.4142 4.58579C19.7893 4.96086 20 5.46957 20 6V17C20 17.5304 19.7893 18.0391 19.4142 18.4142C19.0391 18.7893 18.5304 19 18 19H2C1.46957 19 0.960859 18.7893 0.585786 18.4142C0.210714 18.0391 0 17.5304 0 17V6C0 4.89 0.89 4 2 4H6V2C6 0.89 6.89 0 8 0ZM12 4V2H8V4H12Z" fill="currentColor"/>',
    },
    'education-help': {
      viewBox: '0 0 22 18',
      markup:
        '<path d="M11 0L0 6L11 12L20 7.09V14H22V6M4 10.18V14.18L11 18L18 14.18V10.18L11 14L4 10.18Z" fill="currentColor"/>',
    },
    funding: {
      viewBox: '0 0 17 21',
      markup:
        '<path d="M6.93442 2.52161H4.41281C3.83331 2.52161 3.25949 2.63575 2.7241 2.85751C2.18871 3.07928 1.70225 3.40432 1.29248 3.81409C0.882715 4.22386 0.55767 4.71032 0.335905 5.24571C0.114141 5.78109 0 6.35492 0 6.93442C0 7.51392 0.114141 8.08774 0.335905 8.62313C0.55767 9.15851 0.882715 9.64498 1.29248 10.0547C1.70225 10.4645 2.18871 10.7896 2.7241 11.0113C3.25949 11.2331 3.83331 11.3472 4.41281 11.3472H6.93442V15.1296H1.2608V17.6512H6.93442V20.1729H9.45602V17.6512H11.9776C13.148 17.6512 14.2704 17.1863 15.098 16.3588C15.9255 15.5312 16.3904 14.4088 16.3904 13.2384C16.3904 12.0681 15.9255 10.9457 15.098 10.1181C14.2704 9.29054 13.148 8.82562 11.9776 8.82562H9.45602V5.04321H15.1296V2.52161H9.45602V0H6.93442V2.52161ZM9.45602 11.3472H11.9776C12.4792 11.3472 12.9602 11.5465 13.3149 11.9011C13.6696 12.2558 13.8688 12.7369 13.8688 13.2384C13.8688 13.74 13.6696 14.221 13.3149 14.5757C12.9602 14.9304 12.4792 15.1296 11.9776 15.1296H9.45602V11.3472ZM6.93442 8.82562H4.41281C4.16445 8.82562 3.91853 8.77671 3.68908 8.68166C3.45963 8.58662 3.25114 8.44732 3.07553 8.2717C2.89991 8.09609 2.76061 7.8876 2.66557 7.65815C2.57052 7.4287 2.52161 7.18277 2.52161 6.93442C2.52161 6.68606 2.57052 6.44014 2.66557 6.21068C2.76061 5.98123 2.89991 5.77275 3.07553 5.59713C3.25114 5.42152 3.45963 5.28221 3.68908 5.18717C3.91853 5.09213 4.16445 5.04321 4.41281 5.04321H6.93442V8.82562Z" fill="currentColor"/>',
    },
    'learning-help': {
      viewBox: '0 0 15 20',
      markup:
        '<path d="M6.088 19.413C5.696 19.021 5.5 18.55 5.5 18H9.5C9.5 18.55 9.30433 19.021 8.913 19.413C8.52167 19.805 8.05067 20.0007 7.5 20C6.94933 19.9993 6.47867 19.8037 6.088 19.413ZM3.5 17V15H11.5V17H3.5ZM3.75 14C2.6 13.3167 1.68733 12.4 1.012 11.25C0.336668 10.1 -0.00066568 8.85 9.86193e-07 7.5C9.86193e-07 5.41667 0.729334 3.646 2.188 2.188C3.64667 0.730001 5.41733 0.000667123 7.5 4.56621e-07C9.58267 -0.00066621 11.3537 0.728667 12.813 2.188C14.2723 3.64733 15.0013 5.418 15 7.5C15 8.85 14.6627 10.1 13.988 11.25C13.3133 12.4 12.4007 13.3167 11.25 14H3.75Z" fill="currentColor"/>',
    },
    'education-training': {
      viewBox: '0 0 24 24',
      markup:
        '<path d="M2 16.5C2 16.2348 2.10536 15.9804 2.29289 15.7929C2.48043 15.6054 2.73478 15.5 3 15.5H6V12L12 8L18 12V15.5H21C21.2652 15.5 21.5196 15.6054 21.7071 15.7929C21.8946 15.9804 22 16.2348 22 16.5V21C22 21.2652 21.8946 21.5196 21.7071 21.7071C21.5196 21.8946 21.2652 22 21 22H2V16.5Z" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12 3V8" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/><path d="M18 6.00004V3.00004C18 3.00004 17.25 4.50004 15 3.00004C12.75 1.50004 12 3.00004 12 3.00004V6.00004C12 6.00004 12.75 4.50004 15 6.00004C17.25 7.50004 18 6.00004 18 6.00004Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M14 22V15.5H10V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M9 22H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
    },
    'personal-help': {
      viewBox: '0 0 16 22',
      markup:
        '<path fill-rule="evenodd" clip-rule="evenodd" d="M7.83569 0C7.37606 -6.84897e-09 6.92094 0.0905302 6.4963 0.266422C6.07166 0.442313 5.68582 0.700121 5.36081 1.02513C5.03581 1.35013 4.778 1.73597 4.60211 2.16061C4.42622 2.58525 4.33569 3.04037 4.33569 3.5C4.33569 3.95963 4.42622 4.41475 4.60211 4.83939C4.778 5.26403 5.03581 5.64987 5.36081 5.97487C5.68582 6.29988 6.07166 6.55769 6.4963 6.73358C6.92094 6.90947 7.37606 7 7.83569 7C8.76395 7 9.65418 6.63125 10.3106 5.97487C10.9669 5.3185 11.3357 4.42826 11.3357 3.5C11.3357 2.57174 10.9669 1.6815 10.3106 1.02513C9.65418 0.368749 8.76395 1.38321e-08 7.83569 0ZM14.5187 9.325C14.1333 8.93965 13.6719 8.63875 13.1639 8.44146C12.6559 8.24418 12.1123 8.15483 11.5679 8.1791C11.0234 8.20337 10.49 8.34072 10.0015 8.58243C9.51305 8.82413 9.08026 9.16489 8.73069 9.583L7.83569 10.478L6.87969 9.522C6.53355 9.12507 6.11102 8.80189 5.63731 8.57175C5.1636 8.3416 4.64839 8.2092 4.12241 8.18243C3.59644 8.15566 3.07045 8.23507 2.57582 8.41593C2.08119 8.59678 1.62803 8.87539 1.24338 9.23512C0.858724 9.59486 0.550441 10.0284 0.33691 10.5098C0.123378 10.9912 0.00896987 11.5107 0.0005066 12.0373C-0.00795667 12.5639 0.0896981 13.0868 0.287648 13.5749C0.485599 14.0629 0.779792 14.5061 1.15269 14.878L1.16269 14.888L2.29469 16.019L7.30969 21.035L7.83269 21.565L13.3767 16.019L14.5077 14.889L14.5097 14.887L14.5177 14.879L14.5187 14.877C15.2549 14.1407 15.6685 13.1422 15.6685 12.101C15.6685 11.0598 15.2549 10.0613 14.5187 9.325Z" fill="currentColor"/>',
    },
  };

  function topicIconHtml(topicKey, className = 'topic-icon') {
    const src = TOPIC_ICONS[topicKey];
    if (!src) return '';
    return `<img class="${className}" src="${src}" alt="" aria-hidden="true">`;
  }

  function topicPillIconHtml(topicKey, className = 'topic-icon') {
    const svg = TOPIC_ICON_SVGS[topicKey];
    if (!svg) return '';
    return `<svg class="${className} topic-icon--svg" viewBox="${svg.viewBox}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">${svg.markup}</svg>`;
  }

  function buildTopicInterestFields() {
    const TOOLTIPS = {
      'learning-help': 'Select the learning resources that match your needs.',
      careers: 'Select the career resources that match your needs.',
      'education-help': 'Select the resources you need to get ready for college or further training.',
      'education-training':
        'Select the type of education you\u2019re seeking to find local programs that offer those credentials.',
      'personal-help': 'Select the personal help resources that match your needs.',
    };

    return Object.entries(TOPIC_INTEREST_OPTIONS)
      .filter(([topicKey]) => topicKey !== 'funding')
      .map(([topicKey, options]) => {
        const label = TOPIC_INTEREST_LABELS[topicKey];
        return {
          id: `${topicKey}-interests`,
          label: `${label} Resources`,
          tooltip:
            TOOLTIPS[topicKey] ||
            `Select the ${label.toLowerCase()} resources that match your needs.`,
          type: 'multiselect',
          modalTitle: `Select ${label} Resources`,
          modalDescription: `Choose the ${label.toLowerCase()} resources that apply to you. You can select more than one.`,
          placeholder: `Select ${label.toLowerCase()} resources\u2026`,
          options,
        };
      });
  }

  function buildIdentityMultiselectField(id, label, tooltip, options) {
    return {
      id,
      label,
      tooltip,
      type: 'multiselect',
      modalTitle: `Select ${label}`,
      modalDescription: `Choose the ${label.toLowerCase()} options that apply to you. You can select more than one.`,
      placeholder: `Select ${label.toLowerCase()}\u2026`,
      optional: true,
      options,
    };
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
      expandedSections: ['about-you', 'education-interests', 'financial-aid', 'identity-groups'],
      promotedFieldsBySection: {},
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
      title: 'Choose any specific resources you’d like to find',
      fields: buildTopicInterestFields(),
    },
    'about-you': {
      title: 'About you',
      fields: [
        {
          id: 'student-level',
          label: 'What best describes you?',
          tooltip: 'Your current stage of education helps us show the most relevant resources.',
          type: 'select',
          placeholder: 'Please Select...',
          required: true,
          options: [
            { value: 'hs', label: 'Attending High School' },
            { value: 'young-adult', label: 'Young Adult (18–24) Learner' },
            { value: 'adult', label: 'Adult (25+) Learner' },
            { value: 'k12-educator', label: 'K12 Educator' },
            { value: 'college-educator', label: 'College Educator' },
            { value: 'training-educator', label: 'Training Educator' },
            { value: 'family-member', label: 'Family Member' },
            { value: 'community-member', label: 'Community Member' },
            { value: 'resource-provider', label: 'Resource Provider' },
          ],
        },
        {
          id: 'residency',
          label: 'Residency',
          tooltip: 'Many opportunities are available to residents of specific counties.',
          type: 'select',
          placeholder: 'Please Select...',
          required: true,
          options: ['Allen County, IN', 'Adams County, IN', 'DeKalb County, IN', 'Kosciusko County, IN', 'Other Indiana', 'Out of State'],
        },
        {
          id: 'hs-attending',
          label: 'High School Attending',
          tooltip: 'Select the high school you currently attend.',
          type: 'select',
          placeholder: 'Select',
          showWhen: { studentLevel: ['hs'] },
          options: ['Northrop High School', 'Snider High School', 'Homestead High School', 'Warsaw High School', 'Other'],
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
          tooltip: 'Are you currently enrolled in a college or post-high school training program?',
          type: 'select',
          placeholder: 'Select',
          showWhen: { studentLevel: ['young-adult', 'adult'] },
          options: ['Currently Enrolled', 'Accepted — Not Yet Enrolled', 'Not Currently Enrolled'],
        },
        {
          id: 'college-gpa',
          label: 'College GPA',
          tooltip: 'Your cumulative college GPA if applicable.',
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
          tooltip: 'Types of credential programs you are seeking.',
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
          tooltip: 'The subject area (major) or trade you want to pursue.',
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
          label: 'Colleges of Interest',
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
          tooltip: 'Select the training providers for trades and/or certifications that are not colleges.',
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
        { id: 'gender', label: 'Gender', tooltip: 'Used to match identity-specific opportunities.', type: 'select', placeholder: 'Select', optional: true, options: ['Female', 'Male', 'Non-binary', 'Prefer not to say'] },
        buildIdentityMultiselectField('designed-for', 'Specifically Designed For', 'Communities a program may specifically serve.', ['First-generation college students', 'Single parents', 'Foster youth', 'Other']),
        buildIdentityMultiselectField('activities-affiliations', 'Activities & Affiliations', 'Specific resources may be available based on your clubs, organizations, or affiliations.', ['Clubs & Organizations', 'Athletics', 'Religious Organization', 'Community / Volunteer Group', 'Professional Association', 'Other']),
        buildIdentityMultiselectField('health-related', 'Health Related', 'Specific resources may be available based on your health or wellness needs.', ['Mental wellness', 'Substance recovery support', 'Disability services', 'General wellness']),
        buildIdentityMultiselectField('employer-affiliation', 'Employer Affiliation', 'Specific resources may be available based on your current employer or where family members work.', ['Parkview Health', 'General Motors', 'Lutheran Health Network', 'Other Northeast Indiana Employer', 'Not currently employed']),
        buildIdentityMultiselectField('military', 'Military / Public Service Affiliation', 'Specific resources may be available based on your military or public service affiliations.', ['Active duty', 'Veteran', 'National Guard / Reserve', 'Public service employee', 'None']),
        buildIdentityMultiselectField('career-interests', 'Career Interests', 'Career areas you want to explore.', ['Healthcare', 'Technology', 'Skilled Trades', 'Business', 'Arts & Design']),
      ],
    },
    'financial-aid': {
      title: 'Your Financial Aid Preferences',
      fields: [
        { id: 'gpa-requirement', label: 'GPA Requirement', tooltip: 'Select this option to see opportunities that require a specific GPA.', type: 'select', placeholder: 'Select', options: ['Show all', 'No GPA requirement only', 'Has GPA requirement'] },
        { id: 'financial-need', label: 'Financial Need Requirement', tooltip: 'Select this option to see opportunities awarded based on financial need.', type: 'select', placeholder: 'Select', options: ['Show all', 'Need-based only', 'Merit-based only'] },
        { id: 'multi-year', label: 'Multi-Year / Renewable', tooltip: 'Select this option to see opportunities that provide funding for more than one year.', type: 'select', placeholder: 'Select', options: ['Show all', 'Renewable only', 'One-time only'] },
        { id: 'accepting-applications', label: 'Accepting Applications', tooltip: 'Filter by whether funding opportunities are accepting applications right now. "Show All" lists open and closed opportunities so you can see things that will open again in the future, but aren\u2019t currently taking applications.', type: 'select', placeholder: 'Select', options: ['Show all', 'Accepting now only'] },
        { id: 'funding-type', label: 'Funding Opportunity Type', tooltip: 'Scholarship, grant, loan forgiveness, etc.', type: 'select', placeholder: 'Select', options: ['Show all', 'Scholarship', 'Grant', 'Loan Forgiveness', 'Work-study'] },
        { id: 'show-questa-only', label: 'Show Only Questa', tooltip: 'Select this option to only show funding opportunities provided by Questa Education Foundation.', type: 'select', placeholder: 'Select', options: ['No', 'Yes'] },
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

  function findFieldById(fieldId) {
    for (const section of Object.values(SECTIONS)) {
      const field = section.fields.find((f) => f.id === fieldId);
      if (field) return field;
    }
    return null;
  }

  function formatProfileValue(field, value) {
    if (value === undefined || value === null || value === '') return null;
    if (field.type === 'multiselect' || Array.isArray(value)) {
      const arr = Array.isArray(value) ? value.filter(Boolean) : [value];
      if (!arr.length) return null;
      if (arr.length <= 2) return arr.join(', ');
      return `${arr.slice(0, 2).join(', ')} +${arr.length - 2} more`;
    }
    if (field.type === 'select' && field.options) {
      const match = field.options.find((opt) =>
        typeof opt === 'object' ? opt.value === value : opt === value
      );
      return typeof match === 'object' ? match.label : value;
    }
    return String(value).trim() || null;
  }

  function getProfileSynopsis(profile, topicKeys = []) {
    const STUDENT_LEVEL_SHORT = {
      hs: 'HS student',
      'young-adult': 'Young adult',
      adult: 'Adult learner',
      'k12-educator': 'K12 educator',
      'college-educator': 'College educator',
      'training-educator': 'Training educator',
      'family-member': 'Family member',
      'community-member': 'Community member',
      'resource-provider': 'Resource provider',
    };
    const keys = topicKeys.length ? topicKeys : getTopics().filter((key) => key !== 'funding');
    const segments = [];

    if (profile['student-level']) {
      segments.push(STUDENT_LEVEL_SHORT[profile['student-level']] || profile['student-level']);
    }

    if (profile.residency) {
      const short = String(profile.residency)
        .replace(', IN', '')
        .replace(' County', ' Co.')
        .replace('Out of State', 'Out of state');
      segments.push(short);
    }

    if (keys.length === 1) {
      segments.push(TOPIC_INTEREST_LABELS[keys[0]] || keys[0]);
    } else if (keys.length > 1) {
      const first = TOPIC_INTEREST_LABELS[keys[0]] || keys[0];
      segments.push(`${first} +${keys.length - 1}`);
    }

    let resourceCount = 0;
    keys.forEach((topicKey) => {
      const val = profile[`${topicKey}-interests`];
      if (Array.isArray(val)) resourceCount += val.length;
    });
    if (resourceCount) {
      segments.push(`${resourceCount} resource pick${resourceCount === 1 ? '' : 's'}`);
    }

    let filledExtras = 0;
    Object.values(SECTIONS).forEach((section) => {
      section.fields.forEach((field) => {
        if (!fieldVisible(field, profile)) return;
        if (['student-level', 'residency'].includes(field.id)) return;
        if (field.id.endsWith('-interests')) return;
        if (formatProfileValue(field, profile[field.id])) filledExtras += 1;
      });
    });
    if (filledExtras) {
      segments.push(`+${filledExtras} detail${filledExtras === 1 ? '' : 's'}`);
    }

    return segments;
  }

  function getProfileSummary(profile, topicKeys = []) {
    const rows = [];
    const keys = topicKeys.length ? topicKeys : getTopics().filter((key) => key !== 'funding');

    if (keys.length) {
      rows.push({
        label: 'Topics',
        value: keys.map((key) => TOPIC_INTEREST_LABELS[key] || key).join(', '),
        isTopics: true,
      });
    }

    const aboutYouIds = ['student-level', 'residency', 'hs-attending', 'enrollment-status'];
    aboutYouIds.forEach((fieldId) => {
      const field = findFieldById(fieldId);
      if (!field || !fieldVisible(field, profile)) return;
      const formatted = formatProfileValue(field, profile[fieldId]);
      if (formatted) rows.push({ label: field.label, value: formatted });
    });

    keys.forEach((topicKey) => {
      const fieldId = `${topicKey}-interests`;
      const field = findFieldById(fieldId);
      if (!field) return;
      const formatted = formatProfileValue(field, profile[fieldId]);
      if (formatted) {
        rows.push({
          label: `${TOPIC_INTEREST_LABELS[topicKey] || topicKey} resources`,
          value: formatted,
        });
      }
    });

    let extraCount = 0;
    Object.entries(SECTIONS).forEach(([sectionId, section]) => {
      section.fields.forEach((field) => {
        if (!fieldVisible(field, profile)) return;
        if (aboutYouIds.includes(field.id)) return;
        if (field.id.endsWith('-interests')) return;
        const formatted = formatProfileValue(field, profile[field.id]);
        if (!formatted) return;
        if (rows.some((row) => row.label === field.label)) return;
        if (rows.length < 6) {
          rows.push({ label: field.label, value: formatted });
        } else {
          extraCount += 1;
        }
      });
    });

    if (extraCount > 0) {
      rows.push({ label: 'Additional details', value: `${extraCount} more field${extraCount === 1 ? '' : 's'}` });
    }

    return rows;
  }

  global.CompassProfile = {
    TOPICS,
    TOPIC_INTEREST_OPTIONS,
    TOPIC_INTEREST_LABELS,
    TOPIC_ICONS,
    topicIconHtml,
    topicPillIconHtml,
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
    findFieldById,
    formatProfileValue,
    getProfileSummary,
    getProfileSynopsis,
  };
})(window);
