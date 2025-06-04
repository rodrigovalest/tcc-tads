import React, { useState, useMemo } from "react";
import { View, ScrollView } from "react-native";
import Input from "./Input";
import Button from "./Button";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRegister } from "@/hooks/useRegister";
import IRegisterRequest from "@/models/requests/register-request";
import DropDownPicker from "react-native-dropdown-picker";
import { COUNTRIES } from "@/constants/countries";
import { COLORS } from "@/constants/colors";

const registerSchema = yup.object().shape({
  username: yup.string().required("Username is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must have at least 6 characters")
    .required("Password is required"),
  nationality: yup.string().required("Nationality is required"),
});

const RegisterForm: React.FC = () => {
  const { mutate: onRegister, isPending } = useRegister();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<IRegisterRequest>({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      nationality: "",
    },
  });

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);

  const items = useMemo(
    () =>
      Object.entries(COUNTRIES).map(([code, name]) => ({
        label: name,
        value: code,
      })),
    []
  );

  const onSubmit = (data: IRegisterRequest) => {
    onRegister(data);
  };

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
        name="nationality"
        render={({ field: { onChange, value } }) => (
          <DropDownPicker
            open={open}
            value={value}
            items={items}
            setOpen={setOpen}
            setValue={(callback) => {
              const newValue =
                typeof callback === "function" ? callback(value) : callback;
              onChange(newValue);
            }}
            setItems={() => {}}
            searchable={true}
            placeholder="Select your nationality *"
            searchPlaceholder="Search nationality..."
            listMode="MODAL"
            showArrowIcon={false}
            modalProps={{
              animationType: "slide",
            }}
            modalContentContainerStyle={{
              paddingTop: 20,
            }}
            style={{
              marginBottom: 16,
              backgroundColor: COLORS.appLightGrey, 
              borderColor: 'black',
              borderWidth: 1,
              borderRadius: 8,
              minHeight: 56,
              paddingVertical: 16,
              paddingHorizontal: 12,
            }}
            textStyle={{
              color: COLORS.appDarkGrey,
              fontSize: 20,
            }}
            placeholderStyle={{
              color: COLORS.appMediumGrey,
              fontSize: 20,
            }}
            dropDownContainerStyle={{
              backgroundColor: COLORS.appLightGrey,
              borderColor: 'black',
            }}
          />
        )}
      />
      <Button
        title={isPending ? "Loading..." : "Register"}
        onPress={handleSubmit(onSubmit)}
        disabled={isPending}
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