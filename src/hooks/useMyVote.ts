import { useQuery } from "@tanstack/react-query";
import { VoteService } from "../services/voteService";

export const useMyVote = (presetId?: number, userId?: string) => {
  return useQuery({
    queryKey: ["preset-vote", presetId, userId],
    queryFn: async () =>
      presetId && userId
        ? await VoteService.getUserVote(presetId, userId)
        : undefined,
    enabled: !!presetId && !!userId,
  });
};
