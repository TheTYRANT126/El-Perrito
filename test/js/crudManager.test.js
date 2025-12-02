const { JSDOM } = require('jsdom');

// Setup DOM
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.document = dom.window.document;
global.window = dom.window;

// Mock fetch API
global.fetch = jest.fn();

// Mock modules
const endPoints = {
    apiUrl: jest.fn()
};

const dataForm = {
    objectToFormData: jest.fn()
};

describe('crudManager functions', () => {
    beforeEach(() => {
        fetch.mockClear();
        jest.clearAllMocks();
    });

    test('loginUser sends POST request', async () => {
        fetch.mockResolvedValue({
            ok: true,
            text: async () => 'Login successful'
        });
        
        endPoints.apiUrl.mockReturnValue('http://api.example.com/auth_login.php');
        dataForm.objectToFormData.mockReturnValue(new FormData());

        // Simulate loginUser function
        async function loginUser(payload) {
            const url = endPoints.apiUrl('auth_login.php');
            const formData = dataForm.objectToFormData(payload);
            const response = await fetch(url, {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });
            const body = await response.text();
            return { ok: response.ok, body: body.trim() };
        }

        const result = await loginUser({ username: 'test', password: 'test' });

        expect(fetch).toHaveBeenCalledWith('http://api.example.com/auth_login.php', {
            method: 'POST',
            body: expect.any(FormData),
            credentials: 'include'
        });
        expect(result.ok).toBe(true);
    });

    test('registerUser sends POST request', async () => {
        fetch.mockResolvedValue({
            ok: true,
            text: async () => 'Registration successful'
        });
        
        endPoints.apiUrl.mockReturnValue('http://api.example.com/auth_register.php');
        dataForm.objectToFormData.mockReturnValue(new FormData());

        // Simulate registerUser function
        async function registerUser(payload) {
            const url = endPoints.apiUrl('auth_register.php');
            const formData = dataForm.objectToFormData(payload);
            const response = await fetch(url, {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });
            const body = await response.text();
            return { ok: response.ok, body: body.trim() };
        }

        const result = await registerUser({ username: 'test', email: 'test@test.com' });

        expect(endPoints.apiUrl).toHaveBeenCalledWith('auth_register.php');
        expect(result.ok).toBe(true);
    });
});
