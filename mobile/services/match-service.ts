import api from "../api";
import IMatchHistoryResponse from "../models/responses/match-history-response";

const matchService = {
  getMatchHistory: async (): Promise<IMatchHistoryResponse[]>  => {
    const response = await api.get<IMatchHistoryResponse[]>("/matches");
    return response.data;
  },
}

export default matchService;
