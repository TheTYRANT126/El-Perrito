// Variables globales
let currentOrderId = null;

// =========================
// Funciones de Modales
// =========================
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// =========================
// Historial de Compras
// =========================
async function loadOrderHistory() {
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = '<p style="text-align:center; color:#999">Cargando...</p>';

    try {
        const response = await fetch('../api/orders_list.php', { credentials: 'include' });
        if (!response.ok) {
            throw new Error('Error al cargar historial');
        }

        const orders = await response.json();

        if (!Array.isArray(orders) || orders.length === 0) {
            historyList.innerHTML = '<p style="text-align:center; color:#999">No tienes compras aún.</p>';
            return;
        }

        // Crear tabla de historial
        let html = '<div class="table-wrapper"><table class="orders-table">';
        html += '<thead><tr>';
        html += '<th>Pedido</th>';
        html += '<th>Fecha</th>';
        html += '<th>Total</th>';
        html += '<th>Estado Pago</th>';
        html += '<th>Estado Envío</th>';
        html += '<th>Acciones</th>';
        html += '</tr></thead><tbody>';

        orders.forEach(order => {
            const fecha = new Date(order.fecha.replace(' ', 'T'));
            const estadoPago = getEstadoPagoBadge(order.estado_pago);
            const estadoEnvio = getEstadoEnvioBadge(order.estado_envio);

            html += `<tr>`;
            html += `<td>#${order.id_venta}</td>`;
            html += `<td>${fecha.toLocaleDateString()}</td>`;
            html += `<td>$${Number(order.total).toFixed(2)}</td>`;
            html += `<td>${estadoPago}</td>`;
            html += `<td>${estadoEnvio}</td>`;
            html += `<td><button class="btn-view-detail" data-id="${order.id_venta}">Ver Detalle</button></td>`;
            html += `</tr>`;
        });

        html += '</tbody></table></div>';
        historyList.innerHTML = html;

        // Agregar event listeners a botones de ver detalle
        document.querySelectorAll('.btn-view-detail').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const orderId = e.target.getAttribute('data-id');
                loadOrderDetail(orderId);
            });
        });

    } catch (error) {
        historyList.innerHTML = '<p style="text-align:center; color:#dc2626">Error al cargar el historial</p>';
        console.error(error);
    }
}

// =========================
// Detalle de Compra
// =========================
async function loadOrderDetail(orderId) {
    currentOrderId = orderId;
    openModal('modal-order-detail');

    const detailInfo = document.getElementById('order-detail-info');
    const detailItems = document.getElementById('order-detail-items');
    const cancelSection = document.getElementById('order-cancel-section');

    detailInfo.innerHTML = '<p style="text-align:center; color:#999">Cargando...</p>';
    detailItems.innerHTML = '';
    cancelSection.style.display = 'none';

    try {
        const response = await fetch(`../api/order_detail.php?id=${orderId}`, { credentials: 'include' });
        if (!response.ok) {
            throw new Error('Error al cargar detalle');
        }

        const data = await response.json();
        const { venta, items } = data;

        // Información general de la venta
        const fecha = new Date(venta.fecha.replace(' ', 'T'));
        const estadoPago = getEstadoPagoBadge(venta.estado_pago);
        const estadoEnvio = getEstadoEnvioBadge(venta.estado_envio);

        let infoHtml = '<div class="order-info-card">';
        infoHtml += `<div class="info-row"><strong>Pedido:</strong> #${venta.id_venta}</div>`;
        infoHtml += `<div class="info-row"><strong>Fecha:</strong> ${fecha.toLocaleDateString()} ${fecha.toLocaleTimeString()}</div>`;
        infoHtml += `<div class="info-row"><strong>Total:</strong> $${Number(venta.total).toFixed(2)}</div>`;
        infoHtml += `<div class="info-row"><strong>Estado de Pago:</strong> ${estadoPago}</div>`;
        infoHtml += `<div class="info-row"><strong>Estado de Envío:</strong> ${estadoEnvio}</div>`;
        infoHtml += `<div class="info-row"><strong>Dirección de Envío:</strong> ${venta.direccion_envio || 'No especificada'}</div>`;
        infoHtml += '</div>';
        detailInfo.innerHTML = infoHtml;

        // Productos
        let itemsHtml = '<h3 style="margin-bottom:12px">Productos</h3>';
        itemsHtml += '<div class="order-items-list">';

        items.forEach(item => {
            itemsHtml += '<div class="order-item-row">';
            // La ruta de la imagen ya viene completa desde la API
            const imgSrc = item.imagen || '../src/assets/placeholder.png';
            itemsHtml += `<img src="${imgSrc}" alt="${item.nombre}" onerror="this.src='../src/assets/placeholder.png'">`;
            itemsHtml += '<div class="item-info">';
            itemsHtml += `<div class="item-name">${item.nombre}</div>`;
            itemsHtml += `<div class="item-quantity">Cantidad: ${item.cantidad}</div>`;
            itemsHtml += `<div class="item-price">Precio: $${Number(item.precio_unitario).toFixed(2)}</div>`;
            itemsHtml += '</div>';
            itemsHtml += `<div class="item-subtotal">$${Number(item.subtotal).toFixed(2)}</div>`;
            itemsHtml += '</div>';
        });

        itemsHtml += '</div>';
        detailItems.innerHTML = itemsHtml;

        // Mostrar botón de cancelar si es posible
        if (venta.estado_envio === 'pendiente' || venta.estado_envio === 'preparacion') {
            cancelSection.style.display = 'block';
        }

    } catch (error) {
        detailInfo.innerHTML = '<p style="text-align:center; color:#dc2626">Error al cargar el detalle</p>';
        console.error(error);
    }
}

