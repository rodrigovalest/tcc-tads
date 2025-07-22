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

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  loading: true,

  login: async (token: string) => {
    const decoded: IJwtUser = jwtDecode(token);
    await AsyncStorage.multiSet([
      ["user", JSON.stringify(decoded)],
      ["token", token],
    ]);
    set({ user: decoded, token });
  },

  logout: async () => {
    await AsyncStorage.multiRemove(["user", "token"]);
    set({ user: null, token: null });
  },

  restore: async () => {
    const [[, userData], [, token]] = await AsyncStorage.multiGet([
      "user",
      "token",
    ]);
    if (userData && token) {
      set({ user: JSON.parse(userData), token });
    }
    set((s) => ({ ...s, loading: false }));
  },
}));

export default useAuthStore;
