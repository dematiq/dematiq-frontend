const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const defaultHeaders = { 'Content-Type': 'application/json' };

function authHeaders() {
  const token = localStorage.getItem('dematiq_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const config = {
    ...options,
    headers: { ...defaultHeaders, ...authHeaders(), ...(options.headers || {}) },
  };

  const res = await fetch(url, config);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Error de conexión con el servidor');
  }

  return data;
}

export async function uploadFile(file, label = 'archivo') {
  const url = `${API_URL}/upload`;
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(url, {
    method: 'POST',
    headers: { ...authHeaders() },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Error al subir el ${label}`);
  return data.data.url;
}

export async function uploadImage(file) {
  return uploadFile(file, 'imagen');
}

function mapProduct(p) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    price: Number(p.price ?? 0),
    price_on_request: p.price_on_request || false,
    category: p.categories?.name || 'General',
    category_id: p.category_id,
    image: p.image_url || `/img/products/${p.slug || p.name.toLowerCase().replace(/\s+/g, '-')}.jpg`,
    image_url: p.image_url,
    description: p.description || '',
    stock: p.stock ?? 0,
    specs: p.specs || {},
    features: Array.isArray(p.specs) ? p.specs : [],
    status: p.status || 'active',
    brand: p.brands?.name || p.brand_name || null,
    brand_id: p.brand_id || null,
    brand_logo: p.brands?.logo_url || null,
    brand_slug: p.brands?.slug || null,
    tech_sheet_url: p.tech_sheet_url || '',
    created_at: p.created_at,
    updated_at: p.updated_at,
  };
}

function mapOrder(o) {
  return {
    id: o.id,
    order_id: `#${String(o.id).padStart(3, '0')}`,
    user_id: o.user_id,
    customer: o.profiles?.name || 'Desconocido',
    customer_email: o.profiles?.email || '',
    items: (o.order_items || []).map(i => ({ ...i, product_name: i.product_name || 'Producto', unit_price: Number(i.unit_price ?? 0) })),
    total: Number(o.total ?? 0),
    status: o.status,
    notes: o.notes,
    shipping_address_id: o.shipping_address_id,
    shipping_address: o.shipping_address || null,
    mp_order_id: o.mp_order_id || null,
    needs_invoice: o.needs_invoice || false,
    invoice_rfc: o.invoice_rfc || '',
    invoice_business_name: o.invoice_business_name || '',
    invoice_email: o.invoice_email || '',
    invoice_cfdi_use: o.invoice_cfdi_use || 'G03',
    invoice_zip: o.invoice_zip || '',
    invoice_regime: o.invoice_regime || '',
    invoice_fiscal_address: o.invoice_fiscal_address || '',
    tracking_number: o.tracking_number || '',
    courier: o.courier || '',
    shipped_at: o.shipped_at || null,
    created_at: o.created_at,
    updated_at: o.updated_at,
    itemCount: (o.order_items || []).reduce((sum, i) => sum + i.quantity, 0),
  };
}

function mapUser(u) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone || '',
    role: u.role === 'admin' ? 'Admin' : 'Usuario',
    role_raw: u.role,
    company_name: u.company_name || '',
    rfc: u.rfc || '',
    status: u.status || 'active',
    created_at: u.created_at,
  };
}

export const categoriesApi = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.parent_id) query.set('parent_id', params.parent_id);
    if (params.status) query.set('status', params.status);
    const qs = query.toString();
    const res = await request(`/categories${qs ? `?${qs}` : ''}`);
    return res.data || [];
  },

  getTree: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.set('status', params.status);
    const qs = query.toString();
    const res = await request(`/categories/tree${qs ? `?${qs}` : ''}`);
    return res.data || [];
  },

  getById: async (id) => {
    const res = await request(`/categories/${id}`);
    return res.data;
  },

  create: async (data) => {
    const res = await request('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  update: async (id, data) => {
    const res = await request(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  delete: async (id) => {
    await request(`/categories/${id}`, { method: 'DELETE' });
  },
};

export const productsApi = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.category_id) query.set('category_id', params.category_id);
    if (params.status) query.set('status', params.status);
    if (params.search) query.set('search', params.search);
    if (params.page) query.set('page', params.page);
    if (params.limit) query.set('limit', params.limit);
    const qs = query.toString();
    const res = await request(`/products${qs ? `?${qs}` : ''}`);
    const data = res.data || {};
    const products = Array.isArray(data) ? data : (data.products || []);
    return {
      products: products.map(mapProduct),
      pagination: data.pagination || null,
    };
  },

  getById: async (id) => {
    const res = await request(`/products/${id}`);
    return mapProduct(res.data);
  },

  create: async (data) => {
    const res = await request('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return mapProduct(res.data);
  },

  update: async (id, data) => {
    const res = await request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return mapProduct(res.data);
  },

  delete: async (id) => {
    await request(`/products/${id}`, { method: 'DELETE' });
  },
};

