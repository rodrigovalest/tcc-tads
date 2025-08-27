import { User } from '../entities/user.entity';
import { UpdateUserRequestDto } from '../dtos/requests/update-user.request-dto';

type FieldUpdater = (user: User, value: any) => void;

export class UserFieldUpdater {
  private static readonly fieldUpdaters: Record<string, FieldUpdater> = {
    username: (user, value: string) => {
      const trimmedValue = value?.trim();
      if (trimmedValue) {
        user.username = trimmedValue;
      }
    },
    
    nationality: (user, value) => {
      if (value !== undefined) {
        user.nationality = value;
      }
    },
    
    personalDescription: (user, value: string) => {
      user.personalDescription = value?.trim() || undefined;
    },
    
    removePhoto: (user, value: boolean) => {
      if (value) {
        user.photo = undefined;
      }
    }
  };

  static updateFields(user: User, updateDto: UpdateUserRequestDto): void {
    Object.entries(updateDto)
      .filter(([_, value]) => value !== undefined)
      .forEach(([field, value]) => {
        const updater = this.fieldUpdaters[field];
        if (updater) {
          updater(user, value);
        }
      });
  }
}
