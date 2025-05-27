import React from "react";
import { View, Text, Image } from "react-native";
import { useLoginForm } from "../hooks/useLoginForm";
import Input from "./Input";
import Button from "./Button";
import { SafeAreaView } from "react-native-safe-area-context";

const LoginForm: React.FC = () => {
  const {
    email,
    password,
    setEmail,
    setPassword,
    emailError,
    passwordError,
    isLoading,
    apiError,
    handleEmailBlur,
    handlePasswordBlur,
    handleLogin,
    handleGoogleLogin,
    handleSignUp,
  } = useLoginForm();

  return (
    <SafeAreaView className="flex h-full justify-center px-8">
      <View className="mb-4">
        <Image
          source={require("../assets/images/calle-dog-icon.png")}
          className="w-24 h-24 mx-auto"
        />
        <Text className="text-6xl text-center font-bold">Calle</Text>
        <Text className="text-4xl text-center font-medium">
          Log in or sign up
        </Text>
      </View>
      <Input
        label="Email *  "
        value={email}
        onChangeText={setEmail}
        placeholder="Enter your email"
        type="email"
        error={emailError}
        onBlur={handleEmailBlur}
      />
      <Input
        label="Password *"
        value={password}
        onChangeText={setPassword}
        placeholder="Enter your password"
        type="password"
        error={passwordError}
        onBlur={handlePasswordBlur}
      />
      {apiError ? (
        <Text className="text-appMediumRed text-sm mb-2 text-center">
          {apiError}
        </Text>
      ) : null}
      <Button
        title="Login"
        onPress={handleLogin}
        className="mb-4"
        disabled={!email || !password || isLoading}
        loading={isLoading}
        textSize="2xl"
        textColor="text-white"
        textColorActivate="text-white"
        bgColor="bg-black"
        bgColorActivate="bg-gray-700"
        borderColor="border-black"
      />
      <Text className="text-center text-2xl text-black font-medium mb-4">
        or
      </Text>
      <Button
        title="Login with Google"
        onPress={handleGoogleLogin}
        className="mb-4"
        loading={isLoading}
        textColor="text-black"
        textColorActivate="text-white"
        textSize="2xl"
        bgColor="bg-white"
        bgColorActivate="bg-black"
        borderColor="border-appLightGrey"
        borderColorActivate="border-black"
        iconLeft="google"
        iconLeftColor="black"
        iconLeftColorActivate="white"
      />
      <Button
        title="Create an account"
        onPress={handleSignUp}
        className="mb-4"
        textSize="2xl"
        textColor="text-black"
        textColorActivate="text-white"
        bgColor="bg-white"
        bgColorActivate="bg-black"
        borderColor="border-appLightGrey"
        borderColorActivate="border-black"
      />
    </SafeAreaView>
  );
};

export default LoginForm;
