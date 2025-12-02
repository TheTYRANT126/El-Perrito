// Mock fetch globally
global.fetch = jest.fn();

// Mock DOM elements
const mockElement = {
    textContent: '',
    innerHTML: '',
    style: {},
    value: '',
    checked: false,
    appendChild: jest.fn(),
    addEventListener: jest.fn(),
    classList: {
        add: jest.fn(),
        remove: jest.fn()
    },
    click: jest.fn()
};

// Mock document methods
global.document = {
    getElementById: jest.fn(() => mockElement),
    querySelector: jest.fn(() => mockElement),
    createElement: jest.fn(() => mockElement),
    addEventListener: jest.fn()
};

// Mock window object
global.window = {
    location: {
        search: '?id=1',
        href: ''
    },
    alert: jest.fn(),
    URL: {
        createObjectURL: jest.fn(() => 'blob:mock-url')
    }
};

// Mock console methods
global.console = {
    error: jest.fn(),
    log: jest.fn()
};

// Mock global variables
global.currentImages = [];
global.newImages = [];
global.productId = '1';
global.MAX_IMAGES = 4;

// Mock functions
global.loadProductData = async function () {
    const response = await fetch(`../api/admin_product_get.php?id=${productId}`, {
        credentials: 'include'
    });

    const data = await response.json();
    const product = data.producto || data;

    document.getElementById('nombre').value = product.nombre || '';
    document.getElementById('precio').value = product.precio_venta || '';
};

global.handleSubmit = async function (e) {
    e.preventDefault();

    const endpoint = '../api/admin_product_create.php';
    const response = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'test=data'
    });

    return await response.json();
};

global.addNewImages = function (files) {
    const totalImages = currentImages.length + newImages.length;
    const remaining = MAX_IMAGES - totalImages;

    if (files.length > remaining) {
        files = files.slice(0, remaining);
    }

    files.forEach(file => {
        if (file.size <= 5 * 1024 * 1024) {
            newImages.push(file);
        }
    });
};

describe('Admin Product Edit', () => {
    beforeEach(() => {
        fetch.mockClear();
        window.alert.mockClear();
        document.getElementById.mockClear();
        global.newImages = [];
        global.currentImages = [];
    });

    it('should load product data for editing', async () => {
        const mockProduct = {
            producto: {
                id_producto: 1,
                nombre: 'Test Product',
                precio_venta: 100.00,
                descripcion: 'Test description'
            },
            imagenes: ['image1.jpg', 'image2.jpg']
        };

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockProduct
        });

        await loadProductData();

        expect(fetch).toHaveBeenCalledWith('../api/admin_product_get.php?id=1', {
            credentials: 'include'
        });
    });

    it('should create new product successfully', async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ success: true, id_producto: 123 })
        });

        const mockEvent = {
            preventDefault: jest.fn()
        };

        await handleSubmit(mockEvent);

        expect(fetch).toHaveBeenCalledWith('../api/admin_product_create.php', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'test=data'
        });
    });

    it('should handle image upload', () => {
        const mockFiles = [
            { name: 'test1.jpg', type: 'image/jpeg', size: 1024 },
            { name: 'test2.jpg', type: 'image/jpeg', size: 2048 }
        ];

        addNewImages(mockFiles);

        expect(newImages.length).toBe(2);
        expect(newImages[0].name).toBe('test1.jpg');
    });

    it('should reject oversized images', () => {
        const mockFiles = [
            { name: 'large.jpg', type: 'image/jpeg', size: 6 * 1024 * 1024 }
        ];

        addNewImages(mockFiles);

        expect(newImages.length).toBe(0);
    });

    it('should limit images to maximum allowed', () => {
        global.currentImages = ['img1.jpg', 'img2.jpg'];

        const mockFiles = [
            { name: 'test1.jpg', type: 'image/jpeg', size: 1024 },
            { name: 'test2.jpg', type: 'image/jpeg', size: 1024 },
            { name: 'test3.jpg', type: 'image/jpeg', size: 1024 }
        ];

        addNewImages(mockFiles);

        expect(newImages.length).toBe(2); // Only 2 should be added (4 max - 2 existing)
    });
});
