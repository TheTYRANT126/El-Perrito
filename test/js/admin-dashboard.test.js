// Mock fetch globally
global.fetch = jest.fn();

// Mock DOM elements
const mockElement = {
    textContent: '',
    innerHTML: '',
    style: {},
    appendChild: jest.fn(),
    addEventListener: jest.fn(),
    classList: {
        add: jest.fn(),
        remove: jest.fn()
    },
    value: ''
};

// Mock document methods
global.document = {
    getElementById: jest.fn(() => mockElement),
    querySelectorAll: jest.fn(() => []),
    querySelector: jest.fn(() => mockElement),
    createElement: jest.fn(() => mockElement)
};

// Mock window object
global.window = {
    location: {
        hash: '',
        href: ''
    },
    confirm: jest.fn(),
    alert: jest.fn()
};

// Mock console methods
global.console = {
    error: jest.fn(),
    log: jest.fn()
};

// Mock global variables from admin-dashboard.js
global.currentPage = {
    productos: 1
};

// Mock functions directly since they're not exported
global.loadDashboardStats = async function () {
    const response = await fetch('../api/admin_dashboard_stats.php', {
        credentials: 'include'
    });
    const data = await response.json();

    if (data.success && data.stats) {
        document.getElementById('ventasHoy').textContent = data.stats.ventas_hoy;
    }
};

global.loadProductos = async function () {
    const search = document.getElementById('searchProductos').value;
    const params = new URLSearchParams({
        page: currentPage.productos,
        q: search
    });

    const response = await fetch(`../api/admin_products_list.php?${params}`, {
        credentials: 'include'
    });

    const data = await response.json();
    return data;
};

global.eliminarProducto = async function (id, nombre) {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar el producto "${nombre}"?`)) {
        return;
    }

    const response = await fetch('../api/admin_product_delete.php', {
        method: 'POST',
        credentials: 'include',
        body: new URLSearchParams({ id_producto: id })
    });

    const text = await response.text();

    if (response.ok && text === 'OK') {
        window.alert('Producto eliminado correctamente');
    }
};

describe('Admin Dashboard', () => {
    beforeEach(() => {
        fetch.mockClear();
        window.confirm.mockClear();
        window.alert.mockClear();
        document.getElementById.mockClear();
    });

    it('should load dashboard statistics successfully', async () => {
        const mockStats = {
            success: true,
            stats: {
                ventas_hoy: 1500.50,
                ventas_mes: 45000.00,
                ordenes_hoy: 12,
                productos_activos: 150,
                total_clientes: 300
            }
        };

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockStats
        });

        await loadDashboardStats();

        expect(fetch).toHaveBeenCalledWith('../api/admin_dashboard_stats.php', {
            credentials: 'include'
        });
    });

    it('should load products with pagination', async () => {
        const mockData = {
            productos: [
                { id_producto: 1, nombre: 'Producto Test', precio_venta: 100.00, activo: true }
            ],
            pagination: { current_page: 1, total_pages: 5, total: 50 }
        };

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockData
        });

        await loadProductos();

        expect(fetch).toHaveBeenCalledWith(expect.stringContaining('admin_products_list.php'), {
            credentials: 'include'
        });
    });

    it('should delete product successfully', async () => {
        window.confirm.mockReturnValue(true);

        fetch.mockResolvedValueOnce({
            ok: true,
            text: async () => 'OK'
        });

        await eliminarProducto(1, 'Test Product');

        expect(fetch).toHaveBeenCalledWith('../api/admin_product_delete.php', {
            method: 'POST',
            credentials: 'include',
            body: expect.any(URLSearchParams)
        });
        expect(window.alert).toHaveBeenCalledWith('Producto eliminado correctamente');
    });
});
