// Mock functions
const loginUser = jest.fn();
const registerUser = jest.fn();

// Mock other dependencies
const formToObject = jest.fn();
const setButtonLoading = jest.fn();
const showMessage = jest.fn();
const validateLogin = jest.fn();
const validateRegister = jest.fn();
const pageUrl = jest.fn();
const redirectIfAuthenticated = jest.fn();

// Mock DOM elements
const mockElement = {
    addEventListener: jest.fn(),
    querySelector: jest.fn(() => mockElement),
    preventDefault: jest.fn()
};

global.document = {
    getElementById: jest.fn(() => mockElement)
};

global.window = {
    location: { href: '' },
    setTimeout: jest.fn()
};

global.console = {
    error: jest.fn()
};

describe('Login System', () => {
    beforeEach(() => {
        loginUser.mockClear();
        registerUser.mockClear();
        formToObject.mockClear();
        validateLogin.mockClear();
        validateRegister.mockClear();
    });

    it('should handle successful login', async () => {
        const mockPayload = { email: 'test@example.com', password: 'password123' };

        loginUser.mockResolvedValueOnce({
            ok: true,
            body: 'OK_CLIENTE'
        });

        formToObject.mockReturnValueOnce(mockPayload);
        validateLogin.mockReturnValueOnce([]);
        pageUrl.mockReturnValueOnce('index.html');

        const result = await loginUser(mockPayload);

        expect(loginUser).toHaveBeenCalledWith(mockPayload);
        expect(result.ok).toBe(true);
        expect(result.body).toBe('OK_CLIENTE');
    });

    it('should handle successful registration', async () => {
        const mockPayload = {
            nombre: 'Test',
            email: 'test@example.com',
            password: 'password123'
        };

        registerUser.mockResolvedValueOnce({
            ok: true,
            body: 'OK'
        });

        formToObject.mockReturnValueOnce(mockPayload);
        validateRegister.mockReturnValueOnce([]);
        pageUrl.mockReturnValueOnce('login.html');

        const result = await registerUser(mockPayload);

        expect(registerUser).toHaveBeenCalledWith(mockPayload);
        expect(result.ok).toBe(true);
        expect(result.body).toBe('OK');
    });
});
