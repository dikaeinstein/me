/**
 *
 * @param {HTMLElement} toggle
 * @param {HTMLElement} container
 */
const darkScheme = (toggle, container) => {
  localStorage.setItem('scheme', 'dark');
  toggle.innerHTML = feather.icons.sun.toSvg();
  toggle.classList.remove('light');
  toggle.classList.add('dark');
  container.className = 'dark';
}

/**
 *
 * @param {HTMLElement} toggle
 * @param {HTMLElement} container
 */
const lightScheme = (toggle, container) => {
  localStorage.setItem('scheme', 'light');
  toggle.innerHTML = feather.icons.moon.toSvg();
  toggle.classList.remove('dark')
  toggle.classList.add('light');
  container.className = '';
}

const registerDarkModeClickEventHandler = () => {
  const toggle = document.getElementById('scheme-toggle');

  let scheme = 'light';
  const savedScheme = localStorage.getItem('scheme');

  const container = document.getElementsByTagName('html')[0];
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (prefersDark) {
    scheme = 'dark';
  }

  if (savedScheme) {
    scheme = savedScheme;
  }

  if (scheme === 'dark') {
    darkScheme(toggle, container);
  } else {
    lightScheme(toggle, container);
  }

  toggle.addEventListener('click', () => {
    if (toggle.classList.contains('light')) {
      darkScheme(toggle, container);
    } else if (toggle.classList.contains('dark')) {
      lightScheme(toggle, container);
    }
  });
}

const handleActiveNavLink = () => {
  const navItems = document.getElementsByClassName('nav-item');
  for (let i = 0; i < navItems.length; i++) {
    const navItem = navItems[i];
    if (window.location.href.includes(navItem.href)) {
      console.log(navItem.classList)
      navItem.classList.add('active');
      return;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  handleActiveNavLink();
  registerDarkModeClickEventHandler();
});
