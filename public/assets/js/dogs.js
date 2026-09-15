window.GOLDEN_HEART_DOGS = [
  {name:'Dumbledore', age:'2 years', status:'Available for Contract', group:'available', image:'dumbledore.webp', crop:{position:'48% 72%',scale:1.24,origin:'48% 72%'}, blurb:'Dumbledore is currently available for contract. Matching is based on compatibility, lifestyle, disability-related needs, temperament, and training fit.'},
  {name:'Nala', age:'4 months', sex:'Female', status:'Available Service Dog Prospect', group:'available', image:'nala.webp', blurb:'Nala is in early foundational development and evaluation as Golden Heart assesses her strengths and future service-dog fit.'},
  {name:'Nemo', age:'4 months', status:'Available Service Dog Prospect', group:'available', image:'nemo.webp', blurb:'Nemo is in early foundational development and evaluation as a service-dog prospect.'},
  {name:'Mushu', age:'4 months', status:'Available Service Dog Prospect', group:'available', image:'mushu.webp', blurb:'Mushu is continuing foundational training and evaluation as a service-dog prospect.'},
  {name:'Mulan', age:'4 months', status:'Available Service Dog Prospect', group:'available', image:'mulan.webp', blurb:'Mulan is continuing foundational training and evaluation as a service-dog prospect.'},
  {name:'Ariel', age:'4 months', status:'Available Service Dog Prospect', group:'available', image:'ariel.webp', blurb:'Ariel is continuing foundational training and evaluation as a service-dog prospect.'},

  {name:'Oakley', location:'Oklahoma', status:'Full-Time Placement • Graduating Soon', group:'matched', image:'oakley.webp', crop:{position:'50% 66%',scale:1.14,origin:'50% 66%',filter:'brightness(1.12) saturate(.92)'}, blurb:'Oakley has moved into full-time life with a client in Oklahoma and is approaching graduation.'},
  {name:'Winston', location:'Arkansas', status:'Transitioning to Full-Time • Graduating Soon', group:'matched', image:'winston.webp', crop:{position:'50% 58%',scale:1.12,origin:'50% 58%',filter:'saturate(.72) brightness(.92) contrast(.98)'}, blurb:'Winston is preparing to transition into full-time placement with a client in Arkansas and is nearing graduation.'},
  {name:'Flounder', location:'Florida', status:'Paired with Client', group:'matched', image:'flounder.webp', blurb:'Flounder has been paired with a client in Florida and is no longer available.'},
  {name:'Max', age:'1 year', location:'Connecticut', status:'Paired with Client', group:'matched', image:'max.webp', blurb:'Max has been paired with a client in Connecticut and is no longer available.'},
  {name:'Lily', age:'8 months', location:'Oklahoma', status:'Paired with Client', group:'matched', image:'lily.webp', crop:{position:'36% 30%',scale:1.72,origin:'36% 30%'}, blurb:'Lily has been paired with a client in Oklahoma and is no longer available.'},

  {name:'Theo', age:'8 months', status:'Placed with Veteran Organization', group:'partner', image:'theo.webp', blurb:'Theo has been placed with a veteran organization and is no longer available through Golden Heart.'},
  {name:'Teddy', age:'8 months', status:'Placed with Veteran Organization', group:'partner', image:'teddy.webp', blurb:'Teddy has been placed with a veteran organization and is no longer available through Golden Heart.'},
  {name:'Paisley', age:'1½ years', status:'Placed with Veteran Organization', group:'partner', image:'paisley.webp', blurb:'Paisley has been placed with a veteran organization and is no longer available through Golden Heart.'},
  {name:'Dreamer', age:'1½ years', status:'Placed with Veteran Organization', group:'partner', image:'dreamer.webp', blurb:'Dreamer has been placed with a veteran organization and is no longer available through Golden Heart.'},

  {name:'Winnie', year:'2025', status:'Graduate', group:'graduate', image:'winnie.webp', crop:{position:'44% 70%',scale:1.12,origin:'44% 70%'}, blurb:'Winnie is a 2025 Golden Heart Service Dogs graduate.'},
  {name:'Alfredo', year:'2026', status:'Graduate', group:'graduate', image:'alfredo.webp', crop:{position:'50% 77%',scale:1.04,origin:'50% 77%'}, blurb:'Alfredo is a 2026 Golden Heart Service Dogs graduate.'},
  {name:'Bear', year:'2026', status:'Graduate', group:'graduate', image:'bear.webp', blurb:'Bear is a 2026 Golden Heart Service Dogs graduate.'},
  {name:'Rango', year:'2026', status:'Graduate', group:'graduate', image:'rango.webp', crop:{position:'56% 62%',scale:1.04,origin:'56% 62%'}, blurb:'Rango is a 2026 Golden Heart Service Dogs graduate.'},
  {name:'Ruby', year:'2026', status:'Graduate', group:'graduate', image:'ruby.webp', crop:{position:'58% 77%',scale:1.03,origin:'58% 77%'}, blurb:'Ruby is a 2026 Golden Heart Service Dogs graduate.'},
  {name:'Whiskey', year:'2026', status:'Graduate', group:'graduate', image:'whiskey.webp', crop:{position:'49% 78%',scale:1.03,origin:'49% 78%'}, blurb:'Whiskey is a 2026 Golden Heart Service Dogs graduate.'},
  {name:'Murphy', year:'2026', status:'Graduate', group:'graduate', image:'murphy.webp', crop:{position:'50% 77%',scale:1.04,origin:'50% 77%'}, blurb:'Murphy is a 2026 Golden Heart Service Dogs graduate.'},
  {name:'Remington', year:'2026', status:'Graduate', group:'graduate', image:'remington.webp', blurb:'Remington is a 2026 Golden Heart Service Dogs graduate.'},
  {name:'Ruger', year:'2026', status:'Graduate', group:'graduate', image:'ruger.webp', blurb:'Ruger is a 2026 Golden Heart Service Dogs graduate.'}
];

