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
    "who-am-i": {
      ...AVALIABLE_MATCH_MODES["who-am-i"],
      title: i18n.t("match.matchModes.whoAmI"),
    },
  };
};
