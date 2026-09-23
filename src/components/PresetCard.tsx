import { cn } from "@/lib/utils";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { useMemo } from "react";
import { UserCircleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
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
          background: "bg-gray-700",
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
    }
  }, [preset.model_id]);

  return (
    <Card className="mx-auto w-full max-w-sm overflow-hidden py-0">
      <CardContent className="flex h-full flex-col justify-between px-6 pt-4 pb-3">
        <div className="flex flex-col">
          <h1 className="text-xl font-semibold text-card-foreground">
            {preset.name}
          </h1>

          <p className="my-2 line-clamp-3 text-sm text-muted-foreground">
            {preset.description}
          </p>
        </div>

        <Link
          href={`/profile/${preset.user_id}`}
          className="mt-2 inline-flex items-center self-start rounded-md bg-secondary px-2 py-0.5 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-secondary/80"
        >
          <UserCircleIcon data-icon="inline-start" />
          {preset.user.username}
        </Link>
      </CardContent>

      <CardFooter
        className={cn(
          "flex items-center justify-between px-6 py-3",
          modelColors?.background,
          modelColors?.text
        )}
      >
        <h1 className="text-lg font-semibold">{modelName}</h1>
        <Button
          className="px-6"
          nativeButton={false}
          render={<Link href={`/presets/${preset.id}`} />}
        >
          {t("open-preset-button")}
        </Button>
      </CardFooter>
    </Card>
  );
};
