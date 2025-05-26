import React, { useState } from "react";
import {
  TextInput,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  KeyboardTypeOptions,
} from "react-native";
import { typography } from "../assets/typography";
import Icon from "react-native-vector-icons/FontAwesome";
import { colors } from "../assets/colors";

interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  type?: "text" | "numeric" | "password" | "email";
  error?: string;
  onBlur?: () => void;
}

const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  type = "text",
  error,
  onBlur,
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(true);

  const getKeyboardType = (): KeyboardTypeOptions | undefined => {
    switch (type) {
      case "numeric":
        return "numeric";
      case "email":
        return "email-address";
      default:
        return "default";
    }
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, typography.text]}>{label}</Text>
      <View style={[styles.inputContainer, error ? styles.inputError : null]}>
        <TextInput
          key={
            type === "password"
              ? isPasswordVisible
                ? "password-visible"
                : "password-hidden"
              : "input"
          }
          style={[
            styles.input,
            typography.body,
            type === "password" && styles.inputWithIcon,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          secureTextEntry={type === "password" && !isPasswordVisible}
          keyboardType={getKeyboardType()}
          autoCapitalize={
            type === "email" || type === "password" ? "none" : "sentences"
          }
          textContentType={type === "password" ? "oneTimeCode" : undefined}
          onBlur={onBlur}
        />
        {type === "password" && (
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            style={styles.iconContainer}
            testID="password-visibility-toggle"
          >
            <Icon
              name={isPasswordVisible ? "eye" : "eye-slash"}
              size={24}
              color={colors.iconDefault}
            />
          </TouchableOpacity>
        )}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    color: colors.black,
    fontWeight: "600",
    fontSize: 20,
    paddingLeft: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 10,
    backgroundColor: colors.inputBackground,
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  inputWithIcon: {
    paddingRight: 40,
  },
  iconContainer: {
    position: "absolute",
    right: 12,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default Input;
