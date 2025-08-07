import React from "react";
import { View } from "react-native";
import Input from "./Input";
import Button from "./Button";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useLogin } from "../hooks/useLogin";
import ILoginRequest from "../models/requests/login-request";
import useI18n from "../hooks/useI18n";

const LoginForm: React.FC = () => {
  const { mutate: onLogin, isPending } = useLogin();
  const { t } = useI18n();

  // Create schema with translations
  const loginSchema = yup.object().shape({
    email: yup
      .string()
      .email(t('errors.validationError'))
      .required(`${t('auth.email')} ${t('auth.isRequired')}`),
    password: yup
      .string()
      .min(6, `${t('auth.password')} ${t('auth.mustHaveAtLeast')} 6 ${t('auth.characters')}`)
      .required(`${t('auth.password')} ${t('auth.isRequired')}`),
  });

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
            label={`${t('auth.email')} *`}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder={t('auth.enterEmail')}
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
            label={`${t('auth.password')} *`}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder={t('auth.enterPassword')}
            type="password"
            error={errors.password?.message}
          />
        )}
      />

      <Button
        title={isPending ? t('common.loading') : t('auth.login')}
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
