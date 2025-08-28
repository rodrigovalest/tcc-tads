import IMatchHistoryResponse from "@/models/responses/match-history-response";
import { useQuery } from "@tanstack/react-query";
import matchService from "../services/match-service";
import { ApiError } from "../api";

export function useMatchHistory() {
  return useQuery<IMatchHistoryResponse[], ApiError>({
    queryKey: ["matchHistory"],
    queryFn: () => matchService.getMatchHistory(),
  });
}
