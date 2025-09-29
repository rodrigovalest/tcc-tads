export interface LanguageFluency {
  languageCode: string;
  fluencyLevel: number;
}

export interface MultiStepRegisterData {
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
