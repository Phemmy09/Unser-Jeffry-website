/* ============================================
   @unsertheanswer — Main JS
   ============================================ */

/* -----------------------------------------------
   KIT (ConvertKit) CONFIG
   -----------------------------------------------
   1. Sign up free at https://kit.com
   2. Go to: Settings → Developer → API Key
      Paste your PUBLIC API key below.
   3. Go to: Grow → Landing Pages & Forms → your form
      Copy the numeric Form ID from the URL and paste below.
   4. Go to: Subscribers → Tags → create tags:
      "Freebie", "Applied", "Paid"
      Paste their numeric IDs below.
   ----------------------------------------------- */
const KIT = {
  apiKey:    'sEPoELBsCQMVtYF4SJrR6g',
  formId:    '9352773',
  tags: {
    freebie: '19048416',
    applied: '19048417',
    paid:    '19048420',
  }
};

/* Subscribe an email to Kit and optionally apply a tag */
async function kitSubscribe(email, tag = null) {
  if (!KIT.apiKey || KIT.apiKey === 'YOUR_KIT_PUBLIC_API_KEY') return;
  const body = { api_key: KIT.apiKey, email };
  if (tag) body.tags = [tag];
  try {
    await fetch(`https://api.convertkit.com/v3/forms/${KIT.formId}/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (_) { /* silent */ }
}

document.addEventListener('DOMContentLoaded', () => {
  initScrollAnimations();
  initSmoothScroll();
  initNavbar();
  initEmailForms();
  initKitPaidTag();
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

/* Email form handling — subscribes to Kit + tags as Freebie */
function initEmailForms() {
  document.querySelectorAll('[data-email-form]').forEach((form) => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const emailInput = form.querySelector('input[type="email"]');
      const email = emailInput.value.trim();
      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      const redirect = form.dataset.redirect;

      if (!email) return;

      btn.textContent = 'Sending...';
      btn.disabled = true;

      try {
        await kitSubscribe(email, KIT.tags.freebie);
        btn.textContent = "You're in!";
        btn.style.background = '#22c55e';
        emailInput.value = '';
        if (redirect) {
          /* Pass email to freebie page so Kit can confirm/tag on arrival */
          setTimeout(() => {
            window.location.href = redirect + '?email=' + encodeURIComponent(email);
          }, 1200);
        }
      } catch {
        btn.textContent = 'Try again';
        btn.style.background = '#ef4444';
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.background = '';
          btn.disabled = false;
        }, 3000);
      }
    });
  });
}

/*
 * On thankyou.html — if ?email= is in the URL, tag that subscriber as Paid.
 * This fires when someone lands on the page after completing payment.
 * Wire this up by appending ?email=EMAIL to the Whop success redirect URL,
 * or use Whop's webhook to call Kit's API server-side for 100% reliability.
 */
function initKitPaidTag() {
  const params = new URLSearchParams(window.location.search);
  const email = params.get('email');
  if (email && window.location.pathname.includes('thankyou')) {
    kitSubscribe(email, KIT.tags.paid);
  }
}

/* Application form redirect helper (used by apply.html) */
function goToApply() {
  window.location.href = 'apply.html';
}

