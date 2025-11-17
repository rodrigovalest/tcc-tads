export interface GoogleLoginRequest {
  idToken: string;
  email: string;
  name: string;
  photo?: string;
}

export interface GoogleLoginResponse {
  access_token: string;
  token_type: string;
  isNewUser: boolean;
  requiresRegistration?: boolean;
}

export interface GoogleLinkRequest {
  idToken: string;
}

export interface GoogleLinkResponse {
  success: boolean;
  message: string;
}
