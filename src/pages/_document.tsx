import { Html, Head, Main, NextScript } from "next/document";
import { GeistSans } from "geist/font/sans";
import { Roboto } from "next/font/google";
import { cn } from "@/lib/utils";

const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-roboto",
});

export default function Document() {
  return (
    <Html
      lang="en"
      suppressHydrationWarning
      className={cn(GeistSans.variable, roboto.variable)}
    >
      <Head />
      <body className={cn(GeistSans.className, "min-h-screen font-sans antialiased")}>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
