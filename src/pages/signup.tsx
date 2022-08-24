import Link from "next/link";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetStaticProps } from "next";
import { useUser } from "@supabase/supabase-auth-helpers/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import { UserService } from "../services/userService";
import LoadingDots from "../components/LoadingDots";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { Card } from "../components/Card";

const SignUp = () => {
  const { t } = useTranslation("signup");
  const router = useRouter();
  const { user } = useUser();

  const schema = z
    .object({
      username: z.string().min(1, t("username-field-required-error")),
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
      confirmPassword: z.string({
        required_error: t("password-field-required-error"),
      }),
    })
    .required()
    .refine((data) => data.password === data.confirmPassword, {
      message: t("password-confirmation-do-not-match"),
      path: ["confirmPassword"], // path of error
    });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    mode: "onBlur",
  });

  const handleSignup = handleSubmit(async ({ username, email, password }) => {
    try {
      await UserService.signup({
        email,
        username,
        password,
      });
      toast.success(t("submit-success-message"), {
        position: "bottom-center",
        style: {
          marginBottom: 50,
        },
      });
    } catch ({ message }: any) {
      toast.error(message as string, {
        position: "bottom-center",
        style: {
          marginBottom: 50,
        },
      });
    }
  });

  useEffect(() => {
    if (user) {
      router.replace("/account");
    }
  }, [user]);

  return (
    <>
      <Head>
        <title>Cube Baby Presets - Sign Un</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex flex-col justify-center items-center w-full h-screen">
        <Card className="flex flex-col p-4 gap-8 max-w-md w-full">
          <p className="text-2xl text-center pt-12 pb-4 font-bold text-gray-800 transition-colors duration-200 transform dark:text-white">
            Cube Baby Presets
          </p>

          <form onSubmit={handleSignup} className="flex flex-col gap-4">
            <Input
              label={`${t("username-field")} *`}
              {...register("username")}
              helperText={errors.username?.message}
              error={!!errors.username}
            />
            <Input
              label={`${t("email-field")} *`}
              type="email"
              {...register("email")}
              helperText={errors.email?.message}
              error={!!errors.email}
              required
            />
            <Input
              label={`${t("password-field")} *`}
              type="password"
              {...register("password")}
              helperText={errors.password?.message}
              error={!!errors.password}
            />
            <Input
              label={`${t("confirm-password-field")} *`}
              type="password"
              {...register("confirmPassword")}
              helperText={errors.confirmPassword?.message}
              error={!!errors.confirmPassword}
            />
            <Button className="mt-2" disabled={!isValid} type="submit">
              {isSubmitting ? <LoadingDots /> : t("signup-button")}
            </Button>
          </form>

          <span className="pt-1 text-center text-sm">
            <span className="text-zinc-200">{t("with-account")}</span>
            {` `}
            <Link href="/signin">
              <a className="text-accent-9 font-bold hover:underline cursor-pointer">
                {t("with-account-link")}
              </a>
            </Link>
          </span>
        </Card>
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: await serverSideTranslations(locale!, ["signup"]),
});

export default SignUp;
