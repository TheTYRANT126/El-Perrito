
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

    // verificacion si la respuesta es JSON válido
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Respuesta no es JSON:', text);


      if (text.includes('NO_LOGIN') || response.status === 401) {
        rows.innerHTML = '<div class="card">Inicia sesión para ver tu carrito.</div>';
        subinfo.innerHTML = '<small class="muted">—</small>';

        const payButton = document.getElementById('pay');
        if (payButton) payButton.disabled = true;

        // Ocultar selectores cuando no hay sesión
        const shippingSelector = document.querySelector('.shipping-selector');
        const paymentSelector = document.querySelector('.payment-selector');
        if (shippingSelector) shippingSelector.style.display = 'none';
        if (paymentSelector) paymentSelector.style.display = 'none';
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

      const payButton = document.getElementById('pay');
      if (payButton) payButton.disabled = true;

      // Ocultar selectores cuando el carrito está vacío
      const shippingSelector = document.querySelector('.shipping-selector');
      const paymentSelector = document.querySelector('.payment-selector');
      if (shippingSelector) shippingSelector.style.display = 'none';
      if (paymentSelector) paymentSelector.style.display = 'none';
      return;
    }

    // Mostrar selectores si hay items
    const shippingSelector = document.querySelector('.shipping-selector');
    const paymentSelector = document.querySelector('.payment-selector');
    if (shippingSelector) shippingSelector.style.display = 'block';
    if (paymentSelector) paymentSelector.style.display = 'block';

    // Renderizar items del carrito
    c.items.forEach(it => {
      const row = document.createElement('div');
      row.className = 'row';

      // Columna del producto
      const prod = document.createElement('div');
      prod.className = 'prod';
      const img = document.createElement('img');
      img.src = it.imagen || '../src/assets/placeholder.png';
      img.alt = it.nombre;
      img.onerror = function () {
        console.warn('Error cargando imagen:', this.src);
        this.src = '../src/assets/placeholder.png';
      };

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

      qtycol.append(minus, n, plus);

      // Columna de precio 
      const priceCol = document.createElement('div');
      priceCol.className = 'price-col';
      priceCol.style.display = 'flex';
      priceCol.style.alignItems = 'center';
      priceCol.style.justifyContent = 'flex-end';
      priceCol.style.gap = '30px';

      const ltotal = document.createElement('div');
      ltotal.className = 'line-total';
      const line = it.cantidad * it.precio_unitario;
      ltotal.textContent = '$' + line.toFixed(2);
      ltotal.style.fontWeight = '700';
      ltotal.style.fontSize = '16px';

      const del = document.createElement('button');
      del.className = 'trash';
      del.innerHTML = '<img src="../src/assets/basurero.png" alt="Eliminar" style="width: 30px; height: 30px;">'; del.onclick = async () => {
        await update(it.id_item, 0);
      };

      priceCol.append(ltotal, del);

      row.append(prod, qtycol, priceCol);
      rows.append(row);

      subtotal += it.precio_unitario * it.cantidad;
      count += parseInt(it.cantidad);
    });

    // Actualizar resumen
    subinfo.innerHTML = `<strong>(${count} producto${count !== 1 ? 's' : ''}): $${subtotal.toFixed(2)}</strong>`;

    // Configurar botón de proceder al pago
    const payButton = document.getElementById('pay');
    if (payButton) {
      payButton.disabled = false;
      payButton.onclick = confirmCheckout;
    }

    // Cargar direcciones y tarjetas para el checkout
    loadAddressesForCheckout();
    loadCardsForCheckout();

  } catch (error) {
    console.error('Error cargando carrito:', error);
    rows.innerHTML = `<div class="card">Error al cargar el carrito. Por favor, recarga la página.</div>`;
    subinfo.innerHTML = '<small class="muted">Error</small>';

    const payButton = document.getElementById('pay');
    if (payButton) payButton.disabled = true;
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
    const sessionResponse = await fetch('../api/session_status_improved.php', {
      credentials: 'include'
    });
    const sessionData = await sessionResponse.json();
    console.log('Estado de sesión:', sessionData);

    if (sessionData.status === 'cliente' || sessionData.status === 'admin') {
      load();
    } else {
      rows.innerHTML = '<div class="card">Inicia sesión para ver tu carrito.</div>';
      subinfo.innerHTML = '<small class="muted">—</small>';

      const payButton = document.getElementById('pay');
      if (payButton) payButton.disabled = true;

      // Ocultar selectores cuando no hay sesión
      const shippingSelector = document.querySelector('.shipping-selector');
      const paymentSelector = document.querySelector('.payment-selector');
      if (shippingSelector) shippingSelector.style.display = 'none';
      if (paymentSelector) paymentSelector.style.display = 'none';
    }
  } catch (error) {
    console.error('Error verificando sesión:', error);
    load();
  }
}

