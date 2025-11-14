// src/components/catalog/ProductModal.jsx
import { motion } from "framer-motion";
import { useState } from "react";
import ProductCarousel from "./ProductCarousel";

export default function ProductModal({ product, onClose, onAddToCart }) {
    const [isAdded, setIsAdded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    if (!product) return null;

    const { productResponseDto, catalogResourceUrlSet } = product;

    const handleAddToCart = async () => {
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

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                            {error}
                        </div>
                    )}

                    <motion.button
                        whileHover={{ scale: isAdded ? 1 : 1.05 }}
                        whileTap={{ scale: isAdded ? 1 : 0.95 }}
                        className={`w-full py-3 rounded-md font-semibold transition-colors ${
                            isAdded
                                ? 'bg-white text-black'
                                : 'bg-black text-white hover:bg-gray-800'
                        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={handleAddToCart}
                        disabled={isAdded || isLoading}
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