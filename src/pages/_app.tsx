import type { AppProps } from "next/app";
import { UserProvider } from "@supabase/supabase-auth-helpers/react";
import { supabaseClient } from "@supabase/supabase-auth-helpers/nextjs";
import { ThemeProvider } from "next-themes";
import { appWithTranslation } from "next-i18next";
import { Toaster } from "react-hot-toast";
import { QueryClientProvider } from "@tanstack/react-query";

import nextI18NextConfig from "../../next-i18next.config";
import { queryClient } from "../utils/queryClient";

import "../styles/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider supabaseClient={supabaseClient}>
        <ThemeProvider attribute="class">
          <div className="flex flex-col justify-center items-center w-full">
            <Component {...pageProps} />
            <Toaster />
          </div>
        </ThemeProvider>
      </UserProvider>
    </QueryClientProvider>
  );
}

export default appWithTranslation(MyApp, nextI18NextConfig);
