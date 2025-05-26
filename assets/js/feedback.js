document.addEventListener('DOMContentLoaded', () => {
  const openBtn = document.getElementById('open-feedback');
  const fbModal = document.getElementById('modal-feedback');
  const fbSend  = document.getElementById('fb-send');
  const fbClose = document.getElementById('fb-close');
  const fbText  = document.getElementById('fb-text');

  if (!openBtn || !fbModal) return;

  // Cria o array de feedbacks na primeira vez
  if (!localStorage.getItem('feedbacks')) {
    localStorage.setItem('feedbacks', JSON.stringify([]));
  }

  openBtn.addEventListener('click', () => {
    fbModal.classList.add('active');
  });

  fbClose.addEventListener('click', () => {
    fbModal.classList.remove('active');
  });

  fbSend.addEventListener('click', () => {
    const text = fbText.value.trim();
    if (!text) {
      alert('Escreva algo antes de enviar.');
      return;
    }

    const feedbacks = JSON.parse(localStorage.getItem('feedbacks'));
    feedbacks.push({
      user: sessionStorage.getItem('currentUser') || 'Anônimo',
      text,
      date: new Date().toISOString()
    });
    localStorage.setItem('feedbacks', JSON.stringify(feedbacks));

    alert('Obrigado pelo feedback!');
    fbText.value = '';
    fbModal.classList.remove('active');
  });
});
