import { useMutation } from "@tanstack/react-query";
import matchRateService from "../services/match-rate-service";

export function useMatchRate() {
  return useMutation<void, Error, { matchId: string; reviewedId: number; fluencyScore: number }>({
    mutationFn: async ({ matchId, reviewedId, fluencyScore }) => {
      return matchRateService.submitRating(matchId, reviewedId, fluencyScore);
    }
  });
}
