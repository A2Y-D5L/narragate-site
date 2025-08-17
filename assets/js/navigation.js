/* Minimal accessible navigation toggle */
(function(){
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  var firstLink = nav && nav.querySelector('.site-nav__link');

  // submenu elements
  var servicesToggle = nav && nav.querySelector('.site-nav__toggle');
  var servicesSublist = servicesToggle && document.getElementById('services-submenu');

  if(!toggle || !nav) return;

  // helper to determine mobile breakpoint (kept in JS to match CSS breakpoint)
  // NOTE: keep this in sync with CSS media query '(max-width:767px)'
  function isMobile(){
    return window.matchMedia('(max-width:767px)').matches;
  }

  // respect reduced motion preference
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ensure initial aria-hidden state
  if(!nav.hasAttribute('aria-hidden')) nav.setAttribute('aria-hidden','true');
  if(servicesSublist && !servicesSublist.hasAttribute('aria-hidden')) servicesSublist.setAttribute('aria-hidden','true');

  // focus trap / tab cycling handler reference
  var handleTabKey;

  // track temporary tabindexed elements to ensure cleanup
  var tempTabTargets = new Set();
  var tempTabTimeouts = new Map();

  function removeTempTab(el){
    if(!el) return;
    if(tempTabTargets.has(el)){
      try{ el.removeAttribute('tabindex'); }catch(e){}
      tempTabTargets.delete(el);
    }
    var t = tempTabTimeouts.get(el);
    if(t){ clearTimeout(t); tempTabTimeouts.delete(el); }
  }

  function openNav(){
    toggle.setAttribute('aria-expanded','true');
    toggle.setAttribute('aria-label','Close primary navigation');
    nav.setAttribute('aria-hidden','false');
    nav.classList.add('is-open');
    // move focus to first link
    if(firstLink) firstLink.focus();
    // prevent body scroll when open
    document.body.style.overflow = 'hidden';
    // trap focus within nav - implement proper Tab/Shift+Tab cycling
    handleTabKey = function(e){
      if(e.key !== 'Tab') return;
      var focusable = Array.prototype.slice.call(nav.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'))
        .filter(function(el){ return el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement; });
      if(!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];

      if(e.shiftKey){
        if(document.activeElement === first){
          e.preventDefault();
          last.focus();
        }
      } else {
        if(document.activeElement === last){
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', handleTabKey);
  }

  function closeNav(){
    toggle.setAttribute('aria-expanded','false');
    toggle.setAttribute('aria-label','Open primary navigation');
    nav.setAttribute('aria-hidden','true');
    nav.classList.remove('is-open');
    toggle.focus();
    document.body.style.overflow = '';
    if(handleTabKey) document.removeEventListener('keydown', handleTabKey);

    // cleanup any temporary tabindexes that may have been added for focus
    tempTabTargets.forEach(function(el){ removeTempTab(el); });
  }

  // legacy simple trap (kept for blur/misc) - still present but not used for cycling
  function trapFocus(e){
    if(!nav.contains(e.target)){
      e.stopPropagation();
      firstLink && firstLink.focus();
    }
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
      // also close submenu if open
      if(servicesToggle && servicesToggle.getAttribute('aria-expanded') === 'true'){
        closeServices();
      }
    }
  });

  // Close when clicking a nav link (mobile only) and support smooth scrolling for same-page anchors
  if(nav){
    nav.addEventListener('click', function(e){
      var clickedLink = e.target.closest && e.target.closest('a[href], button');
      if(!clickedLink) return;

      // Handle anchor smooth scrolling for same-page hash links
      if(clickedLink.matches('a[href^="#"]')){
        var hash = clickedLink.getAttribute('href');
        var dest = document.querySelector(hash);
        if(dest){
          e.preventDefault();
          // choose behavior based on reduced-motion preference
          var behavior = prefersReducedMotion ? 'auto' : 'smooth';
          try{
            dest.scrollIntoView({behavior:behavior,block:'start'});
          }catch(err){
            // fallback
            dest.scrollIntoView();
          }
          // set a temporary tabindex to allow focus, then remove it on blur or after timeout
          var hadTabindex = dest.hasAttribute('tabindex');
          var prevTab = dest.getAttribute('tabindex');
          if(!hadTabindex){
            dest.setAttribute('tabindex','-1');
            tempTabTargets.add(dest);

            // blur handler that removes the temporary tabindex
            var blurHandler = function _remove(){
              removeTempTab(dest);
              dest.removeEventListener('blur', blurHandler);
            };
            dest.addEventListener('blur', blurHandler);

            // safety timeout to remove tabindex if blur never occurs
            var to = setTimeout(function(){
              removeTempTab(dest);
              try{ dest.removeEventListener('blur', blurHandler); }catch(e){}
            }, 5000);
            tempTabTimeouts.set(dest, to);
          }
          dest.focus();
        }
      }

      if(clickedLink.matches('.site-nav__link')){
        if(isMobile()) closeNav();
      }
    });
  }

  // Close mobile nav when clicking outside of it
  document.addEventListener('click', function(e){
    var isOpen = toggle.getAttribute('aria-expanded') === 'true';
    if(!isOpen) return;
    var clickedInside = e.target.closest && (e.target.closest('#site-nav') || e.target.closest('.nav-toggle'));
    if(!clickedInside && isMobile()) closeNav();
  });

  // Services submenu open/close
  function openServices(){
    if(!servicesToggle || !servicesSublist) return;
    servicesToggle.setAttribute('aria-expanded','true');
    servicesSublist.setAttribute('aria-hidden','false');
    servicesSublist.classList.add('is-open');
  }
  function closeServices(){
    if(!servicesToggle || !servicesSublist) return;
    servicesToggle.setAttribute('aria-expanded','false');
    servicesSublist.setAttribute('aria-hidden','true');
    servicesSublist.classList.remove('is-open');
    servicesToggle.focus();
  }

  if(servicesToggle){
    servicesToggle.addEventListener('click', function(e){
      e.preventDefault();
      var expanded = servicesToggle.getAttribute('aria-expanded') === 'true';
      if(expanded) closeServices(); else openServices();
    });

    // keyboard navigation inside submenu (open with Arrow keys)
    servicesToggle.addEventListener('keydown', function(e){
      var items = servicesSublist && Array.prototype.slice.call(servicesSublist.querySelectorAll('.site-nav__link')) || [];
      if(!items.length) return;
      var first = items[0], last = items[items.length-1];
      if(e.key === 'ArrowDown'){
        e.preventDefault();
        openServices();
        first.focus();
      } else if(e.key === 'ArrowUp'){
        e.preventDefault();
        openServices();
        last.focus();
      }
    });

    // manage arrow navigation inside submenu links
    if(servicesSublist){
      servicesSublist.addEventListener('keydown', function(e){
        var items = Array.prototype.slice.call(servicesSublist.querySelectorAll('.site-nav__link'));
        var idx = items.indexOf(document.activeElement);
        if(e.key === 'ArrowDown'){
          e.preventDefault();
          var next = items[idx+1] || items[0];
          next.focus();
        } else if(e.key === 'ArrowUp'){
          e.preventDefault();
          var prev = items[idx-1] || items[items.length-1];
          prev.focus();
        } else if(e.key === 'Escape'){
          closeServices();
        }
      });
    }
  }

  // Highlight active link based on current URL
  (function markActive(){
    var links = nav.querySelectorAll('.site-nav__link');
    var path = location.pathname.replace(/\/$/, '') || '/';
    links.forEach(function(a){
      var href = a.getAttribute('href');
      if(!href) return;
      // Skip hash-only anchors
      if(href.indexOf('#') === 0) return;
      // Normalize href
      var linkPath = href.replace(location.origin, '').replace(/\/$/, '') || '/';
      if(linkPath === path){
        a.classList.add('site-nav__link--active');
        a.setAttribute('aria-current','page');
        // expose parent submenu if needed
        var parentSub = a.closest('.site-nav__sublist');
        if(parentSub){
          parentSub.classList.add('is-open');
          parentSub.setAttribute('aria-hidden','false');
          var parentToggle = parentSub.previousElementSibling;
          if(parentToggle && parentToggle.classList.contains('site-nav__toggle')) parentToggle.setAttribute('aria-expanded','true');
        }
      }
    });
  })();

  // Keep ARIA states in sync on viewport resize
  window.addEventListener('resize', function(){
    if(!isMobile()){
      // ensure mobile-only attributes are reset
      document.body.style.overflow = '';
      if(toggle.getAttribute('aria-expanded') === 'true'){
        toggle.setAttribute('aria-expanded','false');
        toggle.setAttribute('aria-label','Open primary navigation');
      }
      nav.setAttribute('aria-hidden','false');
      nav.classList.remove('is-open');
      if(handleTabKey) document.removeEventListener('keydown', handleTabKey);
    } else {
      // restore hidden state on mobile unless nav was explicitly opened
      if(toggle.getAttribute('aria-expanded') !== 'true'){
        nav.setAttribute('aria-hidden','true');
      }
    }
  });

})();
