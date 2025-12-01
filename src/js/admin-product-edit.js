// Admin Product Edit - Sistema de edición y creación de productos

const productId = new URLSearchParams(window.location.search).get('id');
const fromTabParam = new URLSearchParams(window.location.search).get('from_tab');
const isEdit = !!productId;
const fromTab = fromTabParam || 'productos';

// Elementos DOM
const form = document.getElementById('productForm');
const productIdInput = document.getElementById('productId');
const formTitle = document.getElementById('formTitle');
const productIdBadge = document.getElementById('productIdBadge');
const msg = document.getElementById('msg');
const categoriaSelect = document.getElementById('categoria');

// Elementos de imágenes
const mainImage = document.getElementById('mainImage');
const thumbnails = document.getElementById('thumbnails');
const uploadArea = document.getElementById('uploadArea');
const imageInput = document.getElementById('imageInput');
const imageCount = document.getElementById('imageCount');

let currentImages = []; // Imágenes ya existentes en el servidor
let newImages = []; // Archivos nuevos seleccionados para subir
const MAX_IMAGES = 4;

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
    // Actualizar el enlace de "Volver al Panel"
    const backLink = document.querySelector('a[href="admin-dashboard.html"]');
    if (backLink) {
        backLink.href = `admin-dashboard.html#${fromTab}`;
    }

    console.log('=== Inicializando admin-product-edit ===');
    console.log('Product ID:', productId);
    console.log('Modo edición:', isEdit);
    console.log('Volver a la pestaña:', fromTab);

    // Verificar sesión de administrador
    await checkAdminSession();

    // Cargar categorías
    await loadCategories();

    // Si es edición, cargar datos del producto
    if (isEdit) {
        console.log('📝 Modo EDICIÓN activado - Cargando producto ID:', productId);

        formTitle.textContent = 'Editar Producto';
        productIdBadge.textContent = `ID: ${productId}`;
        productIdBadge.style.display = 'inline-block';
        productIdInput.value = productId;

        // Cambiar texto del botón de submit a "Actualizar"
        document.querySelector('#productForm button[type="submit"]').textContent = 'Actualizar Producto';

        console.log('⏳ Cargando datos del producto...');
        await loadProductData();

        console.log('⏳ Cargando imágenes del producto...');
        await loadProductImages();

        console.log('✅ Producto cargado completamente');
    } else {
        console.log('➕ Modo CREACIÓN activado - Formulario vacío');
    }

    // Configurar eventos
    setupEventListeners();

    updateImageCount();

    console.log('=== Inicialización completada ===');
});

// Verificar sesión de administrador
async function checkAdminSession() {
    try {
        const response = await fetch('../api/session_status_improved.php', {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('No autenticado');
        }

        const session = await response.json();

        if (session.status !== 'admin') {
            alert('No tienes permisos para acceder a esta página');
            window.location.href = '../login.html';
        }
    } catch (error) {
        console.error('Error verificando sesión:', error);
        alert('Debes iniciar sesión como administrador');
        window.location.href = '../login.html';
    }
}

// Cargar categorías
async function loadCategories() {
    try {
        const response = await fetch('../api/categories_list.php');

        if (!response.ok) {
            throw new Error('Error cargando categorías');
        }

        const categories = await response.json();

        categoriaSelect.innerHTML = '<option value="">Selecciona una categoría</option>';

        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id_categoria;
            option.textContent = cat.nombre;
            categoriaSelect.appendChild(option);
        });

        console.log('Categorías cargadas:', categories.length);
    } catch (error) {
        console.error('Error cargando categorías:', error);
        msg.style.color = 'red';
        msg.textContent = 'Error al cargar categorías';
    }
}

