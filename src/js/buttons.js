export function setButtonLoading(button, isLoading, loadingText = 'Procesando...') {
  if (!button) return;
  if (isLoading) {
    button.dataset.originalText = button.textContent;
    button.textContent = loadingText;
    button.disabled = true;
  } else {
    const original = button.dataset.originalText;
    if (original) {
      button.textContent = original;
      delete button.dataset.originalText;
    }
    button.disabled = false;
  }
}

export function showMessage(target, message, type = 'error') {
  if (!target) return;
  target.textContent = message;
  target.style.color = type === 'success' ? '#15803d' : '#b91c1c';
}
