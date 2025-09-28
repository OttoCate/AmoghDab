import { create } from 'zustand'

export const useAuth = create((set) => ({
  auth: null,
  setAuth: (value) => set({ auth: value }),
  logout: () => set({ auth: null }),
}))
