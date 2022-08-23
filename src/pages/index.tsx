import { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { Header } from "../components/Header";
import { Container } from "../components/Container";
import { Button } from "../components/Button";

const Home: NextPage = () => {
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <title>Cube Baby Presets</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <Container className="gap-4 py-8 h-[80vh]">
        <div className="items-center lg:flex gap-12 justify-center h-full">
          <div className="w-full lg:w-1/2">
            <div className="lg:max-w-lg">
              <h1 className="text-2xl text-center font-semibold text-gray-800 uppercase dark:text-white lg:text-4xl lg:text-left">
                Cube Baby Presets
              </h1>
              <p className="mt-2 text-center text-gray-600 dark:text-gray-400 lg:text-left">
                {t("project-description")}
              </p>
              <Link href="/presets">
                <Button className="w-full py-2 px-6 mt-8 text-base font-medium text-white lg:w-auto">
                  {t("go-to-presets-button")}
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex items-center justify-center w-full mt-12 lg:mt-0 lg:w-1/2">
            <Image
              alt="music compose"
              src="/undraw_compose_music_re_wpiw.svg"
              width={400}
              height={400}
              className="w-full h-full max-w-md"
            />
          </div>
        </div>
      </Container>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: await serverSideTranslations(locale!),
});

export default Home;
