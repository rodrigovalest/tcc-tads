import { WhoAmICharacter } from '../models/types/who-am-i-character.interface';
import { WHO_AM_I_HINTS } from './who-am-i-hints';

export const WHO_AM_I_CHARACTERS: WhoAmICharacter[] = [
  {
    id: 1,
    name: "Cristiano Ronaldo",
    image: require("../assets/images/who_am_i_characters/whoami1.jpg"),
    hints: WHO_AM_I_HINTS[1],
  },
  {
    id: 2,
    name: "Messi",
    image: require("../assets/images/who_am_i_characters/whoami2.jpg"),
    hints: WHO_AM_I_HINTS[2],
  },
  {
    id: 3,
    name: "The Rock",
    image: require("../assets/images/who_am_i_characters/whoami3.jpg"),
    hints: WHO_AM_I_HINTS[3],
  },
  {
    id: 4,
    name: "Elon Musk",
    image: require("../assets/images/who_am_i_characters/whoami4.jpg"),
    hints: WHO_AM_I_HINTS[4],
  },
  {
    id: 5,
    name: "Mark Zuckerberg",
    image: require("../assets/images/who_am_i_characters/whoami5.jpg"),
    hints: WHO_AM_I_HINTS[5],
  },
  {
    id: 6,
    name: "Leonardo di Caprio",
    image: require("../assets/images/who_am_i_characters/whoami6.jpg"),
    hints: WHO_AM_I_HINTS[6],
  },
  {
    id: 7,
    name: "Donald Trump",
    image: require("../assets/images/who_am_i_characters/whoami7.jpg"),
    hints: WHO_AM_I_HINTS[7],
  },
  {
    id: 8,
    name: "Barack Obama",
    image: require("../assets/images/who_am_i_characters/whoami8.jpg"),
    hints: WHO_AM_I_HINTS[8],
  },
];
