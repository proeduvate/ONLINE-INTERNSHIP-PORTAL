import React, { createContext, useState, useEffect, useContext } from 'react';
import { API_BASE } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [authToken, setAuthToken] = useState(localStorage.getItem('authToken'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            if (authToken) {
                try {
                    const response = await fetch(`${API_BASE}/api/users/me`, {
                        headers: {
                            'Authorization': `Bearer ${authToken}`
                        }
                    });
                    if (response.ok) {
                        const userData = await response.json();
                        setUser(userData);
                    } else {
                        console.error('Failed to fetch user data with token, logging out.');
                        logout();
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                    logout();
                }
            }
            setLoading(false);
        };

        loadUser();
    }, [authToken]);

    const login = async (email, password) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Login failed');
            }

            const data = await response.json();
            localStorage.setItem('authToken', data.access_token);
            setAuthToken(data.access_token);
            setUser(data.user);
            return data.user;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        setAuthToken(null);
        setUser(null);
        // Optionally redirect to login page or home
    };

    return (
        <AuthContext.Provider value={{ user, authToken, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
