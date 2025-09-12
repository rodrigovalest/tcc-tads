import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import IJwtUser from "../models/interfaces/jwt-token-user";
import { jwtDecode } from "jwt-decode";

type AuthState = {
  user: IJwtUser | null;
  token: string | null;
  loading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  restore: () => Promise<void>;
};

const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  loading: true,

  login: async (token: string) => {
    const decoded: IJwtUser = jwtDecode(token);
    await AsyncStorage.setItem("token", token);
    set({ user: decoded, token });
  },

  logout: async () => {
    await AsyncStorage.removeItem("token");
    set({ user: null, token: null });
  },

  restore: async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        const decoded: IJwtUser = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
          await AsyncStorage.removeItem("token");
          set({ user: null, token: null, loading: false });
          return;
        }
        
        set({ user: decoded, token, loading: false });
      } else {
        set({ user: null, token: null, loading: false });
      }
    } catch (error) {
      await AsyncStorage.removeItem("token");
      set({ user: null, token: null, loading: false });
    }
  },
}));

export default useAuthStore;
