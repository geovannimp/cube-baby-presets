import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import nextI18nextConfig from "../../../next-i18next.config";
import { Container } from "../../components/Container";
import { Header } from "../../components/Header";
import { PresetEditor } from "../../components/PresetEditor";
import { createPagesServerClient } from "../../utils/supabase/pages";

const NewPreset: NextPage = () => {
  const { t } = useTranslation("preset");

  return (
    <>
      <Head>
        <title>{`Cube Baby Presets - ${t("preset-title", { context: "creating" })}`}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_10%_0%,color-mix(in_oklch,var(--primary)_22%,transparent),transparent_55%),radial-gradient(ellipse_60%_40%_at_95%_30%,color-mix(in_oklch,var(--primary)_12%,transparent),transparent_50%)]" />
        <div className="absolute -top-32 right-[-12%] size-[min(36rem,85vw)] rounded-full bg-primary/10 blur-3xl" />
      </div>

      <Header />

      <main className="relative flex w-full flex-1 flex-col items-center overflow-hidden">
        <Container className="relative z-10 my-10 w-full py-4 md:my-14 md:py-6">
          <PresetEditor />
        </Container>
      </main>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const supabase = createPagesServerClient(ctx);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Creating a preset always needs an author.
  if (!user) {
    return {
      redirect: {
        destination: "/signin",
        permanent: false,
      },
    };
  }

  return {
    props: await serverSideTranslations(
      ctx.locale!,
      ["common", "preset"],
      nextI18nextConfig
    ),
  };
};

export default NewPreset;
