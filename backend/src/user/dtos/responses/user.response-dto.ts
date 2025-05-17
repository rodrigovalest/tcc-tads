export class UserResponseDto {
  id: number;
  username: string;
  email: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}
