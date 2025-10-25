// src/services/api.js
const API_BASE_URL = 'http://localhost:8080/api/v1';

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
        const response = await fetch(`${API_BASE_URL}/product-catalogs/by-store/8`, {
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
    }
};