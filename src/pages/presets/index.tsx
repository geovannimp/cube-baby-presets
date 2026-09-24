import { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useUser } from "../../hooks/useUser";
import { chain } from "radash";
import {
  debounce,
  parseAsInteger,
  parseAsString,
  useQueryStates,
} from "nuqs";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { usePresets } from "../../hooks/usePresets";
import { useModels } from "../../hooks/useModels";
import { Header } from "../../components/Header";
import { Container } from "../../components/Container";
import { PresetCard } from "../../components/PresetCard";
import { ChangeEventHandler, useMemo } from "react";
import { Preset } from "../../services/presetService";
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

  const isLoading = isLoadingPresets || isLoadingModels;

  const users = useMemo(() => {
    const byId = new Map<string, { id: string; username: string }>();

    for (const preset of presets ?? []) {
      if (!preset.user_id || byId.has(preset.user_id)) continue;

      const profile = Array.isArray(preset.user) ? preset.user[0] : preset.user;

      byId.set(preset.user_id, {
        id: preset.user_id,
        username: profile?.username?.trim() || preset.user_id,
      });
    }

    return [...byId.values()];
  }, [presets]);

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
      ...users.map((user) => ({
        value: user.id,
        label: user.username,
      })),
    ],
    [users, t]
  );

  const filteredPresets = useMemo(
    () =>
      chain(
        filterWithSearch(search),
        filterWithModel(modelId),
        filterWithUser(userId)
      )(presets) as Preset[] | undefined,
    [search, modelId, userId, presets]
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

  const handleSearchChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    void setQuery({
      search: e.target.value || null,
      page: null,
    });
  };

  const handleModelChange = (nextModelId: string | null) => {
    if (!nextModelId) return;
    void setQuery({
      modelId: nextModelId === "all" ? null : nextModelId,
      page: null,
    });
  };

  const handleUserChange = (nextUserId: string | null) => {
    if (!nextUserId) return;
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
                      void setQuery({
                        page:
                          currentPage - 1 <= 1 ? null : currentPage - 1,
                      })
                    }
                  >
                    <ChevronLeftIcon data-icon="inline-start" />
                    {t("presets-list-pagination-previous")}
                  </Button>
                  <Button
                    variant="outline"
                    className="min-h-9"
                    disabled={currentPage >= totalPages}
                    onClick={() => void setQuery({ page: currentPage + 1 })}
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
