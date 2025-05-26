// assets/js/dashboard.js
window.addEventListener('DOMContentLoaded', () => {
  // 1) Logout
  const logoutBtn = document.getElementById('logout-header');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', e => {
      e.preventDefault();
      sessionStorage.removeItem('currentUser');
      window.location = 'index.html';
    });
  }

  // 2) Solicitações
  const listEl = document.getElementById('appointments-list');
  if (!listEl) {
    console.error('Elemento #appointments-list não encontrado');
    return;
  }

  const apps = JSON.parse(localStorage.getItem('appointments')) || [];

  apps.forEach((a, i) => {
    const card = document.createElement('div');
    card.className = 'app-card';
    card.innerHTML = `
      <div class="app-card-header">
        ${a.patient}
      </div>
      <div class="app-card-body">
        <p><strong>Data:</strong> ${a.date}</p>
        <p><strong>Hora:</strong> ${a.time}</p>
        <p><strong>Status:</strong> ${a.status}</p>
      </div>
      <div class="app-card-footer">
        <button class="btn-accept" data-i="${i}" data-st="Aceito">Aceitar</button>
        <button class="btn-decline" data-i="${i}" data-st="Recusado">Recusar</button>
      </div>`;
    listEl.appendChild(card);
  });

  listEl.addEventListener('click', e => {
    const btn = e.target;
    if (!btn.matches('.btn-accept, .btn-decline')) return;
    const idx = btn.dataset.i;
    apps[idx].status = btn.dataset.st;
    localStorage.setItem('appointments', JSON.stringify(apps));
    window.location.reload();
  });

  // 3) (Opcional) Injetar Biblioteca na mesma página
  /*
  const libEl = document.getElementById('dashboard-cards-container');
  if (libEl) {
    fetch('data/content.json')
      .then(r => r.json())
      .then(contents => {
        contents.forEach(c => {
          const card = document.createElement('div');
          card.className = 'card';
          card.innerHTML = `
            <img class="card-image" src="${c.image}" alt="${c.title}">
            <div class="card-header">
              <h4>${c.title}</h4>
            </div>
            <p><em>${c.author} (${c.year})</em></p>
            <button class="detail-btn" data-id="${c.id}">Ver detalhes</button>`;
          libEl.appendChild(card);
        });
      });
  }
  */
});
