// src/components/auth/AuthCallback.jsx
import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/bazar-logo.gif';
import { motion } from 'framer-motion';

export default function AuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { handleCallback } = useAuth();
    const [error, setError] = useState(null);
    const hasProcessed = useRef(false); // Prevent duplicate processing

    useEffect(() => {
        const processCallback = async () => {
            // Prevent duplicate processing (React StrictMode calls useEffect twice)
            if (hasProcessed.current) {
                console.log('Callback already processed, skipping...');
                return;
            }
            hasProcessed.current = true;

            const code = searchParams.get('code');
            const state = searchParams.get('state');
            const errorParam = searchParams.get('error');

            console.log('Callback received - code:', code?.substring(0, 10) + '...', 'state:', state);

            if (errorParam) {
                setError(`Authentication failed: ${searchParams.get('error_description') || errorParam}`);
                return;
            }

            if (!code || !state) {
                setError('Invalid callback parameters');
                return;
            }

            try {
                const redirectPath = await handleCallback(code, state);
                navigate(redirectPath, { replace: true });
            } catch (err) {
                console.error('Callback error:', err);
                setError(err.message || 'Failed to complete authentication');
            }
        };

        processCallback();
    }, [searchParams, handleCallback, navigate]);

    if (error) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-4">
                <motion.div
                    className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Failed</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => navigate('/catalog')}
                        className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800"
                    >
                        Return to Catalog
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="text-center">
                <img src={logo} alt="Loading" className="mx-auto w-20 h-20 mb-4 animate-pulse" />
                <h2 className="text-xl font-semibold mb-2">Completing sign in...</h2>
                <p className="text-gray-600">Please wait while we authenticate your account</p>
            </div>
        </div>
    );
}
