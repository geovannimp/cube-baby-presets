import Link from "next/link";
import { useTranslation } from "next-i18next";
import { SearchXIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export const PresetNotFound = () => {
  const { t } = useTranslation();

  return (
    <Empty className="my-6 py-24">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SearchXIcon />
        </EmptyMedia>
        <EmptyTitle>{t("preset-not-found-title")}</EmptyTitle>
        <EmptyDescription>
          {t("preset-not-found-description")}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/presets" />}
        >
          {t("preset-not-found-back-button")}
        </Button>
      </EmptyContent>
    </Empty>
  );
};
