import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../api/auth';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,

      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),

      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const { data } = await authAPI.login(credentials);
          set({
            user: data.data.user,
            accessToken: data.data.accessToken,
            refreshToken: data.data.refreshToken,
            isLoading: false,
          });
          return data.data;
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      register: async (userData) => {
        set({ isLoading: true });
        try {
          const { data } = await authAPI.register(userData);
          set({
            user: data.data.user,
            accessToken: data.data.accessToken,
            refreshToken: data.data.refreshToken,
            isLoading: false,
          });
          return data.data;
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      logout: async () => {
        try {
          await authAPI.logout();
        } catch (_) { /* silent */ }
        set({ user: null, accessToken: null, refreshToken: null });
      },

      updateUser: (updatedUser) => set({ user: updatedUser }),

      isAuthenticated: () => !!get().accessToken && !!get().user,
    }),
    {
      name: 'foodrush-auth',
      partialise: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);

export default useAuthStore;
