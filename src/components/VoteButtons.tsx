import { useTranslation } from "next-i18next";
import { ThumbsDownIcon, ThumbsUpIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { cn } from "@/lib/utils";
import { DISLIKE, LIKE, type VoteValue } from "../services/voteService";

type VoteButtonsProps = {
  /** The current user's vote, 0 when they have not voted. */
  value: number;
  upCount: number;
  downCount: number;
  onVote: (value: VoteValue) => void;
  onClear: () => void;
  disabled?: boolean;
  className?: string;
};

const OPTIONS = [
  {
    value: LIKE,
    labelKey: "vote-button-like",
    icon: ThumbsUpIcon,
    activeClassName:
      "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  },
  {
    value: DISLIKE,
    labelKey: "vote-button-dislike",
    icon: ThumbsDownIcon,
    activeClassName: "bg-destructive/10 text-destructive",
  },
] as const;

export const VoteButtons = ({
  value,
  upCount,
  downCount,
  onVote,
  onClear,
  disabled,
  className,
}: VoteButtonsProps) => {
  const { t } = useTranslation();

  return (
    <ButtonGroup className={className} aria-label={t("vote-group-aria")}>
      {OPTIONS.map(
        ({ value: option, labelKey, icon: Icon, activeClassName }) => {
          const count = option === LIKE ? upCount : downCount;
          const isActive = value === option;

          return (
            <Button
              key={option}
              // Renders inside the preset form on the preset page: never submit.
              type="button"
              variant="outline"
              aria-pressed={isActive}
              aria-label={`${t(labelKey)} (${count})`}
              title={t("vote-toggle-hint")}
              disabled={disabled}
              // Voting the same way twice clears the vote.
              onClick={() => (isActive ? onClear() : onVote(option))}
              className={cn(
                "tabular-nums",
                isActive && activeClassName
              )}
            >
              <Icon data-icon="inline-start" />
              {count}
            </Button>
          );
        }
      )}
    </ButtonGroup>
  );
};
