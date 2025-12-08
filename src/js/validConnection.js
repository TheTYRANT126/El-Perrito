import { apiUrl, pageUrl } from './endPoints.js';

export async function fetchSessionStatus() {
  try {
    const response = await fetch(apiUrl('session_status_improved.php'), {
      credentials: 'include',
    });

    if (!response.ok) {
      return { status: 'anon' };
    }

    return await response.json();
  } catch {
    return { status: 'anon' };
  }
}

export async function redirectIfAuthenticated(targetPage = pageUrl('public/account.html')) {
  const session = await fetchSessionStatus();
  if (session.status === 'cliente' || session.status === 'admin') {
    window.location.href = targetPage;
  }
}
