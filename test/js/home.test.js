// test/js/home.test.js
const { JSDOM } = require('jsdom');

// Setup DOM
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.document = dom.window.document;
global.window = dom.window;

// Mock elements
const mockElements = {
    grid: { innerHTML: '', append: jest.fn() },
    q: { value: '', addEventListener: jest.fn() },
    btnBuscar: { onclick: null },
    btnClear: { onclick: null },
    btnFiltros: { onclick: null },
    panelFiltros: { style: { display: 'none' }, contains: jest.fn() },
    listaCategorias: { childElementCount: 0, innerHTML: '', append: jest.fn() },
    btnHist: { onclick: null, contains: jest.fn() },
    panelHist: { style: { display: 'none' }, contains: jest.fn() },
    histList: { innerHTML: '', append: jest.fn() }
};

document.getElementById = jest.fn((id) => mockElements[id]);
document.createElement = jest.fn(() => ({
    className: '',
    textContent: '',
    src: '',
    onclick: null,
    style: {},
    append: jest.fn(),
    contains: jest.fn()
}));

// Mock globals
global.fetch = jest.fn();
global.alert = jest.fn();
global.localStorage = {
    getItem: jest.fn(() => '[]'),
    setItem: jest.fn()
};
global.location = { href: '' };

describe('home.js functions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockElements.grid.innerHTML = '';
        mockElements.q.value = '';
    });

    test('saveHistory function works', () => {
        function saveHistory(term) {
            term = term.trim();
            if (!term) return;
            const key = 'elperrito_searches';
            const arr = JSON.parse(localStorage.getItem(key) || '[]');
            arr.unshift(term);
            const unique = [...new Set(arr)].slice(0, 20);
            localStorage.setItem(key, JSON.stringify(unique));
        }

        saveHistory('test');

        expect(localStorage.setItem).toHaveBeenCalledWith(
            'elperrito_searches',
            JSON.stringify(['test'])
        );
    });

    test('search function makes fetch request', async () => {
        fetch.mockResolvedValue({
            ok: true,
            headers: { get: () => 'application/json' },
            json: () => Promise.resolve([])
        });

        async function search() {
            const params = new URLSearchParams();
            if (mockElements.q.value) params.set('q', mockElements.q.value);

            const url = `http://localhost/api/products_list.php?${params.toString()}`;
            const response = await fetch(url);
            const data = await response.json();

            mockElements.grid.innerHTML = '';
            if (data.length === 0) {
                mockElements.grid.innerHTML = '<div>No se encontraron productos</div>';
            }
        }

        mockElements.q.value = 'producto';
        await search();

        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining('q=producto')
        );
    });
});
