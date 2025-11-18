// src/store/slices/productsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productsAPI } from '../../services/api';

// Async thunk for fetching products
export const fetchProducts = createAsyncThunk(
    'products/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await productsAPI.getAllProducts();
            return response.data || response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to load products');
        }
    }
);

const initialState = {
    items: [],
    filteredItems: [],
    searchQuery: '',
    isLoading: false,
    error: null,
};

const productsSlice = createSlice({
    name: 'products',
    initialState,
    reducers: {
        setSearchQuery: (state, action) => {
            state.searchQuery = action.payload;
            
            // Filter products based on search query
            const searchLower = action.payload.toLowerCase();
            if (searchLower === '') {
                state.filteredItems = state.items;
            } else {
                state.filteredItems = state.items.filter(product => {
                    const name = product.productResponseDto?.name?.toLowerCase() || '';
                    const description = product.productResponseDto?.description?.toLowerCase() || '';
                    return name.includes(searchLower) || description.includes(searchLower);
                });
            }
        },
        clearSearchQuery: (state) => {
            state.searchQuery = '';
            state.filteredItems = state.items;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProducts.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.isLoading = false;
                state.items = action.payload;
                state.filteredItems = action.payload;
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
                state.items = [];
                state.filteredItems = [];
            });
    },
});

export const { setSearchQuery, clearSearchQuery } = productsSlice.actions;
export default productsSlice.reducer;
