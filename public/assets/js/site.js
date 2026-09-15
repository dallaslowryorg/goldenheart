const GH = {
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
    <div class="topline"><div class="shell">Individualized service-dog partnerships • Training • Lifelong support</div></div>
    <header class="header">
      <div class="shell header-inner">
        <a class="brand" href="/" aria-label="Golden Heart Service Dogs home">
          <img src="/assets/images/site/logo.png" alt="Golden Heart Service Dogs" width="360" height="190">
        </a>
        <button class="menu-button" type="button" aria-expanded="false" aria-controls="primary-nav"><span></span><span></span><span></span><span class="sr-only">Menu</span></button>
        <nav id="primary-nav" class="nav" aria-label="Primary navigation">
          ${GH.nav.map(([label,url])=>`<a href="${url}" ${path===url?'aria-current="page"':''}>${label}</a>`).join('')}
          <a class="nav-cta" href="/contact">Get Started</a>
        </nav>
      </div>
    </header>`;

  const btn=host.querySelector('.menu-button');
  const nav=host.querySelector('.nav');
  btn?.addEventListener('click',()=>{
    const open=btn.getAttribute('aria-expanded')==='true';
    btn.setAttribute('aria-expanded', String(!open));
    nav.classList.toggle('open', !open);
  });
  nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
    btn?.setAttribute('aria-expanded','false'); nav?.classList.remove('open');
  }));
}

function renderFooter(){
  const host=document.getElementById('site-footer');
  if(!host) return;
  const year=new Date().getFullYear();
  host.innerHTML=`
    <section class="cta-band">
      <div class="shell cta-band-inner">
        <div><p class="eyebrow light">A partnership built for real life</p><h2>Ready to start a conversation?</h2><p>Tell Golden Heart what you need, what daily life looks like, and what you hope a service-dog partnership can make possible.</p></div>
        <a class="button button-light" href="/contact">Start the Golden Heart Process</a>
      </div>
    </section>
    <footer class="footer">
      <div class="shell footer-grid">
        <div class="footer-brand"><img src="/assets/images/site/logo.png" alt="Golden Heart Service Dogs" width="300" height="160"><p>More than a service dog. A lifelong partnership.</p></div>
        <div><h3>Explore</h3><a href="/service-dogs">Service Dogs</a><a href="/dogs">Our Dogs</a><a href="/veterans">Veterans</a><a href="/training">Training</a></div>
        <div><h3>Learn</h3><a href="/process">Our Process</a><a href="/about">About Golden Heart</a><a href="/faq">FAQ</a><a href="/support">Partner With Us</a></div>
        <div><h3>Connect</h3><a href="/contact">Get Started</a><a href="/contact#general">General Questions</a><a href="/contact#partnership">Partnership / Sponsorship</a><p class="muted">Contact details and social links can be added once confirmed.</p></div>
      </div>
      <div class="shell footer-bottom"><span>© ${year} Golden Heart Service Dogs, LLC</span><span><a href="/privacy">Privacy</a> · <a href="/terms">Terms</a> · <a href="/accessibility">Accessibility</a></span></div>
    </footer>`;
}

function enhanceForms(){
  document.querySelectorAll('form[data-demo-form]').forEach(form=>{
    form.addEventListener('submit',e=>{
      e.preventDefault();
      const note=form.querySelector('.form-message');
      if(note){
        note.hidden=false;
        note.textContent='This form is ready for a secure form endpoint. Connect Formspree, Cloudflare Forms/Worker, or another approved service before launch.';
        note.focus?.();
      }
    });
  });
}

function revealOnScroll(){
  const els=[...document.querySelectorAll('[data-reveal]')];
  if(!('IntersectionObserver' in window)){els.forEach(el=>el.classList.add('revealed'));return;}
  const io=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){entry.target.classList.add('revealed');io.unobserve(entry.target);}
  }),{threshold:.12});
  els.forEach(el=>io.observe(el));
}

renderHeader();
renderFooter();
enhanceForms();
revealOnScroll();
