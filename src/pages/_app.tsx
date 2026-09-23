import type { AppProps } from "next/app";
import { ThemeProvider } from "next-themes";
import { appWithTranslation } from "next-i18next";
import { Toaster } from "react-hot-toast";
import { QueryClientProvider } from "@tanstack/react-query";
import Router from "next/router";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

import nextI18NextConfig from "../../next-i18next.config";
import { queryClient } from "../utils/queryClient";
import { AuthProvider } from "../hooks/useUser";

import "../styles/globals.css";

NProgress.configure({ showSpinner: false });

Router.events.on("routeChangeStart", () => NProgress.start());
Router.events.on("routeChangeComplete", () => NProgress.done());
Router.events.on("routeChangeError", () => NProgress.done());

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider attribute="class">
          <div className="flex flex-col justify-center items-center w-full">
            <Component {...pageProps} />
            <Toaster />
          </div>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default appWithTranslation(MyApp, nextI18NextConfig);
