import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, Role, AuthResponse } from '../types';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  demoMode: boolean;
  login: (auth: AuthResponse) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  setDemoMode: (enabled: boolean) => void;
  hasRole: (roles: Role | Role[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      demoMode: false,

      login: (auth: AuthResponse) => {
        localStorage.setItem('auth_token', auth.token);
        set({
          token: auth.token,
          user: auth.user,
          isAuthenticated: true,
        });
      },

      logout: () => {
        localStorage.removeItem('auth_token');
        set({
          token: null,
          user: null,
          isAuthenticated: false,
        });
      },

      updateUser: (updatedUser: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...updatedUser } });
        }
      },

      setDemoMode: (enabled: boolean) => {
        set({ demoMode: enabled });
      },

      hasRole: (roles: Role | Role[]) => {
        const currentUser = get().user;
        if (!currentUser) return false;
        const targetRoles = Array.isArray(roles) ? roles : [roles];
        return targetRoles.includes(currentUser.role);
      },
    }),
    {
      name: 'ticket_auth_store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        demoMode: state.demoMode,
      }),
    }
  )
);

