// src/components/order/OrderSummaryModal.jsx
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { orderAPI } from "../../services/api";
import logo from "../../assets/bazar-logo.gif";
import { 
    fetchCartSummary, 
    removeFromCart as removeFromCartAction,
    applyDiscountCode,
    clearDiscountError 
} from "../../store/slices/cartSlice";

export default function OrderSummaryModal({ onClose, onProceedToCheckout }) {
    const dispatch = useDispatch();
    const [discountCode, setDiscountCode] = useState("");
    const [isRemoving, setIsRemoving] = useState({});
    const [checkoutError, setCheckoutError] = useState(null);
    const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);

    // Redux state
    const { 
        cartItems, 
        cartTotal, 
        isLoading, 
        error, 
        discountError,
        isApplyingDiscount 
    } = useSelector(state => state.cart);

    useEffect(() => {
        dispatch(fetchCartSummary());
    }, [dispatch]);

    const subtotal = cartTotal || 0;
    const total = subtotal;

    const handleApplyDiscount = async () => {
        if (!discountCode.trim()) return;

        try {
            await dispatch(applyDiscountCode(discountCode)).unwrap();
            setDiscountCode("");
        } catch (err) {
            console.error('Error applying discount:', err);
        }
    };

    const handleRemoveItem = async (item) => {
        setIsRemoving(prev => ({ ...prev, [item.productName]: true }));
        try {
            await dispatch(removeFromCartAction(item.productId)).unwrap();
            await dispatch(fetchCartSummary());
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
            const customerId = "random123";
            
            setCheckoutError(null);
            setIsProcessingCheckout(true);
            
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
            setCheckoutError(err.message || 'Failed to proceed to checkout. Please try again.');
        } finally {
            setIsProcessingCheckout(false);
        }
    };

    const displayError = error || discountError || checkoutError;

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
                        {isLoading ? (
                            <div className="text-center py-12">
                                <img src={logo} alt="Loading" className="mx-auto w-16 h-16 mb-4" />
                                <p className="text-gray-600">Loading cart...</p>
                            </div>
                        ) : displayError ? (
                            <div className="text-center py-12">
                                <img src={logo} alt="Error" className="mx-auto w-16 h-16 mb-4 opacity-50" />
                                <p className="text-gray-600 mb-4">{displayError}</p>
                                <button
                                    onClick={() => {
                                        dispatch(fetchCartSummary());
                                        dispatch(clearDiscountError());
                                        setCheckoutError(null);
                                    }}
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

                                    {discountError && (
                                        <div className="mb-3 p-2 bg-red-100 border border-red-400 text-red-700 text-sm rounded">
                                            {discountError}
                                        </div>
                                    )}

                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={discountCode}
                                            onChange={(e) => setDiscountCode(e.target.value)}
                                            placeholder="Enter discount code"
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            onKeyPress={(e) => e.key === 'Enter' && handleApplyDiscount()}
                                        />
                                        <button
                                            onClick={handleApplyDiscount}
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
                                        <span>Subtotal ({cartItems.length} items)</span>
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
                                        disabled={cartItems.length === 0 || isProcessingCheckout}
                                        className="flex-1 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                    >
                                        {isProcessingCheckout ? 'Processing...' : 'Proceed to Checkout'}
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