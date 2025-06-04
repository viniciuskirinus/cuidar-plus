// assets/js/dashboard.js
window.addEventListener('DOMContentLoaded', () => {
  // --- Elementos HTML ---
  const logoutBtn = document.getElementById('logout');
  const pendingListEl = document.getElementById('pending-appointments-list');
  const noPendingMsg = document.getElementById('no-pending-appointments');
  const historyListEl = document.getElementById('history-appointments-list');
  const noHistoryMsg = document.getElementById('no-history-appointments');

  // Elementos do Modal de Detalhes
  const detailModal = document.getElementById('appointment-detail-modal');
  const modalPatient = document.getElementById('modal-patient');
  const modalDate = document.getElementById('modal-date');
  const modalTime = document.getElementById('modal-time');
  const modalSpecialty = document.getElementById('modal-specialty');
  const modalAddress = document.getElementById('modal-address');
  const modalStatus = document.getElementById('modal-status');
  const closeDetailBtn = document.getElementById('close-appointment-detail');

  // Elementos do Calendário
  const dashboardCalendarEl = document.getElementById('dashboard-calendar');
  const monthYearDash = document.getElementById('month-year-dash');
  const prevMonthDash = document.getElementById('prev-month-dash');
  const nextMonthDash = document.getElementById('next-month-dash');

  let currentMonthDash = new Date().getMonth();
  let currentYearDash = new Date().getFullYear();
  const monthNamesDash = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  // Elementos do Gráfico
  const visitsChartCanvas = document.getElementById('visits-chart');
  let visitsChart; // Variável para armazenar a instância do gráfico

  // --- Dados ---
  let allAppointments = JSON.parse(localStorage.getItem('appointments')) || [];
  const currentUserEmail = sessionStorage.getItem('currentUser');
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const me = users.find(u => u.email === currentUserEmail);

  // --- Funções Auxiliares ---

  // Função para exibir o modal de detalhes
  function showAppointmentDetails(appointment) {
    modalPatient.textContent = appointment.patient;
    modalDate.textContent = appointment.date;
    modalTime.textContent = appointment.time;
    modalSpecialty.textContent = appointment.specialty ? appointment.specialty.replace(/_/g, ' ').toUpperCase() : 'Não informada';
    modalAddress.textContent = `${appointment.street}, ${appointment.number} ${appointment.complement ? `- ${appointment.complement}` : ''} - ${appointment.neighborhood}, ${appointment.city} - ${appointment.state}, CEP: ${appointment.cep}`;
    modalStatus.textContent = appointment.status;
    detailModal.classList.add('active');
  }

  // Função para fechar o modal
  closeDetailBtn.addEventListener('click', () => {
    detailModal.classList.remove('active');
  });

  // --- Renderização de Agendamentos Pendentes ---
  function renderPendingAppointments() {
    pendingListEl.innerHTML = '';
    const pendingApps = allAppointments.filter(a => a.status === 'Pendente');

    if (pendingApps.length === 0) {
      noPendingMsg.style.display = 'block';
    } else {
      noPendingMsg.style.display = 'none';
      pendingApps.forEach((a, i) => {
        const card = document.createElement('div');
        card.className = 'app-card';
        card.dataset.index = allAppointments.indexOf(a);
        card.innerHTML = `
          <div class="app-card-header">
            ${a.patient}
          </div>
          <div class="app-card-body">
            <p><strong>Data:</strong> ${a.date}</p>
            <p><strong>Hora:</strong> ${a.time}</p>
            <p><strong>Especialidade:</strong> ${a.specialty ? a.specialty.replace(/_/g, ' ').toUpperCase() : 'Não informada'}</p>
            <p><strong>Endereço:</strong> ${a.street}, ${a.number} ${a.complement ? `- ${a.complement}` : ''}</p>
            <p>${a.neighborhood}, ${a.city} - ${a.state} - CEP: ${a.cep}</p>
            <p><strong>Status:</strong> ${a.status}</p>
          </div>
          <div class="app-card-footer">
            <button class="btn-accept" data-status="Aceito">Aceitar</button>
            <button class="btn-decline" data-status="Recusado">Recusar</button>
          </div>`;
        pendingListEl.appendChild(card);
      });
    }
  }

  // --- Renderização de Histórico de Agendamentos ---
  function renderHistoryAppointments() {
    historyListEl.innerHTML = '';
    const historyApps = allAppointments.filter(a => a.status !== 'Pendente').sort((a,b) => new Date(b.date) - new Date(a.date));

    if (historyApps.length === 0) {
      noHistoryMsg.style.display = 'block';
    } else {
      noHistoryMsg.style.display = 'none';
      historyApps.forEach(a => {
        const item = document.createElement('div');
        item.className = 'visit-item history-item';
        item.dataset.id = allAppointments.indexOf(a);
        item.innerHTML = `
          <strong>${a.date}</strong> às ${a.time} — <em>${a.status}</em><br>
          ${a.patient} - ${a.specialty ? a.specialty.replace(/_/g, ' ').toUpperCase() : 'Não informada'}
        `;
        historyListEl.appendChild(item);
      });
    }
  }

  // --- Renderização do Calendário do Dashboard ---
  function renderDashboardCalendar() {
    dashboardCalendarEl.innerHTML = '';
    monthYearDash.textContent = `${monthNamesDash[currentMonthDash]} ${currentYearDash}`;

    const firstDay = new Date(currentYearDash, currentMonthDash, 1).getDay();
    const daysInMonth = new Date(currentYearDash, currentMonthDash + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
      const e = document.createElement('div');
      e.className = 'day empty';
      dashboardCalendarEl.appendChild(e);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const day = document.createElement('div');
      day.className = 'day';
      day.textContent = d;
      day.dataset.day = d;

      const dateString = `${currentYearDash}-${String(currentMonthDash + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const appointmentsOnDay = allAppointments.filter(a => a.date === dateString && a.status !== 'Recusado'); // Apenas aceitos ou pendentes no calendário

      if (appointmentsOnDay.length > 0) {
        day.classList.add('has-appointments');
        day.dataset.appointments = JSON.stringify(appointmentsOnDay.map(app => allAppointments.indexOf(app)));
      }

      dashboardCalendarEl.appendChild(day);
    }
  }

  // --- Inicialização e Atualização do Gráfico ---
  function updateVisitsChart() {
    const specialtyCounts = {};
    allAppointments.forEach(app => {
      if (app.specialty) {
        const specialtyName = app.specialty.replace(/_/g, ' ').toUpperCase();
        specialtyCounts[specialtyName] = (specialtyCounts[specialtyName] || 0) + 1;
      }
    });

    const labels = Object.keys(specialtyCounts);
    const data = Object.values(specialtyCounts);

    if (visitsChart) {
      visitsChart.destroy(); // Destrói a instância anterior do gráfico
    }

    visitsChart = new Chart(visitsChartCanvas, {
      type: 'doughnut', // Pode ser 'pie' ou 'doughnut'
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: [ // Cores para as fatias do gráfico
            '#2a9d8f', // Cuidar+ green
            '#e76f51', // Orange
            '#f4a261', // Light orange
            '#264653', // Dark blue
            '#b5838d', // Muted pink
            '#6d6875'  // Grey
          ],
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: false, // O título já está no H3
            text: 'Visitas por Especialidade'
          }
        }
      }
    });
  }

  // --- Event Listeners ---

  // Logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', e => {
      e.preventDefault();
      sessionStorage.removeItem('currentUser');
      window.location = 'index.html';
    });
  }

  // Ação de Aceitar/Recusar Agendamento
  pendingListEl.addEventListener('click', e => {
    const btn = e.target;
    if (!btn.matches('.btn-accept, .btn-decline')) return;

    const card = btn.closest('.app-card');
    const originalIndex = parseInt(card.dataset.index);

    if (isNaN(originalIndex) || originalIndex < 0 || originalIndex >= allAppointments.length) {
      console.error("Índice de agendamento inválido.");
      return;
    }

    allAppointments[originalIndex].status = btn.dataset.status;
    localStorage.setItem('appointments', JSON.stringify(allAppointments));

    card.remove(); // Remove o card da visualização pendente

    // Re-renderiza todas as seções
    renderPendingAppointments();
    renderHistoryAppointments();
    renderDashboardCalendar();
    updateVisitsChart(); // Atualiza o gráfico
  });

  // Navegação do Calendário
  prevMonthDash.addEventListener('click', () => {
    currentMonthDash--;
    if (currentMonthDash < 0) {
      currentMonthDash = 11;
      currentYearDash--;
    }
    renderDashboardCalendar();
  });

  nextMonthDash.addEventListener('click', () => {
    currentMonthDash++;
    if (currentMonthDash > 11) {
      currentMonthDash = 0;
      currentYearDash++;
    }
    renderDashboardCalendar();
  });

  // Clique em um dia do calendário com agendamentos
  dashboardCalendarEl.addEventListener('click', e => {
    const day = e.target;
    if (day.classList.contains('has-appointments')) {
      const appIndices = JSON.parse(day.dataset.appointments);
      if (appIndices && appIndices.length > 0) {
        const appointmentToShow = allAppointments[appIndices[0]];
        showAppointmentDetails(appointmentToShow);
      }
    }
  });

  // Clique em um item do histórico
  historyListEl.addEventListener('click', e => {
    const item = e.target.closest('.history-item');
    if (item) {
      const originalIndex = parseInt(item.dataset.id);
      if (!isNaN(originalIndex) && allAppointments[originalIndex]) {
        showAppointmentDetails(allAppointments[originalIndex]);
      }
    }
  });

  // --- Inicialização ---
  renderPendingAppointments();
  renderHistoryAppointments();
  renderDashboardCalendar();
  updateVisitsChart(); // Inicializa o gráfico na primeira carga
});