(()=>{
  const grid=document.querySelector('#stories-grid');
  if(!grid)return;
  const esc=value=>String(value??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const paragraphs=text=>String(text||'').split(/\n\s*\n/).map(p=>p.trim()).filter(Boolean).map(p=>`<p>${esc(p)}</p>`).join('');
  const storyCard=s=>{
    const tags=(s.tags||[]).map(t=>`<span>${esc(t)}</span>`).join('');
    const body=paragraphs(s.body);
    let bodyBlock='';
    if(body){
      bodyBlock=s.collapseBody
        ? `<details class="testimonial-details"><summary>Read full testimonial</summary><div>${body}</div></details>`
        : body;
    }
    const video=s.video?`<details class="testimonial-details"><summary>Watch video</summary><div><video class="voice-video" controls playsinline preload="metadata" ${s.image?`poster="${esc(s.image)}"`:''}><source src="${esc(s.video)}"></video>${s.videoNote?`<p class="video-note">${esc(s.videoNote)}</p>`:''}</div></details>`:'';
    return `<article class="voice-card revealed">
      ${s.image?`<figure class="voice-photo"><img alt="${esc(s.imageAlt||s.title)}" decoding="async" loading="lazy" src="${esc(s.image)}"></figure>`:''}
      <div class="voice-copy">
        <p class="eyebrow">${esc(s.title)}</p>
        ${tags?`<div class="story-meta">${tags}</div>`:''}
        ${s.quote?`<blockquote>“${esc(s.quote)}”</blockquote>`:''}
        ${bodyBlock}
        ${video}
        ${s.attribution?`<p class="voice-attribution">${esc(s.attribution)}</p>`:''}
      </div>
    </article>`;
  };
  fetch('/api/stories',{headers:{Accept:'application/json'}})
    .then(r=>{if(!r.ok)throw new Error('Stories unavailable');return r.json();})
    .then(data=>{
      if(!Array.isArray(data.stories))return;
      grid.innerHTML=data.stories.length?data.stories.map(storyCard).join(''):'<p>No client stories are currently published.</p>';
    })
    .catch(()=>{});
})();
