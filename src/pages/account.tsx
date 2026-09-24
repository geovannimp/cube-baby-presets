import { useEffect, useMemo } from "react";
import { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";

import { Button } from "@/components/ui/button";
import { Header } from "../components/Header";
import { Container } from "../components/Container";
import { PresetsList } from "../components/PresetsList";
import { usePresets } from "../hooks/usePresets";
import { useModels } from "../hooks/useModels";
import nextI18nextConfig from "../../next-i18next.config";
import { useUser } from "../hooks/useUser";
import { createPagesServerClient } from "../utils/supabase/pages";
import { DEFAULT_PRESETS_PAGE_SIZE } from "../services/presetService";

const Account: NextPage = () => {
  const { t } = useTranslation("account");
  const { user } = useUser();
  const { data: models, isLoading: isLoadingModels } = useModels();

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
    () => ({
      userId: user?.id,
      page,
      pageSize: DEFAULT_PRESETS_PAGE_SIZE,
      asOf: asOf ?? undefined,
    }),
    [user?.id, page, asOf]
  );

  const { data, isLoading: isLoadingPresets } = usePresets(options, {
    enabled: Boolean(user?.id && asOf),
  });

  const isLoading = isLoadingModels || isLoadingPresets || !asOf;

  return (
    <>
      <Head>
        <title>Cube Baby Presets - Account</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <Container className="my-8 gap-4">
        <div className="flex flex-row items-center justify-between">
          <p className="text-2xl font-bold">{t("presets-list-title")}</p>
          <Button nativeButton={false} render={<Link href="/presets/new" />}>
            {t("presets-list-button")}
          </Button>
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

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const supabase = createPagesServerClient(ctx);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      redirect: {
        destination: "/signin",
        permanent: false,
      },
    };
  }

  const translations = await serverSideTranslations(
    ctx.locale!,
    ["common", "account", "presets"],
    nextI18nextConfig
  );

  return {
    props: translations,
  };
};

export default Account;
