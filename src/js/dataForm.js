export function formToObject(form) {
  const data = {};
  if (!form) {
    return data;
  }

  const formData = new FormData(form);
  formData.forEach((value, key) => {
    data[key] = typeof value === 'string' ? value.trim() : value;
  });
  return data;
}

export function objectToFormData(object) {
  const formData = new FormData();
  Object.entries(object).forEach(([key, value]) => {
    formData.append(key, value);
  });
  return formData;
}
