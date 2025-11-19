// src/store/slices/cartSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartAPI } from '../../services/api';

// Async thunks for cart operations
export const fetchCartSummary = createAsyncThunk(
    'cart/fetchSummary',
    async (_, { rejectWithValue }) => {
        try {
            const response = await cartAPI.getCartSummary();
            return response.data || response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch cart summary');
        }
    }
);

export const addToCart = createAsyncThunk(
    'cart/addItem',
    async ({ productId, quantity = 1, isFirstItem = false }, { rejectWithValue }) => {
        try {
            let response;
            if (isFirstItem) {
                response = await cartAPI.createCart(productId, quantity);
            } else {
                response = await cartAPI.addToCart(productId, quantity);
            }
            return response.data || response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to add item to cart');
        }
    }
);

export const removeFromCart = createAsyncThunk(
    'cart/removeItem',
    async (productId, { rejectWithValue }) => {
        try {
            await cartAPI.removeFromCart(productId);
            return productId;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to remove item from cart');
        }
    }
);

export const applyDiscountCode = createAsyncThunk(
    'cart/applyDiscount',
    async (code, { rejectWithValue }) => {
        try {
            await cartAPI.applyDiscount(code);
            // Fetch updated cart summary after applying discount
            const response = await cartAPI.getCartSummary();
            return response.data || response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to apply discount code');
        }
    }
);

export const clearCart = createAsyncThunk(
    'cart/clear',
    async (_, { rejectWithValue }) => {
        try {
            await cartAPI.clearCart();
            return null;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to clear cart');
        }
    }
);

const initialState = {
    cartCount: 0,
    cartTotal: 0,
    cartItems: [],
    isLoading: false,
    error: null,
    discountError: null,
    isApplyingDiscount: false,
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        clearCartError: (state) => {
            state.error = null;
        },
        clearDiscountError: (state) => {
            state.discountError = null;
        },
        resetCart: (state) => {
            state.cartCount = 0;
            state.cartTotal = 0;
            state.cartItems = [];
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Cart Summary
            .addCase(fetchCartSummary.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchCartSummary.fulfilled, (state, action) => {
                state.isLoading = false;
                state.cartCount = action.payload?.totalItems || 0;
                state.cartTotal = action.payload?.totalPrice || 0;
                state.cartItems = action.payload?.cartItems || [];
            })
            .addCase(fetchCartSummary.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
                state.cartCount = 0;
                state.cartTotal = 0;
                state.cartItems = [];
            })

            // Add to Cart
            .addCase(addToCart.pending, (state) => {
                state.error = null;
            })
            .addCase(addToCart.fulfilled, (state, action) => {
                // Update cart count from server response (cartSize = total quantity)
                state.cartCount = action.payload?.cartSize || state.cartCount + 1;
            })
            .addCase(addToCart.rejected, (state, action) => {
                state.error = action.payload;
            })

            // Remove from Cart
            .addCase(removeFromCart.pending, (state) => {
                state.error = null;
            })
            .addCase(removeFromCart.fulfilled, (state) => {
                state.error = null;
            })
            .addCase(removeFromCart.rejected, (state, action) => {
                state.error = action.payload;
            })

            // Apply Discount
            .addCase(applyDiscountCode.pending, (state) => {
                state.isApplyingDiscount = true;
                state.discountError = null;
            })
            .addCase(applyDiscountCode.fulfilled, (state, action) => {
                state.isApplyingDiscount = false;
                state.cartCount = action.payload?.totalItems || 0;
                state.cartTotal = action.payload?.totalPrice || 0;
                state.cartItems = action.payload?.cartItems || [];
            })
            .addCase(applyDiscountCode.rejected, (state, action) => {
                state.isApplyingDiscount = false;
                state.discountError = action.payload;
            })

            // Clear Cart
            .addCase(clearCart.fulfilled, (state) => {
                state.cartCount = 0;
                state.cartTotal = 0;
                state.cartItems = [];
                state.error = null;
            });
    },
});

export const { clearCartError, clearDiscountError, resetCart } = cartSlice.actions;
export default cartSlice.reducer;
