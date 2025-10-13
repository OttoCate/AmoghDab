import { create } from 'zustand'

export const useAuth = create((set) => ({
  auth: null,
  setAuth: (value) => set({ auth: value }),
  logout: () => set({ auth: null }),
}))

export const useUsers = create((set) => ({
  users: [],
  setUserState: (value) => set({ users: value }),
  reset: () => set([]),
}))

export const useCompanies = create((set) => ({
  companies: [],
  setCompanyState: (value) => set({ companies: value }),
  reset: () => set([]),
}))
