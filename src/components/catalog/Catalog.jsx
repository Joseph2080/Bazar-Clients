// src/pages/Catalog.jsx
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ProductModal from "../catalog/ProductModel";
import ProductList from "./ProductList";
import OrderSummaryModal from "../order/OrderSummaryModal";
import logo from "../../assets/bazar-logo-rotating.gif";
import { productsAPI, cartAPI } from "../../services/api";

export default function Catalog() {
    const [selected, setSelected] = useState(null);
    const [showOrderSummary, setShowOrderSummary] = useState(false);
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Cart summary from backend
    const [cartSummary, setCartSummary] = useState(null);
    const [isLoadingCart, setIsLoadingCart] = useState(false);

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

    // Fetch cart summary
    const fetchCartSummary = async () => {
        setIsLoadingCart(true);
        try {
            const response = await cartAPI.getCartSummary();
            setCartSummary(response.data);
        } catch (err) {
            console.error('Error fetching cart summary:', err);
            setCartSummary(null);
        } finally {
            setIsLoadingCart(false);
        }
    };

    // Fetch cart on mount and when order summary is closed
    useEffect(() => {
        fetchCartSummary();
    }, []);

    const addToCart = async (product) => {
        try {
            await cartAPI.addToCart(product.productResponseDto.productId);
            await fetchCartSummary(); // Refresh cart
        } catch (err) {
            console.error('Error adding to cart:', err);
            alert('Failed to add item to cart');
        }
    };

    const handleOrderSummaryClose = () => {
        setShowOrderSummary(false);
        fetchCartSummary(); // Refresh cart when closing order summary
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
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <img src={logo} alt="Loading"/>
                    <p className="mt-4 text-gray-600">Loading products...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-600 text-xl mb-4">⚠️</div>
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
                    <h2 className="text-xl font-semibold mb-2">No products available</h2>
                    <p className="text-gray-600">Check back later for new items!</p>
                </div>
            </div>
        );
    }

    const totalItems = cartSummary?.totalItems || 0;
    const totalPrice = cartSummary?.totalPrice || 0;

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto">
                {/* Search Bar */}
                <div className="bg-white border-b border-gray-200 px-4 py-4">
                    <div className="relative max-w-7xl mx-auto flex items-center gap-4">
                        {/* Logo */}
                        <div className="flex-shrink-0">
                            <img
                                src={logo}
                                alt="Logo"
                                className="h-10 w-auto"
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

            {totalItems > 0 && (
                <motion.button
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="fixed bottom-6 right-6 bg-black text-white px-6 py-4 rounded-full shadow-lg hover:bg-gray-800 font-semibold flex items-center gap-2"
                    onClick={() => setShowOrderSummary(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <span>Checkout ({totalItems})</span>
                    <span className="bg-white text-black px-2 py-1 rounded text-sm">
                        €{totalPrice.toFixed(2)}
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

                {showOrderSummary && cartSummary && (
                    <OrderSummaryModal
                        cartSummary={cartSummary}
                        onClose={handleOrderSummaryClose}
                        onCartUpdate={fetchCartSummary}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}