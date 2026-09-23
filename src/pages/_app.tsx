import type { AppProps } from "next/app";
import { GeistSans } from "geist/font/sans";
import { Roboto } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { appWithTranslation } from "next-i18next";
import { QueryClientProvider } from "@tanstack/react-query";
import Router from "next/router";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

import nextI18NextConfig from "../../next-i18next.config";
import { queryClient } from "../utils/queryClient";
import { AuthProvider } from "../hooks/useUser";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

import "../styles/globals.css";

const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-roboto",
});

NProgress.configure({ showSpinner: false });

Router.events.on("routeChangeStart", () => NProgress.start());
Router.events.on("routeChangeComplete", () => NProgress.done());
Router.events.on("routeChangeError", () => NProgress.done());

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider attribute="class">
          <div
            className={cn(
              GeistSans.variable,
              roboto.variable,
              GeistSans.className,
              "flex min-h-screen w-full flex-col items-center bg-background text-foreground"
            )}
          >
            <Component {...pageProps} />
            <Toaster position="bottom-center" />
          </div>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default appWithTranslation(MyApp, nextI18NextConfig);
