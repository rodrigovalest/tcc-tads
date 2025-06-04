import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRegister } from "./useRegister";
import type IRegisterRequest from "@/models/requests/register-request";
import { registerSchema } from "@/schemas/register-schema";

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
      nationality: "",
    },
  });

  const onSubmit = (data: IRegisterRequest) => {
    register(data);
  };

  return {
    control,
    handleSubmit,
    formState: { errors },
    onSubmit,
    isSubmitting: isPending,
  };
}
