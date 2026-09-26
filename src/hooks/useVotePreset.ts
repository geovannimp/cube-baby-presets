import { useMutation } from "@tanstack/react-query";
import { VoteService } from "../services/voteService";
import { queryClient } from "../utils/queryClient";

// Votes feed the denormalised tallies on `presets`, so both the voter's own vote
// (`["preset-vote", presetId, userId]`) and every preset list showing the
// counts have to be refetched.
const invalidateVotes = () => {
  void queryClient.invalidateQueries(["preset-vote"]);
  void queryClient.invalidateQueries(["presets"]);
};

export const useVotePreset = () => {
  const { mutate: vote, isLoading: isVoting } = useMutation(
    VoteService.votePreset,
    { onSuccess: invalidateVotes }
  );

  const { mutate: remove, isLoading: isRemoving } = useMutation(
    VoteService.removeVote,
    { onSuccess: invalidateVotes }
  );

  return { vote, remove, isPending: isVoting || isRemoving };
};
