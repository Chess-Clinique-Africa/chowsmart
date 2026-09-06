const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function request(path, options) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.json();
}

export const api = {
  health: () => request('/health'),
  breads: () => request('/breads'),
  bread: (slug) => request(`/breads/${slug}`),
  restaurants: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/restaurants${qs ? `?${qs}` : ''}`);
  },
  recipes: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/recipes${qs ? `?${qs}` : ''}`);
  },
  recipe: (slug) => request(`/recipes/${slug}`),
  menus: () => request('/menus'),
  suggestMenu: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/menus/suggest${qs ? `?${qs}` : ''}`);
  },
  saveMenu: (payload) =>
    request('/menus', { method: 'POST', body: JSON.stringify(payload) }),
};
