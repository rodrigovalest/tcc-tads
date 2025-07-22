import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRegister } from "./useRegister";
import { registerSchema } from "../schemas/register-schema";

export interface IRegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  nationality: string;
}

export function useRegisterForm() {
  const { mutate: register, isPending } = useRegister();

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
      confirmPassword: "",
      nationality: "",
    },
  });

  const onSubmit = (data: IRegisterRequest) => {
    const { confirmPassword, ...payload } = data;
    register(payload);
  };

  return {
    control,
    handleSubmit,
    formState: { errors },
    onSubmit,
    isSubmitting: isPending,
  };
}
