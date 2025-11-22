import { create } from "zustand";

interface ErrorState {
  error: string | null;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useError = create<ErrorState>((set) => ({
  error: null,
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));

interface LoadingState {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

export const useLoading = create<LoadingState>((set) => ({
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),
}));
