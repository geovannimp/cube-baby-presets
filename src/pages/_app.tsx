import type { AppProps } from "next/app";
import { UserProvider } from "@supabase/supabase-auth-helpers/react";
import { supabaseClient } from "@supabase/supabase-auth-helpers/nextjs";
import { ThemeProvider } from "next-themes";
import { appWithTranslation } from "next-i18next";
import { Toaster } from "react-hot-toast";

import nextI18NextConfig from "../../next-i18next.config";

import "../styles/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <UserProvider supabaseClient={supabaseClient}>
      <ThemeProvider attribute="class">
        <div className="flex flex-col justify-center items-center w-full">
          <Component {...pageProps} />
          <Toaster />
        </div>
      </ThemeProvider>
    </UserProvider>
  );
}

export default appWithTranslation(MyApp, nextI18NextConfig);
