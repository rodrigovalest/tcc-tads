import api from "../api";
import IMatchHistoryResponse from "../models/responses/match-history-response";
import { MatchMode } from "../models/types/match-mode.type";
import { MatchLanguage } from "../models/types/match-language.type";

interface CreateSoloMatchResponse {
  matchId: string;
}

interface CompleteSoloMatchResponse {
  success: boolean;
}

const matchService = {
  getMatchHistory: async (): Promise<IMatchHistoryResponse[]> => {
    const response = await api.get<IMatchHistoryResponse[]>("/matches");
    return response.data;
  },

  createSoloMatch: async (
    mode: MatchMode,
    language: MatchLanguage
  ): Promise<CreateSoloMatchResponse> => {
    const response = await api.post<CreateSoloMatchResponse>("/matches/solo", {
      mode,
      language,
    });
    return response.data;
  },

  completeSoloMatch: async (
    matchId: string
  ): Promise<CompleteSoloMatchResponse> => {
    const response = await api.post<CompleteSoloMatchResponse>(
      `/matches/${matchId}/complete`
    );
    return response.data;
  },
};

export default matchService;
