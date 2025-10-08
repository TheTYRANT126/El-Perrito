const rows = document.getElementById('rows');
const subinfo = document.getElementById('subinfo');
const pay = document.getElementById('pay');

async function load() {
  try {
    const c = await (await fetch('../api/cart_get.php', { credentials: 'include' })).json();
    rows.innerHTML = ''; let subtotal = 0, count = 0;
    c.items.forEach(it => {
      const row = document.createElement('div'); row.className = 'row';

      const prod = document.createElement('div'); prod.className = 'prod';
      const img = document.createElement('img'); img.src = it.imagen || 'images/placeholder.png';
      const namebox = document.createElement('div');
      const title = document.createElement('div'); title.textContent = it.nombre;
      const unit = document.createElement('div'); unit.className = 'unit'; unit.textContent = '$' + Number(it.precio_unitario).toFixed(2);
      namebox.append(title, unit); prod.append(img, namebox);

      const qtycol = document.createElement('div'); qtycol.className = 'qtycol';
      const minus = document.createElement('button'); minus.textContent = '-';
      const n = document.createElement('input'); n.type = 'number'; n.value = it.cantidad; n.min = 0; n.style.width = '56px'; n.style.textAlign = 'center';
      const plus = document.createElement('button'); plus.textContent = '+';
      const ltotal = document.createElement('div'); ltotal.className = 'line-total';
      const line = it.cantidad * it.precio_unitario; ltotal.textContent = '$' + line.toFixed(2);
      minus.onclick = async () => { const val = Math.max(0, parseInt(n.value) - 1); await update(it.id_item, val); };
      plus.onclick = async () => { const val = parseInt(n.value) + 1; await update(it.id_item, val); };
      n.onchange = async () => { await update(it.id_item, parseInt(n.value)); };
      qtycol.append(minus, n, plus, ltotal);

      const price = document.createElement('div'); price.style.display = 'flex'; price.style.alignItems = 'center'; price.style.justifyContent = 'space-between'; price.style.gap = '12px';
      const sp = document.createElement('div'); sp.textContent = '$' + Number(it.precio_unitario).toFixed(2);
      const del = document.createElement('button'); del.className = 'trash'; del.innerHTML = '🗑️'; del.onclick = async () => { await update(it.id_item, 0); };
      price.append(sp, del);

      row.append(prod, qtycol, price);
      rows.append(row);
      subtotal += it.precio_unitario * it.cantidad; count += it.cantidad;
    });
    subinfo.innerHTML = `<strong>(${count} producto${count !== 1 ? 's' : ''}): $${subtotal.toFixed(2)}</strong>`;
    pay.onclick = async () => {
      const r = await fetch('../api/cart_checkout.php', { method: 'POST', credentials: 'include', body: new URLSearchParams() });
      const t = await r.text();
      if (r.ok) { alert('Compra realizada'); load(); } else alert(t || 'Error');
    };
  } catch {
    rows.innerHTML = '<div class="card">Inicia sesión para ver tu carrito.</div>';
    subinfo.innerHTML = '<small class="muted">—</small>';
    pay.disabled = true;
  }
}
async function update(id_item, cantidad) {
  const r = await fetch('../api/cart_update.php', { method: 'POST', credentials: 'include', body: new URLSearchParams({ id_item, cantidad }) });
  if (r.ok) load(); else alert('No se pudo actualizar');
}
load();
