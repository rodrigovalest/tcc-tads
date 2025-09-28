export class GoogleLoginResponseDto {
  access_token: string;
  token_type: string;
  isNewUser: boolean;
  requiresRegistration?: boolean;
}
