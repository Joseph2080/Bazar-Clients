// src/pages/Catalog.jsx
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ProductModal from "../catalog/ProductModel";
import ProductList from "./ProductList";
import OrderSummaryModal from "../order/OrderSummaryModal";
import { productsAPI } from "../../services/api";

export default function Catalog() {
    const [selected, setSelected] = useState(null);
    const [cart, setCart] = useState([]);
    const [showOrderSummary, setShowOrderSummary] = useState(false);
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch products from backend
    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await productsAPI.getAllProducts();

                // Handle the response structure from your backend
                // Assuming response has a 'data' field with the products array
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

    const addToCart = (product) => {
        setCart((prev) => [...prev, product]);
    };

    const removeFromCart = (productId) => {
        setCart((prev) => prev.filter(item => item.productResponseDto.productId !== productId));
    };

    const totalPrice = cart.reduce((sum, item) => sum + item.productResponseDto.price, 0);

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                    <p className="mt-4 text-gray-600">Loading products...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold mb-2">No products available</h2>
                    <p className="text-gray-600">Check back later for new items!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-7xl mx-auto">
                <ProductList products={products} onSelect={setSelected} />
            </div>

            {cart.length > 0 && (
                <motion.button
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="fixed bottom-6 right-6 bg-black text-white px-6 py-4 rounded-full shadow-lg hover:bg-gray-800 font-semibold flex items-center gap-2"
                    onClick={() => setShowOrderSummary(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <span>Checkout ({cart.length})</span>
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

                {showOrderSummary && (
                    <OrderSummaryModal
                        cart={cart}
                        onClose={() => setShowOrderSummary(false)}
                        onRemoveFromCart={removeFromCart}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}