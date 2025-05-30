import React from "react";
import { View } from "react-native";
import Input from "./Input";
import Button from "./Button";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useLogin } from "@/hooks/useLogin";
import ILoginRequest from "@/models/requests/login-request";

const loginSchema = yup.object().shape({
  email: yup.string().email("Email inválido").required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must have at least 6 characters")
    .required("Password is required"),
});

const LoginForm: React.FC = () => {
  const { mutate: onLogin, isPending } = useLogin();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ILoginRequest>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: ILoginRequest) => {
    onLogin(data);
  };

  return (
    <View className="flex justify-center">
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
            error={errors.email?.message}
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
            error={errors.password?.message}
          />
        )}
      />

      <Button
        title={isPending ? "Loading..." : "Login"}
        onPress={handleSubmit(onSubmit)}
        disabled={isPending}
        textSize="2xl"
        textColor="text-white"
        textColorActivate="text-white"
        bgColor="bg-black"
        bgColorActivate="bg-gray-700"
        borderColor="border-black"
        testID="login-button"
      />
    </View>
  );
};

export default LoginForm;
