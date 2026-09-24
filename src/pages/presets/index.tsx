import { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useUser } from "../../hooks/useUser";
import { chain, unique } from "radash";
import { parseAsInteger, useQueryState } from "nuqs";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { usePresets } from "../../hooks/usePresets";
import { useModels } from "../../hooks/useModels";
import { Header } from "../../components/Header";
import { Container } from "../../components/Container";
import { PresetCard } from "../../components/PresetCard";
import { ChangeEventHandler, useMemo } from "react";
import { Preset } from "../../services/presetService";
import { usePresetsFilters } from "../../hooks/usePresetsFilters";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";

const PAGE_SIZE = 48;

const filterWithSearch = (search: string) => (presets?: Preset[]) =>
  search
    ? presets?.filter((preset) =>
        (preset.name + preset.description).toLowerCase().includes(search)
      )
    : presets;

const filterWithModel = (modelId: string) => (presets?: Preset[]) =>
  modelId !== "all"
    ? presets?.filter((preset) => preset.model_id === modelId)
    : presets;

const filterWithUser = (userId: string) => (presets?: Preset[]) =>
  userId !== "all"
    ? presets?.filter((preset) => preset.user_id === userId)
    : presets;

const Presets: NextPage = () => {
  const { t } = useTranslation("presets");
  const { user } = useUser();
  const { data: presets, isLoading: isLoadingPresets } = usePresets();
  const { data: models, isLoading: isLoadingModels } = useModels();

  const { filter, setFilter } = usePresetsFilters();
  const [page, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({ clearOnDefault: true })
  );

  const isLoading = isLoadingPresets || isLoadingModels;

  const users = useMemo(
    () =>
      unique(presets?.map((preset) => preset.user) ?? [], (user) => user.id),
    [presets]
  );

  const filteredPresets = useMemo(
    () =>
      chain(
        filterWithSearch(filter.search),
        filterWithModel(filter.modelId),
        filterWithUser(filter.userId)
      )(presets) as Preset[] | undefined,
    [filter, presets]
  );

  const totalPages = Math.max(
    1,
    Math.ceil((filteredPresets?.length ?? 0) / PAGE_SIZE)
  );
  const currentPage = Math.min(Math.max(page, 1), totalPages);

  const pagedPresets = useMemo(() => {
    if (!filteredPresets?.length) return [];
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredPresets.slice(start, start + PAGE_SIZE);
  }, [filteredPresets, currentPage]);

  const resetPage = () => {
    void setPage(null);
  };

  const handleSearchChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setFilter((current) => ({ ...current, search: e.target.value }));
    resetPage();
  };

  const handleModelChange = (modelId: string | null) => {
    if (modelId) {
      setFilter((current) => ({ ...current, modelId }));
      resetPage();
    }
  };

  const handleUserChange = (userId: string | null) => {
    if (userId) {
      setFilter((current) => ({ ...current, userId }));
      resetPage();
    }
  };

  return (
    <>
      <Head>
        <title>Cube Baby Presets - Presets</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <Container className="my-8 gap-4">
        <div className="flex flex-row items-center justify-between">
          <p className="text-2xl font-bold">{t("presets-list-title")}</p>
          {user && (
            <Button nativeButton={false} render={<Link href="/presets/new" />}>
              {t("presets-list-button")}
            </Button>
          )}
        </div>

        <div className="flex flex-col gap-4 md:flex-row">
          <Field className="flex-1">
            <FieldLabel htmlFor="presets-search">
              {t("presets-list-search-filter")}
            </FieldLabel>
            <Input
              id="presets-search"
              onChange={handleSearchChange}
              placeholder={t("presets-list-search-filter-placeholder")}
              defaultValue={filter.search}
            />
          </Field>
          <Field className="w-full md:w-1/4">
            <FieldLabel>{t("presets-list-model-filter")}</FieldLabel>
            <Select value={filter.modelId} onValueChange={handleModelChange}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">
                    {t("presets-list-model-filter-all")}
                  </SelectItem>
                  {models?.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Field className="w-full md:w-1/4">
            <FieldLabel>{t("presets-list-user-filter")}</FieldLabel>
            <Select value={filter.userId} onValueChange={handleUserChange}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">
                    {t("presets-list-user-filter-all")}
                  </SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.username}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner className="size-8" />
          </div>
        ) : filteredPresets?.length ? (
          <>
            <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-3">
              {pagedPresets.map((preset) => (
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
                    total: filteredPresets.length,
                  })}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="min-h-9"
                    disabled={currentPage <= 1}
                    onClick={() =>
                      void setPage(currentPage - 1 <= 1 ? null : currentPage - 1)
                    }
                  >
                    <ChevronLeftIcon data-icon="inline-start" />
                    {t("presets-list-pagination-previous")}
                  </Button>
                  <Button
                    variant="outline"
                    className="min-h-9"
                    disabled={currentPage >= totalPages}
                    onClick={() => void setPage(currentPage + 1)}
                  >
                    {t("presets-list-pagination-next")}
                    <ChevronRightIcon data-icon="inline-end" />
                  </Button>
                </div>
              </div>
            ) : null}
          </>
        ) : (
          <Empty className="my-6 py-24">
            <EmptyTitle>{t("presets-list-empty")}</EmptyTitle>
            <EmptyDescription />
          </Empty>
        )}
      </Container>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: await serverSideTranslations(locale!, ["common", "presets"]),
});

export default Presets;
