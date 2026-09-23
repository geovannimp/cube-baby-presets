import { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { Button } from "@/components/ui/button";
import { Header } from "../components/Header";
import { Container } from "../components/Container";
import nextI18nextConfig from "../../next-i18next.config";

const Home: NextPage = () => {
  const { t } = useTranslation("common");

  return (
    <>
      <Head>
        <title>Cube Baby Presets</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <Container className="h-[80vh] gap-4 py-8">
        <div className="flex h-full items-center justify-center gap-12 lg:flex">
          <div className="w-full lg:w-1/2">
            <div className="lg:max-w-lg">
              <h1 className="text-center text-2xl font-semibold uppercase text-foreground lg:text-left lg:text-4xl">
                Cube Baby Presets
              </h1>
              <p className="mt-2 text-center text-muted-foreground lg:text-left">
                {t("project-description")}
              </p>
              <Button
                className="mt-8 w-full px-6 lg:w-auto"
                nativeButton={false}
                render={<Link href="/presets" />}
              >
                {t("go-to-presets-button")}
              </Button>
            </div>
          </div>

          <div className="mt-12 flex w-full items-center justify-center lg:mt-0 lg:w-1/2">
            <Image
              alt="music compose"
              src="/undraw_compose_music_re_wpiw.svg"
              width={400}
              height={400}
              className="h-full w-full max-w-md"
              priority
            />
          </div>
        </div>
      </Container>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: await serverSideTranslations(
    locale!,
    ["common"],
    nextI18nextConfig
  ),
});

export default Home;
