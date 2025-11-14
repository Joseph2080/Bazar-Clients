// src/components/order/OrderSummaryModal.jsx
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { cartAPI, orderAPI } from "../../services/api";
import logo from "../../assets/bazar-logo.gif";

export default function OrderSummaryModal({ onClose, onCartCountUpdate, onProceedToCheckout }) {
    const [discountCode, setDiscountCode] = useState("");
    const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
    const [error, setError] = useState(null);
    const [isRemoving, setIsRemoving] = useState({});

    // Cart summary state
    const [cartSummary, setCartSummary] = useState(null);
    const [isLoadingCart, setIsLoadingCart] = useState(true);

    const fetchCartSummary = async () => {
        setIsLoadingCart(true);
        setError(null);
        try {
            const response = await cartAPI.getCartSummary();
            const summary = response.data || response;
            setCartSummary(summary);
        } catch (err) {
            console.error('Error fetching cart summary:', err);
            setError(err.message || 'Failed to load cart');
        } finally {
            setIsLoadingCart(false);
        }
    };

    useEffect(() => {
        fetchCartSummary();
    }, []);

    const cartItems = cartSummary?.cartItems || [];
    const subtotal = cartSummary?.totalPrice || 0;
    const total = subtotal;

    const applyDiscount = async () => {
        if (!discountCode.trim()) return;

        setIsApplyingDiscount(true);
        setError(null);

        try {
            await cartAPI.applyDiscount(discountCode);
            setDiscountCode("");
            await fetchCartSummary();
        } catch (err) {
            setError(err.message || 'Failed to apply discount code');
            console.error('Error applying discount:', err);
        } finally {
            setIsApplyingDiscount(false);
        }
    };

    const handleRemoveItem = async (item) => {
        setIsRemoving(prev => ({ ...prev, [item.productName]: true }));
        try {
            await cartAPI.removeFromCart(item.productId);
            await fetchCartSummary();
            if (onCartCountUpdate && cartSummary) {
                const newCount = Math.max(0, (cartSummary.totalItems || 0) - item.quantity);
                onCartCountUpdate(newCount);
            }
        } catch (err) {
            console.error('Error removing item:', err);
            alert('Failed to remove item from cart');
        } finally {
            setIsRemoving(prev => ({ ...prev, [item.productName]: false }));
        }
    };

    const handleProceedToCheckoutClick = async () => {
        try {
            // TODO: Replace with actual customerId from your auth/session
            const customerId = "random123"; // You'll need to get this from your auth context
            
            setError(null);
            setIsApplyingDiscount(true); // Reuse loading state for UI feedback
            
            // Call the checkout link API
            const response = await orderAPI.generateCheckoutLink(customerId);
            
            // The API returns the payment link in the response data
            const paymentLink = response.data;
            
            if (paymentLink) {
                // Redirect to the payment link
                window.location.href = paymentLink;
            } else {
                throw new Error('Payment link not received from server');
            }
        } catch (err) {
            console.error('Error generating checkout link:', err);
            setError(err.message || 'Failed to proceed to checkout. Please try again.');
        } finally {
            setIsApplyingDiscount(false);
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

                        {/* Loading State */}
                        {isLoadingCart ? (
                            <div className="text-center py-12">
                                <img src={logo} alt="Loading" className="mx-auto w-16 h-16 mb-4" />
                                <p className="text-gray-600">Loading cart...</p>
                            </div>
                        ) : error ? (
                            <div className="text-center py-12">
                                <img src={logo} alt="Error" className="mx-auto w-16 h-16 mb-4 opacity-50" />
                                <p className="text-gray-600 mb-4">{error}</p>
                                <button
                                    onClick={fetchCartSummary}
                                    className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
                                >
                                    Retry
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Cart Items */}
                                <div className="space-y-4 mb-6">
                                    {cartItems.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            Your cart is empty
                                        </div>
                                    ) : (
                                        cartItems.map((item, index) => (
                                            <div key={index} className="flex justify-between items-start border-b pb-4">
                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <h3 className="font-semibold">{item.productName}</h3>
                                                            <p className="text-sm text-gray-600 line-clamp-2">
                                                                {item.productDescription}
                                                            </p>
                                                            <div className="mt-2 flex items-center gap-2">
                                                                <span className="text-sm text-gray-500">
                                                                    Quantity: {item.quantity}
                                                                </span>
                                                                {item.discount > 0 && (
                                                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                                                        -{item.discount.toFixed(0)}% off
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right ml-4 flex flex-col items-end gap-2">
                                                    <div>
                                                        {item.discount > 0 && (
                                                            <p className="text-xs text-gray-400 line-through">
                                                                €{(item.price * item.quantity).toFixed(2)}
                                                            </p>
                                                        )}
                                                        <p className="font-semibold">
                                                            €{((item.price - (item.price * item.discount / 100)) * item.quantity).toFixed(2)}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemoveItem(item)}
                                                        disabled={isRemoving[item.productName]}
                                                        className="text-xs text-red-600 hover:text-red-800 disabled:opacity-50"
                                                    >
                                                        {isRemoving[item.productName] ? 'Removing...' : 'Remove'}
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Discount Code Section */}
                                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                    <h3 className="font-semibold mb-3">Discount Code</h3>

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
                                        <span>Subtotal ({cartSummary?.totalItems || 0} items)</span>
                                        <span>€{subtotal.toFixed(2)}</span>
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
                                        onClick={handleProceedToCheckoutClick}
                                        disabled={cartItems.length === 0 || isApplyingDiscount}
                                        className="flex-1 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                    >
                                        {isApplyingDiscount ? 'Processing...' : 'Proceed to Checkout'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </>
    );
}