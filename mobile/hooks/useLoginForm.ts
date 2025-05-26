import { useState } from "react";

export const useLoginForm = () => {
  const [email, _setEmail] = useState("");
  const [password, _setPassword] = useState("");

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);

  const setEmail = (text: string) => {
    _setEmail(text);
    if (emailError) {
      setEmailError("");
    }
  };

  const setPassword = (text: string) => {
    _setPassword(text);
    if (passwordError) {
      setPasswordError("");
    }
  };

  const validateEmail = () => {
    if (!email.trim()) {
      setEmailError("Email é obrigatório");
      return false;
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      setEmailError("Email inválido");
      return false;
    }
    return true;
  };

  const validatePassword = () => {
    if (!password.trim()) {
      setPasswordError("Senha é obrigatória");
      return false;
    } else if (password.length < 6) {
      setPasswordError("Senha deve ter pelo menos 6 caracteres");
      return false;
    }
    return true;
  };

  const validateForm = () => {
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    return isEmailValid && isPasswordValid;
  };

  const handleLogin = () => {
    setFormSubmitted(true);

    if (validateForm()) {
      // Login logic will be implemented later
      console.log("Login attempt with:", { email, password });
    } else {
      console.log("Form has errors");
    }
  };

  const handleGoogleLogin = () => {
    // Google login logic will be implemented later
    console.log("Google login attempt");
  };

  const handleSignUp = () => {
    // Sign up navigation logic will be implemented later
    console.log("Navigate to sign up");
  };

  const handleEmailBlur = () => {
    if (formSubmitted || email.trim()) {
      validateEmail();
    }
  };

  const handlePasswordBlur = () => {
    if (formSubmitted || password.trim()) {
      validatePassword();
    }
  };

  return {
    email,
    password,
    setEmail,
    setPassword,
    emailError,
    passwordError,
    handleEmailBlur,
    handlePasswordBlur,
    handleLogin,
    handleGoogleLogin,
    handleSignUp,
  };
};
