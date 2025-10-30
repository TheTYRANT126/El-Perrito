(async function () {
    try {
        const r = await fetch('../api/session_status.php', { credentials: 'include' });
        const data = await r.json();
        const account = document.getElementById('accountLink');
        if (!account) return;
        account.href = (data.status === 'anon') ? 'login.html' : 'account.html';
    } catch { }
})();
