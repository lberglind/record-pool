import { create } from 'zustand'

// Define types for state & actions
export type ModelState = {
  username: string
  email: string
  number: number
  update: (number: number) => void
}

// Create store using the curried form of `create`
export const useModelStore = create<ModelState>()((set) => ({
  username: 'John Doe',
  email: 'john.doe@example.com',
  number: 0,
  update: (value) => set((state) => ({ number: value })),
}))