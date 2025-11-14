import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ProductCarousel({ images }) {
    const [current, setCurrent] = useState(0);
    const [direction, setDirection] = useState(0); // for motion direction

    if (!images || images.length === 0) return null;

    const nextSlide = () => {
        setDirection(1);
        setCurrent((prev) => (prev + 1) % images.length);
    };

    const prevSlide = () => {
        setDirection(-1);
        setCurrent((prev) => (prev - 1 + images.length) % images.length);
    };

    const variants = {
        enter: (dir) => ({
            x: dir > 0 ? 300 : -300,
            opacity: 0,
        }),
        center: {
            x: 0,
            opacity: 1,
            transition: {
                duration: 0.45,
                ease: "easeOut",
            },
        },
        exit: (dir) => ({
            x: dir < 0 ? 300 : -300,
            opacity: 0,
            transition: {
                duration: 0.4,
                ease: "easeIn",
            },
        }),
    };

    return (
        <div className="relative w-full h-64 md:h-80 overflow-hidden rounded-xl bg-gray-100">
            {/* Image Slide */}
            <AnimatePresence mode="wait" custom={direction}>
                <motion.img
                    key={images[current].productCatalogId}
                    src={images[current].productImageUrl}
                    alt="Product"
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="absolute inset-0 w-full h-full object-cover"
                    draggable="false"
                />
            </AnimatePresence>

            {/* Left Arrow */}
            <button
                onClick={prevSlide}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 transition"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Right Arrow */}
            <button
                onClick={nextSlide}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 transition"
            >
                <ChevronRight className="w-5 h-5" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-3 w-full flex justify-center gap-2">
                {images.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => {
                            setDirection(index > current ? 1 : -1);
                            setCurrent(index);
                        }}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${
                            index === current ? "bg-white scale-110" : "bg-white/50"
                        }`}
                    />
                ))}
            </div>
        </div>
    );
}
