import { useMutation } from "@tanstack/react-query";
import { VoteService } from "../services/voteService";
import { queryClient } from "../utils/queryClient";

// Votes feed the denormalised tallies on `presets`, so both the voter's own vote
// (`["preset-vote", presetId, userId]`) and every preset list showing the
// counts have to be refetched.
const invalidateVotes = () => {
  void queryClient.invalidateQueries({ queryKey: ["preset-vote"] });
  void queryClient.invalidateQueries({ queryKey: ["presets"] });
};

export const useVotePreset = () => {
  const { mutate: vote, isPending: isVoting } = useMutation({
    mutationFn: VoteService.votePreset,
    onSuccess: invalidateVotes,
  });

  const { mutate: remove, isPending: isRemoving } = useMutation({
    mutationFn: VoteService.removeVote,
    onSuccess: invalidateVotes,
  });

  return { vote, remove, isPending: isVoting || isRemoving };
};
