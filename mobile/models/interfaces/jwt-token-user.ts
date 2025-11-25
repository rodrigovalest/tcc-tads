export default interface IJwtUser {
  sub: number;
  username: string;
  email: string;
  nationality: string;
  photoUri: string | null;
  exp: number;
  iat: number;
}
