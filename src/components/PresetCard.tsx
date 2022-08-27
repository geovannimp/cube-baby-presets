import clsx from "clsx";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { useMemo } from "react";
import { Preset } from "../services/presetService";
import { Button } from "./Button";

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
    <div
      key={preset.id}
      className="flex flex-col justify-between max-w-sm mx-auto overflow-hidden bg-white rounded-lg shadow-lg dark:bg-gray-800 w-full"
    >
      <div className="px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
          {preset.name}
        </h1>

        <p className="my-2 text-sm text-gray-700 dark:text-gray-400 line-clamp-3">
          {preset.description}
        </p>
      </div>

      <div
        className={clsx(
          "flex items-center px-6 py-3 justify-between",
          modelColors?.background,
          modelColors?.text
        )}
      >
        <h1 className="text-lg font-semibold">{modelName}</h1>
        <Link href={`/presets/${preset.id}`}>
          <Button>{t("open-preset-button")}</Button>
        </Link>
      </div>
    </div>
  );
};
