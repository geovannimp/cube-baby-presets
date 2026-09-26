import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useTheme } from "next-themes";
import {
  IdCardIcon,
  LogOutIcon,
  PaletteIcon,
  UserIcon,
} from "lucide-react";
import clsx from "clsx";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProfile } from "../hooks/useProfile";
import { useUser } from "../hooks/useUser";
import { UserService } from "../services/userService";
import { Container } from "./Container";
import { Logo } from "./Logo";

export const Header = () => {
  const { t } = useTranslation();
  const { user } = useUser();
  const router = useRouter();
  const { setTheme } = useTheme();
  const { data: profile, isLoading: isProfileLoading } = useProfile(user?.id);

  const isHome = router.pathname === "/";
  const isPresets = router.pathname.startsWith("/presets");

  const logout = () => {
    UserService.logout().then(() => {
      router.replace("/signin");
    });
  };

  return (
    <header className="flex w-full justify-center border-b bg-background">
      <Container className="py-3">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/"
            aria-current={isHome ? "page" : undefined}
            className="shrink-0 text-foreground transition-colors hover:text-muted-foreground focus-visible:rounded-md focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <Logo className="w-20" />
          </Link>

          <nav
            className="flex min-w-0 flex-1 items-center justify-end gap-1 sm:gap-2"
            aria-label={t("nav-aria-label")}
          >
            <Link
              href="/presets"
              aria-current={isPresets ? "page" : undefined}
              className={clsx(
                "inline-flex min-h-9 items-center rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                isPresets
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {t("nav-presets-button")}
            </Link>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="secondary"
                      className="min-h-9"
                      aria-busy={isProfileLoading || undefined}
                    />
                  }
                >
                  {profile?.username ??
                    (isProfileLoading ? "…" : t("account-button"))}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      nativeButton={false}
                      render={<Link href="/account" />}
                    >
                      <UserIcon data-icon="inline-start" />
                      {t("account-button")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      nativeButton={false}
                      render={<Link href={`/profile/${user.id}`} />}
                    >
                      <IdCardIcon data-icon="inline-start" />
                      {t("profile-button")}
                    </DropdownMenuItem>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <PaletteIcon data-icon="inline-start" />
                        {t("theme-button")}
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem onClick={() => setTheme("dark")}>
                          {t("theme-dark-button")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme("light")}>
                          {t("theme-light-button")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme("system")}>
                          {t("theme-system-button")}
                        </DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    <DropdownMenuItem onClick={logout}>
                      <LogOutIcon data-icon="inline-start" />
                      {t("logout-button")}
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="outline"
                className="min-h-9"
                nativeButton={false}
                render={<Link href="/signin" />}
              >
                {t("login-button")}
              </Button>
            )}
          </nav>
        </div>
      </Container>
    </header>
  );
};
