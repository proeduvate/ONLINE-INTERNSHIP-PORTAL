import React, { createContext, useState, useEffect, useContext } from 'react';
import { API_BASE } from '../api/axios';

const getInitialUser = () => {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken') || localStorage.getItem('access_token');
    const role = localStorage.getItem('role') || localStorage.getItem('user_role');
    let name = localStorage.getItem('name') || localStorage.getItem('user_name');
    if (!name || name.toLowerCase() === 'karan' || name.toLowerCase() === 'user') {
        name = 'John Doe';
        localStorage.setItem('name', 'John Doe');
        localStorage.setItem('user_name', 'John Doe');
    }
    const id = localStorage.getItem('user_id') || '3';
    if (token || role) {
        return { id, user_id: id, name, role: role || 'INTERN' };
    }
    return null;
};

const AuthContext = createContext({
    user: null,
    setUser: () => {},
    authToken: null,
    login: async () => {},
    logout: () => {},
    loading: false
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(getInitialUser);
    const [authToken, setAuthToken] = useState(localStorage.getItem('authToken') || localStorage.getItem('token'));
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadUser = async () => {
            if (authToken) {
                try {
                    let response = await fetch(`${API_BASE}/api/v1/users/profile`, {
                        headers: { 'Authorization': `Bearer ${authToken}` }
                    });
                    if (!response.ok) {
                        response = await fetch(`${API_BASE}/api/users/me`, {
                            headers: { 'Authorization': `Bearer ${authToken}` }
                        });
                    }
                    if (!response.ok) {
                        response = await fetch(`${API_BASE}/users/me`, {
                            headers: { 'Authorization': `Bearer ${authToken}` }
                        });
                    }
                    if (response.ok) {
                        const userData = await response.json();
                        let resolvedName = userData.name || userData.full_name || localStorage.getItem('user_name') || 'John Doe';
                        if (!resolvedName || resolvedName.toLowerCase() === 'karan') {
                            resolvedName = 'John Doe';
                        }
                        userData.name = resolvedName;
                        localStorage.setItem('name', resolvedName);
                        localStorage.setItem('user_name', resolvedName);
                        setUser(prev => ({ ...prev, ...userData, name: resolvedName }));
                    } else {
                        const savedRole = localStorage.getItem('role');
                        if (savedRole) {
                            setUser(prev => prev || { role: savedRole, name: localStorage.getItem('name') || 'John Doe' });
                        }
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                    const savedRole = localStorage.getItem('role');
                    if (savedRole) {
                        setUser(prev => prev || { role: savedRole, name: localStorage.getItem('name') || 'John Doe' });
                    }
                }
            }
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
            let displayName = data.name || data.user?.name || localStorage.getItem('name') || 'John Doe';
            if (!displayName || displayName.toLowerCase() === 'karan') {
                displayName = 'John Doe';
            }
            localStorage.setItem('token', token);
            localStorage.setItem('access_token', token);
            localStorage.setItem('authToken', token);
            localStorage.setItem('role', data.role);
            localStorage.setItem('name', displayName);
            localStorage.setItem('user_name', displayName);
            setAuthToken(token);
            const userData = { role: data.role, name: displayName, email: data.email || data.user?.email || 'intern@gmail.com', id: data.user_id || data.user?.id || '3', user_id: data.user_id || data.user?.id || '3' };
            setUser(userData);
            return userData;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('authToken');
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

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        const token = localStorage.getItem('token') || localStorage.getItem('authToken') || localStorage.getItem('access_token');
        const role = localStorage.getItem('role') || localStorage.getItem('user_role') || 'INTERN';
        const name = localStorage.getItem('name') || localStorage.getItem('user_name') || 'User';
        const id = localStorage.getItem('user_id') || '1';
        return {
            user: { id, user_id: id, name, role },
            setUser: () => {},
            authToken: token,
            login: async () => {},
            logout: () => {
                localStorage.clear();
                window.location.href = '/login';
            },
            loading: false
        };
    }
    return context;
};