export const ordersApi = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.set('status', params.status);
    if (params.user_id) query.set('user_id', params.user_id);
    if (params.page) query.set('page', params.page);
    if (params.limit) query.set('limit', params.limit);
    const qs = query.toString();
    const res = await request(`/orders${qs ? `?${qs}` : ''}`);
    if (Array.isArray(res.data)) {
      return { orders: (res.data || []).map(mapOrder), pagination: null };
    }
    return {
      orders: (res.data?.orders || []).map(mapOrder),
      pagination: res.data?.pagination || null,
    };
  },

  getById: async (id) => {
    const res = await request(`/orders/${id}`);
    return mapOrder(res.data);
  },

  create: async (data) => {
    const res = await request('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return mapOrder(res.data || res);
  },

  updateStatus: async (id, status) => {
    const res = await request(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return mapOrder(res.data);
  },

  update: async (id, data) => {
    const res = await request(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return mapOrder(res.data);
  },
};

export const quotationsApi = {
  send: async (data) => {
    const res = await request('/quotations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res;
  },
  sendContact: async (data) => {
    const res = await request('/quotations/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res;
  },
};

export const usersApi = {
  getAll: async () => {
    const res = await request('/users');
    return (res.data || []).map(mapUser);
  },

  getById: async (id) => {
    const res = await request(`/users/${id}`);
    return mapUser(res.data);
  },

  update: async (id, data) => {
    const res = await request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return mapUser(res.data);
  },

  delete: async (id) => {
    await request(`/users/${id}`, { method: 'DELETE' });
  },
};

export const paymentsApi = {
  createPreference: async (orderId) => {
    const res = await request('/payments/create-preference', {
      method: 'POST',
      body: JSON.stringify({ order_id: orderId }),
    });
    return res.data;
  },

  verifyPayment: async (paymentId, orderId) => {
    const res = await request('/payments/verify-payment', {
      method: 'POST',
      body: JSON.stringify({ payment_id: paymentId, order_id: orderId }),
    });
    return res.data;
  },

  reverify: async (orderId) => {
    const res = await request('/payments/reverify', {
      method: 'POST',
      body: JSON.stringify({ order_id: orderId }),
    });
    return res.data;
  },
};

function mapBrand(b) {
  return {
    id: b.id,
    name: b.name,
    slug: b.slug,
    description: b.description || '',
    logo_url: b.logo_url || '',
    website_url: b.website_url || '',
    status: b.status || 'active',
    created_at: b.created_at,
    updated_at: b.updated_at,
  };
}

export const settingsApi = {
  get: async (key) => {
    const res = await request(`/settings/${key}`);
    return res.data?.value || '';
  },
  update: async (key, value) => {
    const res = await request(`/settings/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ value }),
    });
    return res.data;
  },
};

export const brandsApi = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.set('status', params.status);
    const qs = query.toString();
    const res = await request(`/brands${qs ? `?${qs}` : ''}`);
    return (res.data || []).map(mapBrand);
  },

  getById: async (id) => {
    const res = await request(`/brands/${id}`);
    return mapBrand(res.data);
  },

  create: async (data) => {
    const res = await request('/brands', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return mapBrand(res.data);
  },

  update: async (id, data) => {
    const res = await request(`/brands/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return mapBrand(res.data);
  },

  delete: async (id) => {
    await request(`/brands/${id}`, { method: 'DELETE' });
  },
};
