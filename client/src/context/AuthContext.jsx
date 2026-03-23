import { createContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const storedUser = localStorage.getItem('user');
            return storedUser ? JSON.parse(storedUser) : null;
        } catch (error) {
            console.error('Initial auth parse error:', error);
            return null;
        }
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyAuth = async () => {
            if (user) {
                try {
                    // Silent verification with backend
                    const { data } = await api.get('/auth/me');
                    if (data.success) {
                        setUser(prev => ({ ...prev, ...data.user }));
                    }
                } catch (error) {
                    console.error('Token verification failed:', error);
                    if (error.response?.status === 401) {
                        localStorage.removeItem('user');
                        setUser(null);
                    }
                }
            }
            setLoading(false);
        };

        verifyAuth();
    }, []);

    const login = async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });

        if (data.success) {
            // Structure: { success, user, accessToken, refreshToken }
            const userData = {
                ...data.user,
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
            };
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            return userData;
        }
        throw new Error(data.message || 'Login failed');
    };

    const logout = async () => {
        try {
            const userData = JSON.parse(localStorage.getItem('user'));
            if (userData && userData.refreshToken) {
                await api.post('/auth/logout', { refreshToken: userData.refreshToken });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('user');
            setUser(null);
        }
    };

    const updateUser = (updatedData) => {
        const userData = JSON.parse(localStorage.getItem('user'));
        const newUserData = { ...userData, ...updatedData };
        localStorage.setItem('user', JSON.stringify(newUserData));
        setUser(newUserData);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
