// src/components/catalog/ProductCard.jsx
import { motion } from "framer-motion";
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
            whileHover={{ scale: 1.02 }}
            className="cursor-pointer group"
            onClick={() => onSelect(product)}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            <div className="relative bg-gray-100 aspect-[3/4] overflow-hidden">
                {currentImage && (
                    <img
                        src={currentImage}
                        alt={productResponseDto.name}
                        className="w-full h-full object-cover transition-opacity duration-300"
                    />
                )}

                {/* Image Counter - shows on hover if multiple images */}
                {hasMultipleImages && isHovering && (
                    <div className="absolute top-3 right-3 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs">
                        {currentImageIndex + 1} / {catalogResourceUrlSet.length}
                    </div>
                )}

                {/* Stock Badge */}
                {productResponseDto.stock < 10 && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 text-xs font-medium">
                        Only {productResponseDto.stock} left
                    </div>
                )}

                {productResponseDto.stock === 0 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="bg-white px-4 py-2 text-sm font-semibold">
                            OUT OF STOCK
                        </span>
                    </div>
                )}
            </div>

            <div className="pt-3 pb-2">
                <h3 className="text-sm font-normal mb-1 line-clamp-2">
                    {productResponseDto.name}
                </h3>
                <p className="text-sm font-semibold">
                    €{productResponseDto.price.toFixed(2)}
                </p>

                {/* Additional Info */}
                <div className="flex items-center gap-2 mt-1">
                    {productResponseDto.stock > 0 && productResponseDto.stock < 50 && (
                        <span className="text-xs text-orange-600">
                            Low stock
                        </span>
                    )}
                    {hasMultipleImages && (
                        <span className="text-xs text-gray-500">
                            +{catalogResourceUrlSet.length - 1} more
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    );
}