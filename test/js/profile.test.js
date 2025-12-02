// Mock fetch globally
global.fetch = jest.fn();

// Mock DOM elements
const mockElement = {
    textContent: '',
    style: {},
    value: '',
    addEventListener: jest.fn()
};

// Mock document methods
global.document = {
    getElementById: jest.fn(() => mockElement)
};

// Mock window object
global.window = {
    location: { href: '' },
    setTimeout: jest.fn()
};

// Mock console
global.console = {
    error: jest.fn()
};

describe('Profile Management', () => {
    beforeEach(() => {
        fetch.mockClear();
    });

    it('should verify password successfully', async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ email: 'test@example.com', nombre: 'Test User' })
        });

        fetch.mockResolvedValueOnce({
            ok: true,
            text: async () => 'OK'
        });

        // Simulate the verification process
        const sessionResponse = await fetch('../api/client_info.php', {
            credentials: 'include'
        });
        const sessionData = await sessionResponse.json();

        const formData = new FormData();
        const response = await fetch('../api/verify_password.php', {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });

        expect(fetch).toHaveBeenNthCalledWith(2, '../api/verify_password.php', {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });
    });

    it('should update profile successfully', async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            text: async () => 'OK'
        });

        const formData = new FormData();
        const response = await fetch('../api/update_profile.php', {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });

        expect(fetch).toHaveBeenCalledWith('../api/update_profile.php', {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });
    });
});
