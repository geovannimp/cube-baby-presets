import { useMemo } from "react";
import { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { withPageAuth } from "@supabase/supabase-auth-helpers/nextjs";
import { useUser } from "@supabase/supabase-auth-helpers/react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";

import { Header } from "../components/Header";
import { Button } from "../components/Button";
import { Container } from "../components/Container";
import { usePresets } from "../hooks/usePresets";
import LoadingDots from "../components/LoadingDots";
import { useModels } from "../hooks/useModels";
import { PresetCard } from "../components/PresetCard";
import nextI18nextConfig from "../../next-i18next.config";

const Account: NextPage = () => {
  const { t } = useTranslation("account");
  const { user } = useUser();
  const options = useMemo(() => ({ userId: user?.id }), [user?.id]);
  const { data: presets, isLoading: isLoadingPresets } = usePresets(options);
  const { data: models, isLoading: isLoadingModels } = useModels();

  const isLoading = isLoadingModels || isLoadingPresets;

  return (
    <>
      <Head>
        <title>Cube Baby Presets - Account</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <Container className="gap-4 my-8">
        <div className="flex flex-row justify-between items-center">
          <p className="font-bold text-2xl">{t("presets-list-title")}</p>
          <Link href="/presets/new">
            <Button>
              <span>{t("presets-list-button")}</span>
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <LoadingDots />
        ) : presets?.length ? (
          <div className="mt-4 grid gap-6 md:grid-cols-3 grid-cols-1">
            {presets?.map((preset) => (
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

export const getServerSideProps = withPageAuth({
  redirectTo: "/signin",
  getServerSideProps: async ({ locale }) => {
    const translations = await serverSideTranslations(
      locale!,
      ["common", "account"],
      nextI18nextConfig
    );
    console.log({ locale, translations: JSON.stringify(translations) });

    return {
      props: translations,
    };
  },
});

export default Account;
