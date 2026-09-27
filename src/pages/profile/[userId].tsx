import { useMemo, useState } from "react";
import { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { HeartIcon, UserCircleIcon } from "lucide-react";
import {
  parseAsInteger,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";

import { Header } from "../../components/Header";
import { Container } from "../../components/Container";
import { PresetsList } from "../../components/PresetsList";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { usePresets } from "../../hooks/usePresets";
import { useModels } from "../../hooks/useModels";
import { useUser } from "../../hooks/useUser";
import nextI18nextConfig from "../../../next-i18next.config";
import { useProfile } from "../../hooks/useProfile";
import { DEFAULT_PRESETS_PAGE_SIZE } from "../../services/presetService";

const Profile: NextPage = () => {
  const { t } = useTranslation("profile");
  const router = useRouter();
  const { userId } = router.query;
  const resolvedUserId = typeof userId === "string" ? userId : undefined;
  const [asOf, setAsOf] = useState(() => new Date().toISOString());

  // `tab` is part of the URL so the liked list is linkable from the user menu
  // and survives a reload or a shared link.
  const [{ tab, page }, setQuery] = useQueryStates({
    tab: parseAsStringLiteral(["presets", "liked"])
      .withDefault("presets")
      .withOptions({ clearOnDefault: true }),
    page: parseAsInteger.withDefault(1).withOptions({ clearOnDefault: true }),
  });

  // Each tab only fetches its own slice: the liked list is a different query,
  // and keeping them separate lets each tab show its own empty state.
  const presetsOptions = useMemo(
    () =>
      resolvedUserId && tab === "presets"
        ? {
            userId: resolvedUserId,
            page,
            pageSize: DEFAULT_PRESETS_PAGE_SIZE,
            asOf,
          }
        : undefined,
    [resolvedUserId, tab, page, asOf]
  );

  const likedOptions = useMemo(
    () =>
      resolvedUserId && tab === "liked"
        ? {
            likedByUserId: resolvedUserId,
            page,
            pageSize: DEFAULT_PRESETS_PAGE_SIZE,
            asOf,
          }
        : undefined,
    [resolvedUserId, tab, page, asOf]
  );

  const {
    data: presetsData,
    isLoading: isLoadingPresets,
    isPlaceholderData: isPlaceholderDataPresets,
  } = usePresets(presetsOptions, { enabled: Boolean(presetsOptions) });
  const {
    data: likedData,
    isLoading: isLoadingLiked,
    isPlaceholderData: isPlaceholderDataLiked,
  } = usePresets(likedOptions, { enabled: Boolean(likedOptions) });
  const { data: models, isLoading: isLoadingModels } = useModels();
  const { data: profile } = useProfile(resolvedUserId);
  const { user } = useUser();

  // The "New preset" action only belongs on your own profile.
  const isOwnProfile = Boolean(user?.id && user.id === resolvedUserId);

  // Only the active tab's query is enabled, so the inactive one is idle and
  // contributes nothing to the loading state.
  const isLoading =
    isLoadingModels ||
    (tab === "liked"
      ? isLoadingLiked || isPlaceholderDataLiked
      : isLoadingPresets || isPlaceholderDataPresets);

  const handleTabChange = (nextTab: string | null) => {
    if (nextTab !== "presets" && nextTab !== "liked") return;
    setAsOf(new Date().toISOString());
    // Page 1 belongs to the previous tab, so drop it when switching.
    void setQuery({ tab: nextTab === "presets" ? null : nextTab, page: null });
  };

  const onPageChange = (nextPage: number) => {
    setAsOf(new Date().toISOString());
    void setQuery({ page: nextPage <= 1 ? null : nextPage });
  };

  // On your own profile the wording stays personal, matching what the old
  // account page said.
  const presetsListTitle = isOwnProfile
    ? t("presets-list-title-own")
    : t("presets-list-title");
  const presetsListEmpty = isOwnProfile
    ? t("presets-list-empty-own")
    : t("presets-list-empty");

  return (
    <>
      <Head>
        <title>
          {profile?.username
            ? `Cube Baby Presets - ${profile.username}`
            : "Cube Baby Presets - Profile"}
        </title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <div className="flex w-full justify-center bg-muted">
        <Container className="my-8 flex-col items-center justify-center gap-4 md:flex-row md:items-center md:justify-start">
          <UserCircleIcon className="size-12" />
          <p className="text-xl font-bold">{profile?.username}</p>
        </Container>
      </div>

      <Container className="my-8 gap-4">
        <Tabs
          value={tab}
          onValueChange={handleTabChange}
          className="gap-6"
        >
          <TabsList variant="line">
            <TabsTrigger value="presets">
              <UserCircleIcon data-icon="inline-start" />
              {t("tab-presets")}
            </TabsTrigger>
            <TabsTrigger value="liked">
              <HeartIcon data-icon="inline-start" />
              {t("tab-liked")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="presets" className="flex flex-col gap-4">
            <div className="flex flex-row items-center justify-between gap-3">
              <p className="text-2xl font-bold">{presetsListTitle}</p>
              {isOwnProfile ? (
                <Button
                  nativeButton={false}
                  render={<Link href="/presets/new" />}
                >
                  {t("presets-list-button")}
                </Button>
              ) : null}
            </div>

            <PresetsList
              presets={presetsData?.presets ?? []}
              models={models}
              isLoading={isLoading}
              page={page}
              pageSize={DEFAULT_PRESETS_PAGE_SIZE}
              totalCount={presetsData?.totalCount ?? 0}
              emptyTitle={presetsListEmpty}
              onPageChange={onPageChange}
            />
          </TabsContent>

          <TabsContent value="liked" className="flex flex-col gap-4">
            <div className="flex flex-row items-center justify-between">
              <p className="text-2xl font-bold">{t("liked-list-title")}</p>
            </div>

            <PresetsList
              presets={likedData?.presets ?? []}
              models={models}
              isLoading={isLoading}
              page={page}
              pageSize={DEFAULT_PRESETS_PAGE_SIZE}
              totalCount={likedData?.totalCount ?? 0}
              emptyTitle={t("liked-list-empty")}
              onPageChange={onPageChange}
            />
          </TabsContent>
        </Tabs>
      </Container>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: await serverSideTranslations(
    locale!,
    ["common", "profile", "presets"],
    nextI18nextConfig
  ),
});

export default Profile;
