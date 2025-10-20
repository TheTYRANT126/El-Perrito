const loginForm = document.getElementById('loginForm');
const regForm = document.getElementById('regForm');
const msg = document.getElementById('msg');

// Función helper para limpiar BOM y caracteres invisibles
function cleanResponse(text) {
    // Elimina BOM UTF-8, espacios, tabs y saltos de línea
    return text.replace(/^\uFEFF/, '').replace(/^\s+|\s+$/g, '');
}

// Verificar si el usuario ya tiene sesión activa
async function checkActiveSession() {
    try {
        const response = await fetch('../api/session_status.php', {
            credentials: 'include'
        });
        const data = await response.json();

        // Si el usuario ya está logueado (cliente o admin), redirigir a account.html
        if (data.status === 'cliente' || data.status === 'admin') {
            console.log('Usuario ya tiene sesión activa, redirigiendo a account.html...');
            window.location.href = 'account.html';
        }
    } catch (error) {
        console.error('Error verificando sesión:', error);
    }
}

// Ejecutar verificación al cargar la página
checkActiveSession();

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        try {
            const r = await fetch('../api/auth_login.php', {
                method: 'POST',
                body: new FormData(loginForm),
                credentials: 'include'
            });
            const t = await r.text();

            // Limpiamos la respuesta de BOM y espacios
            const cleanText = cleanResponse(t);

            console.log('Login - Respuesta raw:', t);
            console.log('Login - Respuesta limpia:', cleanText);
            console.log('Login - Es OK_CLIENTE?:', cleanText === 'OK_CLIENTE');
            console.log('Login - Es OK_ADMIN?:', cleanText === 'OK_ADMIN');

            if (r.ok && (cleanText === 'OK_CLIENTE' || cleanText === 'OK_ADMIN')) {
                console.log('✓ Login exitoso, redirigiendo a index.html...');
                window.location.href = 'index.html';
            } else {
                msg.textContent = cleanText || 'Error al iniciar sesión';
            }
        } catch (error) {
            console.error('Error en login:', error);
            msg.textContent = 'Error de conexión';
        }
    });
}

if (regForm) {
    regForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        try {
            const r = await fetch('../api/auth_register.php', {
                method: 'POST',
                body: new FormData(regForm),
                credentials: 'include'
            });
            const t = await r.text();

            // Limpiamos la respuesta de BOM y espacios
            const cleanText = cleanResponse(t);

            console.log('Registro - Respuesta raw:', t);
            console.log('Registro - Respuesta limpia:', cleanText);
            console.log('Registro - Es OK?:', cleanText === 'OK');

            if (r.ok && cleanText === 'OK') {
                console.log('✓ Registro exitoso, redirigiendo a login.html...');
                window.location.href = 'login.html';
            } else {
                msg.textContent = cleanText || 'Error en el registro';
            }
        } catch (error) {
            console.error('Error en registro:', error);
            msg.textContent = 'Error de conexión';
        }
    });
}