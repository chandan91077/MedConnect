import { create } from 'zustand';
import api from '../services/api';
import socketService from '../services/socket';

const useAuthStore = create((set) => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    loading: false,
    error: null,

    login: async (credentials) => {
        set({ loading: true, error: null });
        try {
            const data = await api.post('/auth/login', credentials);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Connect socket
            socketService.connect(data.token);

            set({
                user: data.user,
                token: data.token,
                isAuthenticated: true,
                loading: false,
            });
            return data;
        } catch (error) {
            set({ loading: false, error: error.message });
            throw error;
        }
    },

    register: async (userData) => {
        set({ loading: true, error: null });
        try {
            const data = await api.post('/auth/register', userData);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            socketService.connect(data.token);

            set({
                user: data.user,
                token: data.token,
                isAuthenticated: true,
                loading: false,
            });
            return data;
        } catch (error) {
            set({ loading: false, error: error.message });
            throw error;
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        socketService.disconnect();
        set({
            user: null,
            token: null,
            isAuthenticated: false,
        });
    },

    updateProfile: async (profileData) => {
        try {
            await api.put('/auth/profile', profileData);
            const updatedUser = { ...useAuthStore.getState().user, ...profileData };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            set({ user: updatedUser });
        } catch (error) {
            throw error;
        }
    },
}));

export default useAuthStore;
