// Mapa com Leaflet + filtro
const map = L.map('map').setView([-23.5505, -46.6333], 12);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom:18 }).addTo(map);

// Serviços fixos
const services = [
  { name:'Posto de Saúde A', coords:[-23.545,-46.635], category:'health' },
  { name:'Farmácia B', coords:[-23.560,-46.620], category:'pharma' }
];

function renderMarkers(type='all') {
  map.eachLayer(layer=>{
    if (layer instanceof L.Marker) map.removeLayer(layer);
  });
  if (['all','health'].includes(type)) {
    services.filter(s=>type==='all'||s.category==='health')
      .forEach(s=>L.marker(s.coords).addTo(map).bindPopup(s.name));
  }
  if (['all','pharma'].includes(type)) {
    services.filter(s=>type==='all'||s.category==='pharma')
      .forEach(s=>L.marker(s.coords).addTo(map).bindPopup(s.name));
  }
  if (['all','volunteer'].includes(type)) {
    JSON.parse(localStorage.getItem('users'))
      .filter(u=>u.type==='volunteer')
      .forEach(v=>{
        const lat = -23.55 + (Math.random()-0.5)*0.1;
        const lng = -46.63 + (Math.random()-0.5)*0.1;
        L.marker([lat,lng]).addTo(map).bindPopup(`Voluntário: ${v.name}`);
      });
  }
}

// Inicia tudo
renderMarkers();
document.getElementById('service-type').onchange = e => renderMarkers(e.target.value);
