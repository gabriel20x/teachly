import { createContext } from 'react';

export type User = {
  id: number;
  name: string;
  avatar_url: string;
  google_id: string;
};

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credential: string) => Promise<void>;
  logout: () => void;
  initializeAuth: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined); 