// =========================
// Cancelar Pedido
// =========================
async function cancelOrder() {
    if (!currentOrderId) return;

    if (!confirm('¿Estás seguro de que deseas cancelar este pedido?')) {
        return;
    }

    try {
        const formData = new FormData();
        formData.append('id_venta', currentOrderId);

        const response = await fetch('../api/order_cancel.php', {
            method: 'POST',
            credentials: 'include',
            body: formData
        });

        const text = await response.text();

        if (text === 'OK') {
            alert('Pedido cancelado exitosamente');
            closeModal('modal-order-detail');
            // Recargar historial
            if (document.getElementById('modal-history').style.display === 'flex') {
                loadOrderHistory();
            }
        } else {
            alert(text || 'Error al cancelar el pedido');
        }

    } catch (error) {
        alert('Error al cancelar el pedido');
        console.error(error);
    }
}

// =========================
// Direcciones de Envío (Múltiples)
// =========================
async function loadAddresses() {
    const addressList = document.getElementById('address-list');
    addressList.innerHTML = '<p style="text-align:center; color:#999">Cargando...</p>';

    try {
        const response = await fetch('../api/address_list.php', { credentials: 'include' });
        if (!response.ok) {
            throw new Error('Error al cargar direcciones');
        }

        const addresses = await response.json();

        if (!Array.isArray(addresses) || addresses.length === 0) {
            addressList.innerHTML = '<p style="text-align:center; color:#999">No tienes direcciones guardadas. Agrega una nueva dirección.</p>';
            return;
        }

        let html = '<div class="addresses-grid">';

        addresses.forEach(addr => {
            const isPredeterminada = addr.es_predeterminada == 1;
            const isFromProfile = addr.from_profile == 1;
            const direccionCompleta = `${addr.calle} ${addr.numero_exterior || ''} ${addr.numero_interior || ''}, ${addr.colonia}, ${addr.ciudad}, ${addr.estado} CP ${addr.codigo_postal}`;

            html += `<div class="address-card ${isPredeterminada ? 'address-default' : ''} ${isFromProfile ? 'address-from-profile' : ''}">`;

            // Badges
            if (isFromProfile) {
                html += '<span class="badge badge-warning" style="margin-bottom:8px">Dirección del Perfil</span> ';
            }
            if (isPredeterminada) {
                html += '<span class="badge badge-primary" style="margin-bottom:8px">Predeterminada</span>';
            }

            html += `<h4>${addr.nombre_completo}</h4>`;
            html += `<p style="margin:8px 0">${direccionCompleta}</p>`;
            html += `<p style="margin:8px 0; color:var(--muted)">Tel: ${addr.telefono}</p>`;
            if (addr.referencias) {
                html += `<p style="margin:8px 0; font-size:14px; color:var(--muted)">Ref: ${addr.referencias}</p>`;
            }

            // Mensaje especial para direcciones del perfil
            if (isFromProfile) {
                html += `<div style="margin:12px 0; padding:12px; background:#fff3cd; border-left:3px solid #ffc107; border-radius:6px">`;
                html += `<p style="margin:0; font-size:13px; color:#856404">⚠️ Esta es tu dirección del perfil. Te recomendamos actualizarla con información completa (ciudad, estado, código postal).</p>`;
                html += `</div>`;
            }

            html += '<div class="address-actions" style="margin-top:12px; display:flex; gap:8px; flex-wrap:wrap">';

            if (isFromProfile) {
                // Botón especial para importar y editar la dirección del perfil
                html += `<button class="btn-address-import" data-id="${addr.id_direccion}" style="font-size:12px; padding:6px 12px; background:var(--green); color:#fff; border:none; border-radius:8px; cursor:pointer">Actualizar Dirección Completa</button>`;
            } else {
                // Botones normales
                if (!isPredeterminada) {
                    html += `<button class="btn-address-default" data-id="${addr.id_direccion}" style="font-size:12px; padding:6px 12px">Marcar predeterminada</button>`;
                }
                html += `<button class="btn-address-edit" data-id="${addr.id_direccion}" style="font-size:12px; padding:6px 12px">Editar</button>`;
                html += `<button class="btn-address-delete" data-id="${addr.id_direccion}" style="font-size:12px; padding:6px 12px; background:#dc2626; color:#fff; border:none; border-radius:8px; cursor:pointer">Eliminar</button>`;
            }

            html += '</div>';
            html += '</div>';
        });

        html += '</div>';
        addressList.innerHTML = html;

        // Agregar event listeners
        document.querySelectorAll('.btn-address-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                editAddress(id);
            });
        });

        document.querySelectorAll('.btn-address-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                deleteAddress(id);
            });
        });

        document.querySelectorAll('.btn-address-default').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                setDefaultAddress(id);
            });
        });

        document.querySelectorAll('.btn-address-import').forEach(btn => {
            btn.addEventListener('click', (e) => {
                importAndEditProfileAddress();
            });
        });

    } catch (error) {
        addressList.innerHTML = '<p style="text-align:center; color:#dc2626">Error al cargar las direcciones</p>';
        console.error(error);
    }
}

