// src/pages/OrderCheckout.jsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cartAPI } from "../../services/api";
import logo from "../../assets/bazar-logo.gif";

export default function OrderCheckout({ onClose, onCartCountUpdate }) {
    const [cartSummary, setCartSummary] = useState(null);
    const [isLoadingCart, setIsLoadingCart] = useState(true);

    useEffect(() => {
        fetchCartSummary();
    }, []);

    const fetchCartSummary = async () => {
        setIsLoadingCart(true);
        try {
            const response = await cartAPI.getCartSummary();
            setCartSummary(response.data || response);
        } catch (err) {
            console.error("Error fetching cart:", err);
            alert("Failed to load cart.");
        } finally {
            setIsLoadingCart(false);
        }
    };

    if (isLoadingCart) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="text-center">
                    <img src={logo} alt="Loading" className="mx-auto w-16 h-16 mb-4" />
                    <p className="text-white">Loading checkout...</p>
                </div>
            </div>
        );
    }

    if (!cartSummary || !cartSummary.cartItems || cartSummary.cartItems.length === 0) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                    <img src={logo} alt="Empty" className="mx-auto w-16 h-16 mb-4 opacity-50" />
                    <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
                    <button
                        onClick={onClose}
                        className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800"
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        );
    }

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
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    className="relative w-full max-w-3xl bg-white rounded-lg shadow-2xl max-h-[90vh] overflow-y-auto"
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-500 hover:text-black text-2xl z-10"
                    >
                        ×
                    </button>

                    <div className="p-6">
                        <h1 className="text-3xl font-bold mb-6">Checkout</h1>

                        {/* Your checkout form content here */}
                        <div className="space-y-6">
                            {/* Order Summary */}
                            <div className="border rounded-lg p-4">
                                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                                {cartSummary.cartItems.map((item, index) => (
                                    <div key={index} className="flex justify-between items-center py-2 border-b">
                                        <div>
                                            <h3 className="font-medium">{item.productName}</h3>
                                            <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                        </div>
                                        <p className="font-semibold">
                                            €{((item.price - (item.price * item.discount / 100)) * item.quantity).toFixed(2)}
                                        </p>
                                    </div>
                                ))}
                                <div className="flex justify-between items-center pt-4 font-bold text-lg">
                                    <span>Total</span>
                                    <span>€{(cartSummary.totalPrice + (cartSummary.totalPrice * 0.20)).toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Checkout Form */}
                            <div className="border rounded-lg p-4">
                                <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        placeholder="Full Name"
                                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                                    />
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Address"
                                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
                                >
                                    Back to Cart
                                </button>
                                <button
                                    onClick={() => {
                                        alert('Order placed!');
                                        if (onCartCountUpdate) {
                                            onCartCountUpdate(0);
                                        }
                                        onClose();
                                    }}
                                    className="flex-1 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800"
                                >
                                    Place Order
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </>
    );
}