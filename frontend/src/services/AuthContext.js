import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [authToken, setAuthToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            if (authToken) {
                try {
                    const response = await api.get('/profile');
                    if (response.status === 200) {
                        setUser(response.data);
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
            const response = await api.post('/login', { email, password });
            const data = response.data;
            
            localStorage.setItem('token', data.access_token);
            localStorage.setItem('role', data.role);
            setAuthToken(data.access_token);
            
            const userData = { role: data.role, name: data.name, email: data.email };
            setUser(userData);
            return userData;
        } catch (error) {
            throw new Error(error.response?.data?.detail || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        setAuthToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, authToken, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
