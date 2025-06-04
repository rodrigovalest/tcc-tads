import * as yup from "yup";

export const registerSchema = yup.object().shape({
  username: yup.string().required("Username is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must have at least 6 characters")
    .required("Password is required"),
  nationality: yup.string().required("Nationality is required"),
});
