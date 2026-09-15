window.GOLDEN_HEART_DOGS = [
  {name:'Dumbledore', age:'2 years', status:'Available for Contract', group:'available', image:'dumbledore.webp', blurb:'Dumbledore is currently available for contract. Matching is based on compatibility, lifestyle, disability-related needs, temperament, and training fit.'},
  {name:'Nala', age:'4 months', sex:'Female', status:'Available Service Dog Prospect', group:'available', image:'nala.webp', blurb:'Nala is in early foundational development and evaluation as Golden Heart assesses her strengths and future service-dog fit.'},
  {name:'Nemo', age:'4 months', status:'Available Service Dog Prospect', group:'available', image:'nemo.webp', blurb:'Nemo is in early foundational development and evaluation as a service-dog prospect.'},
  {name:'Mushu', age:'4 months', status:'Available Service Dog Prospect', group:'available', image:'mushu.webp', blurb:'Mushu is continuing foundational training and evaluation as a service-dog prospect.'},
  {name:'Mulan', age:'4 months', status:'Available Service Dog Prospect', group:'available', image:'mulan.webp', blurb:'Mulan is continuing foundational training and evaluation as a service-dog prospect.'},
  {name:'Ariel', age:'4 months', status:'Available Service Dog Prospect', group:'available', image:'ariel.webp', blurb:'Ariel is continuing foundational training and evaluation as a service-dog prospect.'},

  {name:'Oakley', location:'Oklahoma', status:'Full-Time Placement • Graduating Soon', group:'matched', image:'oakley.webp', imageFilter:'brightness(1.08) saturate(.94)', blurb:'Oakley has moved into full-time life with a client in Oklahoma and is approaching graduation.'},
  {name:'Winston', location:'Arkansas', status:'Transitioning to Full-Time • Graduating Soon', group:'matched', image:'winston.webp', imageFilter:'saturate(.82) brightness(.96)', blurb:'Winston is preparing to transition into full-time placement with a client in Arkansas and is nearing graduation.'},
  {name:'Flounder', location:'Florida', status:'Paired with Client', group:'matched', image:'flounder.webp', blurb:'Flounder has been paired with a client in Florida and is no longer available.'},
  {name:'Max', age:'1 year', location:'Connecticut', status:'Paired with Client', group:'matched', veteranPlacement:true, image:'max.webp', blurb:'Max has been paired with a veteran client in Connecticut and is no longer available.'},
  {name:'Lily', age:'8 months', location:'Oklahoma', status:'Paired with Client', group:'matched', image:'lily.webp', blurb:'Lily has been paired with a client in Oklahoma and is no longer available.'},

  {name:'Theo', age:'8 months', status:'Placed with Veteran Organization', group:'partner', image:'theo.webp', blurb:'Theo has been placed with a veteran organization and is no longer available through Golden Heart.'},
  {name:'Teddy', age:'8 months', status:'Placed with Veteran Organization', group:'partner', image:'teddy.webp', blurb:'Teddy has been placed with a veteran organization and is no longer available through Golden Heart.'},
  {name:'Paisley', age:'1½ years', status:'Placed with Veteran Organization', group:'partner', image:'paisley.webp', blurb:'Paisley has been placed with a veteran organization and is no longer available through Golden Heart.'},
  {name:'Dreamer', age:'1½ years', status:'Placed with Veteran Organization', group:'partner', image:'dreamer.webp', blurb:'Dreamer has been placed with a veteran organization and is no longer available through Golden Heart.'},

  {name:'Winnie', year:'2025', status:'Graduate', group:'graduate', image:'winnie.webp', blurb:'Winnie is a 2025 Golden Heart Service Dogs graduate.'},
  {name:'Alfredo', year:'2026', status:'Graduate', group:'graduate', image:'alfredo.webp', blurb:'Alfredo is a 2026 Golden Heart Service Dogs graduate.'},
  {name:'Bear', year:'2026', status:'Graduate', group:'graduate', image:'bear.webp', blurb:'Bear is a 2026 Golden Heart Service Dogs graduate.'},
  {name:'Rango', year:'2026', status:'Graduate', group:'graduate', image:'rango.webp', blurb:'Rango is a 2026 Golden Heart Service Dogs graduate.'},
  {name:'Ruby', year:'2026', status:'Graduate', group:'graduate', veteranPlacement:true, image:'ruby.webp', blurb:'Ruby is a 2026 Golden Heart Service Dogs graduate and part of a veteran service-dog team.'},
  {name:'Whiskey', year:'2026', status:'Graduate', group:'graduate', veteranPlacement:true, image:'whiskey-current.webp', blurb:'Whiskey is a 2026 Golden Heart Service Dogs graduate and part of a veteran service-dog team.'},
  {name:'Murphy', year:'2026', status:'Graduate', group:'graduate', veteranPlacement:true, image:'murphy.webp', blurb:'Murphy is a 2026 Golden Heart Service Dogs graduate and part of a veteran service-dog team.'},
  {name:'Remington', year:'2026', status:'Graduate', group:'graduate', veteranPlacement:true, image:'remington.webp', blurb:'Remington is a 2026 Golden Heart Service Dogs graduate and part of a veteran service-dog team.'},
  {name:'Ruger', year:'2026', status:'Graduate', group:'graduate', veteranPlacement:true, image:'ruger-current.webp', blurb:'Ruger is a 2026 Golden Heart Service Dogs graduate and part of a veteran service-dog team.'}
];

