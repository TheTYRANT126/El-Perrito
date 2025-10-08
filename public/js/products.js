
const grid = document.getElementById('grid');
const q = document.getElementById('q'); const btnBuscar = document.getElementById('btnBuscar');
btnBuscar.addEventListener('click', load);
q.addEventListener('keydown', e=>{ if(e.key==='Enter') load(); });
load();

async function load(){
  const data = await getJSON('products_list.php?q='+(q.value||''));
  grid.innerHTML = '';
  data.forEach(p=>{
    const card = document.createElement('div'); card.className='product-card';
    const img = document.createElement('img'); img.src = (p.imagen||'images/placeholder.png'); img.alt=p.nombre;
    const h = document.createElement('h3'); h.textContent = p.nombre;
    const pr = document.createElement('div'); pr.className='price'; pr.textContent = '$'+p.precio_venta.toFixed(2);
    const row = document.createElement('div'); row.className='actions';
    const add = document.createElement('button'); add.className='btn primary'; add.textContent='Agregar al carrito';
    add.onclick = async () => {
      const r = await postJSON('cart_add.php', { id_producto:p.id_producto, cantidad:1 });
      if (!r.ok) alert('Inicia sesión para agregar al carrito'); else alert('Agregado');
    };
    row.append(add);
    card.append(img,h,pr,row);
    grid.append(card);
  });
}
