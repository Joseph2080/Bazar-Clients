// src/components/catalog/ProductCarousel.jsx
import { motion } from "framer-motion";

export default function ProductCarousel({ images }) {
    if (!images || images.length === 0) return null;

    return (
        <div
            className="relative w-full h-64 overflow-x-auto"
            style={{
                msOverflowStyle: 'none',
                scrollbarWidth: 'none',
                WebkitOverflowScrolling: 'touch'
            }}
        >
            <div className="flex space-x-4">
                {images.map((image) => (
                    <motion.div
                        key={image.productCatalogId}
                        className="flex-none w-64 h-full"
                    >
                        <img
                            src={image.productImageUrl}
                            alt="Product Image"
                            className="w-full h-full object-cover rounded-xl"
                            draggable="false"
                        />
                    </motion.div>
                ))}
            </div>
            <style>
                {`
                    .relative::-webkit-scrollbar {
                        display: none;
                    }
                `}
            </style>
        </div>
    );
}
