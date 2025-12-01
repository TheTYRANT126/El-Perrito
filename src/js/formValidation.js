export function validateLogin(data) {
  const errors = [];
  if (!data.email) {
    errors.push('El correo electrónico es obligatorio.');
  }
  if (!data.password) {
    errors.push('La contraseña es obligatoria.');
  }
  return errors;
}

export function validateRegister(data) {
  const errors = [];
  if (!data.nombre || !data.apellido) {
    errors.push('Nombre y apellido son obligatorios.');
  }
  if (!data.email) {
    errors.push('El correo electrónico es obligatorio.');
  }
  if (!data.password || !data.confirm_password) {
    errors.push('Debes definir y confirmar tu contraseña.');
  }
  if (data.password && data.password.length < 6) {
    errors.push('La contraseña debe contener al menos 6 caracteres.');
  }
  if (data.password !== data.confirm_password) {
    errors.push('Las contraseñas no coinciden.');
  }
  return errors;
}
