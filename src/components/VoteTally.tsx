import { useTranslation } from "next-i18next";
import { ThumbsDownIcon, ThumbsUpIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type VoteTallyProps = {
  upCount: number;
  downCount: number;
  className?: string;
};

export const VoteTally = ({ upCount, downCount, className }: VoteTallyProps) => {
  const { t } = useTranslation();

  return (
    <span
      className={cn("inline-flex items-center gap-3 text-sm", className)}
      aria-label={t("vote-tally-aria", { upCount, downCount })}
    >
      <span
        className={cn(
          "inline-flex items-center gap-1",
          upCount > 0
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-muted-foreground"
        )}
      >
        <ThumbsUpIcon className="size-4" aria-hidden />
        <span className="font-semibold tabular-nums">{upCount}</span>
      </span>
      <span
        className={cn(
          "inline-flex items-center gap-1",
          downCount > 0 ? "text-destructive" : "text-muted-foreground"
        )}
      >
        <ThumbsDownIcon className="size-4" aria-hidden />
        <span className="font-semibold tabular-nums">{downCount}</span>
      </span>
    </span>
  );
};
