// src/services/api.js
// Resolve API base URL in this priority:
// 1) window.BAZAR_API_BASE_URL (from static HTML embed)
// 2) window.REACT_APP_API_URL (alternate window override)
// 3) process.env.REACT_APP_API_URL (CRA env)
// 4) fallback to localhost
const API_BASE_URL = (typeof window !== 'undefined' && (window.BAZAR_API_BASE_URL || window.REACT_APP_API_URL))
    || (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL)
    || 'http://localhost:8080/api/v1';

// Helper function to handle API responses
const handleResponse = async (response) => {
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'API request failed');
    }

    return data;
};

// Helper to get access token
const getAccessToken = () => {
    return sessionStorage.getItem('access_token');
};

// Helper for public API calls (no authentication)
export const fetchPublic = async (endpoint, options = {}) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        credentials: 'include', // Important for cookies
    });
    return response;
};

// Helper for authenticated API calls (with JWT)
export const fetchWithAuth = async (endpoint, options = {}) => {
    const token = getAccessToken();
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers,
        },
        credentials: 'include', // Important for cookies
    });

    // Handle 401 - try to refresh token
    if (response.status === 401) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
            // Retry request with new token
            const newToken = getAccessToken();
            const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...(newToken && { 'Authorization': `Bearer ${newToken}` }),
                    ...options.headers,
                },
                credentials: 'include',
            });
            return retryResponse;
        } else {
            // Refresh failed, user needs to log in again
            throw new Error('Authentication required');
        }
    }

    return response;
};

// Helper to refresh access token
const refreshAccessToken = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // Sends refresh token cookie
        });

        if (response.ok) {
            const data = await response.json();
            sessionStorage.setItem('access_token', data.data.access_token);
            if (data.data.id_token) {
                sessionStorage.setItem('id_token', data.data.id_token);
            }
            return true;
        }
        return false;
    } catch (error) {
        console.error('Token refresh failed:', error);
        return false;
    }
};

// Parse API response
export const parseResponse = async (response) => {
    return handleResponse(response);
};

// Authentication API
export const authAPI = {
    // Get Cognito login URL
    getLoginUrl: async (redirectUri, state) => {
        const response = await fetchPublic(
            `/auth/login-url?redirectUri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(state)}`
        );
        const data = await handleResponse(response);
        // Backend returns: { data: { loginUrl: "..." }, message: "..." }
        return data;
    },

    // Exchange authorization code for tokens
    exchangeToken: async (code, redirectUri) => {
        const payload = { 
            code: code,
            redirectUri: redirectUri 
        };
        
        console.log('Token exchange request payload:', payload);
        
        const response = await fetchPublic('/auth/token', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        const data = await handleResponse(response);
        // Backend returns: { data: { access_token, id_token, ... }, message: "..." }
        return data;
    },

    // Refresh access token
    refreshToken: async () => {
        const response = await fetchPublic('/auth/refresh', {
            method: 'POST',
        });
        const data = await handleResponse(response);
        // Backend returns: { success: true, message: "...", data: { access_token, id_token, ... } }
        return data;
    },
};

// Products API (PUBLIC - no auth required)
export const productsAPI = {
    // Get all products
    getAllProducts: async () => {
        const response = await fetchPublic('/product-catalogs/by-store/9');
        return handleResponse(response);
    },

    // Get product by ID
    getProductById: async (id) => {
        const response = await fetchPublic(`/products/${id}`);
        return handleResponse(response);
    },

    // Get products by store
    getProductsByStore: async (storeId) => {
        const response = await fetchPublic(`/products/store/${storeId}`);
        return handleResponse(response);
    }
};

// Cart API (PROTECTED - requires authentication)
export const cartAPI = {
    // Add product to cart
    addToCart: async (productId, quantity = 1) => {
        const response = await fetchWithAuth('/shop/cart/item', {
            method: 'POST',
            body: JSON.stringify({ productId, quantity })
        });
        return handleResponse(response);
    },

    // Create cart
    createCart: async (productId, quantity = 1) => {
        const response = await fetchWithAuth('/shop/cart', {
            method: 'POST',
            body: JSON.stringify({ productId, quantity })
        });
        return handleResponse(response);
    },

    // Apply discount code
    applyDiscount: async (code) => {
        const response = await fetchWithAuth(`/shop/applyDiscountByCode/${code}`, {
            method: 'POST',
        });
        return handleResponse(response);
    },

    // Remove product from cart
    removeFromCart: async (productId) => {
        const response = await fetchWithAuth(`/shop/cart/item/${productId}`, {
            method: 'DELETE',
        });
        return handleResponse(response);
    },

    // Clear cart
    clearCart: async () => {
        const response = await fetchWithAuth('/shop/cart', {
            method: 'DELETE',
        });
        return handleResponse(response);
    },

    // get cart summary
    getCartSummary: async () => {
        const response = await fetchWithAuth('/shop/cart/summary');
        return handleResponse(response);
    },
};

// Order Checkout API (PROTECTED - requires authentication)
export const orderAPI = {
    // Generate checkout link (now uses JWT, no customerId param needed)
    generateCheckoutLink: async () => {
        const response = await fetchWithAuth('/orders/checkout/link');
        return handleResponse(response);
    },

    // Get order summary
    getOrderSummary: async () => {
        const response = await fetchWithAuth('/orders/summary');
        return handleResponse(response);
    },

    // Complete checkout with payment details
    checkout: async (paymentRequestDto) => {
        const response = await fetchWithAuth('/orders/checkout', {
            method: 'POST',
            body: JSON.stringify(paymentRequestDto)
        });
        return handleResponse(response);
    }
};