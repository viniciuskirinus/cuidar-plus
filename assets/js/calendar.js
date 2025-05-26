// assets/js/calendar.js
(function(){
  const calendarEl = document.getElementById('calendar');
  const slotsEl    = document.getElementById('time-slots');
  const saveBtn    = document.getElementById('save-appointment');
  const visitsList = document.getElementById('my-visits-list');

  // Data atual
  const today    = new Date();
  const year     = today.getFullYear();
  const month    = today.getMonth();
  const monthNames = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  document.getElementById('month-year').textContent = `${monthNames[month]} ${year}`;

  // Gera dias
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  for(let i=0;i<firstDay;i++){
    const e = document.createElement('div');
    e.className = 'day empty';
    calendarEl.appendChild(e);
  }
  for(let d=1; d<=daysInMonth; d++){
    const day = document.createElement('div');
    day.className = 'day';
    day.textContent = d;
    day.dataset.day = d;
    if(d === today.getDate()) day.classList.add('today');
    calendarEl.appendChild(day);
  }

  let selectedDate=null, selectedTime=null;

  calendarEl.addEventListener('click', e=>{
    if(!e.target.classList.contains('day')||e.target.classList.contains('empty'))return;
    calendarEl.querySelectorAll('.day.selected').forEach(x=>x.classList.remove('selected'));
    e.target.classList.add('selected');
    selectedDate = `${year}-${String(month+1).padStart(2,'0')}-${String(e.target.dataset.day).padStart(2,'0')}`;
    renderTimeSlots();
  });

  function renderTimeSlots(){
    const times = ['09:00','10:00','11:00','14:00','15:00','16:00'];
    slotsEl.innerHTML = '';
    times.forEach(t=>{
      const slot = document.createElement('div');
      slot.className = 'slot';
      slot.textContent = t;
      slot.dataset.time = t;
      slotsEl.appendChild(slot);
    });
    slotsEl.addEventListener('click', e=>{
      if(!e.target.classList.contains('slot'))return;
      slotsEl.querySelectorAll('.slot.selected').forEach(x=>x.classList.remove('selected'));
      e.target.classList.add('selected');
      selectedTime = e.target.dataset.time;
    });
  }

  saveBtn.addEventListener('click', ()=>{
    if(!selectedDate)   return alert('Selecione uma data');
    if(!selectedTime)   return alert('Selecione um horário');

    const apps  = JSON.parse(localStorage.getItem('appointments')||'[]');
    const users = JSON.parse(localStorage.getItem('users')||'[]');
    const email = sessionStorage.getItem('currentUser');
    const me    = users.find(u=>u.email===email);

    apps.push({
      patient: me?.name || 'Anônimo',
      date: selectedDate,
      time: selectedTime,
      status: 'Pendente'
    });
    localStorage.setItem('appointments', JSON.stringify(apps));
    alert('Visita agendada com sucesso!');
    renderMyVisits();
  });

  function renderMyVisits(){
    if(!visitsList) return;
    visitsList.innerHTML = '';
    const users = JSON.parse(localStorage.getItem('users')||'[]');
    const email = sessionStorage.getItem('currentUser');
    const me    = users.find(u=>u.email===email);
    const apps  = JSON.parse(localStorage.getItem('appointments')||'[]');
    const my   = apps.filter(a=>a.patient === (me?.name||'Anônimo'));
    if(my.length===0){
      visitsList.innerHTML = '<p>Nenhuma visita agendada.</p>';
    } else {
      visitsList.innerHTML = my.map(a=>`
        <div class="visit-item">
          <strong>${a.date}</strong> às ${a.time} — <em>${a.status}</em>
        </div>
      `).join('');
    }
  }

  // inicializa
  renderMyVisits();
})();
