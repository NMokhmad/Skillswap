(function () {
  const config = window.SEARCH_CONFIG || {};
  const isAuthenticated = Boolean(config.isAuthenticated);

  const queryInput = document.getElementById('searchQueryInput');
  const cityInput = document.getElementById('searchCityInput');
  const sortSelect = document.getElementById('searchSortSelect');
  const minRatingRange = document.getElementById('minRatingRange');
  const minRatingValue = document.getElementById('minRatingValue');
  const applyBtn = document.getElementById('applyFiltersBtn');
  const resetBtn = document.getElementById('resetFiltersBtn');
  const resultsGrid = document.getElementById('searchResultsGrid');
  const resultsSummary = document.getElementById('resultsSummary');
  const pagination = document.getElementById('searchPagination');
  const autocompleteDropdown = document.getElementById('autocompleteDropdown');
  const skillsCheckboxes = Array.from(document.querySelectorAll('.ss-sr-checkbox'));
  const saveSearchBtn = document.getElementById('saveSearchBtn');
  const savedSearchesList = document.getElementById('savedSearchesList');
  const searchHeroBtn = document.getElementById('searchHeroBtn');

  if (!queryInput || !resultsGrid || !resultsSummary || !pagination) return;

  const state = {
    q: '',
    city: '',
    skills: [],
    sort: 'rating_desc',
    min_rating: 0,
    page: 1,
    limit: 9,
  };

  let autocompleteItems = [];
  let autocompleteIndex = -1;
  let debounceTimer = null;

  init();

  function init() {
    hydrateStateFromUrl();
    if (!state.q && typeof config.initialQuery === 'string' && config.initialQuery.trim()) {
      state.q = config.initialQuery.trim();
    }
    syncUiFromState();
    bindEvents();
    fetchResults();
    if (isAuthenticated) {
      loadSavedSearches();
    }
  }

  function bindEvents() {
    applyBtn?.addEventListener('click', () => {
      readStateFromUi();
      state.page = 1;
      fetchResults();
    });

    resetBtn?.addEventListener('click', () => {
      state.q = '';
      state.city = '';
      state.skills = [];
      state.sort = 'rating_desc';
      state.min_rating = 0;
      state.page = 1;
      syncUiFromState();
      fetchResults();
    });

    searchHeroBtn?.addEventListener('click', () => {
      readStateFromUi();
      state.page = 1;
      hideAutocomplete();
      fetchResults();
    });

    minRatingRange?.addEventListener('input', () => {
      minRatingValue.textContent = Number(minRatingRange.value).toFixed(1);
    });

    queryInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        readStateFromUi();
        state.page = 1;
        hideAutocomplete();
        fetchResults();
        return;
      }

      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        if (!autocompleteItems.length) return;
        event.preventDefault();
        autocompleteIndex = event.key === 'ArrowDown'
          ? Math.min(autocompleteIndex + 1, autocompleteItems.length - 1)
          : Math.max(autocompleteIndex - 1, 0);
        renderAutocomplete();
        return;
      }

      if (event.key === 'Escape') {
        hideAutocomplete();
        return;
      }

      if (event.key === 'Tab') {
        hideAutocomplete();
      }
    });

    queryInput.addEventListener('keyup', (event) => {
      if (['ArrowDown', 'ArrowUp', 'Enter', 'Escape'].includes(event.key)) {
        if (event.key === 'Enter' && autocompleteIndex >= 0 && autocompleteItems[autocompleteIndex]) {
          event.preventDefault();
          selectSuggestion(autocompleteItems[autocompleteIndex].fullname);
        }
        return;
      }

      const q = queryInput.value.trim();
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => fetchAutocomplete(q), 300);
    });

    document.addEventListener('click', (event) => {
      if (!autocompleteDropdown.contains(event.target) && event.target !== queryInput) {
        hideAutocomplete();
      }
    });

    saveSearchBtn?.addEventListener('click', async () => {
      readStateFromUi();
      const name = window.prompt('Nom de la recherche sauvegardee :');
      if (!name || !name.trim()) return;

      const res = await fetch('/api/search/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          filters: {
            q: state.q,
            city: state.city,
            skills: state.skills,
            sort: state.sort,
            min_rating: state.min_rating,
          },
        }),
      });

      if (!res.ok) return;
      loadSavedSearches();
    });
  }

  function hydrateStateFromUrl() {
    const params = new URLSearchParams(window.location.search);
    state.q = params.get('q') || '';
    state.city = params.get('city') || '';
    state.sort = params.get('sort') || 'rating_desc';
    state.min_rating = Number.parseFloat(params.get('min_rating') || '0') || 0;
    state.page = Number.parseInt(params.get('page') || '1', 10) || 1;

    const skillsFromUrl = [
      ...params.getAll('skills[]'),
      ...params.getAll('skills'),
    ]
      .map((value) => Number.parseInt(value, 10))
      .filter((value) => Number.isInteger(value) && value > 0);
    state.skills = [...new Set(skillsFromUrl)];
  }

  function syncUiFromState() {
    queryInput.value = state.q;
    if (cityInput) cityInput.value = state.city;
    if (sortSelect) sortSelect.value = state.sort;
    if (minRatingRange) minRatingRange.value = String(state.min_rating);
    if (minRatingValue) minRatingValue.textContent = Number(state.min_rating).toFixed(1);

    skillsCheckboxes.forEach((checkbox) => {
      checkbox.checked = state.skills.includes(Number.parseInt(checkbox.value, 10));
    });
  }

  function readStateFromUi() {
    state.q = queryInput.value.trim();
    state.city = cityInput ? cityInput.value.trim() : '';
    state.sort = sortSelect ? sortSelect.value : 'rating_desc';
    state.min_rating = minRatingRange ? Number.parseFloat(minRatingRange.value) || 0 : 0;
    state.skills = skillsCheckboxes
      .filter((checkbox) => checkbox.checked)
      .map((checkbox) => Number.parseInt(checkbox.value, 10))
      .filter((value) => Number.isInteger(value) && value > 0);
  }

  async function fetchResults() {
    resultsSummary.textContent = 'Chargement des resultats...';
    resultsGrid.textContent = '';
    pagination.hidden = true;

    const params = new URLSearchParams();
    if (state.q) params.set('q', state.q);
    if (state.city) params.set('city', state.city);
    if (state.sort) params.set('sort', state.sort);
    if (state.min_rating > 0) params.set('min_rating', String(state.min_rating));
    params.set('page', String(state.page));
    params.set('limit', String(state.limit));
    state.skills.forEach((skillId) => params.append('skills[]', String(skillId)));

    try {
      const res = await fetch(`/api/search/talents?${params.toString()}`);
      if (!res.ok) {
        resultsSummary.textContent = 'Erreur lors du chargement.';
        return;
      }

      const data = await res.json();
      renderResults(data);
      renderPagination(data.page, data.totalPages);
      updateUrl(params);
    } catch (error) {
      console.error('Erreur fetchResults:', error);
      resultsSummary.textContent = 'Erreur lors du chargement.';
    }
  }

  function renderResults(data) {
    const total = Number(data.total || 0);
    const count = data.results.length;
    resultsSummary.textContent = `${total} résultat${total > 1 ? 's' : ''} — page ${data.page}`;

    if (count === 0) {
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'ss-sr-empty';
      const p1 = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = 'Aucun résultat';
      p1.appendChild(strong);
      const p2 = document.createElement('p');
      p2.textContent = "Essayez d'ajuster vos filtres.";
      emptyDiv.appendChild(p1);
      emptyDiv.appendChild(p2);
      resultsGrid.appendChild(emptyDiv);
      return;
    }

    const fragment = document.createDocumentFragment();

    data.results.forEach((user) => {
      const initials = ((user.firstname || '').charAt(0) + (user.lastname || '').charAt(0)).toUpperCase();
      const rating = Number(user.averageRating || 0).toFixed(1);
      const reviewCount = Number(user.reviewCount || 0);

      const card = document.createElement('article');
      card.className = 'ss-sr-result-card';

      const avatarDiv = document.createElement('div');
      avatarDiv.className = 'ss-sr-result-avatar';
      avatarDiv.textContent = initials;

      const nameLink = document.createElement('a');
      nameLink.href = '/talents/' + user.id;
      nameLink.className = 'ss-sr-result-name';
      nameLink.textContent = user.firstname + ' ' + user.lastname;

      const cityP = document.createElement('p');
      cityP.className = 'ss-sr-result-city';
      cityP.textContent = user.city || 'Ville non renseignée';

      const ratingDiv = document.createElement('div');
      ratingDiv.className = 'ss-sr-result-rating';
      ratingDiv.appendChild(buildStarElements(user.averageRating || 0));

      const ratingValueP = document.createElement('p');
      ratingValueP.className = 'ss-sr-result-rating-value';
      ratingValueP.textContent = rating + '/5 (' + reviewCount + ' avis)';

      const skillsDiv = document.createElement('div');
      skillsDiv.className = 'ss-sr-result-skills';
      (user.skills || []).forEach((skill) => {
        const tag = document.createElement('span');
        tag.className = 'ss-sr-skill-tag';
        tag.textContent = skill.label;
        skillsDiv.appendChild(tag);
      });
      if (!(user.skills || []).length) {
        const muted = document.createElement('span');
        muted.className = 'ss-sr-muted';
        muted.textContent = 'Aucune compétence';
        skillsDiv.appendChild(muted);
      }

      const btn = document.createElement('a');
      btn.href = '/talents/' + user.id;
      btn.className = 'ss-sr-result-btn';
      btn.textContent = 'Voir profil';

      card.appendChild(avatarDiv);
      card.appendChild(nameLink);
      card.appendChild(cityP);
      card.appendChild(ratingDiv);
      card.appendChild(ratingValueP);
      card.appendChild(skillsDiv);
      card.appendChild(btn);

      fragment.appendChild(card);
    });

    resultsGrid.appendChild(fragment);
  }

  function renderPagination(currentPage, totalPages) {
    if (!totalPages || totalPages <= 1) {
      pagination.hidden = true;
      pagination.textContent = '';
      return;
    }

    pagination.hidden = false;
    pagination.textContent = '';

    const prev = document.createElement('a');
    prev.className = 'ss-sr-page-prev';
    prev.textContent = 'Précédent';
    if (currentPage <= 1) {
      prev.disabled = true;
    } else {
      prev.href = '#';
      prev.addEventListener('click', (event) => {
        event.preventDefault();
        state.page = currentPage - 1;
        fetchResults();
      });
    }

    const next = document.createElement('a');
    next.className = 'ss-sr-page-next';
    next.textContent = 'Suivant';
    if (currentPage >= totalPages) {
      next.disabled = true;
    } else {
      next.href = '#';
      next.addEventListener('click', (event) => {
        event.preventDefault();
        state.page = currentPage + 1;
        fetchResults();
      });
    }

    const list = document.createElement('ul');
    list.className = 'ss-sr-page-list';

    for (let page = 1; page <= totalPages; page += 1) {
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.className = 'ss-sr-page-link' + (page === currentPage ? ' is-current' : '');
      link.textContent = String(page);
      link.href = '#';
      link.addEventListener('click', (event) => {
        event.preventDefault();
        state.page = page;
        fetchResults();
      });
      li.appendChild(link);
      list.appendChild(li);
    }

    pagination.appendChild(prev);
    pagination.appendChild(next);
    pagination.appendChild(list);
  }

  async function fetchAutocomplete(q) {
    if (!q) {
      hideAutocomplete();
      return;
    }

    try {
      const res = await fetch(`/api/search/autocomplete?q=${encodeURIComponent(q)}`);
      if (!res.ok) {
        hideAutocomplete();
        return;
      }

      const data = await res.json();
      autocompleteItems = data.suggestions || [];
      autocompleteIndex = -1;
      renderAutocomplete();
    } catch (error) {
      console.error('Erreur autocomplete:', error);
      hideAutocomplete();
    }
  }

  function renderAutocomplete() {
    if (!autocompleteItems.length) {
      hideAutocomplete();
      return;
    }

    autocompleteDropdown.hidden = false;
    autocompleteDropdown.textContent = '';

    autocompleteItems.forEach((item, index) => {
      const option = document.createElement('button');
      option.type = 'button';
      option.className = 'ss-sr-autocomplete-item' + (index === autocompleteIndex ? ' is-active' : '');
      option.textContent = item.city ? `${item.fullname} - ${item.city}` : item.fullname;
      option.addEventListener('mousedown', (event) => {
        event.preventDefault();
        selectSuggestion(item.fullname);
      });
      autocompleteDropdown.appendChild(option);
    });
  }

  function hideAutocomplete() {
    autocompleteDropdown.hidden = true;
    autocompleteDropdown.textContent = '';
    autocompleteItems = [];
    autocompleteIndex = -1;
  }

  function selectSuggestion(value) {
    queryInput.value = value;
    readStateFromUi();
    state.page = 1;
    hideAutocomplete();
    fetchResults();
  }

  async function loadSavedSearches() {
    if (!savedSearchesList) return;
    savedSearchesList.textContent = '';
    const loadingP = document.createElement('p');
    loadingP.className = 'ss-sr-muted';
    loadingP.textContent = 'Chargement...';
    savedSearchesList.appendChild(loadingP);

    try {
      const res = await fetch('/api/search/saved');
      if (!res.ok) {
        savedSearchesList.textContent = '';
        const errP = document.createElement('p');
        errP.className = 'ss-sr-muted';
        errP.textContent = 'Impossible de charger.';
        savedSearchesList.appendChild(errP);
        return;
      }

      const data = await res.json();
      const searches = data.searches || [];

      savedSearchesList.textContent = '';

      if (!searches.length) {
        const emptyP = document.createElement('p');
        emptyP.className = 'ss-sr-muted';
        emptyP.textContent = 'Aucune recherche sauvegardée.';
        savedSearchesList.appendChild(emptyP);
        return;
      }

      searches.forEach((saved) => {
        const item = document.createElement('div');
        item.className = 'ss-sr-saved-item';

        const nameP = document.createElement('p');
        nameP.className = 'ss-sr-saved-name';
        nameP.textContent = saved.name;
        item.appendChild(nameP);

        const actions = document.createElement('div');
        actions.className = 'ss-sr-saved-actions';

        const applyBtn = document.createElement('button');
        applyBtn.type = 'button';
        applyBtn.className = 'ss-sr-btn-secondary saved-apply-btn';
        applyBtn.textContent = 'Appliquer';
        applyBtn.addEventListener('click', () => { applySavedFilters(saved.filters || {}); });

        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'ss-sr-btn-danger saved-delete-btn';
        deleteBtn.textContent = 'Supprimer';
        deleteBtn.addEventListener('click', async () => {
          const delRes = await fetch('/api/search/saved/' + saved.id, { method: 'DELETE' });
          if (delRes.ok) { loadSavedSearches(); }
        });

        actions.appendChild(applyBtn);
        actions.appendChild(deleteBtn);
        item.appendChild(actions);
        savedSearchesList.appendChild(item);
      });
    } catch (error) {
      console.error('Erreur loadSavedSearches:', error);
      savedSearchesList.textContent = '';
      const errP = document.createElement('p');
      errP.className = 'ss-sr-muted';
      errP.textContent = 'Impossible de charger.';
      savedSearchesList.appendChild(errP);
    }
  }

  function applySavedFilters(filters) {
    state.q = typeof filters.q === 'string' ? filters.q : '';
    state.city = typeof filters.city === 'string' ? filters.city : '';
    state.sort = typeof filters.sort === 'string' ? filters.sort : 'rating_desc';
    state.min_rating = Number.parseFloat(filters.min_rating) || 0;
    state.skills = Array.isArray(filters.skills)
      ? filters.skills
          .map((value) => Number.parseInt(value, 10))
          .filter((value) => Number.isInteger(value) && value > 0)
      : [];
    state.page = 1;

    syncUiFromState();
    fetchResults();
  }

  function updateUrl(params) {
    const url = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', url);
  }

  function buildStarElements(rating) {
    const full = Math.floor(rating);
    const half = rating - full >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    const frag = document.createDocumentFragment();

    for (let i = 0; i < full; i += 1) {
      const icon = document.createElement('i');
      icon.className = 'fas fa-star';
      frag.appendChild(icon);
    }
    if (half) {
      const icon = document.createElement('i');
      icon.className = 'fas fa-star-half-alt';
      frag.appendChild(icon);
    }
    for (let i = 0; i < empty; i += 1) {
      const icon = document.createElement('i');
      icon.className = 'far fa-star';
      frag.appendChild(icon);
    }

    return frag;
  }

  function escapeHtml(value) {
    const div = document.createElement('div');
    div.textContent = value;
    return div.innerHTML;
  }
})();
