// assets/js/main.js

document.addEventListener('DOMContentLoaded', () => {
  // — Inicialização de storage —
  if (!localStorage.getItem('users')) {
    localStorage.setItem('users', '[]');
  }
  if (!localStorage.getItem('appointments')) {
    localStorage.setItem('appointments', '[]');
  }
  if (!localStorage.getItem('feedbacks')) {
    localStorage.setItem('feedbacks', '[]');
  }
  if (!localStorage.getItem('favorites')) {
    localStorage.setItem('favorites', '[]');
  }

  // — Sessão & usuário logado —
  const currentEmail = sessionStorage.getItem('currentUser');
  const users        = JSON.parse(localStorage.getItem('users') || '[]');
  const me           = users.find(u => u.email === currentEmail);
  const userType     = me?.type || null;

  // — Proteção de rotas —
  const page = window.location.pathname.split('/').pop();
  if (page === 'schedule.html') {
    if (!me)               return window.location = 'login.html';
    if (userType !== 'patient') return window.location = 'dashboard.html';
  }
  if (page === 'dashboard.html') {
    if (!me)                  return window.location = 'login.html';
    if (userType !== 'volunteer') return window.location = 'schedule.html';
  }

  // — Gerência do menu —
  const nav = document.querySelector('nav');
  if (nav) {
    const links = {
      home:      nav.querySelector('a[href="index.html"]'),
      schedule:  nav.querySelector('a[href="schedule.html"]'),
      map:       nav.querySelector('a[href="map.html"]'),
      library:   nav.querySelector('a[href="library.html"]'),
      profile:   nav.querySelector('a[href="profile.html"]'),
      dashboard: nav.querySelector('a[href="dashboard.html"]'),
      login:     nav.querySelector('#login-link'),
      logout:    nav.querySelector('#logout')
    };

    // Exibir/esconder conforme sessão e tipo
    if (links.login)     links.login.style.display     = me ? 'none' : '';
    if (links.logout)    links.logout.style.display    = me ? ''     : 'none';
    if (links.profile)   links.profile.style.display   = me ? ''     : 'none';
    if (links.schedule)  links.schedule.style.display  = userType === 'patient'   ? '' : 'none';
    if (links.dashboard) links.dashboard.style.display = userType === 'volunteer' ? '' : 'none';
    // home, map, library permanecem sempre visíveis
  }

  // — Logout —
  const logoutBtn = document.getElementById('logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', e => {
      e.preventDefault();
      sessionStorage.removeItem('currentUser');
      window.location = 'index.html';
    });
  }

  // — Cadastro —
  const regForm = document.getElementById('register-form');
  if (regForm) {
    regForm.addEventListener('submit', e => {
      e.preventDefault();
      const arr = JSON.parse(localStorage.getItem('users'));
      arr.push({
        name:  regForm['reg-name'].value,
        email: regForm['reg-email'].value,
        pass:  regForm['reg-pass'].value,
        type:  regForm['reg-type'].value
      });
      localStorage.setItem('users', JSON.stringify(arr));
      alert('Cadastro realizado com sucesso!');
      regForm.reset();
    });
  }

  // — Login —
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', e => {
      e.preventDefault();
      const arr = JSON.parse(localStorage.getItem('users'));
      const u = arr.find(u =>
        u.email === loginForm['login-email'].value &&
        u.pass  === loginForm['login-pass'].value
      );
      if (!u) {
        alert('Credenciais inválidas');
        return;
      }
      sessionStorage.setItem('currentUser', u.email);
      window.location = (u.type === 'volunteer') ? 'dashboard.html' : 'schedule.html';
    });
  }

  // — Animação de contadores na Home —
  document.querySelectorAll('.stats-number').forEach(el => {
    const id = el.id; // "vol-count" ou "visit-count"
    const target = (id === 'vol-count')
      ? users.filter(u => u.type === 'volunteer').length
      : JSON.parse(localStorage.getItem('appointments')).length;
    let current = 0;
    const step = Math.ceil(target / 100) || 1;
    const update = () => {
      if (current < target) {
        current += step;
        el.innerText = current > target ? target : current;
        requestAnimationFrame(update);
      } else {
        el.innerText = target;
      }
    };
    update();
  });

  // — Lista de voluntários e visitas na Home —
  const volListEl = document.getElementById('volunteers-list');
  const visitsEl  = document.getElementById('visits-list');
  const apps      = JSON.parse(localStorage.getItem('appointments') || '[]');

  if (volListEl) {
    volListEl.innerHTML = users
      .filter(u => u.type === 'volunteer')
      .map(v => `<div class="vol-item">${v.name}</div>`)
      .join('');
  }

  if (visitsEl) {
    // Exibe a especialidade ou um placeholder se não houver
    visitsEl.innerHTML = apps
      .filter(a => a.status === 'Aceito') // Mostrar apenas visitas aceitas
      .slice(0, 5) // Limitar a 5 últimas visitas para não poluir
      .map(a => `
        <div class="visit-item">
          <strong>${a.date}</strong> às ${a.time}<br>
          Especialidade: ${a.specialty ? a.specialty.replace(/_/g, ' ').toUpperCase() : 'Não especificado'}
        </div>
      `).join('');
  }

  // — Voluntário Destaque —
  const fvEl = document.getElementById('featured-volunteer');
  if (fvEl) {
    const vols = users.filter(u => u.type === 'volunteer');
    if (vols.length) {
      const rand = vols[Math.floor(Math.random() * vols.length)];
      fvEl.innerHTML = `
        <img src="https://picsum.photos/seed/${encodeURIComponent(rand.name)}/80/80" alt="${rand.name}">
        <h4>${rand.name}</h4>
        <p>Disponível para ajudar em diversas especialidades.</p>
        `;
    } else {
      fvEl.innerHTML = '<p>Nenhum voluntário cadastrado ainda.</p>';
    }
  }

  // — Dicas Rápidas de Saúde —
  const tipsEl = document.getElementById('quick-tips-list');
  if (tipsEl) {
    fetch('data/content.json')
      .then(res => res.json())
      .then(contents => {
        tipsEl.innerHTML = contents.slice(0, 3).map(c => `
          <div class="tip-card">
            <h4>${c.title}</h4>
            <p><em>${c.author} (${c.year})</em></p>
            <a href="library.html" class="btn-small">Ler mais</a>
          </div>
        `).join('');
      })
      .catch(err => {
        console.error(err);
        tipsEl.innerHTML = '<p>Erro ao carregar dicas.</p>';
      });
  }
});