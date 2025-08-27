export interface UserLanguageRequest {
  languageCode: string;
  fluencyLevel: number;
}

export default interface IRegisterRequest {
  username: string;
  email: string;
  password: string;
  nationality: string;
  languages: UserLanguageRequest[];
  photo?: string;
  interestTopics?: string[];
  personalDescription?: string;
}