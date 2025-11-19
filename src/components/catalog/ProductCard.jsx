// src/components/catalog/ProductCard.jsx
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";

export default function ProductCard({ product, onSelect }) {
    const { productResponseDto, catalogResourceUrlSet } = product;
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isHovering, setIsHovering] = useState(false);
    const intervalRef = useRef(null);

    useEffect(() => {
        if (isHovering && catalogResourceUrlSet.length > 1) {
            // Start slideshow
            intervalRef.current = setInterval(() => {
                setCurrentImageIndex((prevIndex) =>
                    (prevIndex + 1) % catalogResourceUrlSet.length
                );
            }, 800); // Change image every 800ms
        } else {
            // Stop slideshow and reset to first image
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            setCurrentImageIndex(0);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isHovering, catalogResourceUrlSet.length]);

    const currentImage = catalogResourceUrlSet[currentImageIndex]?.productImageUrl;
    const hasMultipleImages = catalogResourceUrlSet.length > 1;

    return (
        <motion.div
            layout
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="cursor-pointer group"
            onClick={() => onSelect(product)}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            <div className="relative bg-gray-50 aspect-[3/4] overflow-hidden rounded-sm" style={{ perspective: "1000px" }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentImageIndex}
                        initial={{ rotateY: 90, opacity: 0 }}
                        animate={{ rotateY: 0, opacity: 1 }}
                        exit={{ rotateY: -90, opacity: 0 }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        style={{ 
                            transformStyle: "preserve-3d",
                            backfaceVisibility: "hidden"
                        }}
                        className="w-full h-full"
                    >
                        {currentImage && (
                            <img
                                src={currentImage}
                                alt={productResponseDto.name}
                                className="w-full h-full object-cover"
                            />
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Favorite button - appears on hover */}
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isHovering ? 1 : 0 }}
                    className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md hover:scale-110 transition-transform"
                    onClick={(e) => {
                        e.stopPropagation();
                        // Add to favorites functionality
                    }}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                </motion.button>

                {/* Image Counter - shows on hover if multiple images */}
                {hasMultipleImages && isHovering && (
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                        {currentImageIndex + 1}/{catalogResourceUrlSet.length}
                    </div>
                )}

                {/* Stock Badge */}
                {productResponseDto.stock < 10 && productResponseDto.stock > 0 && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs font-medium rounded">
                        Only {productResponseDto.stock} left
                    </div>
                )}

                {productResponseDto.stock === 0 && (
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                        <span className="bg-white px-3 py-1.5 text-xs font-semibold rounded">
                            OUT OF STOCK
                        </span>
                    </div>
                )}
            </div>

            <div className="pt-2.5 pb-2">
                <h3 className="text-sm font-normal mb-1 line-clamp-2 text-gray-900 group-hover:text-black">
                    {productResponseDto.name}
                </h3>
                <p className="text-sm font-semibold text-gray-900">
                    €{productResponseDto.price.toFixed(2)}
                </p>

                {/* Additional Info - only show low stock warning */}
                {productResponseDto.stock > 0 && productResponseDto.stock < 50 && (
                    <span className="text-xs text-orange-600 mt-1 block">
                        Low stock
                    </span>
                )}
            </div>
        </motion.div>
    );
}