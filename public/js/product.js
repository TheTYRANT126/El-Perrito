function qs(k) { return new URLSearchParams(location.search).get(k); }
async function load() {
    const id = qs('id');
    const data = await (await fetch('../api/product_detail.php?id=' + id)).json();
    if (data.error) { document.getElementById('prodWrap').innerHTML = '<div class="card">Producto no encontrado</div>'; return; }
    const p = data.producto; const imgs = data.imagenes || [];
    const wrap = document.getElementById('prodWrap');
    const main = document.createElement('div');
    main.style.display = 'grid'; main.style.gridTemplateColumns = '120px 1fr 1fr'; main.style.gap = '24px';

    const thumbs = document.createElement('div'); thumbs.style.display = 'grid'; thumbs.style.gap = '16px';
    const all = [{ url: p.imagen || 'images/placeholder.png' }, ...imgs];
    let current = all[0].url;
    all.forEach(o => {
        const t = document.createElement('img'); t.src = o.url; t.style.width = '110px'; t.style.height = '110px'; t.style.objectFit = 'contain'; t.style.background = '#fff'; t.style.borderRadius = '16px'; t.style.border = '1px solid #eee'; t.onclick = () => { current = o.url; big.src = o.url; };
        thumbs.append(t);
    });

    const stage = document.createElement('div'); stage.className = 'card'; stage.style.borderRadius = '24px';
    const big = document.createElement('img'); big.src = current; big.style.display = 'block'; big.style.margin = '20px auto'; big.style.height = '300px'; big.style.objectFit = 'contain';
    stage.append(big);

    const info = document.createElement('div');
    const h = document.createElement('h1'); h.textContent = p.nombre; h.style.fontSize = '48px';
    const price = document.createElement('div'); price.textContent = '$' + Number(p.precio_venta).toFixed(2); price.style.color = '#2c5db5'; price.style.fontSize = '40px'; price.style.fontWeight = '700';
    const add = document.createElement('button'); add.className = 'btn primary'; add.textContent = 'Agregar al carrito'; add.style.fontSize = '20px'; add.style.padding = '12px 22px';
    const qty = document.createElement('div'); qty.className = 'qty'; qty.style.justifyContent = 'center'; qty.style.marginTop = '8px';
    const minus = document.createElement('button'); minus.textContent = '-';
    const n = document.createElement('input'); n.type = 'number'; n.value = 1; n.min = 1; n.style.width = '56px'; n.style.textAlign = 'center';
    const plus = document.createElement('button'); plus.textContent = '+';
    minus.onclick = () => { n.value = Math.max(1, parseInt(n.value || '1') - 1) };
    plus.onclick = () => { n.value = parseInt(n.value || '1') + 1 };
    add.onclick = async () => {
        const r = await fetch('../api/cart_add.php', { method: 'POST', credentials: 'include', body: new URLSearchParams({ id_producto: p.id_producto, cantidad: n.value }) });
        if (!r.ok) alert('Inicia sesión'); else alert('Agregado');
    };
    qty.append(minus, n, plus);

    const dtitle = document.createElement('h3'); dtitle.textContent = 'Descripción';
    const d = document.createElement('p');
    const full = p.descripcion || '';
    const short = full.length > 220 ? full.slice(0, 220) + '…' : full;
    let expanded = false;
    d.textContent = short;
    if (full.length > 220) {
        const more = document.createElement('a'); more.href = '#'; more.textContent = 'Leer más...';
        more.onclick = (e) => { e.preventDefault(); expanded = !expanded; d.textContent = expanded ? full : short; more.textContent = expanded ? 'Leer menos' : 'Leer más...'; };
        info.append(h, price, add, qty, dtitle, d, more);
    } else {
        info.append(h, price, add, qty, dtitle, d);
    }

    main.append(thumbs, stage, info);
    wrap.append(main);
}
load();
