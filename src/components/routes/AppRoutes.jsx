// src/routes/AppRoutes.jsx
import { Routes, Route } from "react-router-dom";
import Catalog from "../catalog/Catalog";
import OrderCheckout from "../order/OrderCheckout";

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/order-checkout" element={<OrderCheckout />} />
        </Routes>
    );
}
