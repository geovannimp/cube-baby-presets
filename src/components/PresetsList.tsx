import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useTranslation } from "next-i18next";

import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { PresetCard } from "./PresetCard";
import { Preset } from "../services/presetService";
import { Model } from "../services/modelService";

type PresetsListProps = {
  presets: Preset[];
  models?: Model[];
  isLoading: boolean;
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  emptyTitle: string;
};

export const PresetsList = ({
  presets,
  models,
  isLoading,
  page,
  pageSize,
  totalCount,
  onPageChange,
  emptyTitle,
}: PresetsListProps) => {
  const { t } = useTranslation("presets");

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (!presets.length) {
    return (
      <Empty className="my-6 py-24">
        <EmptyTitle>{emptyTitle}</EmptyTitle>
        <EmptyDescription />
      </Empty>
    );
  }

  return (
    <>
      <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-3">
        {presets.map((preset) => (
          <PresetCard
            key={preset.id}
            preset={preset}
            modelName={
              models?.find((model) => model.id === preset.model_id)?.name
            }
          />
        ))}
      </div>

      {totalPages > 1 ? (
        <div className="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            {t("presets-list-pagination-status", {
              page: currentPage,
              totalPages,
              total: totalCount,
            })}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="min-h-9"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
            >
              <ChevronLeftIcon data-icon="inline-start" />
              {t("presets-list-pagination-previous")}
            </Button>
            <Button
              variant="outline"
              className="min-h-9"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
            >
              {t("presets-list-pagination-next")}
              <ChevronRightIcon data-icon="inline-end" />
            </Button>
          </div>
        </div>
      ) : null}
    </>
  );
};
