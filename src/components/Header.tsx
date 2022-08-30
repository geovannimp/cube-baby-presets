import { Menu, Transition } from "@headlessui/react";
import { useUser } from "@supabase/supabase-auth-helpers/react";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { Fragment, useEffect, useState } from "react";
import { Profile, UserService } from "../services/userService";
import { Button } from "./Button";
import { Container } from "./Container";

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

  const [profile, setProfile] = useState<Profile>();

  useEffect(() => {
    if (user?.id) {
      UserService.getProfile(user.id).then(setProfile);
    }
  }, [user?.id]);

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

          {/* Mobile Menu open: "block", Menu closed: "hidden" */}
          <div className="flex-1 md:flex md:items-center md:justify-between">
            <div className="flex flex-col -mx-4 md:flex-row md:items-center md:mx-8">
              <Link href="/presets">
                <p className="px-2 py-1 mx-2 mt-2 text-sm font-medium text-gray-700 transition-colors duration-200 transform rounded-md md:mt-0 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700 cursor-pointer">
                  Presets
                </p>
              </Link>
            </div>
            <div className="flex items-center mt-4 md:mt-0">
              {user ? (
                <Menu as="div" className="relative inline-block text-left">
                  <div>
                    <Menu.Button className="inline-flex w-full justify-center rounded-md bg-black bg-opacity-20 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
                      {profile?.username ?? "Loading..."}
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute left-0 md:right-0 mt-2 w-56 origin-top-right text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 ring-black ring-opacity-5 focus:outline-none z-50">
                      <Menu.Item>
                        <CustomLink href="/account">
                          <button className="my-1 flex w-full items-center pl-4 py-2 text-sm hover:bg-gray-700">
                            {t("account-button")}
                          </button>
                        </CustomLink>
                      </Menu.Item>
                      <Menu.Item>
                        <button
                          onClick={logout}
                          className="my-1 flex w-full items-center pl-4 py-2 text-sm hover:bg-gray-700"
                        >
                          {t("logout-button")}
                        </button>
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
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
