// admin-dashboard.js - Panel de Administración

let currentTab = 'dashboard';
let currentPage = {
    dashboard: 1,
    productos: 1,
    usuarios: 1,
    clientes: 1
};
let userRole = '';
let userName = '';

// Inicialización
(async function init() {
    await checkAdminAccess();
    setupTabs();

    // Determinar la pestaña inicial desde el hash de la URL
    const initialTab = window.location.hash.replace('#', '');
    if (initialTab && document.querySelector(`.tab[data-tab="${initialTab}"]`)) {
        currentTab = initialTab;
    } else {
        currentTab = 'dashboard';
        window.location.hash = currentTab; // Opcional: asegurar que el hash esté presente
    }
    
    activateTab(currentTab);
    loadCurrentTab();
    setupSearchHandlers();
})();

// Verificar acceso y obtener información del usuario
async function checkAdminAccess() {
    try {
        const response = await fetch('../api/session_status_improved.php', { credentials: 'include' });
        const data = await response.json();

        if (data.status !== 'admin') {
            alert('Acceso denegado. Solo personal autorizado puede acceder.');
            window.location.href = 'index.html';
            return;
        }

        // Obtener información del usuario con nombre completo y rol
        userRole = data.rol || 'operador';
        userName = (data.nombre || 'Usuario') + (data.apellido ? ' ' + data.apellido : '');

        updateHeader();

    } catch (error) {
        console.error('Error verificando acceso:', error);
        window.location.href = 'login.html';
    }
}

// Actualizar encabezado con información del usuario
function updateHeader() {
    const title = document.getElementById('adminTitle');
    const subtitle = document.getElementById('adminSubtitle');

    const roleName = userRole === 'admin' ? 'Administrador' : 'Operador';
    title.textContent = `${roleName}: ${userName}`;

    // Deshabilitar pestañas según el rol
    if (userRole === 'operador') {
        document.getElementById('tabUsuarios').disabled = true;
        document.getElementById('tabUsuarios').style.opacity = '0.5';
        document.getElementById('tabUsuarios').style.cursor = 'not-allowed';

        document.getElementById('tabClientes').disabled = true;
        document.getElementById('tabClientes').style.opacity = '0.5';
        document.getElementById('tabClientes').style.cursor = 'not-allowed';

        // Aplicar vista de operador al dashboard
        const dashboardContent = document.getElementById('dashboard-content');
        if (dashboardContent) {
            dashboardContent.classList.add('operador-view');
        }
    }
}

// Activar visualmente una pestaña
function activateTab(tabName) {
    // Remover clase active de todas las pestañas y contenidos
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

    // Activar la pestaña y contenido correctos
    const tabToActivate = document.querySelector(`.tab[data-tab="${tabName}"]`);
    const contentToActivate = document.getElementById(`${tabName}-content`);

    if (tabToActivate) {
        tabToActivate.classList.add('active');
    }
    if (contentToActivate) {
        contentToActivate.classList.add('active');
    }
}

// Configurar sistema de pestañas
function setupTabs() {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            if (tab.disabled) return;
            
            const tabName = tab.dataset.tab;
            if (currentTab === tabName) return; // No hacer nada si ya está activa

            currentTab = tabName;
            window.location.hash = tabName; // Actualiza el hash en la URL
            
            activateTab(tabName);
            loadCurrentTab();
        });
    });
}

