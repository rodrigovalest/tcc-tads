import { WhoAmICharacter } from '../models/types/who-am-i-character.interface';
import { MatchLanguage } from '../models/types/match-language.type';
import { getHintsForLanguage } from './who-am-i-hints';

export const WHO_AM_I_CHARACTERS_BASE = [
  {
    id: 1,
    name: "Cristiano Ronaldo",
    image: require("../assets/images/who_am_i_characters/whoami1.jpg"),
  },
  {
    id: 2,
    name: "Messi",
    image: require("../assets/images/who_am_i_characters/whoami2.jpg"),
  },
  {
    id: 3,
    name: "The Rock",
    image: require("../assets/images/who_am_i_characters/whoami3.jpg"),
  },
  {
    id: 4,
    name: "Elon Musk",
    image: require("../assets/images/who_am_i_characters/whoami4.jpg"),
  },
  {
    id: 5,
    name: "Mark Zuckerberg",
    image: require("../assets/images/who_am_i_characters/whoami5.jpg"),
  },
  {
    id: 6,
    name: "Leonardo di Caprio",
    image: require("../assets/images/who_am_i_characters/whoami6.jpg"),
  },
  {
    id: 7,
    name: "Donald Trump",
    image: require("../assets/images/who_am_i_characters/whoami7.jpg"),
  },
  {
    id: 8,
    name: "Barack Obama",
    image: require("../assets/images/who_am_i_characters/whoami8.jpg"),
  },
];

/**
 * Retorna os personagens com as dicas no idioma especificado
 */
export const getWhoAmICharacters = (language: MatchLanguage): WhoAmICharacter[] => {
  return WHO_AM_I_CHARACTERS_BASE.map(character => ({
    ...character,
    hints: getHintsForLanguage(character.id, language),
  }));
};

// Mantém compatibilidade com código existente (usa português como padrão)
export const WHO_AM_I_CHARACTERS: WhoAmICharacter[] = getWhoAmICharacters('pt');
