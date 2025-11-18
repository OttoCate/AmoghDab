import { create } from 'zustand'

export const useZustand = create((set) => ({
  auth: null,
  users: [],
  companies: [],
  banks: [],
  bankAccounts: [],
  indentures: [],
  setAuth: (value) => set({ auth: value }),
  setUserState: (value) => set({ users: value }),
  setCompanyState: (value) => set({ companies: value }),
  setBankState: (value) => set({ banks: value }),
  setBankAccountState: (value) => set({ bankAccounts: value }),
  setIndentureState: (value) => set({ indentures: value }),
  logout: () =>
    set({
      auth: null,
      users: [],
      companies: [],
      banks: [],
      bankAccounts: [],
      indentures: [],
    }),
}))
