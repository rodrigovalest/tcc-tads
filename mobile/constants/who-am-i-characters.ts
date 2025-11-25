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
  {
    id: 9,
    name: "Taylor Swift",
    image: require("../assets/images/who_am_i_characters/whoami9.png"),
  },
  {
    id: 10,
    name: "Michael Jackson",
    image: require("../assets/images/who_am_i_characters/whoami10.png"),
  },
  {
    id: 11,
    name: "Will Smith",
    image: require("../assets/images/who_am_i_characters/whoami11.png"),
  },
  {
    id: 12,
    name: "Albert Einstein",
    image: require("../assets/images/who_am_i_characters/whoami12.png"),
  },
  {
    id: 13,
    name: "Marie Curie",
    image: require("../assets/images/who_am_i_characters/whoami13.png"),
  },
  {
    id: 14,
    name: "Steve Jobs",
    image: require("../assets/images/who_am_i_characters/whoami14.png"),
  },
  {
    id: 15,
    name: "Alan Turing",
    image: require("../assets/images/who_am_i_characters/whoami15.png"),
  },
  {
    id: 16,
    name: "Neymar Jr",
    image: require("../assets/images/who_am_i_characters/whoami16.png"),
  },
  {
    id: 17,
    name: "Serena Williams",
    image: require("../assets/images/who_am_i_characters/whoami17.png"),
  },
  {
    id: 18,
    name: "Usain Bolt",
    image: require("../assets/images/who_am_i_characters/whoami18.png"),
  },
  {
    id: 19,
    name: "Tom Cruise",
    image: require("../assets/images/who_am_i_characters/whoami19.png"),
  },
  {
    id: 20,
    name: "Michael Jordan",
    image: require("../assets/images/who_am_i_characters/whoami20.png"),
  },
  {
    id: 21,
    name: "Paul McCartney",
    image: require("../assets/images/who_am_i_characters/whoami21.png"),
  },
  {
    id: 22,
    name: "Oprah",
    image: require("../assets/images/who_am_i_characters/whoami22.png"),
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
