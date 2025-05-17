import { UserResponseDto } from "../dtos/responses/user.response-dto";
import { User } from "../entities/user.entity";

export class UserMapper {
  static toUserResponseDto(user: User): UserResponseDto {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  static toListUserResponseDto(users: User[]): UserResponseDto[] {
    return users.map(user => this.toUserResponseDto(user));
  }
}
