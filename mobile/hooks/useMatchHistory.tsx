import IMatchHistoryResponse from "@/models/responses/match-history-response";
import { useInfiniteQuery } from "@tanstack/react-query";
import matchService from "../services/match-service";
import { ApiError } from "../api";

export function useMatchHistory(limit = 2) {
  return useInfiniteQuery<IMatchHistoryResponse, ApiError>({
    queryKey: ["matches"],
    queryFn: ({ pageParam = 1 }) => matchService.getMatchHistory(pageParam, limit),
    getNextPageParam: (lastPage) => {
      const totalPages = Math.ceil(lastPage.total / limit);
      return lastPage.page < totalPages ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
  });
}
