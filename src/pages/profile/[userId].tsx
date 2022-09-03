import { useMemo } from "react";
import { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { UserCircleIcon } from "@heroicons/react/20/solid";

import { Header } from "../../components/Header";
import { Container } from "../../components/Container";
import { usePresets } from "../../hooks/usePresets";
import LoadingDots from "../../components/LoadingDots";
import { useModels } from "../../hooks/useModels";
import { PresetCard } from "../../components/PresetCard";
import nextI18nextConfig from "../../../next-i18next.config";
import { useProfile } from "../../hooks/useProfile";

const Account: NextPage = () => {
  const { t } = useTranslation("profile");
  const router = useRouter();
  const { userId } = router.query;

  const options = useMemo(
    () => (typeof userId === "string" ? { userId } : undefined),
    [userId]
  );
  const { data: presets, isLoading: isLoadingPresets } = usePresets(options);
  const { data: models, isLoading: isLoadingModels } = useModels();
  const { data: profile } = useProfile(options?.userId);

  const isLoading = isLoadingModels || isLoadingPresets;

  return (
    <>
      <Head>
        <title>Cube Baby Presets - Account</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <div className="flex justify-center w-full bg-slate-200 dark:bg-slate-700">
        <Container className="gap-4 my-8 flex-col justify-center items-center md:flex-row md:justify-start md:items-center">
          <UserCircleIcon className="h-12 w-12 mr-1 inline-block" />{" "}
          <p className="text-xl font-bold">{profile?.username}</p>
        </Container>
      </div>

      <Container className="gap-4 my-8">
        <div className="flex flex-row justify-between items-center">
          <p className="font-bold text-2xl">{t("presets-list-title")}</p>
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

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: await serverSideTranslations(
    locale!,
    ["common", "profile"],
    nextI18nextConfig
  ),
});

export default Account;
