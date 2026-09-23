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

export const Header = () => {
  const { t } = useTranslation();
  const { user } = useUser();
  const router = useRouter();
  const { setTheme } = useTheme();
  const { data: profile } = useProfile(user?.id);

  const logout = () => {
    UserService.logout().then(() => {
      router.replace("/signin");
    });
  };

  return (
    <nav className="flex w-full justify-center border-b bg-background shadow-sm">
      <Container className="my-4">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="text-2xl font-bold text-foreground transition-colors hover:text-muted-foreground"
            >
              Cube Baby Presets
            </Link>
          </div>

          <div className="mt-2 flex flex-1 items-center justify-between md:mt-0">
            <div className="flex flex-col md:mx-8 md:flex-row md:items-center">
              <Link
                href="/presets"
                className="rounded-md px-2 py-1 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Presets
              </Link>
            </div>
            <div className="flex items-center">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={<Button variant="secondary" />}
                  >
                    {profile?.username ?? "Loading..."}
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
                <Button nativeButton={false} render={<Link href="/signin" />}>
                  {t("login-button")}
                </Button>
              )}
            </div>
          </div>
        </div>
      </Container>
    </nav>
  );
};
