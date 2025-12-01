
const drawer = document.getElementById('drawer');

// Historial de compras xdxdxd  habilitar después
// document.getElementById('tile-history').onclick = async (e) => {
//     e.preventDefault();
//     const data = await (await fetch('../api/orders_list.php', { credentials: 'include' })).json();
//     drawer.style.display = 'block';
//     if (!Array.isArray(data) || data.length === 0) { drawer.innerHTML = '<small class="muted">Sin compras aún.</small>'; return; }
//     const ul = document.createElement('ul');
//     data.forEach(o => {
//         const li = document.createElement('li');
//         const d = new Date(o.fecha.replace(' ', 'T'));
//         li.textContent = `#${o.id_venta} — ${d.toLocaleDateString()} — $${Number(o.total).toFixed(2)} — ${o.resumen}`;
//         ul.append(li);
//     });
//     drawer.innerHTML = ''; drawer.append(ul);
// };

// Cambiar datos - redirigir a profile.html
document.getElementById('tile-profile').onclick = (e) => {
    e.preventDefault();
    window.location.href = 'profile.html';
};

// Eliminar cuenta - redirigir a delete-account.html
document.getElementById('tile-delete').onclick = (e) => {
    e.preventDefault();
    window.location.href = 'delete-account.html';
};

// Cerrar sesión
document.getElementById('tile-logout').onclick = async (e) => {
    e.preventDefault();
    const r = await fetch('../api/auth_logout.php', { method: 'POST', credentials: 'include' });
    if (r.ok) {
        location.href = '../index.html';
    } else {
        alert('Error al cerrar sesión');
    }
};
