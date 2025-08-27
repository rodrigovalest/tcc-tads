import { User } from '../entities/user.entity';
import { CreateUserRequestDto } from '../dtos/requests/create-user.request-dto';
import { CountryCode } from '../entities/country-code.enum';

export class UserBuilder {
  private user: User;

  constructor(
    username: string,
    email: string,
    hashedPassword: string,
    nationality: CountryCode
  ) {
    this.user = new User(
      username?.trim(),
      email?.toLowerCase().trim(),
      hashedPassword,
      nationality
    );
  }

  withPhoto(photo?: string): this {
    if (photo) {
      this.user.photo = photo;
    }
    return this;
  }

  withPersonalDescription(description?: string): this {
    const trimmedDescription = description?.trim();
    if (trimmedDescription) {
      this.user.personalDescription = trimmedDescription;
    }
    return this;
  }

  build(): User {
    return this.user;
  }

  static fromDto(createUserDto: CreateUserRequestDto, hashedPassword: string): UserBuilder {
    return new UserBuilder(
      createUserDto.username,
      createUserDto.email,
      hashedPassword,
      createUserDto.nationality
    )
      .withPhoto(createUserDto.photo)
      .withPersonalDescription(createUserDto.personalDescription);
  }
}
