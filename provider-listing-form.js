(function (global) {
  const CATEGORY_KEYS = [
    'learning-help',
    'careers',
    'education-help',
    'education-training',
    'personal-help',
  ];

  const STUDENT_LEVELS = ['High School', 'Young Adult Learner', 'Adult Learner'];

  const PILL_REMOVE_ICON =
    '<svg class="builder-pill-remove-icon" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M1.5 1.5l7 7M8.5 1.5l-7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';

  let labels = {};
  let topicOptions = {};
  let formState = {
    categories: [],
    subcategories: [],
    eligibility: [],
  };

  let activeField = null;
  let pendingSelections = [];

  const modal = {
    root: null,
    title: null,
    desc: null,
    search: null,
    count: null,
    selected: null,
    list: null,
  };

  function loadTopicData() {
    if (typeof CompassProfile !== 'undefined') {
      labels = CompassProfile.TOPIC_INTEREST_LABELS || {};
      topicOptions = CompassProfile.TOPIC_INTEREST_OPTIONS || {};
      return;
    }
    labels = {
      'learning-help': 'Learning Help',
      careers: 'Careers',
      'education-help': 'Education Readiness',
      'education-training': 'Education & Training',
      'personal-help': 'Personal Help',
    };
    topicOptions = {};
  }

  function categoryLabel(key) {
    return labels[key] || key;
  }

  function categoryKeyFromLabel(label) {
    return CATEGORY_KEYS.find((key) => categoryLabel(key) === label) || null;
  }

  function getSelectedCategoryKeys() {
    return formState.categories
      .map(categoryKeyFromLabel)
      .filter(Boolean);
  }

  function getSubcategoryGroups() {
    const keys = getSelectedCategoryKeys();
    const groups = keys.length ? keys : CATEGORY_KEYS;
    return groups
      .map((key) => ({
        key,
        label: categoryLabel(key),
        options: topicOptions[key] || [],
      }))
      .filter((group) => group.options.length);
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
    trigger.querySelector('.builder-multiselect__inner').innerHTML = renderMultiselectPills(formState[fieldId]);
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
    let optionCount = 0;
    let html = '';

    function renderOption(opt) {
      if (q && !opt.toLowerCase().includes(q)) return;
      optionCount += 1;
      const checked = pendingSelections.includes(opt) ? ' checked' : '';
      html += `
        <label class="builder-ms-option" data-option="${opt.replace(/"/g, '&quot;')}">
          <input type="checkbox" class="builder-ms-option__check" value="${opt.replace(/"/g, '&quot;')}"${checked}>
          <span class="builder-ms-option__label">${opt}</span>
        </label>`;
    }

    if (activeField === 'categories') {
      CATEGORY_KEYS.forEach((key) => {
        const label = categoryLabel(key);
        if (q && !label.toLowerCase().includes(q)) return;
        optionCount += 1;
        const checked = pendingSelections.includes(label) ? ' checked' : '';
        html += `
          <label class="builder-ms-option" data-option="${label.replace(/"/g, '&quot;')}">
            <input type="checkbox" class="builder-ms-option__check" value="${label.replace(/"/g, '&quot;')}"${checked}>
            <span class="builder-ms-option__label">${label}</span>
          </label>`;
      });
    } else if (activeField === 'subcategories') {
      getSubcategoryGroups().forEach((group) => {
        const visibleOpts = group.options.filter((opt) => !q || opt.toLowerCase().includes(q));
        if (!visibleOpts.length) return;
        html += `<div class="builder-ms-group"><p class="builder-ms-group__title">${group.label}</p>`;
        visibleOpts.forEach(renderOption);
        html += '</div>';
      });
    } else if (activeField === 'eligibility') {
      STUDENT_LEVELS.forEach(renderOption);
    }

    modal.list.innerHTML = html || '<p class="builder-ms-empty">No options match your search.</p>';
    modal.count.textContent = `${optionCount} option${optionCount === 1 ? '' : 's'}`;
  }

  function openMultiselectModal(fieldId) {
    activeField = fieldId;
    pendingSelections = [...formState[fieldId]];

    const copy = {
      categories: {
        title: 'Select Main Topics',
        desc: 'Choose every Compass topic this resource supports. Select all that apply.',
      },
      subcategories: {
        title: 'Select Subcategories',
        desc: getSelectedCategoryKeys().length
          ? 'Choose the specific help areas that describe this program or location.'
          : 'Choose subcategories from any topic. Selecting main topics first helps narrow this list.',
      },
      eligibility: {
        title: 'Who It Helps',
        desc: 'Select the student levels this resource is designed to support.',
      },
    }[fieldId];

    modal.title.textContent = copy.title;
    modal.desc.textContent = copy.desc;
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

    if (activeField === 'categories') {
      const allowed = new Set();
      getSubcategoryGroups().forEach((group) => {
        group.options.forEach((opt) => allowed.add(opt));
      });
      formState.subcategories = formState.subcategories.filter((opt) => allowed.has(opt));
      updateMultiselectDisplay('subcategories');
    }

    updateMultiselectDisplay(activeField);
    closeMultiselectModal();
  }

  function togglePendingSelection(opt, selected) {
    if (selected && !pendingSelections.includes(opt)) {
      pendingSelections.push(opt);
    } else if (!selected) {
      pendingSelections = pendingSelections.filter((v) => v !== opt);
    }
    renderMultiselectSelectedTags();
    renderMultiselectList(modal.search.value);
  }

  function removeFieldSelection(fieldId, opt) {
    formState[fieldId] = formState[fieldId].filter((v) => v !== opt);
    if (fieldId === 'categories') {
      const allowed = new Set();
      getSubcategoryGroups().forEach((group) => {
        group.options.forEach((item) => allowed.add(item));
      });
      formState.subcategories = formState.subcategories.filter((item) => allowed.has(item));
      updateMultiselectDisplay('subcategories');
    }
    updateMultiselectDisplay(fieldId);
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

    modal.search.addEventListener('input', () => {
      renderMultiselectList(modal.search.value);
    });

    modal.list.addEventListener('change', (e) => {
      if (!e.target.matches('.builder-ms-option__check')) return;
      togglePendingSelection(e.target.value, e.target.checked);
    });

    modal.selected.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-ms-remove]');
      if (btn) {
        pendingSelections = pendingSelections.filter((v) => v !== btn.dataset.msRemove);
        renderMultiselectSelectedTags();
        renderMultiselectList(modal.search.value);
      }
    });

    document.getElementById('providerMultiselectApplyBtn')?.addEventListener('click', applyMultiselect);
    document.getElementById('providerMultiselectCancelBtn')?.addEventListener('click', closeMultiselectModal);
    document.querySelectorAll('.js-close-provider-multiselect').forEach((el) => {
      el.addEventListener('click', closeMultiselectModal);
    });
  }

  function setValue(id, value) {
    const el = document.getElementById(id);
    if (el && value != null) el.value = value;
  }

  function applyInitialData(data = {}) {
    formState.categories = [...(data.categories || [])];
    formState.subcategories = [...(data.subcategories || [])];
    formState.eligibility = [...(data.eligibility || [])];

    ['categories', 'subcategories', 'eligibility'].forEach(updateMultiselectDisplay);

    setValue('fieldTitle', data.title);
    setValue('fieldProgramType', data.programType);
    setValue('fieldLocation', data.location);
    setValue('fieldDescription', data.description);
    setValue('fieldAddress', data.contact?.address);
    setValue('fieldPhone', data.contact?.phone);
    setValue('fieldEmail', data.contact?.email);
    setValue('fieldWebsite', data.contact?.website);
    setValue('fieldHours', data.contact?.hours);
    setValue('fieldOrganization', data.organization);
    setValue('fieldContactName', data.contactPerson?.name);
    setValue('fieldContactEmail', data.contactPerson?.email);
  }

  function getFormData() {
    return {
      title: document.getElementById('fieldTitle')?.value.trim() || '',
      categories: [...formState.categories],
      subcategories: [...formState.subcategories],
      programType: document.getElementById('fieldProgramType')?.value.trim() || '',
      location: document.getElementById('fieldLocation')?.value.trim() || '',
      description: document.getElementById('fieldDescription')?.value.trim() || '',
      eligibility: [...formState.eligibility],
      contact: {
        address: document.getElementById('fieldAddress')?.value.trim() || '',
        phone: document.getElementById('fieldPhone')?.value.trim() || '',
        email: document.getElementById('fieldEmail')?.value.trim() || '',
        website: document.getElementById('fieldWebsite')?.value.trim() || '',
        hours: document.getElementById('fieldHours')?.value.trim() || '',
      },
      organization: document.getElementById('fieldOrganization')?.value.trim() || '',
      contactPerson: {
        name: document.getElementById('fieldContactName')?.value.trim() || '',
        email: document.getElementById('fieldContactEmail')?.value.trim() || '',
      },
    };
  }

  function init(initialData) {
    loadTopicData();
    bindModal();
    bindMultiselectTriggers(document);
    if (initialData) applyInitialData(initialData);
  }

  global.CompassProviderListingForm = {
    init,
    getFormData,
    applyInitialData,
    STUDENT_LEVELS,
    CATEGORY_KEYS,
  };
})(window);
