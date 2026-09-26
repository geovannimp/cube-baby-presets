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
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
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

const useScrolledPast = (offset: number) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      setIsScrolled(window.scrollY > offset);
    };

    const handleScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [offset]);

  return isScrolled;
};

export const Header = () => {
  const { t } = useTranslation();
  const { user } = useUser();
  const router = useRouter();
  const { setTheme } = useTheme();
  const { data: profile, isLoading: isProfileLoading } = useProfile(user?.id);
  const isScrolled = useScrolledPast(8);

  const isHome = router.pathname === "/";
  const isPresets = router.pathname.startsWith("/presets");

  const logout = () => {
    UserService.logout().then(() => {
      router.replace("/signin");
    });
  };

  return (
    <header
      data-scrolled={isScrolled || undefined}
      className="sticky top-0 z-20 flex w-full justify-center transition-[background-color,box-shadow] duration-200 ease-out data-[scrolled]:bg-background/85 data-[scrolled]:shadow-[inset_0_-1px_0_var(--border)] supports-[backdrop-filter]:data-[scrolled]:bg-background/65 supports-[backdrop-filter]:data-[scrolled]:backdrop-blur-md"
    >
      <Container className="py-3">
        <nav
          className="flex items-center justify-between gap-3"
          aria-label={t("nav-aria-label")}
        >
          <div className="flex min-w-0 items-center gap-1 sm:gap-2">
            <Link
              href="/"
              aria-current={isHome ? "page" : undefined}
              className="shrink-0 text-foreground transition-colors hover:text-muted-foreground focus-visible:rounded-md focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              <Logo className="w-20" />
            </Link>

            <NavigationMenu className="flex-none">
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink
                    active={isPresets}
                    render={<Link href="/presets" />}
                    className={navigationMenuTriggerStyle({
                      className:
                        "text-muted-foreground hover:text-foreground data-active:bg-muted data-active:text-foreground",
                    })}
                  >
                    {t("nav-presets-button")}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="secondary"
                      className="min-h-9 max-w-24 sm:max-w-36"
                      aria-busy={isProfileLoading || undefined}
                    />
                  }
                >
                  <span className="truncate" title={profile?.username}>
                    {profile?.username ??
                      (isProfileLoading ? "…" : t("account-button"))}
                  </span>
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
          </div>
        </nav>
      </Container>
    </header>
  );
};
