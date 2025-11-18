// src/components/payment/PaymentSuccess.jsx
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Home, Package } from "lucide-react";
import logo from "../../assets/bazar-logo.gif";

export default function PaymentSuccess() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get("orderId");
    const [countdown, setCountdown] = useState(10);

    useEffect(() => {
        // Auto-redirect countdown
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    navigate("/catalog");
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [navigate]);

    const handleReturnHome = () => {
        navigate("/catalog");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center p-4">
            <motion.div
                className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            >
                {/* Success Icon */}
                <motion.div
                    className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                    <CheckCircle className="w-16 h-16 text-green-600" />
                </motion.div>

                {/* Success Message */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Payment Successful!
                    </h1>
                    <p className="text-gray-600 mb-6">
                        Thank you for your purchase. Your order has been confirmed.
                    </p>
                </motion.div>

                {/* Order ID */}
                {orderId && (
                    <motion.div
                        className="bg-gray-50 rounded-lg p-4 mb-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-1">
                            <Package className="w-4 h-4" />
                            <span className="font-medium">Order ID</span>
                        </div>
                        <p className="text-lg font-mono font-semibold text-gray-900">
                            {orderId}
                        </p>
                    </motion.div>
                )}

                {/* Confirmation Details */}
                <motion.div
                    className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <h3 className="font-semibold text-green-900 mb-2">What happens next?</h3>
                    <ul className="text-sm text-green-800 space-y-1">
                        <li>• A confirmation email has been sent</li>
                        <li>• Your order is being processed</li>
                        <li>• You'll receive further notifications from the merchant</li>
                    </ul>
                </motion.div>

                {/* Return Home Button */}
                <motion.button
                    onClick={handleReturnHome}
                    className="w-full bg-black text-white py-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 mb-3"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    <Home className="w-5 h-5" />
                    Return to Catalog
                </motion.button>

                {/* Auto-redirect countdown */}
                <motion.p
                    className="text-sm text-gray-500"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                >
                    Redirecting in {countdown} seconds...
                </motion.p>

                {/* Logo */}
                <div className="mt-6">
                    <img src={logo} alt="Bazar Logo" className="h-10 mx-auto opacity-50" />
                </div>
            </motion.div>
        </div>
    );
}