// =========================
// Selección de Dirección de Envío
// =========================
let selectedAddressId = null;

async function loadAddressesForCheckout() {
  const addressSelector = document.getElementById('address-selector');
  addressSelector.innerHTML = '<p style="text-align:center; color:#999">Cargando direcciones...</p>';

  try {
    const response = await fetch('../api/address_list.php', { credentials: 'include' });
    if (!response.ok) {
      throw new Error('Error al cargar direcciones');
    }

    const addresses = await response.json();

    if (!Array.isArray(addresses) || addresses.length === 0) {
      addressSelector.innerHTML = `
        <p style="text-align:center; color:#999">No tienes direcciones guardadas.</p>
        <p style="text-align:center; margin-top:12px">
          <a href="account.html" class="btn primary">Agrega una dirección primero</a>
        </p>
      `;
      return;
    }

    let html = '';
    // Seleccionar automáticamente la dirección predeterminada
    let defaultFound = false;

    addresses.forEach((addr, index) => {
      const isPredeterminada = addr.es_predeterminada == 1;
      const isFromProfile = addr.from_profile == 1;
      const direccionCompleta = `${addr.calle} ${addr.numero_exterior || ''} ${addr.numero_interior || ''}, ${addr.colonia}, ${addr.ciudad}, ${addr.estado} CP ${addr.codigo_postal}`;

      if (isPredeterminada && !defaultFound) {
        selectedAddressId = addr.id_direccion;
        defaultFound = true;
      }

      const isSelected = (isPredeterminada && index === 0) || (!defaultFound && index === 0);

      html += `<div class="address-option ${isSelected ? 'selected' : ''}" data-id="${addr.id_direccion}">`;
      html += `<label style="display:flex; cursor:pointer; width:100%">`;
      html += `<input type="radio" name="address" value="${addr.id_direccion}" ${isSelected ? 'checked' : ''}>`;
      html += '<div style="flex:1">';

      // Badges
      if (isFromProfile) {
        html += '<span class="badge badge-warning" style="margin-bottom:8px">Del Perfil</span> ';
      }
      if (isPredeterminada) {
        html += '<span class="badge badge-primary" style="margin-bottom:8px">Predeterminada</span><br>';
      }

      html += `<strong>${addr.nombre_completo}</strong><br>`;
      html += `<span style="color:var(--muted)">${direccionCompleta}</span><br>`;
      html += `<span style="color:var(--muted); font-size:14px">Tel: ${addr.telefono}</span>`;
      if (addr.referencias && addr.referencias !== 'Dirección del perfil (requiere actualización)') {
        html += `<br><span style="color:var(--muted); font-size:14px">Ref: ${addr.referencias}</span>`;
      }

      // Advertencia para direcciones del perfil
      if (isFromProfile) {
        html += `<br><small style="color:#856404">⚠️ Te recomendamos actualizar esta dirección con datos completos</small>`;
      }

      html += '</div>';
      html += '</label>';
      html += '</div>';
    });

    addressSelector.innerHTML = html;

    // Si no hay predeterminada, seleccionar la primera
    if (!defaultFound && addresses.length > 0) {
      selectedAddressId = addresses[0].id_direccion;
    }

    // Agregar event listeners
    document.querySelectorAll('.address-option').forEach(option => {
      option.addEventListener('click', function() {
        // Quitar selección de todos
        document.querySelectorAll('.address-option').forEach(opt => {
          opt.classList.remove('selected');
          opt.querySelector('input[type="radio"]').checked = false;
        });
        // Seleccionar este
        this.classList.add('selected');
        this.querySelector('input[type="radio"]').checked = true;
        selectedAddressId = this.getAttribute('data-id');
      });
    });

  } catch (error) {
    addressSelector.innerHTML = '<p style="text-align:center; color:#dc2626">Error al cargar las direcciones</p>';
    console.error(error);
  }
}

// =========================
// Selección de Tarjeta de Pago
// =========================
let selectedCardId = null;

