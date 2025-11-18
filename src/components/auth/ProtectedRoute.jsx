// src/components/auth/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingScreen from '../common/LoadingScreen';

export default function ProtectedRoute({ children }) {
    const { isAuthenticated, isLoading, login } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <LoadingScreen message="Checking authentication..." />;
    }

    if (!isAuthenticated) {
        // Trigger login with current path for redirect after auth
        login(location.pathname + location.search);
        return null;
    }

    return children;
}
