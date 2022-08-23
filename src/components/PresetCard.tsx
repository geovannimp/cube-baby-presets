import { useTranslation } from "next-i18next";
import Link from "next/link";
import { Preset } from "../services/presetService";
import { Button } from "./Button";

interface PresetCardProps {
  preset: Preset;
  modelName?: string;
}

export const PresetCard = ({ preset, modelName }: PresetCardProps) => {
  const { t } = useTranslation();
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

      <div className="flex items-center px-6 py-3 justify-between bg-gray-700">
        <h1 className="text-lg font-semibold text-white">{modelName}</h1>
        <Link href={`/presets/${preset.id}`}>
          <Button>{t("open-preset-button")}</Button>
        </Link>
      </div>
    </div>
  );
};
