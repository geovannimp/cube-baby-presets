import { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useUser } from "@supabase/supabase-auth-helpers/react";
import { chain, unique } from "radash";

import { usePresets } from "../../hooks/usePresets";
import { useModels } from "../../hooks/useModels";
import { Header } from "../../components/Header";
import { Container } from "../../components/Container";
import { Button } from "../../components/Button";
import LoadingDots from "../../components/LoadingDots";
import { PresetCard } from "../../components/PresetCard";
import { Input } from "../../components/Input";
import { ChangeEventHandler, useMemo } from "react";
import { Select } from "../../components/Select";
import { Preset } from "../../services/presetService";
import { usePresetsFilters } from "../../hooks/usePresetsFilters";

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

  const handleSearchChange: ChangeEventHandler<HTMLInputElement> = (e) =>
    setFilter((current) => ({ ...current, search: e.target.value }));

  const handleModelChange = (modelId: string) =>
    setFilter((current) => ({ ...current, modelId }));

  const handleUserChange = (userId: string) =>
    setFilter((current) => ({ ...current, userId }));

  return (
    <>
      <Head>
        <title>Cube Baby Presets - Presets</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <Container className="gap-4 my-8">
        <div className="flex flex-row justify-between items-center">
          <p className="font-bold text-2xl">{t("presets-list-title")}</p>
          {user && (
            <Link href="/presets/new">
              <Button>
                <span>{t("presets-list-button")}</span>
              </Button>
            </Link>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <Input
            label={t("presets-list-search-filter")}
            onChange={handleSearchChange}
            placeholder={t("presets-list-search-filter-placeholder")}
          />
          <Select
            className="w-full md:w-1/4 z-20"
            label={t("presets-list-model-filter")}
            options={[
              { name: t("presets-list-model-filter-all"), id: "all" },
              ...(models ?? []),
            ]}
            extractLabel={(model) => model.name}
            extractValue={(model) => model.id}
            value={filter.modelId}
            onChange={handleModelChange}
          />
          <Select
            className="w-full md:w-1/4"
            label={t("presets-list-user-filter")}
            options={[
              { username: t("presets-list-user-filter-all"), id: "all" },
              ...(users ?? []),
            ]}
            extractLabel={(user) => user.username}
            extractValue={(user) => user.id}
            value={filter.userId}
            onChange={handleUserChange}
          />
        </div>

        {isLoading ? (
          <LoadingDots />
        ) : filteredPresets?.length ? (
          <div className="mt-4 grid gap-6 md:grid-cols-3 grid-cols-1">
            {filteredPresets?.map((preset) => (
              <PresetCard
                key={preset.id}
                preset={preset}
                modelName={
                  models?.find((model) => model.id === preset.model_id)?.name
                }
              />
            ))}
          </div>
        ) : (
          <p className="text-center font-bold text-lg my-6 py-24 border-dashed border-2 rounded w-full">
            {t("presets-list-empty")}
          </p>
        )}
      </Container>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: await serverSideTranslations(locale!, ["common", "presets"]),
});

export default Presets;
