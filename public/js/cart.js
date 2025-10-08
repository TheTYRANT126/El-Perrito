// public/js/cart.js
const rows = document.getElementById('rows');
const subinfo = document.getElementById('subinfo');
const pay = document.getElementById('pay');

async function load() {
  console.log('Cargando carrito...');

  try {
    const response = await fetch('../api/cart_get.php', {
      credentials: 'include',
      headers: {
        'Cache-Control': 'no-cache'
      }
    });

    console.log('Response status:', response.status);

    // Primero verificamos si la respuesta es JSON válido
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Respuesta no es JSON:', text);

      // Si la respuesta indica que no hay login
      if (text.includes('NO_LOGIN') || response.status === 401) {
        rows.innerHTML = '<div class="card">Inicia sesión para ver tu carrito.</div>';
        subinfo.innerHTML = '<small class="muted">—</small>';
        pay.disabled = true;
        return;
      }

      throw new Error('Respuesta no válida del servidor: ' + text);
    }

    const c = await response.json();
    console.log('Datos del carrito:', c);

    rows.innerHTML = '';
    let subtotal = 0, count = 0;

    // Verificar si hay items
    if (!c.items || c.items.length === 0) {
      rows.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;">Tu carrito está vacío</div>';
      subinfo.innerHTML = '<small class="muted">(0 productos): $0.00</small>';
      pay.disabled = true;
      return;
    }

    // Renderizar items del carrito
    c.items.forEach(it => {
      const row = document.createElement('div');
      row.className = 'row';

      // Columna del producto
      const prod = document.createElement('div');
      prod.className = 'prod';
      const img = document.createElement('img');
      img.src = it.imagen || 'images/placeholder.png';
      const namebox = document.createElement('div');
      const title = document.createElement('div');
      title.textContent = it.nombre;
      const unit = document.createElement('div');
      unit.className = 'unit';
      unit.textContent = '$' + Number(it.precio_unitario).toFixed(2);
      namebox.append(title, unit);
      prod.append(img, namebox);

      // Columna de cantidad
      const qtycol = document.createElement('div');
      qtycol.className = 'qtycol';
      const minus = document.createElement('button');
      minus.textContent = '-';
      const n = document.createElement('input');
      n.type = 'number';
      n.value = it.cantidad;
      n.min = 0;
      n.style.width = '56px';
      n.style.textAlign = 'center';
      const plus = document.createElement('button');
      plus.textContent = '+';
      const ltotal = document.createElement('div');
      ltotal.className = 'line-total';
      const line = it.cantidad * it.precio_unitario;
      ltotal.textContent = '$' + line.toFixed(2);

      minus.onclick = async () => {
        const val = Math.max(0, parseInt(n.value) - 1);
        await update(it.id_item, val);
      };
      plus.onclick = async () => {
        const val = parseInt(n.value) + 1;
        await update(it.id_item, val);
      };
      n.onchange = async () => {
        await update(it.id_item, parseInt(n.value));
      };

      qtycol.append(minus, n, plus, ltotal);

      // Columna de precio y eliminar
      const price = document.createElement('div');
      price.style.display = 'flex';
      price.style.alignItems = 'center';
      price.style.justifyContent = 'space-between';
      price.style.gap = '12px';
      const sp = document.createElement('div');
      sp.textContent = '$' + Number(it.precio_unitario).toFixed(2);
      const del = document.createElement('button');
      del.className = 'trash';
      del.innerHTML = '🗑️';
      del.onclick = async () => {
        await update(it.id_item, 0);
      };
      price.append(sp, del);

      row.append(prod, qtycol, price);
      rows.append(row);

      subtotal += it.precio_unitario * it.cantidad;
      count += parseInt(it.cantidad);
    });

    // Actualizar resumen
    subinfo.innerHTML = `<strong>(${count} producto${count !== 1 ? 's' : ''}): $${subtotal.toFixed(2)}</strong>`;
    pay.disabled = false;

    // Configurar botón de pago
    pay.onclick = async () => {
      if (confirm('¿Confirmar compra?')) {
        const r = await fetch('../api/cart_checkout.php', {
          method: 'POST',
          credentials: 'include',
          body: new URLSearchParams()
        });
        const t = await r.text();
        if (r.ok && t === 'OK') {
          alert('¡Compra realizada con éxito!');
          load();
        } else {
          alert('Error al procesar la compra: ' + (t || 'Error desconocido'));
        }
      }
    };

  } catch (error) {
    console.error('Error cargando carrito:', error);
    rows.innerHTML = `<div class="card">Error al cargar el carrito. Por favor, recarga la página.</div>`;
    subinfo.innerHTML = '<small class="muted">Error</small>';
    pay.disabled = true;
  }
}

async function update(id_item, cantidad) {
  console.log('Actualizando item:', id_item, 'cantidad:', cantidad);

  try {
    const r = await fetch('../api/cart_update.php', {
      method: 'POST',
      credentials: 'include',
      body: new URLSearchParams({ id_item, cantidad })
    });

    if (r.ok) {
      console.log('Actualización exitosa');
      load();
    } else {
      const text = await r.text();
      console.error('Error en actualización:', text);
      alert('No se pudo actualizar el carrito');
    }
  } catch (error) {
    console.error('Error actualizando:', error);
    alert('Error de conexión');
  }
}

// Verificar primero el estado de la sesión
async function checkSessionAndLoad() {
  console.log('Verificando sesión antes de cargar carrito...');

  try {
    const sessionResponse = await fetch('../api/session_status.php', {
      credentials: 'include'
    });
    const sessionData = await sessionResponse.json();
    console.log('Estado de sesión:', sessionData);

    if (sessionData.status === 'cliente' || sessionData.status === 'admin') {
      // Usuario autenticado, cargar carrito
      load();
    } else {
      // No autenticado
      rows.innerHTML = '<div class="card">Inicia sesión para ver tu carrito.</div>';
      subinfo.innerHTML = '<small class="muted">—</small>';
      pay.disabled = true;
    }
  } catch (error) {
    console.error('Error verificando sesión:', error);
    load(); // Intentar cargar de todos modos
  }
}

// Iniciar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', checkSessionAndLoad);
} else {
  checkSessionAndLoad();
}