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

// Funciones de historial
function saveHistory(term) {
    term = term.trim();
    if (!term) return;
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
        const li = document.createElement('li');
        li.textContent = t;
        li.onclick = () => {
            q.value = t;
            search();
            panelHist.style.display = 'none';
        };
        histList.append(li);
    });
}

// Event listeners para historial
btnHist.onclick = () => {
    panelHist.style.display = panelHist.style.display === 'none' ? 'block' : 'none';
    renderHistory();
};

// Event listener para filtros
btnFiltros.onclick = async () => {
    if (panelFiltros.style.display === 'none') {
        panelFiltros.style.display = 'block';
        if (listaCategorias.childElementCount === 0) {
            try {
                console.log('Cargando categorías...');
                const response = await fetch('../api/categories_list.php');

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const cats = await response.json();
                console.log('Categorías cargadas:', cats);

                // Opción "Todas"
                const liAll = document.createElement('li');
                const aAll = document.createElement('a');
                aAll.href = '#';
                aAll.textContent = 'Todas';
                aAll.onclick = (e) => {
                    e.preventDefault();
                    selectedCat = 0;
                    search();
                    panelFiltros.style.display = 'none';
                };
                liAll.append(aAll);
                listaCategorias.append(liAll);

                // Agregar cada categoría
                cats.forEach(c => {
                    const li = document.createElement('li');
                    const a = document.createElement('a');
                    a.href = '#';
                    a.textContent = c.nombre;
                    a.onclick = (e) => {
                        e.preventDefault();
                        selectedCat = c.id_categoria;
                        search();
                        panelFiltros.style.display = 'none';
                    };
                    li.append(a);
                    listaCategorias.append(li);
                });
            } catch (error) {
                console.error('Error cargando categorías:', error);
                listaCategorias.innerHTML = '<li><small class="muted">Error al cargar categorías</small></li>';
            }
        }
    } else {
        panelFiltros.style.display = 'none';
    }
};

// Event listeners para búsqueda
btnBuscar.onclick = () => {
    saveHistory(q.value);
    search();
};

btnClear.onclick = () => {
    q.value = '';
    selectedCat = 0;
    search();
};

q.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(search, 300);
});

// Función principal de búsqueda
async function search() {
    console.log('🔍 Iniciando búsqueda...');
    console.log('Término:', q.value);
    console.log('Categoría:', selectedCat);

    try {
        const params = new URLSearchParams();
        if (q.value) params.set('q', q.value);
        if (selectedCat > 0) params.set('cat', selectedCat);

        const url = '../api/products_list.php?' + params.toString();
        console.log('URL de búsqueda:', url);

        const response = await fetch(url);
        console.log('Response status:', response.status);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        // Verificar que la respuesta sea JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('Respuesta no es JSON:', text);
            throw new Error('Respuesta inválida del servidor');
        }

        const data = await response.json();
        console.log('Productos recibidos:', data.length);
        console.log('Datos:', data);

        // Limpiar grid
        grid.innerHTML = '';

        // Si no hay productos
        if (!data || data.length === 0) {
            grid.innerHTML = '<div style="padding: 40px; text-align: center; grid-column: 1/-1;"><h3>No se encontraron productos</h3><p class="muted">Intenta con otro término de búsqueda</p></div>';
            return;
        }

        // Renderizar productos
        data.forEach(p => {
            console.log('Renderizando producto:', p.nombre);

            const card = document.createElement('div');
            card.className = 'pcard';

            // Imagen
            const img = document.createElement('img');
            img.src = p.imagen || 'images/placeholder.png';
            img.alt = p.nombre;
            img.onerror = function () {
                console.warn('Imagen no encontrada:', this.src);
                this.src = 'images/placeholder.png';
            };
            img.onclick = () => location.href = 'product.html?id=' + p.id_producto;
            img.style.cursor = 'pointer';

            // Nombre
            const h = document.createElement('div');
            h.textContent = p.nombre;
            h.style.fontWeight = '600';
            h.style.textAlign = 'center';
            h.style.minHeight = '40px';

            // Precio
            const precio = document.createElement('div');
            precio.textContent = '$' + Number(p.precio_venta).toFixed(2);
            precio.style.color = '#2c5db5';
            precio.style.fontWeight = '700';
            precio.style.fontSize = '18px';

            // Botón agregar
            const add = document.createElement('button');
            add.className = 'btn primary';
            add.textContent = 'Agregar al carrito';

            // Controles de cantidad
            const qty = document.createElement('div');
            qty.className = 'qty';
            const minus = document.createElement('button');
            minus.textContent = '-';
            const plus = document.createElement('button');
            plus.textContent = '+';
            const n = document.createElement('input');
            n.type = 'number';
            n.value = 1;
            n.min = 1;
            n.style.width = '48px';
            n.style.textAlign = 'center';

            minus.onclick = () => {
                n.value = Math.max(1, parseInt(n.value || '1') - 1)
            };
            plus.onclick = () => {
                n.value = parseInt(n.value || '1') + 1
            };

            // Función para agregar al carrito
            add.onclick = async () => {
                try {
                    console.log('Agregando producto:', p.id_producto, 'cantidad:', n.value);

                    const r = await fetch('../api/cart_add.php', {
                        method: 'POST',
                        credentials: 'include',
                        body: new URLSearchParams({
                            id_producto: p.id_producto,
                            cantidad: n.value
                        })
                    });

                    const responseText = await r.text();
                    console.log('Respuesta de cart_add:', responseText);

                    if (!r.ok) {
                        if (r.status === 401 || responseText.includes('NO_LOGIN')) {
                            alert('Inicia sesión para agregar al carrito');
                            window.location.href = 'login.html';
                        } else {
                            alert('Error al agregar al carrito: ' + responseText);
                        }
                    } else {
                        alert('✓ Producto agregado al carrito');
                        n.value = 1; // Reset cantidad
                    }
                } catch (error) {
                    console.error('Error:', error);
                    alert('Error de conexión');
                }
            };

            qty.append(minus, n, plus);
            card.append(img, h, precio, add, qty);
            grid.append(card);
        });

        console.log('✓ Productos renderizados correctamente');

    } catch (error) {
        console.error('❌ Error en búsqueda:', error);
        grid.innerHTML = `
            <div style="padding: 40px; text-align: center; grid-column: 1/-1;">
                <h3>Error al cargar productos</h3>
                <p class="muted">${error.message}</p>
                <button class="btn primary" onclick="search()">Reintentar</button>
            </div>
        `;
    }
}

// Cerrar popups al hacer clic fuera
const popups = [
    { panel: panelFiltros, button: btnFiltros },
    { panel: panelHist, button: btnHist }
];

document.addEventListener('click', (e) => {
    for (const popup of popups) {
        if (popup.panel.style.display === 'block' &&
            !popup.button.contains(e.target) &&
            !popup.panel.contains(e.target)) {
            popup.panel.style.display = 'none';
        }
    }
});

// Cargar productos al iniciar
console.log('📦 Iniciando carga de productos...');
search();