import { useMemo } from "react";
import { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";

import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { Header } from "../components/Header";
import { Container } from "../components/Container";
import { usePresets } from "../hooks/usePresets";
import { useModels } from "../hooks/useModels";
import { PresetCard } from "../components/PresetCard";
import nextI18nextConfig from "../../next-i18next.config";
import { useUser } from "../hooks/useUser";
import { createPagesServerClient } from "../utils/supabase/pages";

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

      <Container className="my-8 gap-4">
        <div className="flex flex-row items-center justify-between">
          <p className="text-2xl font-bold">{t("presets-list-title")}</p>
          <Button nativeButton={false} render={<Link href="/presets/new" />}>
            {t("presets-list-button")}
          </Button>
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
    ["common", "account"],
    nextI18nextConfig
  );

  return {
    props: translations,
  };
};

export default Account;
