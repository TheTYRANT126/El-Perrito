const loginForm = document.getElementById('loginForm');
const regForm = document.getElementById('regForm');
const msg = document.getElementById('msg');

if (loginForm) loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const r = await fetch('../api/auth_login.php', { method: 'POST', body: new FormData(loginForm), credentials: 'include' });
    const t = await r.text();
    if (r.ok && (t === 'OK_CLIENTE' || t === 'OK_ADMIN')) location.href = 'index.html';
    else msg.textContent = t || 'Error al iniciar sesión';
});

if (regForm) regForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    // Versión anterior antes de pedir ayuda:
    // const r = await fetch('../api/auth_register.php', { method: 'POST', body: new FormData(regForm), credentials: 'include' });
    // const t = await r.text();    
    // if (r.ok && t === 'OK') location.href = 'login.html';
    // else msg.textContent = t || 'Error';
    const r = await fetch('../api/auth_register.php', { method: 'POST', body: new FormData(regForm), credentials: 'include' });
    const t = await r.text();
    if (r.ok && t === 'OK') location.href = 'login.html';
    else msg.textContent = t || 'Error';
});