// Configurar manejadores de búsqueda
function setupSearchHandlers() {
    // Productos
    document.getElementById('btnSearchProductos').onclick = () => {
        currentPage.productos = 1;
        loadProductos();
    };
    
    document.getElementById('btnClearProductos').onclick = () => {
        document.getElementById('searchProductos').value = '';
        currentPage.productos = 1;
        loadProductos();
    };
    
    document.getElementById('searchProductos').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            currentPage.productos = 1;
            loadProductos();
        }
    });
    
    document.getElementById('btnCrearProducto').onclick = () => {
        window.location.href = `admin-product-edit.html?from_tab=${currentTab}`;
    };

    // Usuarios
    document.getElementById('btnCrearUsuario').onclick = () => {
        window.location.href = `admin-user-edit.html?from_tab=${currentTab}`;
    };
    document.getElementById('btnSearchUsuarios').onclick = () => {
        currentPage.usuarios = 1;
        loadUsuarios();
    };
    
    document.getElementById('btnClearUsuarios').onclick = () => {
        document.getElementById('searchUsuarios').value = '';
        currentPage.usuarios = 1;
        loadUsuarios();
    };
    
    document.getElementById('searchUsuarios').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            currentPage.usuarios = 1;
            loadUsuarios();
        }
    });
    
    // Clientes
    document.getElementById('btnSearchClientes').onclick = () => {
        currentPage.clientes = 1;
        loadClientes();
    };
    
    document.getElementById('btnClearClientes').onclick = () => {
        document.getElementById('searchClientes').value = '';
        currentPage.clientes = 1;
        loadClientes();
    };
    
    document.getElementById('searchClientes').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            currentPage.clientes = 1;
            loadClientes();
        }
    });
}

// Cargar pestaña actual
function loadCurrentTab() {
    switch(currentTab) {
        case 'dashboard':
            loadDashboardStats();
            break;
        case 'productos':
            loadProductos();
            break;
        case 'usuarios':
            loadUsuarios();
            break;
        case 'clientes':
            loadClientes();
            break;
    }
}

// ===== PRODUCTOS =====

