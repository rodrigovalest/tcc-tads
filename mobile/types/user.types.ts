// Base User interface - reutilizável em todo o sistema
export interface BaseUser {
  id: number;
  username: string;
  email: string;
  nationality: string;
  personalDescription?: string;
  photo?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FullUser extends BaseUser {
  languages: UserLanguage[];
  interestTopics: UserTopic[];
}

export interface UserLanguage {
  id: number;
  language: string;
  fluencyLevel: number;
}

export interface UserTopic {
  id: number;
  topic: string;
}

export type User = BaseUser | FullUser;