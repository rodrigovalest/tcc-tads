import IMatchHistoryResponse from "@/models/responses/match-history-response";
import { useQuery } from "@tanstack/react-query";
import matchService from "../services/match-service";
import useAuthStore from "../store/auth-store";
import { ApiError } from "../api";

export function useMatchHistory() {
  const bearerToken = useAuthStore((s) => s.token);

  return useQuery<IMatchHistoryResponse[], ApiError>({
    queryKey: ["matchHistory", bearerToken],
    queryFn: () => matchService.getMatchHistory(bearerToken!),
  });
}
