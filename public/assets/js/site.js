const GH = {
  // Add the Formspree endpoint here when the form is created, e.g. https://formspree.io/f/abcdwxyz
  formEndpoint: '',
  formRecipient: 'gldnheartservicedogs@gmail.com',
  facebookUrl: 'https://www.facebook.com/profile.php?id=61584248185435',
  nav: [
    ['Home','/'],
    ['Service Dogs','/service-dogs'],
    ['Our Dogs','/dogs'],
    ['Veterans','/veterans'],
    ['Training','/training'],
    ['Process','/process'],
    ['About','/about'],
    ['FAQ','/faq']
  ]
};

function currentPath() {
  let p = window.location.pathname.replace(/\.html$/, '');
  if (p !== '/' && p.endsWith('/')) p = p.slice(0,-1);
  return p || '/';
}

function renderHeader(){
  const host=document.getElementById('site-header');
  if(!host) return;
  const path=currentPath();
  host.innerHTML=`
    <a class="skip-link" href="#main">Skip to content</a>
    <div class="topline"><div class="shell">Tulsa, Oklahoma • Service-dog partnerships • Nationwide & international consideration • Lifelong support</div></div>
    <header class="header">
      <div class="shell header-inner">
        <a class="brand" href="/" aria-label="Golden Heart Service Dogs home">
          <img src="/assets/images/site/logo.png" alt="Golden Heart Service Dogs" width="360" height="190" decoding="async">
        </a>
        <button class="menu-button" type="button" aria-expanded="false" aria-controls="primary-nav" aria-label="Open navigation menu"><span></span><span></span><span></span><span class="sr-only">Menu</span></button>
        <nav id="primary-nav" class="nav" aria-label="Primary navigation">
          ${GH.nav.map(([label,url])=>`<a href="${url}" ${path===url?'aria-current="page"':''}>${label}</a>`).join('')}
          <a class="nav-cta" href="/contact" ${path==='/contact'?'aria-current="page"':''}>Get Started</a>
        </nav>
      </div>
    </header>`;

  const btn=host.querySelector('.menu-button');
  const nav=host.querySelector('.nav');
  const closeMenu=()=>{
    btn?.setAttribute('aria-expanded','false');
    btn?.setAttribute('aria-label','Open navigation menu');
    nav?.classList.remove('open');
    document.body.classList.remove('nav-open');
  };
  const openMenu=()=>{
    btn?.setAttribute('aria-expanded','true');
    btn?.setAttribute('aria-label','Close navigation menu');
    nav?.classList.add('open');
    document.body.classList.add('nav-open');
  };
  btn?.addEventListener('click',()=>{
    const open=btn.getAttribute('aria-expanded')==='true';
    open ? closeMenu() : openMenu();
  });
  nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape' && btn?.getAttribute('aria-expanded')==='true'){
      closeMenu();
      btn.focus();
    }
  });
  document.addEventListener('click',e=>{
    if(btn?.getAttribute('aria-expanded')!=='true') return;
    if(host.contains(e.target)) return;
    closeMenu();
  });
  window.addEventListener('resize',()=>{
    if(window.innerWidth>1000) closeMenu();
  },{passive:true});
}

