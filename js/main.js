/* ============================================
   @unsertheanswer — Main JS
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initScrollAnimations();
  initSmoothScroll();
  initNavbar();
  initEmailForms();
  initVSLVideo();
});

/* Scroll-triggered animations */
function initScrollAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.animate-on-scroll').forEach((el) => {
    observer.observe(el);
  });
}

/* Smooth scroll for anchor links */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

/* Navbar scroll effect */
function initNavbar() {
  const nav = document.querySelector('.navbar');
  if (!nav) return;

  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    if (currentScroll > 60) {
      nav.classList.add('navbar--scrolled');
    } else {
      nav.classList.remove('navbar--scrolled');
    }
    if (currentScroll > lastScroll && currentScroll > 300) {
      nav.classList.add('navbar--hidden');
    } else {
      nav.classList.remove('navbar--hidden');
    }
    lastScroll = currentScroll;
  });

  /* Mobile menu toggle */
  const toggle = document.querySelector('.navbar__toggle');
  const menu = document.querySelector('.navbar__menu');
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      menu.classList.toggle('navbar__menu--open');
      toggle.classList.toggle('active');
      document.body.style.overflow = menu.classList.contains('navbar__menu--open') ? 'hidden' : '';
    });
  }
}

/* Email form handling — connects to Kit (ConvertKit) */
function initEmailForms() {
  document.querySelectorAll('[data-email-form]').forEach((form) => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = form.querySelector('input[type="email"]').value;
      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.textContent;

      if (!email) return;

      btn.textContent = 'Sending...';
      btn.disabled = true;

      /*
       * Replace this URL with your Kit (ConvertKit) form endpoint:
       * https://app.convertkit.com/forms/YOUR_FORM_ID/subscriptions
       *
       * Or use the Kit API:
       * https://api.convertkit.com/v3/forms/YOUR_FORM_ID/subscribe
       */
      const CONVERTKIT_FORM_URL = form.dataset.formAction || '#';

      if (CONVERTKIT_FORM_URL === '#') {
        /* Demo mode — show success then redirect if configured */
        setTimeout(() => {
          btn.textContent = 'You\'re in!';
          btn.style.background = 'var(--success)';
          form.querySelector('input[type="email"]').value = '';
          const redirect = form.dataset.redirect;
          if (redirect) {
            setTimeout(() => window.location.href = redirect, 1500);
          } else {
            setTimeout(() => {
              btn.textContent = originalText;
              btn.style.background = '';
              btn.disabled = false;
            }, 3000);
          }
        }, 800);
        return;
      }

      try {
        const response = await fetch(CONVERTKIT_FORM_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email_address: email }),
        });

        if (response.ok) {
          btn.textContent = 'You\'re in!';
          btn.style.background = 'var(--success)';
          form.querySelector('input[type="email"]').value = '';

          /* Redirect to freebie delivery or stay on page */
          const redirect = form.dataset.redirect;
          if (redirect) {
            setTimeout(() => window.location.href = redirect, 1500);
          }
        } else {
          throw new Error('Submission failed');
        }
      } catch {
        btn.textContent = 'Try again';
        btn.style.background = '#ef4444';
      } finally {
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.background = '';
          btn.disabled = false;
        }, 3000);
      }
    });
  });
}

/* VSL video — autoplay on scroll, zero YouTube branding
 *
 * Strategy:
 *  1. No iframe in HTML — poster shown until scroll or click
 *  2. iframe injected with autoplay=1&mute=1 when triggered
 *  3. pointer-events:none on iframe stops ALL mouse events reaching
 *     YouTube (kills hover watermark entirely)
 *  4. Transparent overlay handles click → postMessage play/pause
 */
function initVSLVideo() {
  const container = document.querySelector('[data-vsl]');
  if (!container) return;

  const poster = container.querySelector('.vsl-poster');
  let iframe = null;
  let overlay = null;
  let playing = false;
  let loaded = false;

  function postCmd(func) {
    iframe && iframe.contentWindow && iframe.contentWindow.postMessage(
      JSON.stringify({ event: 'command', func: func, args: [] }), '*'
    );
  }

  function loadVideo() {
    if (loaded) return;
    loaded = true;

    /* Inject iframe — no src in HTML means YouTube thumbnail never shown */
    iframe = document.createElement('iframe');
    iframe.className = 'vsl-iframe';
    iframe.src = 'https://www.youtube-nocookie.com/embed/cqvDox9l2HU' +
      '?controls=0&modestbranding=1&rel=0&iv_load_policy=3' +
      '&playsinline=1&enablejsapi=1&autoplay=1&mute=1';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    container.insertBefore(iframe, poster);

    /* Transparent click overlay — sits above iframe, intercepts all clicks
       so no mouse event ever reaches YouTube (kills hover watermark) */
    overlay = document.createElement('div');
    overlay.className = 'vsl-click-overlay';
    container.appendChild(overlay);

    /* Fade poster out once video has had time to start */
    setTimeout(function () {
      poster.style.opacity = '0';
      poster.style.pointerEvents = 'none';
    }, 900);

    playing = true;

    /* Click overlay → pause/resume via postMessage */
    overlay.addEventListener('click', function () {
      if (playing) {
        postCmd('pauseVideo');
        playing = false;
        /* Show paused state — semi-transparent poster with play icon */
        poster.style.opacity = '0.88';
        poster.style.pointerEvents = 'none';
      } else {
        postCmd('playVideo');
        playing = true;
        poster.style.opacity = '0';
      }
    });
  }

  /* Clicking the poster before scroll also starts the video */
  poster.addEventListener('click', function () {
    observer.unobserve(container);
    loadVideo();
  });

  /* Autoplay when 50% of the container enters the viewport */
  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          loadVideo();
          observer.unobserve(container);
        }
      });
    },
    { threshold: 0.5 }
  );

  observer.observe(container);
}

/* Typeform embed helper */
function openTypeform(typeformId) {
  if (window.typeformEmbed) {
    window.typeformEmbed.makePopup(`https://form.typeform.com/to/${typeformId}`, {
      mode: 'popup',
      hideHeaders: true,
      hideFooter: true,
    }).open();
  } else {
    window.open(`https://form.typeform.com/to/${typeformId}`, '_blank');
  }
}
