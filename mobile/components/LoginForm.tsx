import React from "react";
import { View, Text, Image } from "react-native";
import { useLoginForm } from "../hooks/useLoginForm";
import Input from "./Input";
import Button from "./Button";
import { SafeAreaView } from "react-native-safe-area-context";
import { Controller } from "react-hook-form";

const LoginForm: React.FC = () => {
  const {
    control,
    handleSubmit,
    errors,
    isLoading,
    apiError,
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

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Email *"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="Enter your email"
            type="email"
            error={errors.email?.message || undefined}
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Password *"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="Enter your password"
            type="password"
            error={errors.password?.message || undefined}
          />
        )}
      />

      {apiError ? (
        <Text className="text-appMediumRed text-sm mb-2 text-center">
          {apiError}
        </Text>
      ) : null}

      <Button
        title="Login"
        onPress={handleSubmit}
        className="mb-4"
        disabled={isLoading || Object.keys(errors).length > 0}
        loading={isLoading}
        textSize="2xl"
        textColor="text-white"
        textColorActivate="text-white"
        bgColor="bg-black"
        bgColorActivate="bg-gray-700"
        borderColor="border-black"
        testID="login-button"
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
        testID="google-login-button"
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
