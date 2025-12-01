const wrap = document.getElementById('prodWrap');
const placeholder = '../src/assets/placeholder.png';

const showMessage = (title, description = '') => {
    wrap.innerHTML = `
        <div class="card" style="padding: 40px; text-align: center;">
            <h3>${title}</h3>
            ${description ? `<p class="muted">${description}</p>` : ''}
        </div>
    `;
};

const parseResponse = async (response) => {
    const text = await response.text();

    try {
        return JSON.parse(text);
    } catch (error) {
        console.error('Respuesta no es JSON:', text);
        throw new Error('Respuesta inválida del servidor.');
    }
};

const buildGallery = (producto, imagenes) => {
    const gallery = Array.isArray(imagenes) ? imagenes : [];
    const mainImage = producto.imagen || placeholder;
    return [{ url: mainImage }, ...gallery];
};

async function loadProduct() {
    const id = new URLSearchParams(window.location.search).get('id');
    if (!id) {
        showMessage('Producto no especificado', 'Intenta regresar al catálogo.');
        return;
    }

    try {
        const response = await fetch(`../api/product_detail.php?id=${encodeURIComponent(id)}`);
        const data = await parseResponse(response);

        if (!response.ok) {
            throw new Error(data?.error || 'No se pudo cargar el producto.');
        }

        if (!data || !data.producto) {
            throw new Error('Producto no encontrado.');
        }

        renderProduct(data.producto, data.imagenes || []);
    } catch (error) {
        console.error('Error cargando producto:', error);
        showMessage('Error al cargar el producto', error.message);
    }
}

function renderProduct(producto, imagenes) {
    wrap.innerHTML = '';

    const main = document.createElement('div');
    main.style.display = 'grid';
    main.style.gridTemplateColumns = '120px 1fr 1fr';
    main.style.gap = '24px';

    const thumbs = document.createElement('div');
    thumbs.style.display = 'grid';
    thumbs.style.gap = '16px';

    const gallery = buildGallery(producto, imagenes);
    let current = gallery[0]?.url || placeholder;

    const stage = document.createElement('div');
    stage.className = 'card';
    stage.style.borderRadius = '24px';

    const big = document.createElement('img');
    big.src = current;
    big.style.display = 'block';
    big.style.margin = '20px auto';
    big.style.height = '300px';
    big.style.objectFit = 'contain';
    big.onerror = function () { this.src = placeholder; };
    stage.append(big);

    gallery.forEach(({ url }) => {
        const thumb = document.createElement('img');
        thumb.src = url;
        thumb.style.width = '110px';
        thumb.style.height = '110px';
        thumb.style.objectFit = 'contain';
        thumb.style.background = '#fff';
        thumb.style.borderRadius = '16px';
        thumb.style.border = '1px solid #eee';
        thumb.onerror = function () { this.src = placeholder; };
        thumb.onclick = () => {
            current = url;
            big.src = url;
        };
        thumbs.append(thumb);
    });

    const info = document.createElement('div');
    const title = document.createElement('h1');
    title.textContent = producto.nombre;
    title.style.fontSize = '48px';

    const price = document.createElement('div');
    price.textContent = '$' + Number(producto.precio_venta).toFixed(2);
    price.style.color = '#2c5db5';
    price.style.fontSize = '40px';
    price.style.fontWeight = '700';

    const add = document.createElement('button');
    add.className = 'btn primary';
    add.textContent = 'Agregar al carrito';
    add.style.fontSize = '20px';
    add.style.padding = '12px 22px';

    const qty = document.createElement('div');
    qty.className = 'qty';
    qty.style.justifyContent = 'center';
    qty.style.marginTop = '8px';

    const minus = document.createElement('button');
    minus.textContent = '-';

    const input = document.createElement('input');
    input.type = 'number';
    input.value = 1;
    input.min = 1;
    input.style.width = '56px';
    input.style.textAlign = 'center';

    const plus = document.createElement('button');
    plus.textContent = '+';

    minus.onclick = () => {
        input.value = Math.max(1, parseInt(input.value || '1', 10) - 1);
    };

    plus.onclick = () => {
        input.value = parseInt(input.value || '1', 10) + 1;
    };

    add.onclick = async () => {
        try {
            const body = new URLSearchParams({ id_producto: producto.id_producto, cantidad: input.value });
            const response = await fetch('../api/cart_add.php', {
                method: 'POST',
                credentials: 'include',
                body
            });

            const text = await response.text();
            if (!response.ok || text.includes('NO_LOGIN')) {
                alert('Inicia sesión para agregar productos.');
            } else {
                alert('✓ Producto agregado al carrito');
                input.value = 1;
            }
        } catch (error) {
            console.error('Error al agregar al carrito:', error);
            alert('Error al agregar al carrito');
        }
    };

    qty.append(minus, input, plus);

    const descTitle = document.createElement('h3');
    descTitle.textContent = 'Descripción';
    const desc = document.createElement('p');

    const full = producto.descripcion || '';
    const short = full.length > 220 ? full.slice(0, 220) + '…' : full;
    let expanded = false;
    desc.textContent = short;

    if (full.length > 220) {
        const toggle = document.createElement('a');
        toggle.href = '#';
        toggle.textContent = 'Leer más...';
        toggle.onclick = (event) => {
            event.preventDefault();
            expanded = !expanded;
            desc.textContent = expanded ? full : short;
            toggle.textContent = expanded ? 'Leer menos' : 'Leer más...';
        };
        info.append(title, price, add, qty, descTitle, desc, toggle);
    } else {
        info.append(title, price, add, qty, descTitle, desc);
    }

    main.append(thumbs, stage, info);
    wrap.append(main);
}

loadProduct();
