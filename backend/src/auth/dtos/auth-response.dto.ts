export class AuthResponseDto {
  access_token: string;
  token_type: string = 'bearer';
  expires_in: number;
}