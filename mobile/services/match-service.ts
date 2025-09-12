import api from "../api";
import IMatchHistoryResponse from "../models/responses/match-history-response";
import { MatchMode } from "../models/types/match-mode.type";
import { MatchLanguage } from "../models/types/match-language.type";
import ICreateSoloMatchResponse from "../models/responses/create-solo-match-response";
import ICompleteSoloMatchResponse from "../models/responses/complete-solo-match-response";

const matchService = {
  getMatchHistory: async (): Promise<IMatchHistoryResponse[]> => {
    const response = await api.get<IMatchHistoryResponse[]>("/matches");
    return response.data;
  },

  createSoloMatch: async (
    mode: MatchMode,
    language: MatchLanguage
  ): Promise<ICreateSoloMatchResponse> => {
    const response = await api.post<ICreateSoloMatchResponse>("/matches/solo", {
      mode,
      language,
    });
    return response.data;
  },

  completeSoloMatch: async (
    matchId: string
  ): Promise<ICompleteSoloMatchResponse> => {
    const response = await api.post<ICompleteSoloMatchResponse>(
      `/matches/${matchId}/complete`
    );
    return response.data;
  },
};

export default matchService;
