import { useEffect } from "react";
import useGoogleRegisterStore from "../store/google-register-store";

export function useGoogleRegister() {
  const store = useGoogleRegisterStore();

  const isGoogleAccount =
    store.wasGoogleSignInTriggered && !!store.googleUserData;

  useEffect(() => {
    store.checkForGoogleUser();
  }, []);

  return {
    googleUserData: store.googleUserData,
    isFromGoogleSignIn: store.isFromGoogleSignIn,
    isGoogleAccount,
    downloadGooglePhoto: store.downloadGooglePhoto,
    checkForGoogleUser: store.checkForGoogleUser,
    resetGoogleData: store.resetGoogleData,
    setGoogleSignInData: store.setGoogleSignInData,
    markAsManualRegistration: store.markAsManualRegistration,
    clearAllForManualRegistration: store.clearAllForManualRegistration,
  };
}
