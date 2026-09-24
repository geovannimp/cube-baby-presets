import { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useUser } from "../../hooks/useUser";
import {
  debounce,
  parseAsInteger,
  parseAsString,
  useQueryStates,
} from "nuqs";
import { ChangeEventHandler, useMemo, useState } from "react";

import { usePresets } from "../../hooks/usePresets";
import { usePresetAuthors } from "../../hooks/usePresetAuthors";
import { useModels } from "../../hooks/useModels";
import { Header } from "../../components/Header";
import { Container } from "../../components/Container";
import { PresetsList } from "../../components/PresetsList";
import { Button } from "@/components/ui/button";
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
import { DEFAULT_PRESETS_PAGE_SIZE } from "../../services/presetService";

const Presets: NextPage = () => {
  const { t } = useTranslation("presets");
  const { user } = useUser();
  const { data: models, isLoading: isLoadingModels } = useModels();
  const { data: authors, isLoading: isLoadingAuthors } = usePresetAuthors();
  const [asOf, setAsOf] = useState(() => new Date().toISOString());

  const [{ search, modelId, userId, page }, setQuery] = useQueryStates({
    search: parseAsString.withDefault("").withOptions({
      clearOnDefault: true,
      limitUrlUpdates: debounce(300),
    }),
    modelId: parseAsString.withDefault("all").withOptions({
      clearOnDefault: true,
    }),
    userId: parseAsString.withDefault("all").withOptions({
      clearOnDefault: true,
    }),
    page: parseAsInteger.withDefault(1).withOptions({ clearOnDefault: true }),
  });

  const presetsQuery = useMemo(
    () => ({
      search: search || undefined,
      modelId: modelId === "all" ? undefined : modelId,
      userId: userId === "all" ? undefined : userId,
      page,
      pageSize: DEFAULT_PRESETS_PAGE_SIZE,
      asOf,
    }),
    [search, modelId, userId, page, asOf]
  );

  const { data, isLoading: isLoadingPresets } = usePresets(presetsQuery);

  const isLoading = isLoadingPresets || isLoadingModels || isLoadingAuthors;

  const modelSelectItems = useMemo(
    () => [
      { value: "all", label: t("presets-list-model-filter-all") },
      ...(models?.map((model) => ({
        value: model.id,
        label: model.name,
      })) ?? []),
    ],
    [models, t]
  );

  const userSelectItems = useMemo(
    () => [
      { value: "all", label: t("presets-list-user-filter-all") },
      ...(authors?.map((author) => ({
        value: author.id,
        label: author.username,
      })) ?? []),
    ],
    [authors, t]
  );

  const handleSearchChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setAsOf(new Date().toISOString());
    void setQuery({
      search: e.target.value || null,
      page: null,
    });
  };

  const handleModelChange = (nextModelId: string | null) => {
    if (!nextModelId) return;
    setAsOf(new Date().toISOString());
    void setQuery({
      modelId: nextModelId === "all" ? null : nextModelId,
      page: null,
    });
  };

  const handleUserChange = (nextUserId: string | null) => {
    if (!nextUserId) return;
    setAsOf(new Date().toISOString());
    void setQuery({
      userId: nextUserId === "all" ? null : nextUserId,
      page: null,
    });
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
              value={search}
              onChange={handleSearchChange}
              placeholder={t("presets-list-search-filter-placeholder")}
            />
          </Field>
          <Field className="w-full md:w-1/4">
            <FieldLabel>{t("presets-list-model-filter")}</FieldLabel>
            <Select
              items={modelSelectItems}
              value={modelId}
              onValueChange={handleModelChange}
            >
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
            <Select
              items={userSelectItems}
              value={userId}
              onValueChange={handleUserChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">
                    {t("presets-list-user-filter-all")}
                  </SelectItem>
                  {authors?.map((author) => (
                    <SelectItem key={author.id} value={author.id}>
                      {author.username}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        </div>

        <PresetsList
          presets={data?.presets ?? []}
          models={models}
          isLoading={isLoading}
          page={page}
          pageSize={DEFAULT_PRESETS_PAGE_SIZE}
          totalCount={data?.totalCount ?? 0}
          emptyTitle={t("presets-list-empty")}
          onPageChange={(nextPage) =>
            void setQuery({ page: nextPage <= 1 ? null : nextPage })
          }
        />
      </Container>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: await serverSideTranslations(locale!, ["common", "presets"]),
});

export default Presets;
