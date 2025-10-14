import { ImageSourcePropType } from 'react-native';

export interface WhoAmICharacter {
  id: number;
  name: string;
  image: ImageSourcePropType;
}

export interface WhoAmICharacterPair {
  myCharacter: WhoAmICharacter;
  opponentCharacter: WhoAmICharacter;
}
