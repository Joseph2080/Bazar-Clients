// src/routes/AppRoutes.jsx
import { Routes, Route } from "react-router-dom";
import Catalog from "../catalog/Catalog";

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/catalog" element={<Catalog />} />
        </Routes>
    );
}
