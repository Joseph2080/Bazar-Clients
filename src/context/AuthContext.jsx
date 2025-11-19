// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const isProcessingCallback = useRef(false); // Prevent duplicate callback processing

    // Check if user is authenticated on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = () => {
        const token = sessionStorage.getItem('access_token');
        if (token) {
            try {
                // Decode JWT to get user info (simple base64 decode)
                const payload = JSON.parse(atob(token.split('.')[1]));
                const currentTime = Date.now() / 1000;
                
                if (payload.exp && payload.exp > currentTime) {
                    setUser({
                        id: payload.sub,
                        email: payload.email,
                        username: payload['cognito:username'] || payload.email,
                    });
                    setIsAuthenticated(true);
                } else {
                    // Token expired, try to refresh
                    refreshToken();
                }
            } catch (error) {
                console.error('Error decoding token:', error);
                clearAuth();
            }
        } else {
            setIsAuthenticated(false);
            setUser(null);
        }
        setIsLoading(false);
    };

    const login = async (redirectPath = null) => {
        // Prevent multiple simultaneous login attempts
        if (isLoggingIn) {
            console.log('Login already in progress, skipping...');
            return;
        }

        setIsLoggingIn(true);
        
        try {
            // Clear any old authentication data before starting new login
            sessionStorage.removeItem('access_token');
            sessionStorage.removeItem('id_token');
            sessionStorage.removeItem('auth_state');
            
            // Store intended path for post-login redirect
            if (redirectPath) {
                sessionStorage.setItem('auth_redirect', redirectPath);
            } else {
                sessionStorage.setItem('auth_redirect', window.location.pathname);
            }

            // Generate random state for CSRF protection
            const state = Math.random().toString(36).substring(2, 15);
            
            // Store state BEFORE making any API calls
            sessionStorage.setItem('auth_state', state);
            
            console.log('Generated and stored state:', state);
            console.log('Verification - state in storage:', sessionStorage.getItem('auth_state'));

            // Get Cognito login URL from backend
            const callbackUri = `${window.location.origin}/auth/callback`;
            console.log('Requesting login URL with callbackUri:', callbackUri);
            
            const response = await authAPI.getLoginUrl(callbackUri, state);
            
            // Backend returns: { data: { loginUrl: "..." }, message: "..." }
            const loginUrl = response.data.loginUrl;
            
            console.log('Received login URL:', loginUrl);
            
            // Extract and store the redirect_uri that was used in the login URL
            try {
                const url = new URL(loginUrl);
                const redirectUriFromUrl = url.searchParams.get('redirect_uri');
                console.log('Redirect URI in Cognito URL:', redirectUriFromUrl);
                
                // Store this exact redirect_uri to use in token exchange
                if (redirectUriFromUrl) {
                    sessionStorage.setItem('auth_redirect_uri', redirectUriFromUrl);
                }
            } catch (e) {
                console.error('Failed to parse login URL:', e);
            }
            
            if (!loginUrl) {
                throw new Error('Login URL not received from backend');
            }

            console.log('About to redirect to Cognito. State in storage:', sessionStorage.getItem('auth_state'));

            // Small delay to ensure sessionStorage is written
            await new Promise(resolve => setTimeout(resolve, 100));

            // Redirect to Cognito login
            window.location.href = loginUrl;
        } catch (error) {
            console.error('Error initiating login:', error);
            setIsLoggingIn(false);
            throw error;
        }
    };

    const handleCallback = async (code, state) => {
        // Prevent duplicate callback processing
        if (isProcessingCallback.current) {
            console.log('Callback already being processed, ignoring duplicate call');
            return sessionStorage.getItem('auth_redirect') || '/catalog';
        }
        
        isProcessingCallback.current = true;
        
        try {
            console.log('Received state from callback:', state);
            
            // Optional state verification (CSRF disabled on backend)
            const storedState = sessionStorage.getItem('auth_state');
            console.log('Stored state:', storedState);
            
            if (storedState && state && state !== storedState) {
                console.warn(`State mismatch - Received: ${state}, Expected: ${storedState}`);
                // Don't throw error since CSRF is disabled on backend
            }
            
            // Exchange code for tokens
            // Use the EXACT same redirect_uri that was used in the authorization request
            const storedRedirectUri = sessionStorage.getItem('auth_redirect_uri');
            const callbackUri = storedRedirectUri || `${window.location.origin}/auth/callback`;
            
            console.log('Exchanging code for tokens with callbackUri:', callbackUri);
            console.log('Authorization code:', code.substring(0, 20) + '...');
            
            // Clean up stored redirect URI
            sessionStorage.removeItem('auth_redirect_uri');
            
            const response = await authAPI.exchangeToken(code, callbackUri);
            
            // Backend returns: { data: { access_token, id_token, token_type, expires_in }, message: "..." }
            const { access_token, id_token } = response.data;
            console.log('Received tokens from backend. Access token length:', access_token.length);            
            if (!access_token) {
                throw new Error('Access token not received from backend');
            }

            // Store access token
            sessionStorage.setItem('access_token', access_token);
            if (id_token) {
                sessionStorage.setItem('id_token', id_token);
            }

            // Clean up auth state
            sessionStorage.removeItem('auth_state');

            // Update auth state
            checkAuth();

            // Get redirect path and clean up
            const redirectPath = sessionStorage.getItem('auth_redirect') || '/catalog';
            sessionStorage.removeItem('auth_redirect');

            return redirectPath;
        } catch (error) {
            console.error('Error handling callback:', error);
            isProcessingCallback.current = false; // Reset on error to allow retry
            clearAuth();
            throw error;
        }
    };

    const refreshToken = async () => {
        try {
            const response = await authAPI.refreshToken();
            const { access_token, id_token } = response.data;

            sessionStorage.setItem('access_token', access_token);
            if (id_token) {
                sessionStorage.setItem('id_token', id_token);
            }

            checkAuth();
            return true;
        } catch (error) {
            console.error('Error refreshing token:', error);
            clearAuth();
            return false;
        }
    };

    const logout = () => {
        clearAuth();
        // Optionally redirect to Cognito logout
        // window.location.href = cognitoLogoutUrl;
    };

    const clearAuth = () => {
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('id_token');
        sessionStorage.removeItem('auth_redirect');
        sessionStorage.removeItem('auth_state');
        setIsAuthenticated(false);
        setUser(null);
    };

    const getAccessToken = () => {
        return sessionStorage.getItem('access_token');
    };

    const value = {
        isAuthenticated,
        user,
        isLoading,
        login,
        logout,
        handleCallback,
        refreshToken,
        getAccessToken,
        checkAuth,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