// Cargar datos del producto
async function loadProductData() {
    try {
        const response = await fetch(`../api/admin_product_get.php?id=${productId}`, {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Error cargando producto');
        }

        const data = await response.json();
        console.log('Datos recibidos:', data);

        // La API devuelve { producto: {...}, imagenes: [...] }
        const product = data.producto || data;
        console.log('Producto a cargar:', product);

        // Rellenar formulario con los datos existentes
        document.getElementById('nombre').value = product.nombre || '';
        document.getElementById('precio').value = product.precio_venta || '';
        document.getElementById('categoria').value = product.id_categoria || '';
        document.getElementById('descripcion').value = product.descripcion || '';
        document.getElementById('caducidad').value = product.caducidad || '';
        document.getElementById('stock').value = product.stock || 0;
        document.getElementById('stock_minimo').value = product.stock_minimo || 0;
        document.getElementById('es_medicamento').checked = product.es_medicamento == 1;

        console.log('✓ Formulario rellenado con datos existentes');

    } catch (error) {
        console.error('Error cargando producto:', error);
        msg.style.color = 'red';
        msg.textContent = 'Error al cargar los datos del producto';
    }
}

// Cargar imágenes del producto desde el servidor
async function loadProductImages() {
    try {
        const response = await fetch(`../api/admin_product_get.php?id=${productId}`, {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Error cargando imágenes');
        }

        const data = await response.json();
        console.log('Datos de imágenes recibidos:', data);

        // La API devuelve { producto: {...}, imagenes: [...] }
        currentImages = [];

        if (data.imagenes && data.imagenes.length > 0) {
            data.imagenes.forEach(img => {
                if (typeof img === 'string') {
                    currentImages.push(img);
                } else if (img && img.url) {
                    currentImages.push(img.url);
                }
            });
        }

        console.log('Imágenes cargadas:', currentImages);
        renderImages();
        updateImageCount();

    } catch (error) {
        console.error('Error cargando imágenes:', error);
    }
}

// Verificar si una imagen existe
async function checkImageExists(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
    } catch {
        return false;
    }
}

// Renderizar imágenes (existentes + nuevas seleccionadas)
function renderImages() {
    thumbnails.innerHTML = '';

    // Combinar imágenes existentes con las nuevas
    const allImages = [...currentImages];

    // Agregar las nuevas imágenes como URLs de objeto
    newImages.forEach(file => {
        allImages.push(URL.createObjectURL(file));
    });

    if (allImages.length === 0) {
        mainImage.src = '../src/assets/placeholder.png';
        return;
    }

    // Mostrar primera imagen como principal
    mainImage.src = allImages[0];

    // Crear thumbnails
    allImages.forEach((imgSrc, index) => {
        const div = document.createElement('div');
        div.className = 'thumbnail';
        if (index === 0) div.classList.add('active');

        const img = document.createElement('img');
        img.src = imgSrc;
        img.alt = `Imagen ${index + 1}`;

        div.appendChild(img);
        div.onclick = () => {
            mainImage.src = imgSrc;
            document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
            div.classList.add('active');
        };

        thumbnails.appendChild(div);
    });
}

// Actualizar contador de imágenes
function updateImageCount() {
    const totalImages = currentImages.length + newImages.length;
    const remaining = MAX_IMAGES - totalImages;

    imageCount.textContent = `${totalImages} de ${MAX_IMAGES} imágenes. ${remaining > 0 ? `Puedes subir ${remaining} más.` : 'Máximo alcanzado.'}`;
    imageCount.style.color = remaining > 0 ? '#64748b' : '#dc2626';
}

// Configurar event listeners
function setupEventListeners() {
    // Submit del formulario
    form.addEventListener('submit', handleSubmit);

    // Click en área de subida
    uploadArea.addEventListener('click', () => {
        const totalImages = currentImages.length + newImages.length;
        if (totalImages < MAX_IMAGES) {
            imageInput.click();
        } else {
            alert('Ya has alcanzado el máximo de 4 imágenes');
        }
    });

    // Selección de archivos
    imageInput.addEventListener('change', handleFileSelect);

    // Drag & Drop
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
}

// Manejar drag over
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    uploadArea.classList.add('dragging');
}

// Manejar drag leave
function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    uploadArea.classList.remove('dragging');
}

