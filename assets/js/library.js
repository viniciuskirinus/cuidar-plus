document.addEventListener('DOMContentLoaded', () => {
  const categoryFilter = document.getElementById('category-filter');
  const yearSort       = document.getElementById('year-sort');
  const searchBox      = document.getElementById('search-box');
  const toggleFavBtn   = document.getElementById('toggle-fav');
  const cardsContainer = document.getElementById('cards-container');

  const detailModal    = document.getElementById('detail-modal');
  const detailTitle    = document.getElementById('detail-title');
  const detailAuthYear = document.getElementById('detail-author-year');
  const detailDesc     = document.getElementById('detail-desc');
  const detailLink     = document.getElementById('detail-link');
  const closeDetail    = document.getElementById('close-detail');

  let contents = [];
  let showFavs = false;
  let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

  // Carrega JSON
  fetch('data/content.json')
    .then(r => r.json())
    .then(data => {
      contents = data;
      populateCategoryFilter();
      renderCards();
    });

  // Preenche dropdown de categorias
  function populateCategoryFilter() {
    const cats = Array.from(new Set(contents.map(c => c.category)));
    cats.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.innerText = cat;
      categoryFilter.appendChild(opt);
    });
  }

  // Renderiza cards de acordo com filtros
  function renderCards() {
    let list = contents.slice();

    // favoritos?
    if (showFavs) {
      list = list.filter(c => favorites.includes(c.id));
      toggleFavBtn.innerText = 'Ver Todos';
    } else {
      toggleFavBtn.innerText = 'Ver Favoritos';
    }

    // categoria
    const cat = categoryFilter.value;
    if (cat !== 'all') list = list.filter(c => c.category === cat);

    // busca
    const term = searchBox.value.trim().toLowerCase();
    if (term) {
      list = list.filter(c =>
        c.title.toLowerCase().includes(term) ||
        c.author.toLowerCase().includes(term)
      );
    }

    // ordenação
    list.sort((a, b) => {
      return yearSort.value === 'asc'
        ? a.year - b.year
        : b.year - a.year;
    });

    // monta HTML
    cardsContainer.innerHTML = '';
    list.forEach(c => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <img class="card-image" src="${c.image}" alt="${c.title}">
        <div class="card-header">
          <h4>${c.title}</h4>
          <button class="fav-btn" data-id="${c.id}">
            ${favorites.includes(c.id) ? '★' : '☆'}
          </button>
        </div>
        <p class="card-author-year">${c.author} — ${c.year}</p>
        <br>
        <button class="detail-btn" data-id="${c.id}">Ver detalhes</button>
      `;
      cardsContainer.appendChild(card);
    });
  }

  // Eventos de filtro e busca
  categoryFilter.addEventListener('change', renderCards);
  yearSort.addEventListener('change', renderCards);
  searchBox.addEventListener('input', renderCards);
  toggleFavBtn.addEventListener('click', () => {
    showFavs = !showFavs;
    renderCards();
  });

  // Delegation: favoritos e detalhes
  cardsContainer.addEventListener('click', e => {
    const id = parseInt(e.target.dataset.id);
    if (e.target.classList.contains('fav-btn')) {
      toggleFavorite(id);
      renderCards();
    }
    if (e.target.classList.contains('detail-btn')) {
      openDetailModal(id);
    }
  });

  // Favoritar/desfavoritar
  function toggleFavorite(id) {
    if (favorites.includes(id)) {
      favorites = favorites.filter(f => f !== id);
    } else {
      favorites.push(id);
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }

  // Modal de detalhes
  function openDetailModal(id) {
    const c = contents.find(x => x.id === id);
    detailTitle.innerText = c.title;
    detailAuthYear.innerText = `${c.author} — ${c.year}`;
    detailDesc.innerText = c.description;
    detailLink.href = c.link;
    detailModal.classList.add('active');
  }
  closeDetail.addEventListener('click', () => {
    detailModal.classList.remove('active');
  });
});