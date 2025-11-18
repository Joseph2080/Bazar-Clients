// src/components/catalog/ProductModal.jsx
import { motion } from "framer-motion";
import { useState } from "react";
import ProductCarousel from "./ProductCarousel";

export default function ProductModal({ product, onClose, onAddToCart, isAuthenticated, onLogin }) {
    const [isAdded, setIsAdded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    if (!product) return null;

    const { productResponseDto, catalogResourceUrlSet } = product;

    const handleAddToCart = async () => {
        // CRITICAL: Do not make ANY API calls if not authenticated
        if (!isAuthenticated) {
            console.log('Add to cart blocked - user not authenticated');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Call parent's addToCart which handles createCart vs addToCart logic
            await onAddToCart(product, 1);

            // Update local state
            setIsAdded(true);

            // Reset and close after success
            setTimeout(() => {
                setIsAdded(false);
                onClose();
            }, 1500);
        } catch (err) {
            setError(err.message || 'Failed to add to cart');
            console.error('Error adding to cart:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLoginClick = () => {
        // Only call login when user clicks the sign-in button
        onLogin('/catalog');
    };

    return (
        <>
            <motion.div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                onClick={onClose}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            />

            <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    className="relative w-[90%] max-w-md bg-white rounded-lg p-6 shadow-2xl"
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                    <ProductCarousel images={catalogResourceUrlSet} />

                    <h2 className="text-xl font-semibold mt-4">
                        {productResponseDto.name}
                    </h2>
                    <p className="text-gray-600 mb-4">
                        {productResponseDto.description}
                    </p>
                    <p className="text-lg font-bold mb-4">
                        €{productResponseDto.price.toFixed(2)}
                    </p>

                    {/* Login prompt notification - appears when not authenticated */}
                    {!isAuthenticated && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-4 p-4 bg-gray-50 border border-gray-300 rounded-lg"
                        >
                            <div className="flex items-start gap-3">
                                <svg className="w-6 h-6 text-gray-700 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900 mb-1">Sign in required</h4>
                                    <p className="text-sm text-gray-700 mb-3">
                                        You need to sign in to add items to your cart and make purchases.
                                    </p>
                                    <button
                                        onClick={handleLoginClick}
                                        className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded-md transition-colors"
                                    >
                                        Sign In to Continue
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                            {error}
                        </div>
                    )}

                    <motion.button
                        whileHover={{ scale: (isAdded || !isAuthenticated) ? 1 : 1.05 }}
                        whileTap={{ scale: (isAdded || !isAuthenticated) ? 1 : 0.95 }}
                        className={`w-full py-3 rounded-md font-semibold transition-colors ${
                            isAdded
                                ? 'bg-white text-black'
                                : 'bg-black text-white hover:bg-gray-800'
                        } ${isLoading || !isAuthenticated ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                        onClick={handleAddToCart}
                        disabled={isAdded || isLoading || !isAuthenticated}
                    >
                        {isLoading ? (
                            <span>Adding...</span>
                        ) : isAdded ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Added to Cart!
                            </span>
                        ) : (
                            'Add to Cart'
                        )}
                    </motion.button>

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-500 hover:text-black text-2xl"
                    >
                        ×
                    </button>
                </motion.div>
            </motion.div>
        </>
    );
}