// Manejar drop
function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    uploadArea.classList.remove('dragging');

    const totalImages = currentImages.length + newImages.length;
    if (totalImages >= MAX_IMAGES) {
        alert('Ya has alcanzado el máximo de 4 imágenes');
        return;
    }

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length === 0) {
        alert('Por favor arrastra solo archivos de imagen');
        return;
    }

    addNewImages(imageFiles);
}

// Manejar selección de archivos
function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    addNewImages(files);
    // Limpiar input
    e.target.value = '';
}

// Agregar nuevas imágenes a la cola (sin subirlas todavía)
function addNewImages(files) {
    const totalImages = currentImages.length + newImages.length;
    const remaining = MAX_IMAGES - totalImages;

    if (files.length > remaining) {
        alert(`Solo puedes subir ${remaining} imagen(es) más`);
        files = files.slice(0, remaining);
    }

    // Validar tamaño
    files.forEach(file => {
        if (file.size > 5 * 1024 * 1024) {
            alert(`${file.name} es demasiado grande (máximo 5MB)`);
            return;
        }
        newImages.push(file);
    });

    // Actualizar vista previa
    renderImages();
    updateImageCount();
}

// Manejar submit del formulario
async function handleSubmit(e) {
    e.preventDefault();

    try {
        msg.style.color = '#2c5db5';
        msg.textContent = isEdit ? 'Actualizando producto...' : 'Creando producto...';

        // Paso 1: Guardar/actualizar producto
        const formData = new FormData(form);
        const params = new URLSearchParams();

        for (const [key, value] of formData.entries()) {
            if (key === 'es_medicamento') {
                params.set(key, document.getElementById('es_medicamento').checked ? '1' : '0');
            } else if (value !== '') {
                params.set(key, value);
            }
        }

        const endpoint = isEdit ? '../api/admin_product_update.php' : '../api/admin_product_create.php';

        const response = await fetch(endpoint, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params.toString()
        });

        // Leer la respuesta
        const contentType = response.headers.get('content-type');
        let result = null;
        let idProducto = productId; // Por defecto, usar el ID actual

        if (contentType && contentType.includes('application/json')) {
            // Si es JSON (creación), parsear
            result = await response.json();
            console.log('Respuesta JSON:', result);

            // Verificar si hay error en la respuesta
            if (!response.ok || !result.success) {
                throw new Error(result.error || 'Error al guardar producto');
            }

            idProducto = result.id_producto || productId;
        } else {
            // Si es texto plano (edición)
            const text = await response.text();
            console.log('Respuesta texto:', text);

            if (!response.ok) {
                throw new Error(text || 'Error al guardar producto');
            }

            if (text !== 'OK') {
                throw new Error('Respuesta inesperada: ' + text);
            }

            result = { success: true };
            idProducto = productId; // En edición, ya tenemos el ID
        }

        // Paso 2: Subir nuevas imágenes si hay
        if (newImages.length > 0) {
            msg.textContent = 'Subiendo imágenes...';

            const imageFormData = new FormData();
            imageFormData.append('id_producto', idProducto);

            newImages.forEach(file => {
                imageFormData.append('images[]', file);
            });

            const imageResponse = await fetch('../api/admin_product_upload_images.php', {
                method: 'POST',
                credentials: 'include',
                body: imageFormData
            });

            if (!imageResponse.ok) {
                const text = await imageResponse.text();
                throw new Error('Error al subir imágenes: ' + text);
            }

            console.log('Imágenes subidas correctamente');
        }

        msg.style.color = 'green';
        msg.textContent = '✓ Producto guardado correctamente';

        // Si es creación, redirigir a edición después de un momento
        if (!isEdit) {
            setTimeout(() => {
                window.location.href = `admin-product-edit.html?id=${idProducto}&from_tab=${fromTab}`;
            }, 1500);
        } else {
            // Si es edición, recargar imágenes y limpiar newImages
            newImages = [];
            await loadProductImages();
        }

    } catch (error) {
        console.error('Error guardando producto:', error);
        msg.style.color = 'red';
        msg.textContent = 'Error: ' + error.message;
    }
}
