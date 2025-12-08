const isPublicContext = window.location.pathname.includes('/public/');
const homeRedirectUrl = isPublicContext ? '../index.html' : 'index.html';
const deleteForm = document.getElementById('deleteForm');
const msg = document.getElementById('msg');
const userEmail = document.getElementById('user-email');
let sessionInfoCache = null;

async function fetchSessionStatus() {
    if (sessionInfoCache) {
        return sessionInfoCache;
    }

    try {
        const response = await fetch('../api/session_status_improved.php', {
            credentials: 'include'
        });
        if (response.ok) {
            sessionInfoCache = await response.json();
        } else {
            sessionInfoCache = { status: 'anon' };
        }
    } catch {
        sessionInfoCache = { status: 'anon' };
    }

    return sessionInfoCache;
}

// Cargar información del usuario
async function loadUserInfo() {
    console.log('Cargando información del usuario...');

    try {
        const response = await fetch('../api/client_info.php', {
            credentials: 'include'
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
            const session = await fetchSessionStatus();
            if (session.status === 'admin') {
                msg.textContent = 'Cuenta de administración, cuidado al eliminar.';
                msg.style.color = '#b45309';
                const fullName = `${session.nombre || ''} ${session.apellido || ''}`.trim();
                userEmail.textContent = fullName || 'Cuenta administrativa';
                return;
            }
            msg.textContent = 'Error: Debes iniciar sesión';
            msg.style.color = '#d00000';
            setTimeout(() => window.location.href = 'login.html', 2000);
            return;
        }

        const userData = await response.json();
        console.log('Datos del usuario:', userData);

        if (userData && userData.email) {
            userEmail.textContent = userData.email;
            console.log('Email mostrado:', userData.email);
        } else {
            console.error('No se encontró el email en los datos');
            userEmail.textContent = 'Error al cargar email';
        }

    } catch (error) {
        console.error('Error completo:', error);
        msg.textContent = 'Error de conexión';
        msg.style.color = '#d00000';
    }
}

// Eliminar cuenta
deleteForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.textContent = '';

    const confirmCheckbox = document.getElementById('confirm-delete');
    if (!confirmCheckbox.checked) {
        msg.textContent = 'Debes confirmar que entiendes las consecuencias';
        msg.style.color = '#d00000';
        return;
    }

    try {
        const formData = new FormData(deleteForm);

        console.log('Enviando solicitud de eliminación...');

        const response = await fetch('../api/delete_account.php', {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });

        const text = await response.text();
        console.log('Respuesta raw:', text);

        const cleanText = text.trim();
        console.log('Respuesta limpia:', cleanText);
        console.log('Status:', response.status);

        if (response.ok && cleanText === 'OK') {
            msg.textContent = '✓ Cuenta eliminada correctamente';
            msg.style.color = '#2bb640';

            // Deshabilitar el formulario
            deleteForm.querySelectorAll('input, button').forEach(el => el.disabled = true);

            // Redirigir al inicio después de 3 segundos
            setTimeout(() => {
                window.location.href = homeRedirectUrl;
            }, 3000);
        } else if (response.status === 401) {
            msg.textContent = 'Contraseña incorrecta';
            msg.style.color = '#d00000';
        } else {
            msg.textContent = 'Error: ' + cleanText;
            msg.style.color = '#d00000';
        }
    } catch (error) {
        console.error('Error completo:', error);
        msg.textContent = 'Error de conexión';
        msg.style.color = '#d00000';
    }
});


loadUserInfo();