async function saveAddress(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const message = document.getElementById('address-form-message');
    const idDireccion = document.getElementById('input-id-direccion').value;

    const apiUrl = idDireccion ? '../api/address_update.php' : '../api/address_create.php';

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            credentials: 'include',
            body: formData
        });

        const text = await response.text();

        if (text === 'OK' || text.includes('success')) {
            message.textContent = idDireccion ? 'Dirección actualizada correctamente' : 'Dirección creada correctamente';
            message.style.color = 'var(--green)';
            message.style.display = 'block';

            setTimeout(() => {
                closeModal('modal-address-form');
                message.style.display = 'none';
                e.target.reset();
                loadAddresses();
            }, 1500);
        } else {
            message.textContent = text || 'Error al guardar la dirección';
            message.style.color = '#dc2626';
            message.style.display = 'block';
        }

    } catch (error) {
        message.textContent = 'Error al guardar la dirección';
        message.style.color = '#dc2626';
        message.style.display = 'block';
        console.error(error);
    }
}

async function editAddress(id) {
    try {
        const response = await fetch(`../api/address_get.php?id=${id}`, { credentials: 'include' });
        if (!response.ok) {
            throw new Error('Error al cargar dirección');
        }

        const addr = await response.json();

        document.getElementById('address-form-title').textContent = 'Editar Dirección';
        document.getElementById('input-id-direccion').value = addr.id_direccion;
        document.getElementById('input-nombre-completo').value = addr.nombre_completo;
        document.getElementById('input-telefono').value = addr.telefono;
        document.getElementById('input-calle').value = addr.calle;
        document.getElementById('input-num-ext').value = addr.numero_exterior || '';
        document.getElementById('input-num-int').value = addr.numero_interior || '';
        document.getElementById('input-colonia').value = addr.colonia;
        document.getElementById('input-ciudad').value = addr.ciudad;
        document.getElementById('input-estado').value = addr.estado;
        document.getElementById('input-cp').value = addr.codigo_postal;
        document.getElementById('input-referencias').value = addr.referencias || '';
        document.getElementById('input-predeterminada').checked = addr.es_predeterminada == 1;

        openModal('modal-address-form');

    } catch (error) {
        alert('Error al cargar los datos de la dirección');
        console.error(error);
    }
}

