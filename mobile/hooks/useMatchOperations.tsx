import { useMutation, useQueryClient } from "@tanstack/react-query";
import matchService from "../services/match-service";
import { MatchMode } from "../models/types/match-mode.type";
import { MatchLanguage } from "../models/types/match-language.type";

export function useCreateSoloMatch() {
  return useMutation({
    mutationFn: ({
      mode,
      language,
    }: {
      mode: MatchMode;
      language: MatchLanguage;
    }) => matchService.createSoloMatch(mode, language),
  });
}

export function useCompleteSoloMatch() {
  return useMutation({
    mutationFn: (matchId: string) => matchService.completeSoloMatch(matchId),
  });
}