async function loadProductos() {
    const tbody = document.getElementById('productosTableBody');
    const search = document.getElementById('searchProductos').value;
    
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Cargando...</td></tr>';
    
    try {
        const params = new URLSearchParams({
            page: currentPage.productos,
            q: search
        });
        
        const response = await fetch(`../api/admin_products_list.php?${params}`, {
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('Error al cargar productos');
        }
        
        const data = await response.json();
        
        if (!data.productos || data.productos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No se encontraron productos</td></tr>';
            return;
        }
        
        tbody.innerHTML = '';
        
        data.productos.forEach(producto => {
            const tr = document.createElement('tr');
            
            // Estado
            const estadoBadge = producto.activo ? 
                '<span class="badge activo">Activo</span>' : 
                '<span class="badge inactivo">Inactivo</span>';
            
            tr.innerHTML = `
                <td>${producto.id_producto}</td>
                <td><img src="${producto.imagen || '../src/assets/placeholder.png'}" alt="${producto.nombre}" onerror="this.src='../src/assets/placeholder.png'"></td>
                <td>${producto.nombre}</td>
                <td>$${Number(producto.precio_venta).toFixed(2)}</td>
                <td>${producto.existencia} unidades</td>
                <td>${estadoBadge}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-small btn-edit" onclick="editarProducto(${producto.id_producto})">Actualizar</button>
                        <button class="btn-small btn-delete" onclick="eliminarProducto(${producto.id_producto}, '${producto.nombre}')">Eliminar</button>
                    </div>
                </td>
            `;
            
            tbody.appendChild(tr);
        });
        
        // Actualizar paginación
        updatePagination('productos', data.pagination);
        
    } catch (error) {
        console.error('Error:', error);
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #d00000;">Error al cargar productos</td></tr>';
    }
}

function editarProducto(id) {
    window.location.href = `admin-product-edit.html?id=${id}&from_tab=${currentTab}`;
}

async function eliminarProducto(id, nombre) {
    if (!confirm(`¿Estás seguro de que deseas eliminar el producto "${nombre}"?\n\nEsto marcará el producto como inactivo y no se podrá recuperar sin ayuda de un administrador.`)) {
        return;
    }
    
    try {
        const response = await fetch('../api/admin_product_delete.php', {
            method: 'POST',
            credentials: 'include',
            body: new URLSearchParams({ id_producto: id })
        });
        
        const text = await response.text();
        
        if (response.ok && text === 'OK') {
            alert('Producto eliminado correctamente');
            loadProductos();
        } else {
            alert('Error al eliminar producto: ' + text);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión');
    }
}

// Continúa en la siguiente parte...
// admin-dashboard.js - Parte 2: Usuarios, Clientes y Utilidades

// ===== USUARIOS =====

async function loadUsuarios() {
    if (userRole !== 'admin') {
        const tbody = document.getElementById('usuariosTableBody');
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #d00000;">Acceso denegado</td></tr>';
        return;
    }
    
    const tbody = document.getElementById('usuariosTableBody');
    const search = document.getElementById('searchUsuarios').value;
    
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Cargando...</td></tr>';
    
    try {
        const params = new URLSearchParams({
            page: currentPage.usuarios,
            q: search
        });
        
        const response = await fetch(`../api/admin_users_list.php?${params}`, {
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('Error al cargar usuarios');
        }
        
        const data = await response.json();
        
        if (!data.usuarios || data.usuarios.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No se encontraron usuarios</td></tr>';
            return;
        }
        
        tbody.innerHTML = '';
        
        data.usuarios.forEach(usuario => {
            const tr = document.createElement('tr');
            
            // Badges de estado y rol
            const estadoBadge = usuario.activo ? 
                '<span class="badge activo">Activo</span>' : 
                '<span class="badge inactivo">Inactivo</span>';
            
            const rolBadge = usuario.rol === 'admin' ?
                '<span class="badge admin">Admin</span>' :
                '<span class="badge operador">Operador</span>';
            
            // Formatear fecha
            const fecha = new Date(usuario.fecha_registro);
            const fechaStr = fecha.toLocaleDateString('es-MX');
            
            tr.innerHTML = `
                <td>${usuario.id_usuario}</td>
                <td>${usuario.nombre} ${usuario.apellido || ''}</td>
                <td>${usuario.email}</td>
                <td>${rolBadge}</td>
                <td>${estadoBadge}</td>
                <td>${fechaStr}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-small btn-edit" onclick="editarUsuario(${usuario.id_usuario})">Actualizar</button>
                        <button class="btn-small btn-history-custom-color" onclick="verHistorialUsuario(${usuario.id_usuario})">Historial</button>
                        <button class="btn-small btn-activity-custom-color" onclick="verActividadUsuario(${usuario.id_usuario})">Registro</button>
                    </div>
                </td>
            `;
            
            tbody.appendChild(tr);
        });
        
        // Actualizar paginación
        updatePagination('usuarios', data.pagination);
        
    } catch (error) {
        console.error('Error:', error);
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #d00000;">Error al cargar usuarios</td></tr>';
    }
}

function editarUsuario(id) {
    window.location.href = `admin-user-edit.html?id=${id}&from_tab=${currentTab}`;
}

function verHistorialUsuario(id) {
    window.location.href = `admin-user-history.html?id=${id}&from_tab=${currentTab}`;
}

function verActividadUsuario(id) {
    window.location.href = `admin-user-activity.html?id=${id}&from_tab=${currentTab}`;
}

// ===== CLIENTES =====

async function loadClientes() {
    if (userRole !== 'admin') {
        const tbody = document.getElementById('clientesTableBody');
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #d00000;">Acceso denegado</td></tr>';
        return;
    }
    
    const tbody = document.getElementById('clientesTableBody');
    const search = document.getElementById('searchClientes').value;
    
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Cargando...</td></tr>';
    
    try {
        const params = new URLSearchParams({
            page: currentPage.clientes,
            q: search
        });
        
        const response = await fetch(`../api/admin_clients_list.php?${params}`, {
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('Error al cargar clientes');
        }
        
        const data = await response.json();
        
        if (!data.clientes || data.clientes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No se encontraron clientes</td></tr>';
            return;
        }
        
        tbody.innerHTML = '';
        
        data.clientes.forEach(cliente => {
            const tr = document.createElement('tr');
            
            // Formatear fecha
            const fecha = new Date(cliente.fecha_registro);
            const fechaStr = fecha.toLocaleDateString('es-MX');
            
            tr.innerHTML = `
                <td>${cliente.id_cliente}</td>
                <td>${cliente.nombre} ${cliente.apellido}</td>
                <td>${cliente.email}</td>
                <td>${cliente.telefono || 'N/A'}</td>
                <td>${fechaStr}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-small btn-edit" onclick="editarCliente(${cliente.id_cliente})">Actualizar</button>
                        <button class="btn-small btn-cart-custom-color" onclick="verCarritoCliente(${cliente.id_cliente})">Carrito</button>
                        <button class="btn-small btn-custom-color" onclick="verHistorialCliente(${cliente.id_cliente})">Compras</button>
                    </div>
                </td>
            `;
            
            tbody.appendChild(tr);
        });
        
        // Actualizar paginación
        updatePagination('clientes', data.pagination);
        
    } catch (error) {
        console.error('Error:', error);
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #d00000;">Error al cargar clientes</td></tr>';
    }
}

function editarCliente(id) {
    window.location.href = `admin-client-edit.html?id=${id}&from_tab=${currentTab}`;
}

function verCarritoCliente(id) {
    window.location.href = `admin-client-cart.html?id=${id}&from_tab=${currentTab}`;
}

function verHistorialCliente(id) {
    window.location.href = `admin-client-orders.html?id=${id}&from_tab=${currentTab}`;
}

// ===== PAGINACIÓN =====

function updatePagination(type, paginationData) {
    const container = document.getElementById(`${type}Pagination`);
    container.innerHTML = '';
    
    const { current_page, total_pages, total } = paginationData;
    
    if (total_pages <= 1) return;
    
    // Botón anterior
    const prevBtn = document.createElement('button');
    prevBtn.textContent = '« Anterior';
    prevBtn.disabled = current_page <= 1;
    prevBtn.onclick = () => {
        currentPage[type]--;
        loadCurrentTab();
    };
    container.appendChild(prevBtn);
    
    // Información de página
    const info = document.createElement('span');
    info.textContent = `Página ${current_page} de ${total_pages} (${total} registros)`;
    container.appendChild(info);
    
    // Botón siguiente
    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Siguiente »';
    nextBtn.disabled = current_page >= total_pages;
    nextBtn.onclick = () => {
        currentPage[type]++;
        loadCurrentTab();
    };
    container.appendChild(nextBtn);
}

// ========================================
// DASHBOARD: Estadísticas y Métricas
// ========================================

async function loadDashboardStats() {
    try {
        const response = await fetch('../api/admin_dashboard_stats.php', {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Error al cargar estadísticas');
        }

        const data = await response.json();

        if (!data.success || !data.stats) {
            throw new Error('Respuesta inválida del servidor');
        }

        const stats = data.stats;

        // Función para formatear moneda
        const formatCurrency = (value) => {
            return new Intl.NumberFormat('es-MX', {
                style: 'currency',
                currency: 'MXN',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(value || 0);
        };

        // Ventas
        document.getElementById('ventasHoy').textContent = formatCurrency(stats.ventas_hoy);
        document.getElementById('ventasMes').textContent = formatCurrency(stats.ventas_mes);
        document.getElementById('ordenesHoy').textContent = stats.ordenes_hoy || 0;

        // Tendencia de ventas
        const tendenciaVentas = parseFloat(stats.tendencia_ventas || 0);
        const tendenciaVentasEl = document.getElementById('tendenciaVentas');
        if (tendenciaVentas > 0) {
            tendenciaVentasEl.textContent = `↑ +${tendenciaVentas.toFixed(1)}% vs mes anterior`;
            tendenciaVentasEl.style.color = '#28a745';
        } else if (tendenciaVentas < 0) {
            tendenciaVentasEl.textContent = `↓ ${tendenciaVentas.toFixed(1)}% vs mes anterior`;
            tendenciaVentasEl.style.color = '#dc3545';
        } else {
            tendenciaVentasEl.textContent = `Sin cambios vs mes anterior`;
            tendenciaVentasEl.style.color = '#6c757d';
        }

        // Inventario
        document.getElementById('productosActivos').textContent = stats.productos_activos || 0;
        document.getElementById('stockBajo').textContent = stats.productos_stock_bajo || 0;
        document.getElementById('productosAgotados').textContent = stats.productos_agotados || 0;

        // Clientes
        document.getElementById('totalClientes').textContent = stats.total_clientes || 0;
        document.getElementById('clientesNuevosMes').textContent = stats.clientes_nuevos_mes || 0;

        // Tendencia de clientes
        const tendenciaClientes = parseFloat(stats.tendencia_clientes || 0);
        const tendenciaClientesEl = document.getElementById('tendenciaClientes');
        if (tendenciaClientes > 0) {
            tendenciaClientesEl.textContent = `↑ +${tendenciaClientes.toFixed(1)}% vs mes anterior`;
            tendenciaClientesEl.style.color = '#28a745';
        } else if (tendenciaClientes < 0) {
            tendenciaClientesEl.textContent = `↓ ${tendenciaClientes.toFixed(1)}% vs mes anterior`;
            tendenciaClientesEl.style.color = '#dc3545';
        } else {
            tendenciaClientesEl.textContent = `Sin cambios vs mes anterior`;
            tendenciaClientesEl.style.color = '#6c757d';
        }

        // Top 5 Productos Más Vendidos
        renderTopProductos(stats.top_productos || []);

        // Actividades Recientes
        renderActividadesRecientes(stats.actividades_recientes || []);

    } catch (error) {
        console.error('Error cargando estadísticas del dashboard:', error);

        // Mostrar mensaje de error
        document.getElementById('topProductos').innerHTML = '<p style="text-align: center; color: #dc3545;">Error al cargar datos</p>';
        document.getElementById('actividadesRecientes').innerHTML = '<p style="text-align: center; color: #dc3545;">Error al cargar datos</p>';
    }
}

function renderTopProductos(productos) {
    const container = document.getElementById('topProductos');

    if (!productos || productos.length === 0) {
        container.innerHTML = '<div class="empty-state"><p class="empty-state-text">No hay datos de ventas este mes</p></div>';
        return;
    }

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value || 0);
    };

    let html = '<table class="dashboard-table">';
    html += '<thead><tr><th>#</th><th>Producto</th><th>Vendido</th><th>Ingresos</th></tr></thead>';
    html += '<tbody>';

    productos.forEach((p, index) => {
        html += '<tr>';
        html += `<td style="font-weight: 600; color: #64748b;">${index + 1}</td>`;
        html += `<td style="font-weight: 600;">${escapeHtml(p.nombre)}</td>`;
        html += `<td><span style="background: #f0f7ff; padding: 4px 8px; border-radius: 6px; font-weight: 600; color: #2c5db5;">${p.total_vendido} unidades</span></td>`;
        html += `<td style="font-weight: 700; color: #10b981;">${formatCurrency(p.ingresos)}</td>`;
        html += '</tr>';
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

function renderActividadesRecientes(actividades) {
    const container = document.getElementById('actividadesRecientes');

    if (!actividades || actividades.length === 0) {
        container.innerHTML = '<div class="empty-state"><p class="empty-state-text">No hay actividades recientes</p></div>';
        return;
    }

    let html = '<div class="activity-list">';

    actividades.forEach(act => {
        const fecha = new Date(act.fecha_accion);
        const fechaStr = fecha.toLocaleString('es-MX', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const usuario = `${act.usuario_nombre || ''} ${act.usuario_apellido || ''}`.trim();

        html += '<div class="activity-item">';
        html += `<div style="display: flex; justify-content: space-between; align-items: start;">`;
        html += `<div style="flex: 1;">`;
        html += `<div><span class="activity-type">${escapeHtml(act.tipo_accion)}</span> <span class="activity-description">${escapeHtml(act.descripcion)}</span></div>`;
        html += `<div class="activity-meta">`;
        html += `<span class="activity-user">👤 ${escapeHtml(usuario)}</span>`;
        html += `<span style="color: #cbd5e1;">•</span>`;
        html += `<span>${escapeHtml(act.usuario_rol)}</span>`;
        html += `</div>`;
        html += `</div>`;
        html += `<span class="activity-timestamp">🕐 ${fechaStr}</span>`;
        html += `</div>`;
        html += '</div>';
    });

    html += '</div>';
    container.innerHTML = html;
}

// Función auxiliar para escapar HTML y prevenir XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
