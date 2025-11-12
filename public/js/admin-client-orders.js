// public/js/admin-client-orders.js

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const clientId = urlParams.get('id');
    const fromTab = urlParams.get('from_tab') || 'clientes';

    // Actualizar el enlace de "Volver al Panel"
    const backLink = document.querySelector('a[href="admin-dashboard.html"]');
    if (backLink) {
        backLink.href = `admin-dashboard.html#${fromTab}`;
    }

    if (!clientId) {
        alert('ID de cliente no especificado');
        window.history.back();
        return;
    }

    await loadClientOrders(clientId);
});

async function loadClientOrders(clientId) {
    const clientNameEl = document.getElementById('clientName');
    const ordersContainerEl = document.getElementById('ordersContainer');

    try {
        const response = await fetch(`../api/admin_client_orders_get.php?id_cliente=${clientId}`, {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Error al cargar las compras del cliente');
        }

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        // Mostrar nombre del cliente
        clientNameEl.textContent = `Cliente: ${data.cliente.nombre} ${data.cliente.apellido || ''} (${data.cliente.email})`;

        // Llenar contenedor de órdenes
        if (!data.pedidos || data.pedidos.length === 0) {
            ordersContainerEl.innerHTML = '<div class="card" style="text-align: center; padding: 40px; color: #64748b;">Este cliente no ha realizado ninguna compra.</div>';
            return;
        }

        ordersContainerEl.innerHTML = '';

        data.pedidos.forEach(pedido => {
            const orderCard = document.createElement('div');
            orderCard.className = 'order-card';

            const orderDate = new Date(pedido.fecha_pedido).toLocaleString('es-MX', { dateStyle: 'long', timeStyle: 'short' });

            let itemsHtml = '';
            pedido.items.forEach(item => {
                const subtotal = item.precio_unitario * item.cantidad;
                itemsHtml += `
                    <tr>
                        <td>
                            <div class="product-cell">
                                <img src="${item.imagen_producto || 'images/placeholder.png'}" alt="${item.nombre_producto}" onerror="this.src='images/placeholder.png'">
                                <span>${item.nombre_producto}</span>
                            </div>
                        </td>
                        <td>$${Number(item.precio_unitario).toFixed(2)}</td>
                        <td>${item.cantidad}</td>
                        <td style="text-align: right;">$${subtotal.toFixed(2)}</td>
                    </tr>
                `;
            });

            orderCard.innerHTML = `
                <div class="order-header">
                    <h3>Pedido #${pedido.id_pedido}</h3>
                    <div style="text-align: right;">
                        <div><strong>Total: $${Number(pedido.total).toFixed(2)}</strong></div>
                        <div style="font-size: 14px; color: #64748b;">${orderDate}</div>
                    </div>
                </div>
                <div class="order-body">
                    <table class="order-table">
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Precio</th>
                                <th>Cantidad</th>
                                <th style="text-align: right;">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                    </table>
                </div>
            `;
            ordersContainerEl.appendChild(orderCard);
        });

    } catch (error) {
        console.error('Error:', error);
        ordersContainerEl.innerHTML = `<div class="card" style="text-align: center; padding: 40px; color:#d00000;">${error.message}</div>`;
        clientNameEl.textContent = 'No se pudo cargar la información del cliente.';
    }
}
