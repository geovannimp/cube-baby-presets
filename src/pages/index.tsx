import { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { Header } from "../components/Header";
import { Container } from "../components/Container";
import { PresetCard } from "../components/PresetCard";
import { useModels } from "../hooks/useModels";
import { usePresets } from "../hooks/usePresets";
import nextI18nextConfig from "../../next-i18next.config";

const Home: NextPage = () => {
  const { t } = useTranslation("common");
  const [asOf] = useState(() => new Date().toISOString());
  const { data, isLoading: isLoadingPresets } = usePresets({
    page: 1,
    pageSize: 3,
    asOf,
  });
  const { data: models, isLoading: isLoadingModels } = useModels();

  const isLoading = isLoadingPresets || isLoadingModels;
  const latestPresets = data?.presets ?? [];

  return (
    <>
      <Head>
        <title>Cube Baby Presets</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <main className="relative flex w-full flex-1 flex-col items-center overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_10%_20%,color-mix(in_oklch,var(--primary)_28%,transparent),transparent_55%),radial-gradient(ellipse_70%_50%_at_90%_80%,color-mix(in_oklch,var(--primary)_16%,transparent),transparent_50%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 right-[-10%] size-[min(42rem,90vw)] rounded-full bg-primary/10 blur-3xl"
        />

        <Container className="relative z-10 flex min-h-[calc(100svh-4.5rem)] w-full flex-col justify-center py-16 md:py-24">
          <div className="animate-in fade-in slide-in-from-bottom-3 fill-mode-both duration-700 ease-out motion-reduce:animate-none">
            <div className="max-w-3xl">
              <h1 className="font-heading text-4xl leading-[1.05] font-bold tracking-[-0.03em] text-foreground sm:text-5xl md:text-6xl lg:text-7xl xl:text-[5.75rem]">
                Cube Baby Presets
              </h1>
              <p className="mt-2 max-w-[38rem] text-base leading-relaxed text-muted-foreground sm:text-lg md:text-xl">
                {t("project-description")}
              </p>
            </div>

            <div className="mt-16 w-full">
              <h2 className="mb-6 text-2xl font-bold text-foreground">
                {t("home-latest-presets-title")}
              </h2>

              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Spinner className="size-8" />
                </div>
              ) : latestPresets.length ? (
                <>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {latestPresets.map((preset) => (
                      <PresetCard
                        key={preset.id}
                        preset={preset}
                        modelName={
                          models?.find((model) => model.id === preset.model_id)
                            ?.name
                        }
                      />
                    ))}
                  </div>
                  <div className="mt-8">
                    <Button
                      variant="outline"
                      size="lg"
                      className="h-11 w-full px-8 text-lg"
                      nativeButton={false}
                      render={<Link href="/presets" />}
                    >
                      {t("home-see-more-button")}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex w-full flex-col gap-6">
                  <Empty className="w-full py-12">
                    <EmptyTitle>{t("home-presets-empty")}</EmptyTitle>
                    <EmptyDescription />
                  </Empty>
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-11 w-full px-8"
                    nativeButton={false}
                    render={<Link href="/presets" />}
                  >
                    {t("home-see-more-button")}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Container>
      </main>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: await serverSideTranslations(locale!, ["common"], nextI18nextConfig),
});

export default Home;
