import Link from "next/link";
import { useTranslation } from "next-i18next";
import { useTheme } from "next-themes";
import { PaletteIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type AuthShellProps = {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export const AuthShell = ({ title, children, footer }: AuthShellProps) => {
  const { t } = useTranslation("common");
  const { setTheme } = useTheme();

  return (
    <div className="relative flex min-h-svh w-full bg-background">
      <div className="absolute top-4 right-4 z-20 sm:top-6 sm:right-6">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="outline"
                size="icon"
                className="size-9"
                aria-label={t("theme-button")}
              />
            }
          >
            <PaletteIcon />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-36">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              {t("theme-light-button")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              {t("theme-dark-button")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              {t("theme-system-button")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <aside className="relative hidden w-[min(46%,36rem)] shrink-0 flex-col justify-between overflow-hidden border-r border-border bg-[color-mix(in_oklch,var(--primary)_7%,var(--background))] lg:flex xl:w-[min(44%,40rem)]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_80%_at_-10%_-10%,color-mix(in_oklch,var(--primary)_48%,transparent),transparent_55%),radial-gradient(ellipse_80%_60%_at_110%_110%,color-mix(in_oklch,var(--primary)_28%,transparent),transparent_50%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 top-1/3 size-[min(32rem,55vw)] rounded-full bg-primary/20 blur-3xl"
        />

        <div className="relative z-10 flex h-full flex-col justify-between px-10 py-12 xl:px-14 xl:py-14">
          <Link
            href="/"
            className="font-heading text-lg font-bold tracking-[-0.02em] text-foreground transition-colors hover:text-muted-foreground focus-visible:rounded-md focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            Cube Baby Presets
          </Link>

          <div className="animate-in fade-in slide-in-from-bottom-3 fill-mode-both duration-700 ease-out motion-reduce:animate-none">
            <p className="font-heading max-w-[10ch] text-5xl leading-[1.02] font-bold tracking-[-0.03em] text-foreground xl:text-[3.75rem]">
              Cube Baby Presets
            </p>
            <p className="mt-6 max-w-[26rem] text-base leading-relaxed text-muted-foreground xl:text-lg">
              {t("project-description")}
            </p>
          </div>

          <Link
            href="/presets"
            className="w-fit text-sm font-medium text-foreground/70 underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:rounded-sm focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            {t("go-to-presets-button")}
          </Link>
        </div>
      </aside>

      <main className="relative flex min-h-svh flex-1 flex-col bg-background">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_100%_-10%,color-mix(in_oklch,var(--primary)_16%,transparent),transparent_50%)] lg:hidden"
        />

        <div className="relative z-10 flex flex-1 flex-col justify-center px-6 py-12 sm:px-10 lg:px-16">
          <div className="mx-auto w-full max-w-[22rem] animate-in fade-in slide-in-from-bottom-3 fill-mode-both duration-700 ease-out motion-reduce:animate-none">
            <Link
              href="/"
              className="mb-10 inline-block font-heading text-lg font-bold tracking-[-0.02em] text-foreground transition-colors hover:text-muted-foreground focus-visible:rounded-md focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none lg:hidden"
            >
              Cube Baby Presets
            </Link>

            <h1 className="font-heading text-[2rem] leading-tight font-bold tracking-[-0.03em] text-foreground sm:text-3xl">
              {title}
            </h1>

            <div className="mt-8">{children}</div>

            {footer ? (
              <div className="mt-8 border-t border-border pt-6">{footer}</div>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
};
