// assets/js/calendar.js
(function(){
  const calendarEl = document.getElementById('calendar');
  const slotsEl    = document.getElementById('time-slots');
  const saveBtn    = document.getElementById('save-appointment');
  const visitsList = document.getElementById('my-visits-list');

  // Novos elementos de endereço e especialidade
  const appointmentCep         = document.getElementById('appointment-cep');
  const appointmentStreet      = document.getElementById('appointment-street');
  const appointmentNumber      = document.getElementById('appointment-number');
  const appointmentComplement  = document.getElementById('appointment-complement');
  const appointmentNeighborhood= document.getElementById('appointment-neighborhood');
  const appointmentCity        = document.getElementById('appointment-city');
  const appointmentState       = document.getElementById('appointment-state');
  const appointmentSpecialty   = document.getElementById('appointment-specialty');


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

  // Lógica para preenchimento automático do CEP
  appointmentCep.addEventListener('blur', () => {
    const cep = appointmentCep.value.replace(/\D/g, ''); // Remove não-dígitos
    if (cep.length !== 8) return;

    fetch(`https://viacep.com.br/ws/${cep}/json/`)
      .then(response => response.json())
      .then(data => {
        if (!data.erro) {
          appointmentStreet.value       = data.logradouro;
          appointmentNeighborhood.value = data.bairro;
          appointmentCity.value         = data.localidade;
          appointmentState.value        = data.uf;
          // Foca no número para o usuário completar
          appointmentNumber.focus();
        } else {
          alert('CEP não encontrado.');
          clearAddressFields();
        }
      })
      .catch(error => {
        console.error('Erro ao buscar CEP:', error);
        alert('Erro ao buscar CEP. Tente novamente.');
        clearAddressFields();
      });
  });

  function clearAddressFields() {
    appointmentStreet.value       = '';
    appointmentNumber.value       = '';
    appointmentComplement.value   = '';
    appointmentNeighborhood.value = '';
    appointmentCity.value         = '';
    appointmentState.value        = '';
  }


  saveBtn.addEventListener('click', ()=>{
    if(!selectedDate)          return alert('Selecione uma data');
    if(!selectedTime)          return alert('Selecione um horário');
    if(!appointmentCep.value)  return alert('Preencha o CEP');
    if(!appointmentStreet.value) return alert('Preencha a Rua');
    if(!appointmentNumber.value) return alert('Preencha o Número');
    if(!appointmentNeighborhood.value) return alert('Preencha o Bairro');
    if(!appointmentCity.value) return alert('Preencha a Cidade');
    if(!appointmentState.value) return alert('Preencha o Estado');
    if(!appointmentSpecialty.value) return alert('Selecione a Especialidade');


    const apps  = JSON.parse(localStorage.getItem('appointments')||'[]');
    const users = JSON.parse(localStorage.getItem('users')||'[]');
    const email = sessionStorage.getItem('currentUser');
    const me    = users.find(u=>u.email===email);

    apps.push({
      patient: me?.name || 'Anônimo',
      date: selectedDate,
      time: selectedTime,
      status: 'Pendente',
      // Novos dados de endereço e especialidade
      cep: appointmentCep.value,
      street: appointmentStreet.value,
      number: appointmentNumber.value,
      complement: appointmentComplement.value,
      neighborhood: appointmentNeighborhood.value,
      city: appointmentCity.value,
      state: appointmentState.value,
      specialty: appointmentSpecialty.value
    });
    localStorage.setItem('appointments', JSON.stringify(apps));
    alert('Visita agendada com sucesso!');
    // Limpa os campos do formulário após o agendamento
    clearAddressFields();
    appointmentCep.value = '';
    appointmentSpecialty.value = '';
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
      // Atualiza a exibição para incluir os novos detalhes
      visitsList.innerHTML = my.map(a=>`
        <div class="visit-item">
          <strong>${a.date}</strong> às ${a.time} — <em>${a.status}</em><br>
          ${a.specialty.replace('_', ' ').toUpperCase()} em ${a.street}, ${a.number} - ${a.neighborhood}<br>
          ${a.city} - ${a.state}, CEP: ${a.cep}
          ${a.complement ? `<br>Complemento: ${a.complement}` : ''}
        </div>
      `).join('');
    }
  }

  // inicializa
  renderMyVisits();
})();