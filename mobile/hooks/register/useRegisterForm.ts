import { useForm } from "react-hook-form";
import { RegisterFormData } from "../../models/types/register.types";
import { DEFAULT_FORM_VALUES } from "./register.constants";

export function useRegisterForm() {
  const formMethods = useForm<RegisterFormData>({
    mode: 'onSubmit',
    defaultValues: DEFAULT_FORM_VALUES,
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    setError,
    clearErrors,
  } = formMethods;

  return {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    setError,
    clearErrors,
    formMethods,
  };
}
