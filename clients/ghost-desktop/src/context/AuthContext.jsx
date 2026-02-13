import { createContext, useContext, useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

const AuthContext = createContext({
    isAuthenticated: false,
    user: null,
    token: null,
    login: async () => { },
    register: async () => { },
    logout: async () => { },
    isLoading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize session on mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Here we could try to verify an existing token if we had one stored
                // For now, we'll rely on the backend session or local storage if implemented later
                // As per the MVP guide, let's start fresh or check if a token exists in localStorage
                const storedToken = localStorage.getItem('identra_auth_token');
                if (storedToken) {
                    // Verify token with backend
                    // invoke('verify_token', { token: storedToken }) ... but we don't have that command yet exposed directly or it's part of verify_token in auth service
                    // For MVP speed, let's assume if token exists, we are "logged in" until an API call fails
                    setToken(storedToken);
                    setIsAuthenticated(true);
                    // We might want to fetch user profile here
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                logout();
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = async (username, password) => {
        try {
            const accessToken = await invoke('login_user', { username, password });
            setToken(accessToken);
            setIsAuthenticated(true);
            localStorage.setItem('identra_auth_token', accessToken);
            return { success: true };
        } catch (error) {
            console.error('Login failed:', error);
            return { success: false, error };
        }
    };

    const register = async (username, email, password) => {
        try {
            const userId = await invoke('register_user', { username, email, password });
            // Auto-login after register? Or require login?
            // Let's require login for security/simplicity or just return success
            return { success: true, userId };
        } catch (error) {
            console.error('Registration failed:', error);
            return { success: false, error };
        }
    };

    const logout = async () => {
        setToken(null);
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem('identra_auth_token');
        // detailed logout logic to backend if needed
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, token, login, register, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};
