export default interface IJwtUser {
  sub: number;
  username: string;
  email: string;
  nationality: string; 
  exp: number;
  iat: number;
}
