let userId = null;

(async function init() {
    const urlParams = new URLSearchParams(window.location.search);
    userId = urlParams.get('id');
    const fromTab = urlParams.get('from_tab') || 'usuarios';

    // Actualizar el enlace de "Volver al Panel"
    const backLink = document.querySelector('a[href="admin-dashboard.html"]');
    if (backLink) {
        backLink.href = `admin-dashboard.html#${fromTab}`;
    }

    if (!userId) {
        alert('ID de usuario no especificado');
        window.history.back();
        return;
    }

    await loadUserInfo(userId);
    await loadActivity(userId);
})();

async function loadUserInfo(id) {
    try {
        const response = await fetch(`../api/admin_user_get.php?id=${id}`, {
            credentials: 'include'
        });

        if (!response.ok) throw new Error('Error al cargar usuario');

        const data = await response.json();
        const user = data.usuario;

        document.getElementById('userName').textContent = 
            `Usuario: ${user.nombre} ${user.apellido || ''} (${user.email})`;

    } catch (error) {
        console.error('Error:', error);
    }
}

async function loadActivity(id) {
    try {
        const response = await fetch(`../api/admin_user_activity.php?id=${id}`, {
            credentials: 'include'
        });

        if (!response.ok) throw new Error('Error al cargar el registro de actividad');

        const data = await response.json();
        const activities = data.actividades || [];

        const tbody = document.getElementById('activityBody');

        if (activities.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color:#64748b;">No hay actividades registradas</td></tr>';
            return;
        }

        tbody.innerHTML = '';

        activities.forEach(activity => {
            const tr = document.createElement('tr');

            const fecha = new Date(activity.fecha_accion);
            const fechaStr = fecha.toLocaleString('es-MX', { 
                dateStyle: 'medium', 
                timeStyle: 'medium' 
            });

            tr.innerHTML = `
                <td style="white-space: nowrap;">${fechaStr}</td>
                <td><strong>${activity.tipo_accion}</strong></td>
                <td>${activity.tabla_afectada}</td>
                <td>${activity.id_registro_afectado || '<span style="color:#94a3b8;">N/A</span>'}</td>
                <td>${activity.descripcion}</td>
            `;

            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error('Error:', error);
        const tbody = document.getElementById('activityBody');
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color:#d00000;">Error al cargar el registro</td></tr>';
    }
}
