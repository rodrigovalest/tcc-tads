import { create } from "zustand";
import authService from "../services/auth-service";

interface GoogleUserData {
  email: string;
  name: string;
  photo?: string;
  givenName?: string;
  familyName?: string;
}

type GoogleRegisterState = {
  googleUserData: GoogleUserData | null;
  isFromGoogleSignIn: boolean;
  wasGoogleSignInTriggered: boolean;
  setGoogleSignInData: (googleUser: any) => void;
  resetGoogleData: () => void;
  checkForGoogleUser: () => Promise<void>;
  downloadGooglePhoto: (photoUrl: string) => Promise<string | null>;
  markAsManualRegistration: () => void;
  clearAllForManualRegistration: () => void;
};

const useGoogleRegisterStore = create<GoogleRegisterState>((set, get) => ({
  googleUserData: null,
  isFromGoogleSignIn: false,
  wasGoogleSignInTriggered: false,

  setGoogleSignInData: (googleUser: any) => {
    const userData: GoogleUserData = {
      email: googleUser.email,
      name:
        googleUser.name ||
        `${googleUser.givenName} ${googleUser.familyName}`.trim(),
      photo: googleUser.photo || undefined,
      givenName: googleUser.givenName || undefined,
      familyName: googleUser.familyName || undefined,
    };

    set({
      googleUserData: userData,
      isFromGoogleSignIn: true,
      wasGoogleSignInTriggered: true,
    });
  },

  resetGoogleData: () => {
    set({
      googleUserData: null,
      isFromGoogleSignIn: false,
      wasGoogleSignInTriggered: false,
    });
  },

  markAsManualRegistration: () => {
    set({
      isFromGoogleSignIn: false,
      wasGoogleSignInTriggered: false,
    });
  },

  clearAllForManualRegistration: () => {
    set({
      googleUserData: null,
      isFromGoogleSignIn: false,
      wasGoogleSignInTriggered: false,
    });
  },

  checkForGoogleUser: async () => {
    try {
      const googleUser = await authService.getGoogleUserInfo();

      if (googleUser) {
        const userData: GoogleUserData = {
          email: googleUser.email,
          name:
            googleUser.name ||
            `${googleUser.givenName} ${googleUser.familyName}`.trim(),
          photo: googleUser.photo || undefined,
          givenName: googleUser.givenName || undefined,
          familyName: googleUser.familyName || undefined,
        };

        set((state) => ({
          googleUserData: userData,
          isFromGoogleSignIn: state.isFromGoogleSignIn,
          wasGoogleSignInTriggered: state.wasGoogleSignInTriggered,
        }));
      }
    } catch (error) {
      console.error("Error checking Google user:", error);
    }
  },

  downloadGooglePhoto: async (photoUrl: string): Promise<string | null> => {
    try {
      const response = await fetch(photoUrl);
      if (!response.ok) {
        throw new Error(`Failed to download photo: ${response.status}`);
      }

      const blob = await response.blob();
      const reader = new FileReader();

      return new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () =>
          reject(new Error("Failed to convert photo to base64"));
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Error downloading Google photo:", error);
      return null;
    }
  },
}));

export default useGoogleRegisterStore;
