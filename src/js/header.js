import { apiUrl, pageUrl } from './endPoints.js';

const ensureAccountLink = (status) => {
  const account = document.getElementById('accountLink');
  if (!account) return null;

  if (status === 'anon') {
    account.href = pageUrl('public/login.html');
  } else {
    account.href = pageUrl('public/account.html');
  }

  return account;
};

(async function initHeader() {
  try {
    const response = await fetch(apiUrl('session_status_improved.php'), {
      credentials: 'include',
    });

    if (!response.ok) {
      ensureAccountLink('anon');
      return;
    }

    const data = await response.json();
    const accountLink = ensureAccountLink(data.status || 'anon');

    if (data.status === 'admin' && accountLink) {
      const nav = document.querySelector('.nav');
      if (nav && !document.getElementById('adminLink')) {
        const adminLink = document.createElement('a');
        adminLink.href = pageUrl('public/admin-dashboard.html');
        adminLink.textContent = 'Administración';
        adminLink.id = 'adminLink';
        nav.insertBefore(adminLink, accountLink);
      }
    }
  } catch (error) {
    console.error('No se pudo verificar la sesión', error);
    ensureAccountLink('anon');
  }
})();
