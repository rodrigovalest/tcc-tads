import React from "react";
import { View } from "react-native";
import { Controller, Control, FieldErrors } from "react-hook-form";
import Input from "../../Input";
import Dropdown from "../../Dropdown";
import { MultiStepRegisterData } from "../../../models/types/register.types";

interface BasicInfoStepProps {
  control: Control<any>;
  errors: FieldErrors<any>;
  updateFormData: (field: keyof MultiStepRegisterData, value: any) => void;
  countryItems: Array<{ label: string; value: string }>;
  isNationalityDropdownOpen: boolean;
  setIsNationalityDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  t: (key: string) => string;
  isGoogleAccount?: boolean;
  googleEmail?: string;
}

export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  control,
  errors,
  updateFormData,
  countryItems,
  isNationalityDropdownOpen,
  setIsNationalityDropdownOpen,
  t,
  isGoogleAccount = false,
  googleEmail,
}) => {
  return (
    <View className="space-y-4">
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label={`${t("auth.name")} *`}
            value={value}
            onChangeText={(text) => {
              onChange(text);
              updateFormData("name", text);
            }}
            onBlur={onBlur}
            placeholder={t("auth.enterName")}
            error={errors.name?.message as string}
          />
        )}
      />

      <Controller
        control={control}
        name="username"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label={`${t("auth.username")} *`}
            value={value}
            onChangeText={(text) => {
              onChange(text);
              updateFormData("username", text);
            }}
            onBlur={onBlur}
            placeholder={t("auth.enterUsername")}
            error={errors.username?.message as string}
          />
        )}
      />

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label={`${t("auth.email")} *`}
            value={isGoogleAccount ? googleEmail || value : value}
            onChangeText={(text) => {
              if (!isGoogleAccount) {
                onChange(text);
                updateFormData("email", text);
              }
            }}
            onBlur={onBlur}
            placeholder={t("auth.enterEmail")}
            type="email"
            error={errors.email?.message as string}
            disabled={isGoogleAccount}
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label={`${t("auth.password")} *`}
            value={value}
            onChangeText={(text) => {
              onChange(text);
              updateFormData("password", text);
            }}
            onBlur={onBlur}
            placeholder={t("auth.enterPassword")}
            type="password"
            error={errors.password?.message as string}
          />
        )}
      />

      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label={`${t("auth.confirmPassword")} *`}
            value={value}
            onChangeText={(text) => {
              onChange(text);
              updateFormData("confirmPassword", text);
            }}
            onBlur={onBlur}
            placeholder={t("auth.confirmYourPassword")}
            type="password"
            error={errors.confirmPassword?.message as string}
          />
        )}
      />

      <Controller
        control={control}
        name="nationality"
        render={({ field: { onChange, value } }) => (
          <Dropdown
            label={`${t("auth.nationality")} *`}
            value={value}
            onChange={(text) => {
              onChange(text);
              updateFormData("nationality", text);
            }}
            items={countryItems}
            error={errors.nationality?.message as string}
            open={isNationalityDropdownOpen}
            setOpen={setIsNationalityDropdownOpen}
          />
        )}
      />
    </View>
  );
};
