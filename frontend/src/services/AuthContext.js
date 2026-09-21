import React, { createContext, useState, useEffect, useContext } from 'react';
import { API_BASE } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [authToken, setAuthToken] = useState(localStorage.getItem('authToken'));
    const [loading, setLoading] = useState(true);
    const [devDomain, setDevDomain] = useState("");

    useEffect(() => {
        const loadUser = async () => {
            if (authToken) {
                try {
                    const response = await fetch(`${API_BASE}/api/auth/me`, {
                        headers: {
                            'Authorization': `Bearer ${authToken}`
                        }
                    });
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
            const userObj = data.user || data; // Fallback in case it's flat
            
            const normalizedRole = userObj.role ? userObj.role.toLowerCase() : "";

            localStorage.setItem('authToken', data.access_token);
            localStorage.setItem('role', normalizedRole);
            setAuthToken(data.access_token);
            
            const userData = { ...userObj, role: normalizedRole, name: userObj.full_name || userObj.name };
            setUser(userData);
            return userData;
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

    const effectiveUser = user ? { ...user, domain: devDomain || user.domain } : null;

    return (
        <AuthContext.Provider value={{ user: effectiveUser, authToken, login, logout, loading, setDevDomain, devDomain }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
