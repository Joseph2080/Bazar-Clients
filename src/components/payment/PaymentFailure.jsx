// src/components/payment/PaymentFailure.jsx
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { XCircle, Home, RotateCcw, HelpCircle } from "lucide-react";
import logo from "../../assets/bazar-logo.gif";

export default function PaymentFailure() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get("orderId");

    const handleReturnHome = () => {
        navigate("/catalog");
    };

    const handleTryAgain = () => {
        // Navigate back to catalog and show order summary modal
        navigate("/catalog");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center p-4">
            <motion.div
                className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            >
                {/* Failure Icon */}
                <motion.div
                    className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                    <XCircle className="w-16 h-16 text-red-600" />
                </motion.div>

                {/* Failure Message */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Payment Failed
                    </h1>
                    <p className="text-gray-600 mb-6">
                        We couldn't process your payment. Please try again or contact support.
                    </p>
                </motion.div>

                {/* Order ID (if available) */}
                {orderId && (
                    <motion.div
                        className="bg-gray-50 rounded-lg p-4 mb-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-1">
                            <HelpCircle className="w-4 h-4" />
                            <span className="font-medium">Reference ID</span>
                        </div>
                        <p className="text-lg font-mono font-semibold text-gray-900">
                            {orderId}
                        </p>
                    </motion.div>
                )}

                {/* Common Reasons */}
                <motion.div
                    className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <h3 className="font-semibold text-red-900 mb-2">Common reasons for payment failure:</h3>
                    <ul className="text-sm text-red-800 space-y-1">
                        <li>• Insufficient funds in your account</li>
                        <li>• Incorrect card details entered</li>
                        <li>• Card expired or blocked</li>
                        <li>• Network connection issues</li>
                    </ul>
                </motion.div>

                {/* Action Buttons */}
                <div className="space-y-3">
                    <motion.button
                        onClick={handleTryAgain}
                        className="w-full bg-black text-white py-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                    >
                        <RotateCcw className="w-5 h-5" />
                        Try Again
                    </motion.button>

                    <motion.button
                        onClick={handleReturnHome}
                        className="w-full bg-white border-2 border-gray-300 text-gray-700 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                    >
                        <Home className="w-5 h-5" />
                        Return to Catalog
                    </motion.button>
                </div>

                {/* Support Info */}
                <motion.p
                    className="text-sm text-gray-500 mt-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                >
                    Need help? Contact our support team
                </motion.p>

                {/* Logo */}
                <div className="mt-4">
                    <img src={logo} alt="Bazar Logo" className="h-10 mx-auto opacity-50" />
                </div>
            </motion.div>
        </div>
    );
}
