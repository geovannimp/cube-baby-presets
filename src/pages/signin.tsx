import Link from "next/link";
import Head from "next/head";
import { GetStaticProps } from "next/types";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useUser } from "@supabase/supabase-auth-helpers/react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import toast from "react-hot-toast";
import { useTranslation } from "next-i18next";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import LoadingDots from "../components/LoadingDots";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { UserService } from "../services/userService";

const SignIn = () => {
  const { t } = useTranslation("signin");
  const router = useRouter();
  const { user } = useUser();

  const schema = z
    .object({
      email: z
        .string({
          required_error: t("email-field-required-error"),
        })
        .email(t("email-field-validation-error")),
      password: z
        .string({
          required_error: t("password-field-required-error"),
        })
        .min(6, t("password-field-min-length-error")),
    })
    .required();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    mode: "onBlur",
  });

  const onSubmit = handleSubmit(async ({ email, password }) => {
    try {
      await UserService.signin({ email, password });
    } catch ({ message }: any) {
      if (message === "Invalid login credentials") {
        toast.error(t("submit-invalid-grant-error"), {
          position: "bottom-center",
          style: {
            marginBottom: 50,
          },
        });
      } else {
        toast.error(message as string, {
          position: "bottom-center",
          style: {
            marginBottom: 50,
          },
        });
      }
    }
  });

  useEffect(() => {
    if (user) {
      router.replace("/account");
    }
  }, [user]);

  if (!user)
    return (
      <>
        <Head>
          <title>Cube Baby Presets - Sign In</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <div className="flex flex-col justify-center items-center w-full h-screen">
          <Card className="flex flex-col p-4 gap-8 max-w-md w-full">
            <p className="text-2xl text-center pt-12 pb-4 font-bold text-gray-800 transition-colors duration-200 transform dark:text-white">
              Cube Baby Presets
            </p>

            <form onSubmit={onSubmit} className="flex flex-col gap-4">
              <Input
                type="email"
                label={`${t("email-field")} *`}
                {...register("email")}
                helperText={errors.email?.message}
                error={!!errors.email}
              />
              <Input
                type="password"
                label={`${t("password-field")} *`}
                {...register("password")}
                helperText={errors.password?.message}
                error={!!errors.password}
                required
              />
              <Button className="mt-2" type="submit" disabled={!isValid}>
                {isSubmitting ? <LoadingDots /> : t("signin-button")}
              </Button>
            </form>

            <span className="pt-1 text-center text-sm">
              <span className="text-zinc-200">{t("no-account")}</span>
              {` `}
              <Link href="/signup">
                <a className="text-accent-9 font-bold hover:underline cursor-pointer">
                  {t("no-account-link")}
                </a>
              </Link>
            </span>
          </Card>
        </div>
      </>
    );

  return (
    <div className="m-6">
      <LoadingDots />
    </div>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: await serverSideTranslations(locale!, ["signin"]),
});

export default SignIn;
