import { useMemo } from "react";
import { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { UserCircleIcon } from "lucide-react";

import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { Header } from "../../components/Header";
import { Container } from "../../components/Container";
import { usePresets } from "../../hooks/usePresets";
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

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner className="size-8" />
          </div>
        ) : presets?.length ? (
          <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-3">
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
          <Empty className="my-6 py-24">
            <EmptyTitle>{t("presets-list-empty")}</EmptyTitle>
            <EmptyDescription />
          </Empty>
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
