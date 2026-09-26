import { useQuery } from "@tanstack/react-query";
import { VoteService } from "../services/voteService";

export const useMyVote = (presetId?: number, userId?: string) => {
  return useQuery(
    ["preset-vote", presetId, userId],
    async () =>
      presetId && userId
        ? await VoteService.getUserVote(presetId, userId)
        : undefined,
    { enabled: !!presetId && !!userId }
  );
};
