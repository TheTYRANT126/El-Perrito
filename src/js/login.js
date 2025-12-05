import { formToObject } from './dataForm.js';
import { setButtonLoading, showMessage } from './buttons.js';
import { loginUser, registerUser } from './crudManager.js';
import { validateLogin, validateRegister } from './formValidation.js';
import { pageUrl } from './endPoints.js';
import { redirectIfAuthenticated } from './validConnection.js';

const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('regForm');
const feedbackNode = document.getElementById('msg');

redirectIfAuthenticated();

if (loginForm) {
  loginForm.addEventListener('submit', handleLoginSubmit);
}

if (registerForm) {
  registerForm.addEventListener('submit', handleRegisterSubmit);
}

async function handleLoginSubmit(event) {
  event.preventDefault();
  const button = loginForm.querySelector('button[type="submit"]');
  const payload = formToObject(loginForm);
  const errors = validateLogin(payload);

  if (errors.length) {
    showMessage(feedbackNode, errors[0]);
    return;
  }

  try {
    setButtonLoading(button, true, 'Iniciando sesión...');
    const response = await loginUser(payload);

    if (response.ok && (response.body === 'OK_CLIENTE' || response.body === 'OK_ADMIN')) {
      window.location.href = pageUrl('public/index.html');
      return;
    }

    showMessage(feedbackNode, response.body || 'Credenciales inválidas');
  } catch (error) {
    console.error('Error en login:', error);
    showMessage(feedbackNode, 'No se pudo establecer conexión');
  } finally {
    setButtonLoading(button, false);
  }
}

async function handleRegisterSubmit(event) {
  event.preventDefault();
  const button = registerForm.querySelector('button[type="submit"]');
  const payload = formToObject(registerForm);
  const errors = validateRegister(payload);

  if (errors.length) {
    showMessage(feedbackNode, errors[0]);
    return;
  }

  try {
    setButtonLoading(button, true, 'Registrando...');
    const response = await registerUser(payload);

    if (response.ok && response.body === 'OK') {
      showMessage(feedbackNode, 'Registro exitoso, redirigiendo...', 'success');
      setTimeout(() => {
        window.location.href = pageUrl('public/login.html');
      }, 1200);
      return;
    }

    showMessage(feedbackNode, response.body || 'No se pudo registrar la cuenta');
  } catch (error) {
    console.error('Error en registro:', error);
    showMessage(feedbackNode, 'No se pudo establecer conexión');
  } finally {
    setButtonLoading(button, false);
  }
}
