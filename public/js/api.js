
const API_BASE = location.origin + '/elperrito/api/';
async function postForm(url, formEl) {
  const fd = new FormData(formEl);
  const r = await fetch(API_BASE + url, { method:'POST', body: fd, credentials:'include' });
  return r;
}
async function getJSON(url) {
  const r = await fetch(API_BASE + url, { credentials:'include' });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return await r.json();
}
async function postJSON(url, data) {
  const r = await fetch(API_BASE + url, { method:'POST', body: new URLSearchParams(data), credentials:'include' });
  return r;
}
