// public/js/admin-client-cart.js

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

    await loadClientCart(clientId);
});

async function loadClientCart(clientId) {
    const clientNameEl = document.getElementById('clientName');
    const cartBodyEl = document.getElementById('cartBody');
    const totalEl = document.getElementById('total');

    try {
        const response = await fetch(`../api/admin_client_cart_get.php?id_cliente=${clientId}`, {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Error al cargar el carrito del cliente');
        }

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        // Mostrar nombre del cliente
        clientNameEl.textContent = `Cliente: ${data.cliente.nombre} ${data.cliente.apellido || ''} (${data.cliente.email})`;

        // Llenar tabla del carrito
        if (!data.carrito || data.carrito.length === 0) {
            cartBodyEl.innerHTML = '<tr><td colspan="6" style="text-align: center; color:#64748b;">El carrito de este cliente está vacío.</td></tr>';
            totalEl.textContent = 'Total: $0.00';
            return;
        }

        cartBodyEl.innerHTML = '';
        let total = 0;

        data.carrito.forEach(item => {
            const tr = document.createElement('tr');
            const subtotal = item.precio_venta * item.cantidad;
            total += subtotal;

            tr.innerHTML = `
                <td>${item.nombre_producto}</td>
                <td><img src="${item.imagen_producto || '../src/assets/placeholder.png'}" alt="${item.nombre_producto}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;" onerror="this.src='../src/assets/placeholder.png'"></td>
                <td>$${Number(item.precio_venta).toFixed(2)}</td>
                <td>${item.cantidad}</td>
                <td>$${subtotal.toFixed(2)}</td>
                <td>
                    <button class="btn-small btn-delete" onclick="deleteItem(${clientId}, ${item.id_producto}, '${item.nombre_producto}')">Eliminar</button>
                </td>
            `;
            cartBodyEl.appendChild(tr);
        });

        totalEl.textContent = `Total: $${total.toFixed(2)}`;

    } catch (error) {
        console.error('Error:', error);
        cartBodyEl.innerHTML = `<tr><td colspan="6" style="text-align: center; color:#d00000;">${error.message}</td></tr>`;
        clientNameEl.textContent = 'No se pudo cargar la información del cliente.';
    }
}

async function deleteItem(clientId, productId, productName) {
    if (!confirm(`¿Estás seguro de que deseas eliminar "${productName}" del carrito de este cliente?`)) {
        return;
    }

    try {
        const response = await fetch('../api/admin_client_cart_item_delete.php', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                id_cliente: clientId,
                id_producto: productId
            })
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || 'Error al eliminar el item.');
        }

        const result = await response.json();

        if (result.success) {
            alert('Producto eliminado del carrito.');
            loadClientCart(clientId); // Recargar el carrito
        } else {
            throw new Error(result.error || 'Error desconocido al eliminar.');
        }

    } catch (error) {
        console.error('Error:', error);
        alert(`Error: ${error.message}`);
    }
}
