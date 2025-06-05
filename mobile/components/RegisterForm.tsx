import React, { useState, useMemo } from "react";
import { View } from "react-native";
import { Controller } from "react-hook-form";
import { COUNTRIES } from "@/constants/countries";
import Input from "./Input";
import Button from "./Button";
import Dropdown from "./Dropdown";
import { useRegisterForm } from "@/hooks/useRegisterForm";

const RegisterForm: React.FC = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    onSubmit,
    isSubmitting,
  } = useRegisterForm();

  const [open, setOpen] = useState(false);
  const items = useMemo(
    () =>
      Object.entries(COUNTRIES).map(([code, name]) => ({
        label: name,
        value: code,
      })),
    []
  );

  return (
    <View className="flex justify-center z-0">
      <Controller
        control={control}
        name="username"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Username *"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="Enter your username"
            error={errors.username?.message}
          />
        )}
      />
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
      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Confirm Password *"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="Confirm your password"
            type="password"
            error={errors.confirmPassword?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="nationality"
        render={({ field: { onChange, value } }) => (
          <Dropdown
            label="Nationality *"
            value={value}
            onChange={onChange}
            items={items}
            error={errors.nationality?.message}
            open={open}
            setOpen={setOpen}
          />
        )}
      />
      <Button
        title={isSubmitting ? "Loading..." : "Register"}
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
        textSize="2xl"
        textColor="text-white"
        textColorActivate="text-white"
        bgColor="bg-black"
        bgColorActivate="bg-gray-700"
        borderColor="border-black"
        testID="register-button"
      />
    </View>
  );
};

export default RegisterForm;
