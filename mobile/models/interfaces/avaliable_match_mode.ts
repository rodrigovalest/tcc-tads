import { ImageSourcePropType } from "react-native";
import { MatchFormat } from "../types/match-format.type";
import { MatchMode } from "../types/match-mode.type";

export default interface IAvaliableMatchMode {
  title: string;
  matchMode: MatchMode
  matchFormat: MatchFormat[]
  image: ImageSourcePropType
}
