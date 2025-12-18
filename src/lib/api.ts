const API_BASE = '/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { error: errorData.error || errorData.message || `Request failed: ${response.status}` };
    }

    const data = await response.json();
    return { data };
  } catch (error: any) {
    return { error: error.message || 'Network error' };
  }
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      apiRequest<{ user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    register: (email: string, password: string, fullName?: string) =>
      apiRequest<{ user: any }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, fullName }),
      }),
    logout: () =>
      apiRequest('/auth/logout', { method: 'POST' }),
    me: () =>
      apiRequest<{ user: any }>('/auth/me'),
  },

  products: {
    list: (filters?: { category?: string; search?: string }) => {
      const params = new URLSearchParams();
      if (filters?.category) params.append('category', filters.category);
      if (filters?.search) params.append('search', filters.search);
      const query = params.toString();
      return apiRequest<any[]>(`/products${query ? `?${query}` : ''}`);
    },
    get: (id: string) => apiRequest<any>(`/products/${id}`),
    getVariants: (productId: string) => apiRequest<any[]>(`/products/${productId}/variants`),
  },

  orders: {
    create: (data: any) =>
      apiRequest<any>('/orders', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    list: () => apiRequest<any[]>('/orders'),
    get: (id: string) => apiRequest<any>(`/orders/${id}`),
  },

  reviews: {
    list: (productId?: string) => {
      const query = productId ? `?productId=${productId}` : '';
      return apiRequest<any[]>(`/reviews${query}`);
    },
    create: (data: any) =>
      apiRequest<any>('/reviews', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  favorites: {
    list: () => apiRequest<any[]>('/favorites'),
    add: (productId: string) =>
      apiRequest<any>('/favorites', {
        method: 'POST',
        body: JSON.stringify({ productId }),
      }),
    remove: (productId: string) =>
      apiRequest<void>(`/favorites/${productId}`, { method: 'DELETE' }),
  },

  newsletter: {
    subscribe: (email: string, firstName?: string) =>
      apiRequest<any>('/newsletter/subscribe', {
        method: 'POST',
        body: JSON.stringify({ email, firstName }),
      }),
  },

  partners: {
    apply: (data: any) =>
      apiRequest<any>('/partners/apply', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getByCode: (code: string) => apiRequest<any>(`/partners/code/${code}`),
  },

  contests: {
    list: () => apiRequest<any[]>('/contests'),
    enter: (contestId: string, data: any) =>
      apiRequest<any>(`/contests/${contestId}/enter`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
};

export { apiRequest };
