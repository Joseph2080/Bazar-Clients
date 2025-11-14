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

// Products API
export const productsAPI = {
    // Get all products
    getAllProducts: async () => {
        const response = await fetch(`${API_BASE_URL}/product-catalogs/by-store/9`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        return handleResponse(response);
    },

    // Get product by ID
    getProductById: async (id) => {
        const response = await fetch(`${API_BASE_URL}/products/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        return handleResponse(response);
    },

    // Get products by store
    getProductsByStore: async (storeId) => {
        const response = await fetch(`${API_BASE_URL}/products/store/${storeId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        return handleResponse(response);
    }
};

// Cart API
export const cartAPI = {
    // Add product to cart
    addToCart: async (productId, quantity = 1) => {
        const response = await fetch(`${API_BASE_URL}/shop/cart/item`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                productId,
                quantity
            })
        });
        return handleResponse(response);
    },

    // Create cart
    createCart: async (productId, quantity = 1) => {
        const response = await fetch(`${API_BASE_URL}/shop/cart`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                productId,
                quantity
            })
        });
        return handleResponse(response);
    },

    // Apply discount code
    applyDiscount: async (code) => {
        const response = await fetch(`${API_BASE_URL}/shop/applyDiscountByCode/${code}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        return handleResponse(response);
    },

    // Remove product from cart
    removeFromCart: async (productId) => {
        const response = await fetch(`${API_BASE_URL}/shop/cart/item/${productId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        return handleResponse(response);
    },

    // Clear cart
    clearCart: async () => {
        const response = await fetch(`${API_BASE_URL}/shop/cart`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        return handleResponse(response);
    },

    // get cart summary
    getCartSummary: async () => {
        const response = await fetch(`${API_BASE_URL}/shop/cart/summary`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        return handleResponse(response);
    },
    // Process payment (Stripe)
    processPayment: async (paymentData) => {
        const response = await fetch(`${API_BASE_URL}/payments/process`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(paymentData)
        });
        return handleResponse(response);
    }
};

// Order Checkout API
export const orderAPI = {
    // Generate checkout link for customer
    generateCheckoutLink: async (customerId) => {
        const response = await fetch(`${API_BASE_URL}/orders/checkout/link/${customerId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        return handleResponse(response);
    },

    // Get order summary for customer
    getOrderSummary: async (customerId) => {
        const response = await fetch(`${API_BASE_URL}/orders/${customerId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        return handleResponse(response);
    },

    // Complete checkout with payment details
    checkout: async (customerId, paymentRequestDto) => {
        const response = await fetch(`${API_BASE_URL}/orders/checkout/${customerId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(paymentRequestDto)
        });
        return handleResponse(response);
    }
};