async function deleteAddress(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta dirección?')) {
        return;
    }

    try {
        const formData = new FormData();
        formData.append('id_direccion', id);

        const response = await fetch('../api/address_delete.php', {
            method: 'POST',
            credentials: 'include',
            body: formData
        });

        const text = await response.text();

        if (text === 'OK') {
            loadAddresses();
        } else {
            alert(text || 'Error al eliminar la dirección');
        }

    } catch (error) {
        alert('Error al eliminar la dirección');
        console.error(error);
    }
}

async function setDefaultAddress(id) {
    try {
        const formData = new FormData();
        formData.append('id_direccion', id);

        const response = await fetch('../api/address_set_default.php', {
            method: 'POST',
            credentials: 'include',
            body: formData
        });

        const text = await response.text();

        if (text === 'OK') {
            loadAddresses();
        } else {
            alert(text || 'Error al marcar como predeterminada');
        }

    } catch (error) {
        alert('Error al marcar como predeterminada');
        console.error(error);
    }
}

async function importAndEditProfileAddress() {
    try {
        // Importar la dirección del perfil a la tabla de direcciones
        const response = await fetch('../api/address_import_from_profile.php', {
            method: 'POST',
            credentials: 'include'
        });

        if (!response.ok) {
            const text = await response.text();
            alert(text || 'Error al importar la dirección');
            return;
        }

        const data = await response.json();

        if (data.success && data.id_direccion) {
            // Abrir el formulario de edición con la dirección recién creada
            editAddress(data.id_direccion);
            // Recargar la lista después de un momento
            setTimeout(() => {
                loadAddresses();
            }, 500);
        }

    } catch (error) {
        alert('Error al importar la dirección');
        console.error(error);
    }
}

// =========================
// Funciones Auxiliares
// =========================
function getEstadoPagoBadge(estado) {
    const badges = {
        'pendiente': '<span class="badge badge-warning">Pendiente</span>',
        'pagado': '<span class="badge badge-success">Pagado</span>',
        'rechazado': '<span class="badge badge-danger">Rechazado</span>'
    };
    return badges[estado] || estado;
}

function getEstadoEnvioBadge(estado) {
    const badges = {
        'pendiente': '<span class="badge badge-info">Pendiente</span>',
        'preparacion': '<span class="badge badge-warning">En Preparación</span>',
        'enviado': '<span class="badge badge-primary">Enviado</span>',
        'entregado': '<span class="badge badge-success">Entregado</span>',
        'cancelado': '<span class="badge badge-danger">Cancelado</span>'
    };
    return badges[estado] || estado;
}

// =========================
// Event Listeners
// =========================

// Historial de compras
document.getElementById('tile-history').addEventListener('click', (e) => {
    e.preventDefault();
    openModal('modal-history');
    loadOrderHistory();
});

// Dirección de envío
document.getElementById('tile-address').addEventListener('click', (e) => {
    e.preventDefault();
    openModal('modal-address');
    loadAddresses();
});

// Agregar nueva dirección
document.getElementById('btn-add-address').addEventListener('click', () => {
    document.getElementById('address-form-title').textContent = 'Nueva Dirección';
    document.getElementById('form-address').reset();
    document.getElementById('input-id-direccion').value = '';
    openModal('modal-address-form');
});

// Cambiar datos - redirigir a profile.html
document.getElementById('tile-profile').addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = 'profile.html';
});

// Eliminar cuenta - redirigir a delete-account.html
document.getElementById('tile-delete').addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = 'delete-account.html';
});

// Cerrar sesión
document.getElementById('tile-logout').addEventListener('click', async (e) => {
    e.preventDefault();
    const r = await fetch('../api/auth_logout.php', { method: 'POST', credentials: 'include' });
    if (r.ok) {
        location.href = 'index.html';
    } else {
        alert('Error al cerrar sesión');
    }
});

// Cerrar modales
document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const modalId = e.target.getAttribute('data-modal');
        closeModal(modalId);
    });
});

// Cerrar modal al hacer click fuera
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
});

// Cancelar pedido
document.getElementById('btn-cancel-order').addEventListener('click', cancelOrder);

// Guardar dirección (crear o actualizar)
document.getElementById('form-address').addEventListener('submit', saveAddress);