function dogCard(dog){
  const chips=[dog.age, dog.sex, dog.location, dog.year ? `${dog.year} Graduate` : null].filter(Boolean);
  const statusClass=dog.group==='available'?'available':dog.group==='graduate'?'graduate':dog.group==='partner'?'partner':'matched';
  const crop=dog.crop||{};
  const scale=Number(crop.scale||1);
  const cropStyle=[
    `--dog-position:${crop.position||'50% 50%'}`,
    `--dog-scale:${scale}`,
    `--dog-hover-scale:${(scale*1.025).toFixed(3)}`,
    `--dog-origin:${crop.origin||crop.position||'50% 50%'}`,
    `--dog-filter:${crop.filter||'none'}`
  ].join(';');
  return `<article class="dog-card" id="${dog.name.toLowerCase().replace(/[^a-z0-9]+/g,'-')}">
    <div class="dog-photo"><img loading="lazy" style="${cropStyle}" src="/assets/images/dogs/${dog.image}" alt="${dog.name}, Golden Heart service dog${dog.group==='graduate'?' graduate':''}"></div>
    <div class="dog-card-body">
      <div class="dog-title-row"><h3>${dog.name}</h3><span class="status status-${statusClass}">${dog.status}</span></div>
      ${chips.length?`<div class="chips">${chips.map(x=>`<span>${x}</span>`).join('')}</div>`:''}
      <p>${dog.blurb}</p>
    </div>
  </article>`;
}

function renderDogs(){
  const grid=document.querySelector('[data-dog-grid]');
  if(!grid) return;
  const filters=[...document.querySelectorAll('[data-dog-filter]')];
  let active=grid.dataset.initialFilter || 'all';
  const draw=()=>{
    const dogs=window.GOLDEN_HEART_DOGS.filter(d=>active==='all'||d.group===active);
    grid.innerHTML=dogs.map(dogCard).join('');
    filters.forEach(b=>b.classList.toggle('active',b.dataset.dogFilter===active));
  };
  filters.forEach(btn=>btn.addEventListener('click',()=>{active=btn.dataset.dogFilter;draw();}));
  draw();
}

renderDogs();
