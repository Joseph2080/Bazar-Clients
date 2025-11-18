// src/store/slices/uiSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    selectedProduct: null,
    showOrderSummary: false,
    showOrderCheckout: false,
    showProductModal: false,
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        setSelectedProduct: (state, action) => {
            state.selectedProduct = action.payload;
            state.showProductModal = action.payload !== null;
        },
        closeProductModal: (state) => {
            state.selectedProduct = null;
            state.showProductModal = false;
        },
        openOrderSummary: (state) => {
            state.showOrderSummary = true;
        },
        closeOrderSummary: (state) => {
            state.showOrderSummary = false;
        },
        openOrderCheckout: (state) => {
            state.showOrderSummary = false;
            state.showOrderCheckout = true;
        },
        closeOrderCheckout: (state) => {
            state.showOrderCheckout = false;
        },
        closeAllModals: (state) => {
            state.selectedProduct = null;
            state.showProductModal = false;
            state.showOrderSummary = false;
            state.showOrderCheckout = false;
        },
    },
});

export const {
    setSelectedProduct,
    closeProductModal,
    openOrderSummary,
    closeOrderSummary,
    openOrderCheckout,
    closeOrderCheckout,
    closeAllModals,
} = uiSlice.actions;

export default uiSlice.reducer;
