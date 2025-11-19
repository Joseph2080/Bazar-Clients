// src/pages/Catalog.jsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import ProductModal from "../catalog/ProductModel";
import ProductList from "./ProductList";
import OrderSummaryModal from "../order/OrderSummaryModal";
import OrderCheckout from "../order/OrderCheckout"
import LoadingScreen from "../common/LoadingScreen";
import logo from "../../assets/bazar-logo.gif";
import { useAuth } from "../../context/AuthContext";
import { fetchProducts, setSearchQuery, clearSearchQuery } from "../../store/slices/productsSlice";
import { fetchCartSummary, addToCart as addToCartAction } from "../../store/slices/cartSlice";
import { 
    setSelectedProduct, 
    closeProductModal, 
    openOrderSummary, 
    closeOrderSummary,
    openOrderCheckout,
    closeOrderCheckout 
} from "../../store/slices/uiSlice";

export default function Catalog() {
    const dispatch = useDispatch();
    const { isAuthenticated, login, user, logout } = useAuth();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    
    // Redux state
    const { filteredItems: products, isLoading, error, searchQuery } = useSelector(state => state.products);
    const { cartCount, cartTotal } = useSelector(state => state.cart);
    const { selectedProduct, showOrderSummary, showOrderCheckout, showProductModal } = useSelector(state => state.ui);

    // Fetch products on mount
    useEffect(() => {
        dispatch(fetchProducts());
    }, [dispatch]);

    const handleProductSelect = (product) => {
        dispatch(setSelectedProduct(product));
    };

    const handleAddToCart = async (product, quantity = 1) => {
        // This function should ONLY be called after authentication check passes
        // No authentication check here - it's handled in ProductModal
        
        try {
            const isFirstItem = cartCount === 0;
            await dispatch(addToCartAction({ 
                productId: product.productResponseDto.productId, 
                quantity,
                isFirstItem 
            })).unwrap();
            
            // Don't fetch cart summary here - wait until user opens order summary
            // Just update the cart count from the response
        } catch (err) {
            console.error('Error adding to cart:', err);
            throw err; // Re-throw so ProductModal can handle it
        }
    };

    const handleOrderSummaryClose = () => {
        dispatch(closeOrderSummary());
    };

    const handleOrderSummaryOpen = () => {
        // Fetch cart summary when opening order summary modal
        if (isAuthenticated) {
            dispatch(fetchCartSummary());
        }
        dispatch(openOrderSummary());
    };

    const handleProceedToCheckout = () => {
        dispatch(openOrderCheckout());
    };

    const handleOrderCheckoutClose = () => {
        dispatch(closeOrderCheckout());
        dispatch(fetchCartSummary());
    };

    const handleSearchChange = (value) => {
        dispatch(setSearchQuery(value));
    };

    const handleSearchClear = () => {
        dispatch(clearSearchQuery());
    };

    // Loading state
    if (isLoading) {
        return <LoadingScreen message="Loading products..." />;
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <img src={logo} alt="Error" className="mx-auto mb-4 w-20 h-20" />
                    <h2 className="text-xl font-semibold mb-2">Failed to load products</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => dispatch(fetchProducts())}
                        className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // Empty state
    if (products.length === 0 && !searchQuery) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <img src={logo} alt="Empty" className="mx-auto mb-4 w-20 h-20 opacity-50" />
                    <h2 className="text-xl font-semibold mb-2">No products available</h2>
                    <p className="text-gray-600">Check back later for new items!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Search Bar */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        {/* Logo */}
                        <div className="flex-shrink-0">
                            <img
                                src={logo}
                                alt="Logo"
                                className="h-12 w-auto"
                            />
                        </div>

                        {/* Search Bar */}
                        <div className="flex-1 max-w-3xl">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchQuery}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    className="w-full px-4 py-3 pl-12 pr-10 text-base bg-gray-50 rounded-full border-0 focus:outline-none focus:bg-white focus:ring-2 focus:ring-gray-300 transition-all"
                                />
                                <svg
                                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                                {searchQuery && (
                                    <button
                                        onClick={handleSearchClear}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Profile Icon - Only show when authenticated */}
                        {isAuthenticated && (
                            <div className="relative">
                                <button
                                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                                >
                                    <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </button>

                                {/* Profile Dropdown */}
                                <AnimatePresence>
                                    {showProfileMenu && (
                                        <>
                                            {/* Backdrop to close menu */}
                                            <div 
                                                className="fixed inset-0 z-30"
                                                onClick={() => setShowProfileMenu(false)}
                                            />
                                            
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{ duration: 0.2 }}
                                                className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-40"
                                            >
                                                {/* User Info */}
                                                <div className="px-4 py-3 border-b border-gray-200">
                                                    <p className="text-sm font-semibold text-gray-900">
                                                        {user?.username || user?.email || 'User'}
                                                    </p>
                                                    {user?.email && (
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {user.email}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Logout Button */}
                                                <button
                                                    onClick={() => {
                                                        logout();
                                                        setShowProfileMenu(false);
                                                    }}
                                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                    </svg>
                                                    Logout
                                                </button>
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                    
                    {searchQuery && (
                        <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-sm text-gray-600 mt-3 ml-14"
                        >
                            {products.length} {products.length === 1 ? 'result' : 'results'}
                        </motion.p>
                    )}
                </div>
            </div>

            {/* Product Grid */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                <ProductList products={products} onSelect={handleProductSelect} />
            </div>

            {cartCount > 0 && (
                <motion.button
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="fixed bottom-6 right-6 bg-black text-white px-6 py-4 rounded-full shadow-lg hover:bg-gray-800 font-semibold flex items-center gap-2"
                    onClick={handleOrderSummaryOpen}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <span>Checkout ({cartCount})</span>
                    <span className="bg-white text-black px-2 py-1 rounded text-sm">
                        €{cartTotal.toFixed(2)}
                    </span>
                </motion.button>
            )}

            <AnimatePresence>
                {showProductModal && selectedProduct && (
                    <ProductModal
                        product={selectedProduct}
                        onClose={() => dispatch(closeProductModal())}
                        onAddToCart={handleAddToCart}
                        isAuthenticated={isAuthenticated}
                        onLogin={login}
                    />
                )}

                {showOrderSummary && (
                    <OrderSummaryModal
                        onClose={handleOrderSummaryClose}
                        onProceedToCheckout={handleProceedToCheckout}
                    />
                )}

                {showOrderCheckout && (
                    <OrderCheckout
                        onClose={handleOrderCheckoutClose}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}