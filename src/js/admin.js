
const nf = document.getElementById('newProductForm');
const sf = document.getElementById('stockForm');
const pmsg = document.getElementById('pmsg');
const smsg = document.getElementById('smsg');
if (nf) nf.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const r = await postForm('admin_new_product.php', nf);
  pmsg.textContent = r.ok ? 'Producto creado' : 'Error al crear';
});
if (sf) sf.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const r = await postForm('admin_set_stock.php', sf);
  smsg.textContent = r.ok ? 'Inventario actualizado' : 'Error al actualizar';
});
