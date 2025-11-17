import * as yup from "yup";

export const registerSchema = yup.object().shape({
  name: yup.string().required("Name is required"),
  username: yup.string().required("Username is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must have at least 6 characters")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
  nationality: yup.string().required("Nationality is required"),
  languages: yup.array().of(
    yup.object().shape({
      languageCode: yup.string().required(),
      fluencyLevel: yup.number().min(1).max(5).required(),
    })
  ).min(1, "At least one language must be selected").required(),
  photo: yup.string().optional(),
  interestTopics: yup.array().of(yup.string()).default([]),
  personalDescription: yup.string().default(""),
});
