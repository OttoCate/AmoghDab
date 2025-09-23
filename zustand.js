import { create } from 'zustand'

export const useAuth = create((set) => ({
  auth: null,
  getAuth: (value) => set({ auth: value }),
  logout: () => set({ auth: null }),
}))
