export interface LanguageFluency {
  languageCode: string;
  fluencyLevel: number;
}

export interface MultiStepRegisterData {
  name: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  nationality: string;
  languages: LanguageFluency[];
  photo?: string;
  interestTopics: string[];
  personalDescription: string;
  isGoogleAccount?: boolean;
  googlePhoto?: string;
}

export interface RegisterRequest {
  name: string;
  username: string;
  email: string;
  password: string;
  nationality: string;
  languages: LanguageFluency[];
  photo?: string;
  interestTopics?: string[];
  personalDescription?: string;
  isGoogleAccount?: boolean;
  googlePhoto?: string;
}

export interface RegisterFormData {
  name: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  nationality: string;
  languages: LanguageFluency[];
  photo?: string;
  interestTopics: string[];
  personalDescription: string;
  isGoogleAccount?: boolean;
  googlePhoto?: string;
}
