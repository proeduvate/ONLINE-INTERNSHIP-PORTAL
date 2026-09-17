import React, { createContext, useState, useEffect, useContext } from 'react';
import { API_BASE } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [authToken, setAuthToken] = useState(localStorage.getItem('token') || localStorage.getItem('access_token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            if (authToken) {
                try {
                    let response = await fetch(`${API_BASE}/users/profile`, {
                        headers: {
                            'Authorization': `Bearer ${authToken}`
                        }
                    });
                    if (!response.ok) {
                        response = await fetch(`${API_BASE}/profile`, {
                            headers: {
                                'Authorization': `Bearer ${authToken}`
                            }
                        });
                    }
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
            let response = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                response = await fetch(`${API_BASE}/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                });
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Login failed');
            }

            const data = await response.json();
            const token = data.access_token || data.token;
            localStorage.setItem('token', token);
            localStorage.setItem('access_token', token);
            localStorage.setItem('role', data.role);
            setAuthToken(token);
            const userData = { role: data.role, name: data.name, email: data.email, id: data.user_id };
            setUser(userData);
            return { ...data, ...userData };
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('access_token');
        localStorage.removeItem('role');
        setAuthToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, authToken, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
