import { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useUser } from "@supabase/supabase-auth-helpers/react";

import { usePresets } from "../../hooks/usePresets";
import { useModels } from "../../hooks/useModels";
import { Header } from "../../components/Header";
import { Container } from "../../components/Container";
import { Button } from "../../components/Button";
import LoadingDots from "../../components/LoadingDots";
import { PresetCard } from "../../components/PresetCard";

const Presets: NextPage = () => {
  const { t } = useTranslation("presets");
  const { user } = useUser();
  const { data: presets, isLoading: isLoadingPresets } = usePresets();
  const { data: models, isLoading: isLoadingModels } = useModels();

  const isLoading = isLoadingPresets || isLoadingModels;

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

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: await serverSideTranslations(locale!, ["common", "presets"]),
});

export default Presets;
