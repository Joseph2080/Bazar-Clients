// src/pages/Catalog.jsx
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ProductModal from "../catalog/ProductModel";
import ProductList from "./ProductList";
import OrderSummaryModal from "../order/OrderSummaryModal";
import OrderCheckout from "../order/OrderCheckout"
import LoadingScreen from "../common/LoadingScreen";
import logo from "../../assets/bazar-logo.gif";
import { productsAPI, cartAPI } from "../../services/api";

export default function Catalog() {
    const [selected, setSelected] = useState(null);
    const [showOrderSummary, setShowOrderSummary] = useState(false);
    const [showOrderCheckout, setShowOrderCheckout] = useState(false);
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Light cart state
    const [cartCount, setCartCount] = useState(0);
    const [cartTotal, setCartTotal] = useState(0);

    // Fetch products from backend
    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await productsAPI.getAllProducts();
                const productsData = response.data || response;
                setProducts(productsData);
            } catch (err) {
                console.error('Error fetching products:', err);
                setError(err.message || 'Failed to load products');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Fetch light cart info on mount
    useEffect(() => {
        fetchLightCartInfo();
    }, []);

    const fetchLightCartInfo = async () => {
        try {
            const response = await cartAPI.getCartSummary();
            const summary = response.data;
            setCartCount(summary?.totalItems || 0);
            setCartTotal(summary?.totalPrice || 0);
        } catch (err) {
            console.error('Error fetching cart info:', err);
            setCartCount(0);
            setCartTotal(0);
        }
    };

    const addToCart = async (product, quantity = 1) => {
        try {
            let response;

            if (cartCount === 0) {
                response = await cartAPI.createCart(product.productResponseDto.productId, quantity);
            } else {
                response = await cartAPI.addToCart(product.productResponseDto.productId, quantity);
            }

            if (response.data) {
                setCartCount(response.data.cartSize || 0);
            }

            await fetchLightCartInfo();
        } catch (err) {
            console.error('Error adding to cart:', err);
            alert('Failed to add item to cart');
        }
    };

    const handleOrderSummaryClose = () => {
        setShowOrderSummary(false);
        fetchLightCartInfo();
    };

    const handleProceedToCheckout = () => {
        setShowOrderSummary(false);
        setShowOrderCheckout(true);
    };

    const handleOrderCheckoutClose = () => {
        setShowOrderCheckout(false);
        fetchLightCartInfo();
    };

    // Filter products based on search query
    const filteredProducts = products.filter(product => {
        const searchLower = searchQuery.toLowerCase();
        const name = product.productResponseDto?.name?.toLowerCase() || '';
        const description = product.productResponseDto?.description?.toLowerCase() || '';
        return name.includes(searchLower) || description.includes(searchLower);
    });

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
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // Empty state
    if (products.length === 0) {
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
            <div className="max-w-7xl mx-auto">
                {/* Search Bar */}
                <div className="bg-white border-b border-gray-200 px-4 py-4">
                    <div className="relative max-w-7xl mx-auto flex items-center gap-4">
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
                                    placeholder="Search"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-4 py-3 pl-12 pr-10 text-base bg-gray-100 rounded-full border-0 focus:outline-none focus:bg-white focus:ring-2 focus:ring-gray-300 transition-all"
                                />
                                <svg
                                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500"
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
                                        onClick={() => setSearchQuery("")}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                            {searchQuery && (
                                <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-center text-sm text-gray-600 mt-2"
                                >
                                    {filteredProducts.length} {filteredProducts.length === 1 ? 'result' : 'results'}
                                </motion.p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-4">
                    <ProductList products={filteredProducts} onSelect={setSelected} />
                </div>
            </div>

            {cartCount > 0 && (
                <motion.button
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="fixed bottom-6 right-6 bg-black text-white px-6 py-4 rounded-full shadow-lg hover:bg-gray-800 font-semibold flex items-center gap-2"
                    onClick={() => setShowOrderSummary(true)}
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
                {selected && (
                    <ProductModal
                        product={selected}
                        onClose={() => setSelected(null)}
                        onAddToCart={addToCart}
                    />
                )}

                {showOrderSummary && (
                    <OrderSummaryModal
                        onClose={handleOrderSummaryClose}
                        onProceedToCheckout={handleProceedToCheckout}
                        onCartCountUpdate={setCartCount}
                    />
                )}

                {showOrderCheckout && (
                    <OrderCheckout
                        onClose={handleOrderCheckoutClose}
                        onCartCountUpdate={setCartCount}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}