// src/components/OrderSummaryModal.jsx
import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cartAPI } from "../../services/api";

export default function OrderSummaryModal({ cart, onClose, onRemoveFromCart }) {
    const navigate = useNavigate();
    const [discountCode, setDiscountCode] = useState("");
    const [appliedDiscounts, setAppliedDiscounts] = useState([]);
    const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
    const [error, setError] = useState(null);

    const subtotal = cart.reduce((sum, item) => sum + item.productResponseDto.price, 0);
    const tax = subtotal * 0.20;
    const total = subtotal + tax;

    const applyDiscount = async () => {
        if (!discountCode.trim()) return;

        setIsApplyingDiscount(true);
        setError(null);

        try {
            await cartAPI.applyDiscount(discountCode);

            if (!appliedDiscounts.includes(discountCode)) {
                setAppliedDiscounts([...appliedDiscounts, discountCode]);
            }
            setDiscountCode("");
        } catch (err) {
            setError(err.message || 'Failed to apply discount code');
            console.error('Error applying discount:', err);
        } finally {
            setIsApplyingDiscount(false);
        }
    };

    const removeDiscount = async (code) => {
        try {
            // If you have a remove discount endpoint, call it here
            // For now, just remove from local state
            setAppliedDiscounts(appliedDiscounts.filter(d => d !== code));
        } catch (error) {
            console.error("Error removing discount:", error);
        }
    };

    const handleRemoveItem = async (productId) => {
        try {
            await cartAPI.removeFromCart(productId);
            onRemoveFromCart(productId);
        } catch (err) {
            console.error('Error removing item:', err);
            alert('Failed to remove item from cart');
        }
    };

    const handleProceedToCheckout = () => {
        onClose();
        navigate('/checkout', { state: { cart, appliedDiscounts } });
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
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    className="relative w-full max-w-2xl bg-white rounded-lg shadow-2xl max-h-[90vh] overflow-y-auto"
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
                        <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

                        {/* Cart Items */}
                        <div className="space-y-4 mb-6">
                            {cart.map((item, index) => (
                                <div key={index} className="flex justify-between items-start border-b pb-4">
                                    <div className="flex-1">
                                        <h3 className="font-semibold">{item.productResponseDto.name}</h3>
                                        <p className="text-sm text-gray-600 line-clamp-2">
                                            {item.productResponseDto.description}
                                        </p>
                                    </div>
                                    <div className="text-right ml-4 flex flex-col items-end gap-2">
                                        <p className="font-semibold">€{item.productResponseDto.price.toFixed(2)}</p>
                                        <button
                                            onClick={() => handleRemoveItem(item.productResponseDto.productId)}
                                            className="text-xs text-red-600 hover:text-red-800"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Discount Code Section */}
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                            <h3 className="font-semibold mb-3">Discount Codes</h3>

                            {appliedDiscounts.length > 0 && (
                                <div className="mb-3 space-y-2">
                                    {appliedDiscounts.map((code) => (
                                        <div key={code} className="flex items-center justify-between bg-green-100 px-3 py-2 rounded">
                                            <span className="text-sm font-medium text-green-800">{code}</span>
                                            <button
                                                onClick={() => removeDiscount(code)}
                                                className="text-red-600 hover:text-red-800 text-sm"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {error && (
                                <div className="mb-3 p-2 bg-red-100 border border-red-400 text-red-700 text-sm rounded">
                                    {error}
                                </div>
                            )}

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={discountCode}
                                    onChange={(e) => setDiscountCode(e.target.value)}
                                    placeholder="Enter discount code"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    onKeyPress={(e) => e.key === 'Enter' && applyDiscount()}
                                />
                                <button
                                    onClick={applyDiscount}
                                    disabled={isApplyingDiscount || !discountCode.trim()}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                    {isApplyingDiscount ? "Applying..." : "Apply"}
                                </button>
                            </div>
                        </div>

                        {/* Price Breakdown */}
                        <div className="space-y-2 mb-6 border-t pt-4">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>€{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Tax (20%)</span>
                                <span>€{tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xl font-bold border-t pt-2">
                                <span>Total</span>
                                <span>€{total.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
                            >
                                Continue Shopping
                            </button>
                            <button
                                onClick={handleProceedToCheckout}
                                className="flex-1 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800"
                            >
                                Proceed to Checkout
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </>
    );
}