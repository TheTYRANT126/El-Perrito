const grid = document.getElementById('grid');
const q = document.getElementById('q');
const btnBuscar = document.getElementById('btnBuscar');
const btnClear = document.getElementById('btnClear');
const btnFiltros = document.getElementById('btnFiltros');
const panelFiltros = document.getElementById('panelFiltros');
const listaCategorias = document.getElementById('listaCategorias');
const btnHist = document.getElementById('btnHist');
const panelHist = document.getElementById('panelHist');
const histList = document.getElementById('histList');

let selectedCat = 0, debounceTimer = null;

function saveHistory(term) {
    term = term.trim(); if (!term) return;
    const key = 'elperrito_searches';
    const arr = JSON.parse(localStorage.getItem(key) || '[]');
    arr.unshift(term);
    const unique = [...new Set(arr)].slice(0, 20);
    localStorage.setItem(key, JSON.stringify(unique));
}
function renderHistory() {
    const arr = JSON.parse(localStorage.getItem('elperrito_searches') || '[]');
    histList.innerHTML = arr.length ? '' : '<li><small class="muted">Sin búsquedas</small></li>';
    arr.forEach(t => {
        const li = document.createElement('li'); li.textContent = t;
        li.onclick = () => { q.value = t; search(); panelHist.style.display = 'none'; };
        histList.append(li);
    });
}
btnHist.onclick = () => { panelHist.style.display = panelHist.style.display === 'none' ? 'block' : 'none'; renderHistory(); };

btnFiltros.onclick = async () => {
    if (panelFiltros.style.display === 'none') {
        panelFiltros.style.display = 'block';
        if (listaCategorias.childElementCount === 0) {
            const cats = await (await fetch('../api/categories_list.php')).json();
            const liAll = document.createElement('li');
            const aAll = document.createElement('a'); aAll.href = '#'; aAll.textContent = 'Todas';
            aAll.onclick = (e) => { e.preventDefault(); selectedCat = 0; search(); panelFiltros.style.display = 'none'; };
            liAll.append(aAll); listaCategorias.append(liAll);
            cats.forEach(c => {
                const li = document.createElement('li');
                const a = document.createElement('a'); a.href = '#'; a.textContent = c.nombre;
                a.onclick = (e) => { e.preventDefault(); selectedCat = c.id_categoria; search(); panelFiltros.style.display = 'none'; };
                li.append(a); listaCategorias.append(li);
            });
        }
    } else panelFiltros.style.display = 'none';
};

btnBuscar.onclick = () => { saveHistory(q.value); search(); };
btnClear.onclick = () => { q.value = ''; search(); };
q.addEventListener('input', () => { clearTimeout(debounceTimer); debounceTimer = setTimeout(search, 200); });

async function search() {
    const params = new URLSearchParams();
    if (q.value) params.set('q', q.value);
    if (selectedCat > 0) params.set('cat', selectedCat);
    const data = await (await fetch('../api/products_list.php?' + params.toString())).json();
    grid.innerHTML = '';
    data.forEach(p => {
        const card = document.createElement('div'); card.className = 'pcard';
        const img = document.createElement('img'); img.src = p.imagen || 'images/placeholder.png'; img.alt = p.nombre; img.onclick = () => location.href = 'product.html?id=' + p.id_producto;
        const h = document.createElement('div'); h.textContent = p.nombre;
        const add = document.createElement('button'); add.className = 'btn primary'; add.textContent = 'Agregar al carrito';
        const qty = document.createElement('div'); qty.className = 'qty';
        const minus = document.createElement('button'); minus.textContent = '-';
        const plus = document.createElement('button'); plus.textContent = '+';
        const n = document.createElement('input'); n.type = 'number'; n.value = 1; n.min = 1; n.style.width = '48px'; n.style.textAlign = 'center';
        minus.onclick = () => { n.value = Math.max(1, parseInt(n.value || '1') - 1) };
        plus.onclick = () => { n.value = parseInt(n.value || '1') + 1 };
        add.onclick = async () => {
            const r = await fetch('../api/cart_add.php', { method: 'POST', credentials: 'include', body: new URLSearchParams({ id_producto: p.id_producto, cantidad: n.value }) });
            if (!r.ok) alert('Inicia sesión para agregar al carrito'); else alert('Agregado');
        };
        qty.append(minus, n, plus);
        card.append(img, h, add, qty);
        grid.append(card);
    });
}

const popups = [
    { panel: panelFiltros, button: btnFiltros },
    { panel: panelHist, button: btnHist }
    // Si en el futuro agregas más, solo los añades aquí
    // { panel: otroPanel, button: otroBoton }
];

document.addEventListener('click', (e) => {
    // Itera sobre cada uno de los popups definidos
    for (const popup of popups) {
        // Comprueba si el panel está visible y si el clic fue fuera del panel y su botón
        if (popup.panel.style.display === 'block' &&
            !popup.button.contains(e.target) &&
            !popup.panel.contains(e.target)) {
            popup.panel.style.display = 'none';
        }
    }
});

search();
