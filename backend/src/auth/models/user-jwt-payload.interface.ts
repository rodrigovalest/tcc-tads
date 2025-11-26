import { CountryCode } from "src/user/entities/country-code.enum";

export interface IUserJwtPayload {
  sub: number;
  email: string;
  username: string;
  nationality: CountryCode;
  photoUri: string | null;
}
