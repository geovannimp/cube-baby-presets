import { useEffect, useMemo } from "react";
import { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { UserCircleIcon } from "lucide-react";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";

import { Header } from "../../components/Header";
import { Container } from "../../components/Container";
import { PresetsList } from "../../components/PresetsList";
import { usePresets } from "../../hooks/usePresets";
import { useModels } from "../../hooks/useModels";
import nextI18nextConfig from "../../../next-i18next.config";
import { useProfile } from "../../hooks/useProfile";
import { DEFAULT_PRESETS_PAGE_SIZE } from "../../services/presetService";

const Profile: NextPage = () => {
  const { t } = useTranslation("profile");
  const router = useRouter();
  const { userId } = router.query;
  const resolvedUserId = typeof userId === "string" ? userId : undefined;

  const [{ page, asOf }, setQuery] = useQueryStates({
    page: parseAsInteger.withDefault(1).withOptions({ clearOnDefault: true }),
    asOf: parseAsString.withOptions({ clearOnDefault: true }),
  });

  useEffect(() => {
    if (!asOf) {
      void setQuery({ asOf: new Date().toISOString() });
    }
  }, [asOf, setQuery]);

  const options = useMemo(
    () =>
      resolvedUserId
        ? {
            userId: resolvedUserId,
            page,
            pageSize: DEFAULT_PRESETS_PAGE_SIZE,
            asOf: asOf ?? undefined,
          }
        : undefined,
    [resolvedUserId, page, asOf]
  );

  const { data, isLoading: isLoadingPresets } = usePresets(options, {
    enabled: Boolean(resolvedUserId && asOf),
  });
  const { data: models, isLoading: isLoadingModels } = useModels();
  const { data: profile } = useProfile(resolvedUserId);

  const isLoading = isLoadingModels || isLoadingPresets || !asOf;

  return (
    <>
      <Head>
        <title>Cube Baby Presets - Account</title>
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
        <div className="flex flex-row items-center justify-between">
          <p className="text-2xl font-bold">{t("presets-list-title")}</p>
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

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: await serverSideTranslations(
    locale!,
    ["common", "profile", "presets"],
    nextI18nextConfig
  ),
});

export default Profile;
