// src/routes/AppRoutes.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Catalog from "../catalog/Catalog";
import OrderCheckout from "../order/OrderCheckout";
import PaymentSuccess from "../payment/PaymentSuccess";
import PaymentFailure from "../payment/PaymentFailure";
import AuthCallback from "../auth/AuthCallback";
import ProtectedRoute from "../auth/ProtectedRoute";

export default function AppRoutes() {
    return (
        <Routes>
            {/* Public routes */}
            <Route path="/" element={<Navigate to="/catalog" replace />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            
            {/* Protected routes - require authentication */}
            <Route 
                path="/order-checkout" 
                element={
                    <ProtectedRoute>
                        <OrderCheckout />
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/payment/success" 
                element={
                    <ProtectedRoute>
                        <PaymentSuccess />
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/payment/failure" 
                element={
                    <ProtectedRoute>
                        <PaymentFailure />
                    </ProtectedRoute>
                } 
            />
        </Routes>
    );
}
