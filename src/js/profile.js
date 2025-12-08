
const verifySection = document.getElementById('verify-section');
const editSection = document.getElementById('edit-section');
const verifyForm = document.getElementById('verifyForm');
const editForm = document.getElementById('editForm');
const verifyMsg = document.getElementById('verify-msg');
const editMsg = document.getElementById('edit-msg');

let userData = null;

// Paso 1: Verificar contraseña
verifyForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    verifyMsg.textContent = '';

    try {
        const formData = new FormData(verifyForm);

        // obtener el email del usuario actual
        const sessionResponse = await fetch('../api/client_info.php', {
            credentials: 'include'
        });

        if (!sessionResponse.ok) {
            verifyMsg.textContent = 'Error: Debes iniciar sesión';
            setTimeout(() => window.location.href = 'login.html', 2000);
            return;
        }

        const sessionData = await sessionResponse.json();
        formData.append('email', sessionData.email);

        // Verificar la contraseña
        const response = await fetch('../api/verify_password.php', {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });

        const text = await response.text();
        const cleanText = text.trim();

        if (response.ok && cleanText === 'OK') {
            // Contraseña correcta, cargar los datos del usuario
            userData = sessionData;
            loadUserData();
            verifySection.style.display = 'none';
            editSection.style.display = 'block';
        } else {
            verifyMsg.textContent = 'Contraseña incorrecta';
            verifyMsg.style.color = '#d00000';
        }
    } catch (error) {
        console.error('Error:', error);
        verifyMsg.textContent = 'Error de conexión';
    }
});

// Cargar datos del usuario en el formulario
function loadUserData() {
    document.getElementById('nombre').value = userData.nombre || '';
    document.getElementById('apellido').value = userData.apellido || '';
    document.getElementById('email').value = userData.email || '';
    document.getElementById('telefono').value = userData.telefono || '';
    document.getElementById('direccion').value = userData.direccion || '';
}

// Paso 2: Guardar cambios
editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    editMsg.textContent = '';

    const newPass = document.getElementById('new_password').value;
    const confirmPass = document.getElementById('confirm_password').value;

    // Validar contraseña si se ingresó
    if (newPass || confirmPass) {
        if (newPass !== confirmPass) {
            editMsg.textContent = 'Las contraseñas no coinciden';
            editMsg.style.color = '#d00000';
            return;
        }
        if (newPass.length < 6) {
            editMsg.textContent = 'La contraseña debe tener al menos 6 caracteres';
            editMsg.style.color = '#d00000';
            return;
        }
    }

    try {
        const formData = new FormData(editForm);

        const response = await fetch('../api/update_profile.php', {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });

        const text = await response.text();
        const cleanText = text.trim();

        if (response.ok && cleanText === 'OK') {
            editMsg.textContent = '✓ Datos actualizados correctamente';
            editMsg.style.color = '#2bb640';

            // Limpiar campos de contraseña
            document.getElementById('new_password').value = '';
            document.getElementById('confirm_password').value = '';

            // Redirigir después de 2 segundos
            setTimeout(() => window.location.href = 'account.html', 2000);
        } else {
            editMsg.textContent = 'Error al actualizar: ' + cleanText;
            editMsg.style.color = '#d00000';
        }
    } catch (error) {
        console.error('Error:', error);
        editMsg.textContent = 'Error de conexión';
        editMsg.style.color = '#d00000';
    }
});
