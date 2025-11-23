import api from "../api";
import IMatchHistoryResponse from "../models/responses/match-history-response";
import { MatchMode } from "../models/types/match-mode.type";
import { MatchLanguage } from "../models/types/match-language.type";
import ICreateSoloMatchResponse from "../models/responses/create-solo-match-response";
import ICompleteSoloMatchResponse from "../models/responses/complete-solo-match-response";

const matchService = {
  getMatchHistory: async (
    page: number | unknown = 1,
    limit: number | unknown = 10
  ): Promise<IMatchHistoryResponse> => {
    const response = await api.get<IMatchHistoryResponse>("/matches", {
      params: { page, limit },
    });
    let data = response.data as any;

    if (Array.isArray(data)) {
      data = {
        data,
        total: data.length,
        page: Number(page) || 1,
        limit: Number(limit) || data.length,
      } satisfies IMatchHistoryResponse;
    } else if (!("page" in data) || !("total" in data) || !("limit" in data)) {
      data = {
        data: data.data ?? [],
        total: data.data?.length ?? 0,
        page: Number(page) || 1,
        limit: Number(limit) || (data.data?.length ?? 0),
      } satisfies IMatchHistoryResponse;
    }

    try {
      console.log(
        `[matchService] normalized history page=${data.page} limit=${data.limit} items=${data.data.length} total=${data.total}`
      );
    } catch {}

    return data as IMatchHistoryResponse;
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
