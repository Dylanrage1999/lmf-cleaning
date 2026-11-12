document.documentElement.classList.add('js');

let preserveHashAtTop = location.hash === '#home';
let homeLinkPending = false;
let firstTopObservation = true;

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', () => {
    if (link.hash === '#home') homeLinkPending = true;
  });
});

function rememberHashNavigation() {
  homeLinkPending = false;
  preserveHashAtTop = location.hash === '#home';
}

window.addEventListener('hashchange', rememberHashNavigation);
window.addEventListener('popstate', rememberHashNavigation);

const topSentinel = document.querySelector('.scroll-top-sentinel');
if (topSentinel && 'IntersectionObserver' in window) {
  const topObserver = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) {
      if (firstTopObservation) {
        firstTopObservation = false;
        return;
      }
      homeLinkPending = false;
      preserveHashAtTop = false;
      return;
    }

    firstTopObservation = false;
    if (homeLinkPending) {
      homeLinkPending = false;
      preserveHashAtTop = true;
      return;
    }
    if (preserveHashAtTop) {
      preserveHashAtTop = false;
      return;
    }
    if (location.hash) {
      history.replaceState(history.state, '', `${location.pathname}${location.search}`);
    }
  }, { threshold: 0 });
  topObserver.observe(topSentinel);
}

const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.primary-nav');
const mobileNavigation = window.matchMedia('(max-width: 760px)');

function setMenuOpen(open) {
  if (!menuButton || !navigation) return;
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Menu sluiten' : 'Menu openen');
  navigation.classList.toggle('is-open', open);
  navigation.inert = mobileNavigation.matches && !open;
  document.body.classList.toggle('menu-open', open && mobileNavigation.matches);
}

if (menuButton && navigation) {
  navigation.inert = mobileNavigation.matches;
  menuButton.addEventListener('click', () => {
    setMenuOpen(menuButton.getAttribute('aria-expanded') !== 'true');
  });
  navigation.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenuOpen(false));
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
      setMenuOpen(false);
      menuButton.focus();
    }
  });
  mobileNavigation.addEventListener('change', (event) => {
    setMenuOpen(false);
    navigation.inert = event.matches;
  });
}

const revealItems = document.querySelectorAll('.reveal');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if ('IntersectionObserver' in window && !reduceMotion) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

const sectionLinks = [...document.querySelectorAll('.primary-nav a[href^="#"]')];
const linkedSections = sectionLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);
if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const activeLink = sectionLinks.find((link) => link.hash === `#${entry.target.id}`);
      sectionLinks.forEach((link) => {
        if (link === activeLink) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-35% 0px -55% 0px' });
  linkedSections.forEach((section) => sectionObserver.observe(section));
}
