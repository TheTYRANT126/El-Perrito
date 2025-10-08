// public/js/account.js
const drawer = document.getElementById('drawer');
document.getElementById('tile-history').onclick = async (e) => {
    e.preventDefault();
    const data = await (await fetch('../api/orders_list.php', { credentials: 'include' })).json();
    drawer.style.display = 'block';
    if (!Array.isArray(data) || data.length === 0) { drawer.innerHTML = '<small class="muted">Sin compras aún.</small>'; return; }
    const ul = document.createElement('ul');
    data.forEach(o => {
        const li = document.createElement('li');
        const d = new Date(o.fecha.replace(' ', 'T'));
        li.textContent = `#${o.id_venta} — ${d.toLocaleDateDateString()} — $${Number(o.total).toFixed(2)} — ${o.resumen}`;
        ul.append(li);
    });
    drawer.innerHTML = ''; drawer.append(ul);
};

document.getElementById('tile-logout').onclick = async (e) => {
    e.preventDefault();
    const r = await fetch('../api/auth_logout.php', { method: 'POST', credentials: 'include' });
    if (r.ok) {
        location.href = 'index.html';
    } else {
        alert('Error al cerrar sesión');
    }
};