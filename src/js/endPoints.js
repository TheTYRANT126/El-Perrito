const determineBasePath = () => {
  const { pathname } = window.location;
  if (pathname.includes('/public/')) {
    const [beforePublic] = pathname.split('/public/');
    return beforePublic || '';
  }

  let trimmed = pathname;
  if (trimmed.endsWith('/')) {
    trimmed = trimmed.slice(0, -1);
  }

  if (!trimmed) {
    return '';
  }

  const lastSlash = trimmed.lastIndexOf('/');
  const lastSegment = lastSlash >= 0 ? trimmed.slice(lastSlash + 1) : trimmed;

  if (lastSegment.includes('.')) {
    const base = trimmed.substring(0, lastSlash);
    return base || '';
  }

  return trimmed;
};

const rawBase = determineBasePath();
const normalizedBase = rawBase === '' || rawBase === '/' ? '' : rawBase;

const buildUrl = (relative) => {
  const path = relative.startsWith('/') ? relative : `/${relative}`;
  return `${normalizedBase}${path}`;
};

export const apiUrl = (endpoint) => buildUrl(`api/${endpoint}`);
export const assetUrl = (relative) => buildUrl(`src/assets/${relative}`);
export const pageUrl = (page) => buildUrl(page);
export const getBasePath = () => (normalizedBase || '/');
export const resolvePath = buildUrl;

export default {
  apiUrl,
  assetUrl,
  pageUrl,
  getBasePath,
  resolvePath,
};
