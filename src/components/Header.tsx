import { Disclosure, Popover } from "@headlessui/react";
import { useUser } from "@supabase/supabase-auth-helpers/react";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { useProfile } from "../hooks/useProfile";
import { UserService } from "../services/userService";
import { Button } from "./Button";
import { Container } from "./Container";
import { useFloating, shift, offset } from "@floating-ui/react-dom";
import { useTheme } from "next-themes";
import {
  ArrowLeftOnRectangleIcon,
  IdentificationIcon,
  SwatchIcon,
  UserIcon,
} from "@heroicons/react/20/solid";

const CustomLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentProps<"a">
>(function CustomLinkForwarder(props, ref) {
  let { href, children, ...rest } = props;
  return (
    <Link href={href as string}>
      <a ref={ref} {...rest}>
        {children}
      </a>
    </Link>
  );
});

export const Header = () => {
  const { t } = useTranslation();
  const { user } = useUser();
  const router = useRouter();

  const { setTheme } = useTheme();

  const { data: profile } = useProfile(user?.id);

  const { x, y, reference, floating, strategy } = useFloating({
    strategy: "fixed",
    middleware: [
      shift({
        padding: 8,
      }),
      offset(12),
    ],
  });

  const logout = () => {
    UserService.logout().then(() => {
      router.replace("/signin");
    });
  };

  return (
    <nav className="flex justify-center bg-white shadow dark:bg-gray-800 w-full">
      <Container className="my-4">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex items-center justify-between">
            <div className="text-xl font-semibold text-gray-700">
              <Link href="/">
                <p className="text-2xl font-bold cursor-pointer text-gray-800 transition-colors duration-200 transform dark:text-white hover:text-gray-700 dark:hover:text-gray-300">
                  Cube Baby Presets
                </p>
              </Link>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-between mt-2 md:mt-0">
            <div className="flex flex-col md:flex-row md:items-center md:mx-8">
              <Link href="/presets">
                <p className="px-2 py-1 text-sm font-medium text-gray-700 transition-colors duration-200 transform rounded-md md:mt-0 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700 cursor-pointer">
                  Presets
                </p>
              </Link>
            </div>
            <div className="flex items-center">
              {user ? (
                <Popover className="relative inline-block text-left">
                  <Popover.Button
                    ref={reference}
                    className="inline-flex w-full justify-center rounded-md bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
                  >
                    {profile?.username ?? "Loading..."}
                  </Popover.Button>

                  <Popover.Panel
                    className="w-56 text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-400 ring-black ring-opacity-5 shadow-xl focus:outline-none z-50"
                    ref={floating}
                    style={{
                      position: strategy,
                      top: y ?? 0,
                      left: x ?? 0,
                    }}
                  >
                    <CustomLink href="/account">
                      <button className="my-1 flex w-full items-center pl-4 py-2 text-sm hover:bg-gray-700 hover:text-gray-300">
                        <UserIcon className="w-4 h-4 mr-2" />
                        {t("account-button")}
                      </button>
                    </CustomLink>
                    <CustomLink href={`/profile/${user.id}`}>
                      <button className="my-1 flex w-full items-center pl-4 py-2 text-sm hover:bg-gray-700 hover:text-gray-300">
                        <IdentificationIcon className="w-4 h-4 mr-2" />
                        {t("profile-button")}
                      </button>
                    </CustomLink>
                    <Disclosure>
                      <Disclosure.Button
                        as="button"
                        className="my-1 flex w-full items-center pl-4 py-2 text-sm hover:bg-gray-700 hover:text-gray-300"
                      >
                        <>
                          <SwatchIcon className="w-4 h-4 mr-2" />
                          {t("theme-button")}
                        </>
                      </Disclosure.Button>
                      <Disclosure.Panel className="text-gray-600 dark:text-gray-400">
                        <button
                          onClick={() => setTheme("dark")}
                          className="my-1 flex w-full items-center pl-10 py-2 text-sm hover:bg-gray-700 hover:text-gray-300"
                        >
                          {t("theme-dark-button")}
                        </button>
                        <button
                          onClick={() => setTheme("light")}
                          className="my-1 flex w-full items-center pl-10 py-2 text-sm hover:bg-gray-700 hover:text-gray-300"
                        >
                          {t("theme-light-button")}
                        </button>
                        <button
                          onClick={() => setTheme("system")}
                          className="my-1 flex w-full items-center pl-10 py-2 text-sm hover:bg-gray-700 hover:text-gray-300"
                        >
                          {t("theme-system-button")}
                        </button>
                      </Disclosure.Panel>
                    </Disclosure>
                    <button
                      onClick={logout}
                      className="my-1 flex w-full items-center pl-4 py-2 text-sm hover:bg-gray-700 hover:text-gray-300"
                    >
                      <ArrowLeftOnRectangleIcon className="w-4 h-4 mr-2" />
                      {t("logout-button")}
                    </button>
                  </Popover.Panel>
                </Popover>
              ) : (
                <Link href="/signin">
                  <Button>{t("login-button")}</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </Container>
    </nav>
  );
};
