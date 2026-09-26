import React, { createContext, useState, useEffect, useContext } from 'react';
import { API_BASE } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [authToken, setAuthToken] = useState(localStorage.getItem('token') || localStorage.getItem('access_token'));
    const [loading, setLoading] = useState(true);
    const [devDomain, setDevDomain] = useState("");

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
                        if (userData && userData.role) {
                            userData.role = userData.role.toLowerCase();
                        }
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
            localStorage.setItem('authToken', token); // For backward compatibility
            
            const userObj = data.user || data; // Fallback in case it's flat
            const normalizedRole = (userObj.role || data.role || "").toLowerCase();
            localStorage.setItem('role', normalizedRole);
            setAuthToken(token);
            
            const userData = { ...userObj, role: normalizedRole, name: userObj.full_name || userObj.name || data.name, email: userObj.email || data.email, id: userObj.user_id || data.user_id };
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

    const effectiveUser = user ? { ...user, domain: devDomain || user.domain } : null;

    return (
        <AuthContext.Provider value={{ user: effectiveUser, setUser, authToken, login, logout, loading, setDevDomain, devDomain }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
