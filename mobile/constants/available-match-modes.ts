import IAvaliableMatchMode from "../models/interfaces/avaliable_match_mode";
import { MatchMode } from "../models/types/match-mode.type";
import { i18n } from "../lib/i18n";

export const AVALIABLE_MATCH_MODES: Record<MatchMode, IAvaliableMatchMode> = {
  "just-chilling": {
    title: "Just Chilling",
    matchFormat: ["duo"],
    matchMode: "just-chilling",
    image: require("../assets/images/match_modes/just-chilling.png"),
  },
  "word-builder": {
    title: "Word Builder",
    matchFormat: ["solo"],
    matchMode: "word-builder",
    image: require("../assets/images/match_modes/word-builder.png"),
  },
  "time-attack-vocab": {
    title: "Time Attack Vocab",
    matchFormat: ["solo"],
    matchMode: "time-attack-vocab",
    image: require("../assets/images/match_modes/time-attack-vocab.png"),
  },
  "guess-who": {
    title: "Guess Who",
    matchFormat: ["duo"],
    matchMode: "guess-who",
    image: require("../assets/images/match_modes/guess_who.png"),
  },
  "who-am-i": {
    title: "Who Am I",
    matchFormat: ["duo"],
    matchMode: "who-am-i",
    image: require("../assets/images/match_modes/who-am-i.png"),
  },
};

export const getLocalizedMatchModes = (): Record<
  MatchMode,
  IAvaliableMatchMode
> => {
  return {
    "just-chilling": {
      ...AVALIABLE_MATCH_MODES["just-chilling"],
      title: i18n.t("match.matchModes.justChilling"),
    },
    "word-builder": {
      ...AVALIABLE_MATCH_MODES["word-builder"],
      title: i18n.t("match.matchModes.wordBuilder"),
    },
    "time-attack-vocab": {
      ...AVALIABLE_MATCH_MODES["time-attack-vocab"],
      title: i18n.t("match.matchModes.timeAttackVocab"),
    },
    "who-am-i": {
      ...AVALIABLE_MATCH_MODES["who-am-i"],
      title: i18n.t("match.matchModes.whoAmI"),
    },
    "guess-who": {
      ...AVALIABLE_MATCH_MODES["guess-who"],
      title: i18n.t("match.matchModes.guessWho"),
    },
  };
};
