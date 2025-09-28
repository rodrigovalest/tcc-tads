import api from "../api";

const matchRateService = {
  submitRating: async (
    matchId: string,
    reviewedId: number,
    fluencyScore: number
  ): Promise<void> => {
    const response = await api.post<void>("/match-rate", {
      matchId,
      reviewedId,
      fluencyScore,
    });
    return response.data;
  }
}

export default matchRateService;