// Counts that include confirmed Golden Heart placements not shown as public dog profiles.
// Bo is included in the veteran-placement total but intentionally has no public photo/profile.
window.GOLDEN_HEART_PROGRAM_COUNTS = {
  veteranPlacements: 7,
  veteranOrganizationPlacements: 4
};

function dogCard(dog){
  const chips=[dog.age, dog.sex, dog.location].filter(Boolean);
  if(dog.veteranPlacement) chips.push('Veteran Placement');
  const statusClass=dog.group==='available'?'available':dog.group==='graduate'?'graduate':dog.group==='partner'?'partner':'matched';
  const badgeLabel={available:'Available',matched:'Matched',partner:'Partner Placement',graduate:'Graduate'}[dog.group] || dog.status;
  const stage=dog.group==='graduate' ? `${dog.year} Graduate` : dog.status;
  const imageStyle=`--dog-filter:${dog.imageFilter||'none'}`;
  return `<article class="dog-card group-${dog.group}${dog.veteranPlacement?' veteran-placement-card':''}" id="${dog.name.toLowerCase().replace(/[^a-z0-9]+/g,'-')}">
    <div class="dog-photo"><img loading="lazy" decoding="async" fetchpriority="low" style="${imageStyle}" src="/assets/images/dogs/${dog.image}" alt="${dog.name}, Golden Heart service dog${dog.group==='graduate'?' graduate':''}"></div>
    <div class="dog-card-body">
      <div class="dog-title-row"><h3>${dog.name}</h3><span class="status status-${statusClass}">${badgeLabel}</span></div>
      ${chips.length?`<div class="chips">${chips.map(x=>`<span${x==='Veteran Placement'?' class="veteran-placement-chip"':''}>${x}</span>`).join('')}</div>`:''}
      <p class="dog-stage">${stage}</p>
      <p class="dog-blurb">${dog.blurb}</p>
    </div>
  </article>`;
}

function renderDogs(){
  const validFilters=['all','available','matched','partner','graduate'];
  const hashFilter=window.location.hash.replace('#','');

  document.querySelectorAll('[data-dog-grid]').forEach(grid=>{
    const filters=[...document.querySelectorAll('[data-dog-filter]')];
    let active=grid.dataset.initialFilter || (validFilters.includes(hashFilter)?hashFilter:'all');
    const limit=Number(grid.dataset.limit||0);

    const draw=()=>{
      let dogs=window.GOLDEN_HEART_DOGS.filter(d=>active==='all'||d.group===active);
      if(limit>0) dogs=dogs.slice(0,limit);
      grid.innerHTML=dogs.map(dogCard).join('');
      filters.forEach(b=>{
        const selected=b.dataset.dogFilter===active;
        b.classList.toggle('active',selected);
        b.setAttribute('aria-pressed',String(selected));
      });
    };

    filters.forEach(btn=>btn.addEventListener('click',()=>{
      active=btn.dataset.dogFilter;
      if(grid.dataset.initialFilter===undefined){
        const nextHash=active==='all'?'':`#${active}`;
        history.replaceState(null,'',`${window.location.pathname}${nextHash}`);
      }
      draw();
    }));

    if(grid.dataset.initialFilter===undefined){
      window.addEventListener('hashchange',()=>{
        const next=window.location.hash.replace('#','');
        active=validFilters.includes(next)?next:'all';
        draw();
      });
    }

    draw();
  });

  const counts=window.GOLDEN_HEART_DOGS.reduce((a,d)=>{a[d.group]=(a[d.group]||0)+1;return a;},{all:window.GOLDEN_HEART_DOGS.length});
  document.querySelectorAll('[data-dog-filter]').forEach(btn=>{
    const key=btn.dataset.dogFilter;
    if(btn.dataset.counted==='true') return;
    const count=counts[key]||0;
    btn.insertAdjacentHTML('beforeend',` <span class="filter-count">${count}</span>`);
    btn.dataset.counted='true';
  });
  document.querySelectorAll('[data-dog-count]').forEach(el=>{
    el.textContent=counts[el.dataset.dogCount]||0;
  });
}

function renderVeteranPlacements(){
  const dogs=window.GOLDEN_HEART_DOGS.filter(d=>d.veteranPlacement);
  document.querySelectorAll('[data-veteran-dog-grid]').forEach(grid=>{
    grid.innerHTML=dogs.map(dogCard).join('');
  });
  document.querySelectorAll('[data-veteran-count]').forEach(el=>{
    const key=el.dataset.veteranCount;
    el.textContent=window.GOLDEN_HEART_PROGRAM_COUNTS[key] ?? 0;
  });
}

renderDogs();
renderVeteranPlacements();
