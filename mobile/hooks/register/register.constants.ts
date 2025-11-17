import { MultiStepRegisterData } from "../../models/types/register.types";

export const TOTAL_STEPS = 5;
export const FIRST_STEP = 1;
export const LAST_STEP = TOTAL_STEPS;
export const MIN_PASSWORD_LENGTH = 6;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const DEFAULT_FORM_VALUES: MultiStepRegisterData = {
  name: "",
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  nationality: "",
  languages: [],
  photo: undefined,
  interestTopics: [],
  personalDescription: "",
  isGoogleAccount: false,
  googlePhoto: undefined,
};

export const STEPS_CONFIG = [
  "register.steps.basicInfo",
  "register.steps.languages",
  "register.steps.photo",
  "register.steps.interests",
  "register.steps.description",
] as const;
