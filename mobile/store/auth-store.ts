import { create } from "zustand";
import ILoginResponse from "@/models/responses/login-response";
import IUsuarioResponse from "@/models/responses/user-response";
import AsyncStorage from "@react-native-async-storage/async-storage";
import authService from "@/services/auth-service";
import userService from "@/services/user-service";
import ILoginRequest from "@/models/requests/login-request";

const USER_STORAGE_KEY = "user_session";
const PROFILE_STORAGE_KEY = "user_profile";

export interface AuthState {
  user: ILoginResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  userProfile: IUsuarioResponse | null;
  isLoading: boolean;
  error: string | null;

  login: (credentials: ILoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  userProfile: null,
  isLoading: true,
  error: null,

  login: async (credentials: ILoginRequest) => {
    set({ isLoading: true, error: null });
    try {
      const loginResponse = await authService.login(credentials);
      const profile = await userService.getProfile(loginResponse.access_token);

      await AsyncStorage.setItem(
        USER_STORAGE_KEY,
        JSON.stringify(loginResponse)
      );
      await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));

      set({
        user: loginResponse,
        token: loginResponse.access_token,
        userProfile: profile,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Falha no login. Verifique suas credenciais.";
      set({
        error: message,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        userProfile: null,
      });
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
      await AsyncStorage.removeItem(PROFILE_STORAGE_KEY);
      throw new Error(message);
    }
  },

  logout: async () => {
    set({ isLoading: true });
    await authService.logout();

    await AsyncStorage.removeItem(USER_STORAGE_KEY);
    await AsyncStorage.removeItem(PROFILE_STORAGE_KEY);
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      userProfile: null,
      isLoading: false,
      error: null,
    });
  },

  restoreSession: async () => {
    set({ isLoading: true, error: null });
    try {
      const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
      const storedProfile = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);

      if (storedUser && storedProfile) {
        const loginResponse: ILoginResponse = JSON.parse(storedUser);
        const profile: IUsuarioResponse = JSON.parse(storedProfile);

        set({
          user: loginResponse,
          token: loginResponse.access_token,
          userProfile: profile,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          userProfile: null,
          isLoading: false,
        });
        await AsyncStorage.removeItem(USER_STORAGE_KEY);
        await AsyncStorage.removeItem(PROFILE_STORAGE_KEY);
      }
    } catch (error) {
      console.error("Failed to restore session:", error);
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        userProfile: null,
        isLoading: false,
        error: "Falha ao restaurar sessão.",
      });
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
      await AsyncStorage.removeItem(PROFILE_STORAGE_KEY);
    }
  },
}));

export default useAuthStore;
