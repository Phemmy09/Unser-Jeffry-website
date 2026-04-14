/* ============================================
   @unsertheanswer — Main JS
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initScrollAnimations();
  initSmoothScroll();
  initNavbar();
  initEmailForms();
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
        /* Demo mode — show success */
        setTimeout(() => {
          btn.textContent = 'You\'re in!';
          btn.style.background = 'var(--success)';
          form.querySelector('input[type="email"]').value = '';
          setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
            btn.disabled = false;
          }, 3000);
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
