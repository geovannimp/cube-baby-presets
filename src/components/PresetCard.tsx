import { cn } from "@/lib/utils";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { useMemo } from "react";
import { ArrowRightIcon, UserCircleIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Preset } from "../services/presetService";

interface PresetCardProps {
  preset: Preset;
  modelName?: string;
}

export const PresetCard = ({ preset, modelName }: PresetCardProps) => {
  const { t } = useTranslation();

  const modelColors = useMemo(() => {
    switch (preset.model_id) {
      case "cube-baby":
        return {
          background: "bg-neutral-900",
          text: "text-gray-100",
        };
      case "cube-baby-ac":
        return {
          background: "bg-amber-200",
          text: "text-gray-900",
        };
      case "cube-baby-bass":
        return {
          background: "bg-sky-900",
          text: "text-gray-100",
        };
      default:
        return {
          background: "bg-secondary",
          text: "text-secondary-foreground",
        };
    }
  }, [preset.model_id]);

  const description = preset.description?.trim();
  const username = preset.user?.username?.trim();

  return (
    <Card className="mx-auto h-full w-full max-w-sm overflow-hidden py-0">
      <CardContent className="flex flex-1 flex-col justify-between gap-4 px-6 pt-5 pb-4">
        <div className="flex min-w-0 flex-col gap-1.5">
          <CardTitle className="line-clamp-2 text-xl font-semibold text-card-foreground">
            {preset.name}
          </CardTitle>

          {description ? (
            <CardDescription className="line-clamp-3 text-sm leading-relaxed">
              {description}
            </CardDescription>
          ) : null}
        </div>

        {username ? (
          <Link
            href={`/profile/${preset.user_id}`}
            className="inline-flex min-h-9 max-w-full items-center gap-1.5 self-start rounded-md bg-secondary px-2.5 py-1.5 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-secondary/80 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <UserCircleIcon className="size-3.5 shrink-0" aria-hidden />
            <span className="truncate">{username}</span>
          </Link>
        ) : null}
      </CardContent>

      <CardFooter className="mt-auto p-0">
        <Link
          href={`/presets/${preset.id}`}
          className="group/preset-action flex w-full items-center justify-between gap-3 rounded-b-xl bg-muted/50 px-6 py-3 text-card-foreground transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none focus-visible:ring-inset"
        >
          <span
            className={cn(
              "min-w-0 truncate rounded-md px-2.5 py-1 text-sm font-semibold",
              modelColors.background,
              modelColors.text
            )}
          >
            {modelName ?? "\u00a0"}
          </span>
          <span className="inline-flex shrink-0 items-center gap-2.5 text-sm font-semibold text-foreground">
            {t("open-preset-button")}
            <ArrowRightIcon
              className="size-4 transition-transform duration-200 ease-out group-hover/preset-action:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover/preset-action:translate-x-0"
              aria-hidden
            />
          </span>
        </Link>
      </CardFooter>
    </Card>
  );
};
