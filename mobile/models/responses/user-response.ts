interface UserLanguageResponse {
  id: number;
  languageCode: string;
  fluencyLevel: number;
  createdAt: string;
}

interface UserInterestTopicResponse {
  id: number;
  topic: string;
  createdAt: string;
}

export default interface IUserResponse {
  id: number;
  name: string;
  username: string;
  email: string;
  nationality: string;
  personalDescription?: string;
  photoUri?: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  languages: UserLanguageResponse[];
  interestTopics: UserInterestTopicResponse[];
}
