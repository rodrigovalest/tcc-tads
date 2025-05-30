export default interface IJwtUser {
  sub: number;
  username: string;
  email: string;
  exp: number;
  iat: number;
}
