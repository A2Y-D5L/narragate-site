/* Minimal accessible navigation toggle */
(function(){
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  var firstLink = nav && nav.querySelector('.site-nav__link');

  if(!toggle || !nav) return;

  // ensure initial aria-hidden state
  if(!nav.hasAttribute('aria-hidden')) nav.setAttribute('aria-hidden','true');

  function openNav(){
    toggle.setAttribute('aria-expanded','true');
    toggle.setAttribute('aria-label','Close primary navigation');
    nav.setAttribute('aria-hidden','false');
    nav.classList.add('is-open');
    // move focus to first link
    if(firstLink) firstLink.focus();
    // prevent body scroll when open
    document.body.style.overflow = 'hidden';
  }

  function closeNav(){
    toggle.setAttribute('aria-expanded','false');
    toggle.setAttribute('aria-label','Open primary navigation');
    nav.setAttribute('aria-hidden','true');
    nav.classList.remove('is-open');
    toggle.focus();
    document.body.style.overflow = '';
  }

  toggle.addEventListener('click', function(){
    var expanded = toggle.getAttribute('aria-expanded') === 'true';
    if(expanded) closeNav(); else openNav();
  });

  // Close on Escape
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape'){
      var expanded = toggle.getAttribute('aria-expanded') === 'true';
      if(expanded) closeNav();
    }
  });

  // Close when clicking a nav link (mobile)
  if(nav){
    nav.addEventListener('click', function(e){
      if(e.target && e.target.matches('.site-nav__link')) closeNav();
    });
  }
})();
