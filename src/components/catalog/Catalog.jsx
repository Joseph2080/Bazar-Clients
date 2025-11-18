// src/pages/Catalog.jsx
import { useEffect } from "react";
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
    const { isAuthenticated, login } = useAuth();
    
    // Redux state
    const { filteredItems: products, isLoading, error, searchQuery } = useSelector(state => state.products);
    const { cartCount, cartTotal } = useSelector(state => state.cart);
    const { selectedProduct, showOrderSummary, showOrderCheckout, showProductModal } = useSelector(state => state.ui);

    // Fetch products and cart info on mount
    useEffect(() => {
        dispatch(fetchProducts());
        
        // Only fetch cart summary if authenticated
        if (isAuthenticated) {
            dispatch(fetchCartSummary());
        }
    }, [dispatch, isAuthenticated]);

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
            
            // Refresh cart summary
            dispatch(fetchCartSummary());
        } catch (err) {
            console.error('Error adding to cart:', err);
            throw err; // Re-throw so ProductModal can handle it
        }
    };

    const handleOrderSummaryClose = () => {
        dispatch(closeOrderSummary());
        dispatch(fetchCartSummary());
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
                        <div className="flex-shrink-0 h-10 w-auto overflow-hidden">
                            <img
                                src={logo}
                                alt="Logo"
                                className="h-10 w-auto scale-125"
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
                    onClick={() => dispatch(openOrderSummary())}
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