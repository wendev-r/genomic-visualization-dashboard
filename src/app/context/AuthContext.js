'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext({
    user: null,
    loading: true,
    setUser: null,
    checkAuth: () => {},
    logout: () => {},
});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }

            console.log('Checking auth with token:', token);

            const response = await fetch('http://127.0.0.1:5000/auth/me', {
                method: 'GET',
                headers: {
                    'Authorization': token,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            console.log('Auth check response status:', response.status);

            const responseText = await response.text();
            console.log('Auth check response:', responseText);

            if (response.ok) {
                try {
                    const userData = JSON.parse(responseText);
                    console.log('Parsed user data:', userData);
                    setUser(userData);
                } catch (parseError) {
                    console.error('Failed to parse user data:', parseError);
                    localStorage.removeItem('token');
                    setUser(null);
                }
            } else {
                console.log('Auth check failed with status:', response.status);
                localStorage.removeItem('token');
                setUser(null);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            localStorage.removeItem('token');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        window.location.reload();
    };

    useEffect(() => {
        checkAuth();
    }, []);

    // Make sure all functions are defined before providing them
    const authContextValue = {
        user,
        loading,
        setUser: (userData) => {
            console.log('Setting user:', userData);
            setUser(userData);
        },
        checkAuth,
        logout
    };

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);