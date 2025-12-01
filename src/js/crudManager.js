import { apiUrl } from './endPoints.js';
import { objectToFormData } from './dataForm.js';

const cleanResponse = (text) => text.replace(/^\uFEFF/, '').trim();

async function postForm(endpoint, payload) {
  const response = await fetch(apiUrl(endpoint), {
    method: 'POST',
    body: payload instanceof FormData ? payload : objectToFormData(payload),
    credentials: 'include',
  });

  const text = cleanResponse(await response.text());
  return { ok: response.ok, body: text };
}

export function loginUser(payload) {
  return postForm('auth_login.php', payload);
}

export function registerUser(payload) {
  return postForm('auth_register.php', payload);
}
