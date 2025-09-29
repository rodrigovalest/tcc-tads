import { IsString } from 'class-validator';

export class GoogleLinkRequestDto {
  @IsString()
  idToken: string;
}
