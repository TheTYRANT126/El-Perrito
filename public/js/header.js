(async function () {
    try {
        const r = await fetch('../api/session_status_improved.php', { credentials: 'include' });
        const data = await r.json();
        const account = document.getElementById('accountLink');
        if (!account) return;
        account.href = (data.status === 'anon') ? 'login.html' : 'account.html';

        // Mostrar enlace de Administración si es admin o usuario del sistema
        if (data.status === 'admin') {
            const nav = document.querySelector('.nav');
            const adminLink = document.createElement('a');
            adminLink.href = 'admin-dashboard.html';
            adminLink.textContent = 'Administración';
            adminLink.id = 'adminLink';
            nav.insertBefore(adminLink, account);
        }
    } catch { }
})();
