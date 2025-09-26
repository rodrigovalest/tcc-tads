import { ImageSourcePropType } from "react-native";
import { MatchRateScore } from "../models/types/match-rate-score";

interface MatchRateInfo {
  defaultLevel?: string;
  i18nKeyLevel: string;
  defaultDescription?: string;
  i18nKeyDescription: string;
  image: ImageSourcePropType;
}

export const MATCH_RATE: Record<MatchRateScore, MatchRateInfo> = {
  1: {
    i18nKeyLevel: "match.rate.levels.1.title",
    i18nKeyDescription: "match.rate.levels.1.description",
    defaultLevel: "Beginner",
    defaultDescription: "Knows a few words, there is a lot to learn",
    image: require("../assets/images/match_rates/1.png"),
  },
  2: { 
    i18nKeyLevel: "match.rate.levels.2.title",
    i18nKeyDescription: "match.rate.levels.2.description",
    defaultLevel: "Elementary",
    defaultDescription: "Can communicate in simple situations, but struggles with more complex topics",
    image: require("../assets/images/match_rates/2.png"),
  },
  3: { 
    i18nKeyLevel: "match.rate.levels.3.title",
    i18nKeyDescription: "match.rate.levels.3.description",
    defaultLevel: "Elementary",
    defaultDescription: "Can communicate in simple situations, but struggles with more complex topics",
    image: require("../assets/images/match_rates/3.png"),
  },
  4: { 
    i18nKeyLevel: "match.rate.levels.4.title",
    i18nKeyDescription: "match.rate.levels.4.description",
    defaultLevel: "Elementary",
    defaultDescription: "Can communicate in simple situations, but struggles with more complex topics",
    image: require("../assets/images/match_rates/4.png"),
  },
  5: { 
    i18nKeyLevel: "match.rate.levels.5.title",
    i18nKeyDescription: "match.rate.levels.5.description",
    defaultLevel: "Elementary",
    defaultDescription: "Can communicate in simple situations, but struggles with more complex topics",
    image: require("../assets/images/match_rates/5.png"),
  },
}
