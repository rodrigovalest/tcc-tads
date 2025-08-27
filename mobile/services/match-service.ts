import api from "../api";
import IMatchHistoryResponse from "../models/responses/match-history-response";

const matchService = {
  getMatchHistory: async (bearerToken: string): Promise<IMatchHistoryResponse[]>  => {
    const response = await api.get<IMatchHistoryResponse[]>("/matches",
      {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      }
    );
    
    return response.data;
  },
}

export default matchService;
