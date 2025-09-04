import { useCallback } from "react";
import { EMAIL_REGEX, MIN_PASSWORD_LENGTH } from "./register.constants";

export function useValidationHelpers() {
  const isValidEmail = useCallback((email: string): boolean => {
    return EMAIL_REGEX.test(email);
  }, []);

  const isValidPassword = useCallback((password: string): boolean => {
    return password.length >= MIN_PASSWORD_LENGTH;
  }, []);

  return {
    isValidEmail,
    isValidPassword,
  };
}