async function loadCardsForCheckout() {
  const cardSelector = document.getElementById('card-selector');
  cardSelector.innerHTML = '<p style="text-align:center; color:#999">Cargando tarjetas...</p>';

  try {
    const response = await fetch('../api/card_list.php', { credentials: 'include' });
    if (!response.ok) {
      throw new Error('Error al cargar tarjetas');
    }

    const cards = await response.json();

    if (!Array.isArray(cards) || cards.length === 0) {
      cardSelector.innerHTML = `
        <p style="text-align:center; color:#999">No tienes tarjetas guardadas.</p>
        <p style="text-align:center; margin-top:12px">
          <a href="account.html" class="btn primary">Agrega una tarjeta primero</a>
        </p>
      `;
      return;
    }

    let html = '';
    // Seleccionar automáticamente la tarjeta predeterminada
    let defaultFound = false;

    cards.forEach((card, index) => {
      const isPredeterminada = card.es_predeterminada == 1;
      const cardIcon = getCardIcon(card.tipo_tarjeta);
      const cardName = getCardName(card.tipo_tarjeta);
      const maskedNumber = maskCardNumber(card.numero_tarjeta);

      if (isPredeterminada && !defaultFound) {
        selectedCardId = card.id_tarjeta;
        defaultFound = true;
      }

      const isSelected = (isPredeterminada && index === 0) || (!defaultFound && index === 0);

      html += `<div class="card-option ${isSelected ? 'selected' : ''}" data-id="${card.id_tarjeta}">`;
      html += `<label style="display:flex; cursor:pointer; width:100%">`;
      html += `<input type="radio" name="card" value="${card.id_tarjeta}" ${isSelected ? 'checked' : ''}>`;
      html += '<div style="flex:1">';

      if (isPredeterminada) {
        html += '<span class="badge badge-primary" style="margin-bottom:8px">Predeterminada</span><br>';
      }

      html += `<strong>${cardIcon} ${cardName} ${maskedNumber}</strong><br>`;
      html += `<span style="color:var(--muted)">${card.nombre_titular}</span><br>`;
      html += `<span style="color:var(--muted); font-size:14px">Expira: ${card.mes_expiracion}/${card.anio_expiracion}</span>`;

      html += '</div>';
      html += '</label>';
      html += '</div>';
    });

    cardSelector.innerHTML = html;

    // Si no hay predeterminada, seleccionar la primera
    if (!defaultFound && cards.length > 0) {
      selectedCardId = cards[0].id_tarjeta;
    }

    // Agregar event listeners
    document.querySelectorAll('.card-option').forEach(option => {
      option.addEventListener('click', function() {
        // Quitar selección de todos
        document.querySelectorAll('.card-option').forEach(opt => {
          opt.classList.remove('selected');
          opt.querySelector('input[type="radio"]').checked = false;
        });
        // Seleccionar este
        this.classList.add('selected');
        this.querySelector('input[type="radio"]').checked = true;
        selectedCardId = this.getAttribute('data-id');
      });
    });

  } catch (error) {
    cardSelector.innerHTML = '<p style="text-align:center; color:#dc2626">Error al cargar las tarjetas</p>';
    console.error(error);
  }
}

// Funciones auxiliares para tarjetas
function maskCardNumber(numero) {
  if (!numero) return '****';
  const last4 = numero.slice(-4);
  return '**** **** **** ' + last4;
}

function getCardIcon(tipo) {
  const icons = {
    'visa': '💳',
    'mastercard': '💳',
    'amex': '💳',
    'discover': '💳'
  };
  return icons[tipo] || '💳';
}

function getCardName(tipo) {
  const names = {
    'visa': 'Visa',
    'mastercard': 'Mastercard',
    'amex': 'American Express',
    'discover': 'Discover'
  };
  return names[tipo] || tipo;
}

async function confirmCheckout() {
  if (!selectedAddressId) {
    alert('Por favor selecciona una dirección de envío');
    return;
  }

  if (!selectedCardId) {
    alert('Por favor selecciona un método de pago');
    return;
  }

  if (!confirm('¿Confirmar compra con la dirección y método de pago seleccionados?')) {
    return;
  }

  try {
    const formData = new FormData();
    formData.append('id_direccion_envio', selectedAddressId);
    formData.append('id_tarjeta', selectedCardId);

    const r = await fetch('../api/cart_checkout.php', {
      method: 'POST',
      credentials: 'include',
      body: formData
    });

    const t = await r.text();

    if (r.ok && t === 'OK') {
      alert('¡Compra realizada con éxito!');
      load();
    } else {
      alert('Error al procesar la compra: ' + (t || 'Error desconocido'));
    }

  } catch (error) {
    alert('Error al procesar la compra');
    console.error(error);
  }
}


// Inicializar carrito
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', checkSessionAndLoad);
} else {
  checkSessionAndLoad();
}
