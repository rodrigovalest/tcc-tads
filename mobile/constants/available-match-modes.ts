import IAvaliableMatchMode from "../models/interfaces/avaliable_match_mode";
import { MatchMode } from "../models/types/match-mode.type";

export const AVALIABLE_MATCH_MODES: Record<MatchMode, IAvaliableMatchMode> = {
  "just-chilling": {
    title: 'Just Chilling',
    matchFormat: ['duo'],
    matchMode: 'just-chilling',
    image: require('../assets/images/match_modes/just-chilling.png'),
  },
};