function renderFooter(){
  const host=document.getElementById('site-footer');
  if(!host) return;
  const year=new Date().getFullYear();
  const path=currentPath();
  const cta = path==='/contact' ? '' : `
    <section class="cta-band">
      <div class="shell cta-band-inner">
        <div><p class="eyebrow light">A partnership built for real life</p><h2>Ready to start a conversation?</h2><p>Tell Golden Heart what you need, what daily life looks like, and what you hope a service-dog partnership can make possible.</p></div>
        <a class="button button-light" href="/contact">Start the Golden Heart Process</a>
      </div>
    </section>`;
  host.innerHTML=`
    ${cta}
    <footer class="footer">
      <div class="shell footer-grid">
        <div class="footer-brand"><img src="/assets/images/site/logo.png" alt="Golden Heart Service Dogs" width="300" height="160" loading="lazy" decoding="async"><p>More than a service dog. A lifelong partnership.</p></div>
        <div><h3>Explore</h3><a href="/service-dogs">Service Dogs</a><a href="/dogs">Our Dogs</a><a href="/veterans">Veterans</a><a href="/training">Training</a></div>
        <div><h3>Learn</h3><a href="/process">Our Process</a><a href="/stories">Client Stories</a><a href="/about">About Golden Heart</a><a href="/faq">FAQ</a><a href="/support">Partnerships</a></div>
        <div><h3>Connect</h3><a href="/contact">Get Started</a><a href="mailto:gldnheartservicedogs@gmail.com">Email Golden Heart</a><a href="tel:+19184022071">918-402-2071</a><a href="${GH.facebookUrl}" target="_blank" rel="noopener noreferrer">Facebook</a><a href="/support">Professional & Community Partnerships</a><span class="footer-hours">Mon–Fri • 8 AM–5 PM CT</span></div>
      </div>
      <div class="shell footer-bottom"><span>© ${year} Golden Heart Service Dogs, LLC</span><span><a href="/privacy">Privacy</a> · <a href="/terms">Terms</a> · <a href="/accessibility">Accessibility</a></span></div>
    </footer>`;
}

function enhanceForms(){
  const typeAliases={
    'service':'service-dog',
    'service-dog':'service-dog',
    'veteran':'veteran',
    'veterans':'veteran',
    'partnership':'partnership',
    'partner':'partnership',
    'general':'general'
  };

  document.querySelectorAll('form[data-inquiry-form]').forEach(form=>{
    const typeSelect=form.querySelector('select[name="type"]');
    const queryType=new URLSearchParams(window.location.search).get('type');
    const normalized=typeAliases[(queryType||'').toLowerCase()];
    if(typeSelect && normalized && [...typeSelect.options].some(o=>o.value===normalized)){
      typeSelect.value=normalized;
    }

    form.addEventListener('submit',async e=>{
      e.preventDefault();
      const message=form.querySelector('.form-message');
      const button=form.querySelector('button[type="submit"]');
      const endpoint=(form.dataset.endpoint || GH.formEndpoint || '').trim();

      const showMessage=(text,state='')=>{
        if(!message) return;
        message.hidden=false;
        message.classList.remove('is-success','is-error');
        if(state) message.classList.add(`is-${state}`);
        message.textContent=text;
        message.focus?.();
      };

      if(!form.reportValidity()) return;

      if(!endpoint){
        showMessage(`Online submission is not active yet. Please email ${GH.formRecipient} or call 918-402-2071.`, 'error');
        return;
      }

      const data=new FormData(form);
      const selectedLabel=typeSelect?.selectedOptions?.[0]?.textContent?.trim() || 'General inquiry';
      data.set('_subject',`Golden Heart Website Inquiry — ${selectedLabel}`);
      data.set('source','Golden Heart website');

      const oldText=button?.textContent;
      if(button){
        button.disabled=true;
        button.textContent='Sending…';
      }
      showMessage('Sending your inquiry…');

      try{
        const response=await fetch(endpoint,{
          method:'POST',
          body:data,
          headers:{'Accept':'application/json'}
        });
        if(!response.ok) throw new Error('Submission failed');
        form.reset();
        if(typeSelect && normalized) typeSelect.value=normalized;
        showMessage('Thank you. Your inquiry has been sent to Golden Heart Service Dogs. A member of the team will follow up using the contact information you provided.', 'success');
      }catch(err){
        showMessage(`We could not send the form right now. Please email ${GH.formRecipient} or call 918-402-2071.`, 'error');
      }finally{
        if(button){
          button.disabled=false;
          button.textContent=oldText || 'Send Initial Inquiry';
        }
      }
    });
  });
}
function revealOnScroll(){
  const els=[...document.querySelectorAll('[data-reveal]')];
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)){
    els.forEach(el=>el.classList.add('revealed'));
    return;
  }
  const io=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){entry.target.classList.add('revealed');io.unobserve(entry.target);}
  }),{threshold:.12});
  els.forEach(el=>io.observe(el));
}

renderHeader();
renderFooter();
enhanceForms();
revealOnScroll();
