// admin-dashboard.js - Panel de Administración

let currentTab = 'productos';
let currentPage = {
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
    setupSearchHandlers();
    loadCurrentTab();
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
    }
}

// Configurar sistema de pestañas
function setupTabs() {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            if (tab.disabled) return;
            
            // Remover clase active de todas las pestañas
            tabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            // Activar pestaña seleccionada
            tab.classList.add('active');
            const tabName = tab.dataset.tab;
            document.getElementById(`${tabName}-content`).classList.add('active');
            
            currentTab = tabName;
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
        window.location.href = 'admin-product-edit.html';
    };

    // Usuarios
    document.getElementById('btnCrearUsuario').onclick = () => {
        window.location.href = 'admin-user-edit.html';
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
                <td><img src="${producto.imagen || 'images/placeholder.png'}" alt="${producto.nombre}" onerror="this.src='images/placeholder.png'"></td>
                <td>${producto.nombre}</td>
                <td>$${Number(producto.precio_venta).toFixed(2)}</td>
                <td>${producto.existencia} unidades</td>
                <td>${estadoBadge}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-small btn-edit" onclick="editarProducto(${producto.id_producto})">Editar</button>
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
    window.location.href = `admin-product-edit.html?id=${id}`;
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
                        <button class="btn-small btn-edit" onclick="editarUsuario(${usuario.id_usuario})">Editar</button>
                        <button class="btn-small btn-view" onclick="verHistorialUsuario(${usuario.id_usuario})">Historial</button>
                        <button class="btn-small btn-view" onclick="verActividadUsuario(${usuario.id_usuario})">Registro</button>
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
    window.location.href = `admin-user-edit.html?id=${id}`;
}

function verHistorialUsuario(id) {
    window.location.href = `admin-user-history.html?id=${id}`;
}

function verActividadUsuario(id) {
    window.location.href = `admin-user-activity.html?id=${id}`;
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
                        <button class="btn-small btn-edit" onclick="editarCliente(${cliente.id_cliente})">Editar</button>
                        <button class="btn-small btn-view" onclick="verCarritoCliente(${cliente.id_cliente})">Carrito</button>
                        <button class="btn-small btn-view" onclick="verHistorialCliente(${cliente.id_cliente})">Compras</button>
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
    window.location.href = `admin-client-edit.html?id=${id}`;
}

function verCarritoCliente(id) {
    window.location.href = `admin-client-cart.html?id=${id}`;
}

function verHistorialCliente(id) {
    window.location.href = `admin-client-orders.html?id=${id}`;
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
