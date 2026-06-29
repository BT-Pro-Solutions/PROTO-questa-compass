(function (global) {
  const PRIMARY_CATEGORIES = [
    'Careers',
    'Education Readiness',
    'Education & Training',
    'Funding',
    'Learning Help',
    'Personal Help',
  ];

  const COUNTIES = [
    'Adams',
    'Allen',
    'DeKalb',
    'Grant',
    'Huntington',
    'Kosciusko',
    'LaGrange',
    'Noble',
    'Steuben',
    'Wabash',
    'Wells',
    'Whitley',
  ];

  const COUNTIES_SERVED = [
    'Indiana (Any County)',
    'Adams County',
    'Allen County',
    'DeKalb County',
    'Grant County',
    'Huntington County',
    'Kosciusko County',
    'LaGrange County',
    'Noble County',
    'Steuben County',
    'Wabash County',
    'Wells County',
    'Whitley County',
  ];

  const PRIMARY_AUDIENCE = [
    'Community Organizations',
    'Employers',
    'Educators',
    'Education Intermediary',
    'Parents',
    'Students',
    'Other',
  ];

  const STUDENT_LEVELS = [
    'Middle School',
    'High School',
    'Young Adult (Aged 18-24)',
    'Adult Learner (Aged 25+)',
    'Serves All Student Levels',
  ];

  const ENROLLMENT_LEVELS = [
    'Currently Enrolled',
    'Graduated',
    'Interested in Enrollment',
    'Was Enrolled, but Stopped Out',
    'Serves All Enrollment Statuses',
  ];

  const DEMOGRAPHICS = [
    'Financial Need',
    'First Generation Student',
    'Food Insecure',
    'Foster Care',
    'Homeschooled',
    'Justice Involved',
    'LGTBQ+',
    'Military (Active Duty or Veteran)',
    'Single Parent',
    'Student with Disabilities',
    'Students of Color',
    'Specific Gender and/or Gender Identity',
    'Undocumented',
    'Unhoused',
    'Other',
  ];

  const STUDENTS_OF_COLOR = [
    'American Indian or Alaskan Native',
    'Asian',
    'Black or African American',
    'Hispanic, Latino/a, and/or Latinx/e',
    'Native Hawaiian or Other Pacific Islander',
    'White',
  ];

  const GENDER_IDENTITY = ['Female', 'Male', 'Nonbinary'];

  const CAREER_INTERESTS = [
    'Arts & Creative',
    'Business/Finance/Insurance/Marketing',
    'Communication & Media',
    'Criminal Justice & Law',
    'Education',
    'Entrepreneurialism',
    'General / Liberal Arts',
    'Healthcare',
    'Human Services',
    'Manufacturing',
    'Skilled Trades',
    'STEM',
    'Transportation',
    'Other',
  ];

  const TOPIC_RESOURCE_OPTIONS = {
    'Learning Help': [
      'Academic/Study Skills',
      'High School Completion (HSE/GED)',
      'Tutoring/Study Tables',
      'English Language Skills',
      'Other',
    ],
    Careers: [
      'Apprenticeships',
      'Job Shadowing',
      'Information about Careers',
      'Internships/ Co-ops/ Work-Based Learning',
      'Self-Assessment for Careers',
      'Skill Development',
      'Other',
    ],
    'Education Readiness': [
      'Campus Visits',
      'College or Training Exploration',
      'College Bridge / College Success Program',
      'College or Training Application Process',
      'Early College Classes/Dual Credit',
      'College Credit for Past Experience',
      'Transition Planning (time off and re-entry)',
      'Other',
    ],
    Funding: [
      'FAFSA Support (Free Application for Federal Student Aid)',
      'Planning for Education Expenses (Financial Literacy)',
      'Funding for Education (Scholarships or Financial Aid)',
      'Other',
    ],
    'Personal Help': [
      'Childcare',
      'Club and Athletics',
      'Guidance/Support Services',
      'Housing',
      'Mentoring',
      'Social Connections',
      'Transportation',
      'Legal',
      'Wellness - Mental & Physical Health',
      'Documentation/License',
      'Other',
    ],
    'Education & Training': [
      'Certificate',
      'Associate Degree',
      'Bachelor Degree',
      'Master Degree',
      'Doctoral Degree',
      'Employer-Provided Training',
      'Journeyperson Card',
      'Licensure',
      'Other',
    ],
  };

  const PILL_REMOVE_ICON =
    '<svg class="builder-pill-remove-icon" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M1.5 1.5l7 7M8.5 1.5l-7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';

  let formState = {};
  let activeField = null;
  let pendingSelections = [];
  let currentStep = 1;

  const modal = {};

  function initState() {
    formState = {
      primaryCategories: [],
      countiesServed: [],
      studentLevels: [],
      enrollmentLevels: [],
      demographics: [],
      studentsOfColor: [],
      genderIdentity: [],
      careerInterests: [],
    };
    PRIMARY_CATEGORIES.forEach((cat) => {
      formState[`resources-${cat}`] = [];
    });
  }

  function getSelectedCategories() {
    return formState.primaryCategories || [];
  }

  function renderMultiselectPills(values) {
    if (!values.length) {
      return '<span class="builder-multiselect__placeholder">Click to select\u2026</span>';
    }
    return values
      .map(
        (val) =>
          `<span class="builder-multiselect__pill"><span class="builder-multiselect__pill-text">${val}</span><button type="button" class="builder-multiselect__pill-remove" data-remove="${val.replace(/"/g, '&quot;')}" aria-label="Remove ${val.replace(/"/g, '&quot;')}">${PILL_REMOVE_ICON}</button></span>`
      )
      .join('');
  }

  function updateMultiselectDisplay(fieldId) {
    const trigger = document.querySelector(`.builder-multiselect[data-field="${fieldId}"]`);
    if (!trigger) return;
    const inner = trigger.querySelector('.builder-multiselect__inner');
    if (inner) inner.innerHTML = renderMultiselectPills(formState[fieldId] || []);
  }

  function getOptionsForField(fieldId) {
    const map = {
      primaryCategories: PRIMARY_CATEGORIES,
      countiesServed: COUNTIES_SERVED,
      studentLevels: STUDENT_LEVELS,
      enrollmentLevels: ENROLLMENT_LEVELS,
      demographics: DEMOGRAPHICS,
      studentsOfColor: STUDENTS_OF_COLOR,
      genderIdentity: GENDER_IDENTITY,
      careerInterests: CAREER_INTERESTS,
    };
    if (map[fieldId]) return map[fieldId];
    if (fieldId.startsWith('resources-')) {
      const cat = fieldId.replace('resources-', '');
      return TOPIC_RESOURCE_OPTIONS[cat] || [];
    }
    return [];
  }

  function renderMultiselectSelectedTags() {
    if (!pendingSelections.length) {
      modal.selected.innerHTML = '';
      modal.selected.hidden = true;
      return;
    }
    modal.selected.hidden = false;
    modal.selected.innerHTML = pendingSelections
      .map(
        (val) =>
          `<span class="builder-ms-tag">${val}<button type="button" class="builder-ms-tag__remove" data-ms-remove="${val.replace(/"/g, '&quot;')}" aria-label="Remove ${val.replace(/"/g, '&quot;')}">${PILL_REMOVE_ICON}</button></span>`
      )
      .join('');
  }

  function renderMultiselectList(query) {
    const q = query.trim().toLowerCase();
    const options = getOptionsForField(activeField);
    const filtered = options.filter((opt) => !q || opt.toLowerCase().includes(q));
    modal.list.innerHTML = filtered.length
      ? filtered
          .map((opt) => {
            const checked = pendingSelections.includes(opt) ? ' checked' : '';
            return `
              <label class="builder-ms-option">
                <input type="checkbox" class="builder-ms-option__check" value="${opt.replace(/"/g, '&quot;')}"${checked}>
                <span class="builder-ms-option__label">${opt}</span>
              </label>`;
          })
          .join('')
      : '<p class="builder-ms-empty">No options match your search.</p>';
    modal.count.textContent = `${filtered.length} option${filtered.length === 1 ? '' : 's'}`;
  }

  function openMultiselectModal(fieldId) {
    activeField = fieldId;
    pendingSelections = [...(formState[fieldId] || [])];
    const label = document.querySelector(`[data-field-label="${fieldId}"]`)?.textContent?.replace('*', '').trim()
      || fieldId;
    modal.title.textContent = `Select ${label}`;
    modal.desc.textContent = 'Choose all options that apply. You can select more than one.';
    modal.search.value = '';
    renderMultiselectSelectedTags();
    renderMultiselectList('');
    modal.root.hidden = false;
    modal.search.focus();
  }

  function closeMultiselectModal() {
    modal.root.hidden = true;
    activeField = null;
    pendingSelections = [];
  }

  function applyMultiselect() {
    if (!activeField) return;
    formState[activeField] = [...pendingSelections];
    updateMultiselectDisplay(activeField);
    if (activeField === 'primaryCategories') updateTopicResourceSections();
    if (activeField === 'demographics') updateConditionalDemographics();
    closeMultiselectModal();
  }

  function removeFieldSelection(fieldId, opt) {
    formState[fieldId] = (formState[fieldId] || []).filter((v) => v !== opt);
    updateMultiselectDisplay(fieldId);
    if (fieldId === 'primaryCategories') updateTopicResourceSections();
    if (fieldId === 'demographics') updateConditionalDemographics();
  }

  function bindMultiselectTriggers(root) {
    root.querySelectorAll('.builder-multiselect').forEach((trigger) => {
      trigger.addEventListener('click', (e) => {
        if (e.target.closest('.builder-multiselect__pill-remove')) return;
        openMultiselectModal(trigger.dataset.field);
      });
      trigger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openMultiselectModal(trigger.dataset.field);
        }
      });
    });

    root.querySelectorAll('.builder-multiselect__pill-remove').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const fieldId = btn.closest('.builder-multiselect').dataset.field;
        removeFieldSelection(fieldId, btn.dataset.remove);
      });
    });
  }

  function bindModal() {
    modal.root = document.getElementById('providerMultiselectModal');
    modal.title = document.getElementById('providerMultiselectTitle');
    modal.desc = document.getElementById('providerMultiselectDesc');
    modal.search = document.getElementById('providerMultiselectSearch');
    modal.count = document.getElementById('providerMultiselectCount');
    modal.selected = document.getElementById('providerMultiselectSelected');
    modal.list = document.getElementById('providerMultiselectList');
    if (!modal.root) return;

    modal.search.addEventListener('input', () => renderMultiselectList(modal.search.value));
    modal.list.addEventListener('change', (e) => {
      if (!e.target.matches('.builder-ms-option__check')) return;
      const opt = e.target.value;
      if (e.target.checked && !pendingSelections.includes(opt)) pendingSelections.push(opt);
      else pendingSelections = pendingSelections.filter((v) => v !== opt);
      renderMultiselectSelectedTags();
      renderMultiselectList(modal.search.value);
    });
    modal.selected.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-ms-remove]');
      if (!btn) return;
      pendingSelections = pendingSelections.filter((v) => v !== btn.dataset.msRemove);
      renderMultiselectSelectedTags();
      renderMultiselectList(modal.search.value);
    });
    document.getElementById('providerMultiselectApplyBtn')?.addEventListener('click', applyMultiselect);
    document.getElementById('providerMultiselectCancelBtn')?.addEventListener('click', closeMultiselectModal);
    document.querySelectorAll('.js-close-provider-multiselect').forEach((el) => {
      el.addEventListener('click', closeMultiselectModal);
    });
  }

  function multiselectField(fieldId, label, required = true) {
    const req = required ? ' <span class="builder-field__required" aria-hidden="true">*</span>' : '';
    return `
      <div class="builder-field builder-field--full">
        <div class="builder-field__head">
          <span class="builder-field__label" data-field-label="${fieldId}">${label}${req}</span>
        </div>
        <div class="builder-multiselect" role="button" tabindex="0" data-field="${fieldId}" aria-haspopup="dialog">
          <span class="builder-multiselect__inner"><span class="builder-multiselect__placeholder">Click to select\u2026</span></span>
        </div>
      </div>`;
  }

  function renderTopicResourceSections() {
    const root = document.getElementById('topicResourceSections');
    if (!root) return;
    const selected = getSelectedCategories();
    root.innerHTML = selected
      .map((cat) => {
        const fieldId = `resources-${cat}`;
        const heading = cat === 'Learning Help' ? 'Learning Help'
          : cat === 'Careers' ? 'Careers'
          : cat === 'Education Readiness' ? 'Education Readiness'
          : cat === 'Funding' ? 'Funding'
          : cat === 'Personal Help' ? 'Personal Help'
          : 'Education & Training';
        const prompt = {
          'Learning Help': 'Please select which academic resources are provided:',
          Careers: 'Please select which career exploration, experience or skill development resources are provided:',
          'Education Readiness': 'Please select which college/training, exploration, preparation, and success resources are provided:',
          Funding: 'Please select which financial and college funding resources are provided:',
          'Personal Help': 'Please select which personal resources are provided:',
          'Education & Training': 'Please select which college/training education programs are provided:',
        }[cat];
        return `
          <h3 class="provider-form-section__title provider-form-section__title--full">${heading}</h3>
          <p class="provider-form-note provider-form-note--full">${prompt}<span class="builder-field__required" aria-hidden="true">*</span></p>
          ${multiselectField(fieldId, heading + ' resources', true)}`;
      })
      .join('');
    bindMultiselectTriggers(root);
    selected.forEach((cat) => updateMultiselectDisplay(`resources-${cat}`));
  }

  function updateConditionalDemographics() {
    const demo = formState.demographics || [];
    const colorWrap = document.getElementById('studentsOfColorWrap');
    const genderWrap = document.getElementById('genderIdentityWrap');
    if (colorWrap) colorWrap.hidden = !demo.includes('Students of Color');
    if (genderWrap) genderWrap.hidden = !demo.includes('Specific Gender and/or Gender Identity');
  }

  function showStep(step) {
    currentStep = step;
    document.querySelectorAll('[data-form-step]').forEach((el) => {
      el.hidden = Number(el.dataset.formStep) !== step;
    });
    document.getElementById('formStepBackBtn').hidden = step === 1;
    document.getElementById('formStepNextBtn').hidden = step === 2;
    document.getElementById('formStepSubmitBtn').hidden = step !== 2;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function bindSteps() {
    document.getElementById('formStepNextBtn')?.addEventListener('click', () => {
      renderTopicResourceSections();
      showStep(2);
    });
    document.getElementById('formStepBackBtn')?.addEventListener('click', () => showStep(1));
  }

  function init() {
    initState();
    bindModal();
    bindMultiselectTriggers(document);
    bindSteps();
    renderTopicResourceSections();
    updateConditionalDemographics();
  }

  global.CompassProviderAddListingForm = {
    init,
    getFormData: () => ({ ...formState }),
  };
})(window);
