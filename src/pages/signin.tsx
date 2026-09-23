import Link from "next/link";
import Head from "next/head";
import { GetStaticProps } from "next/types";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useUser } from "../hooks/useUser";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { toast } from "sonner";
import { useTranslation } from "next-i18next";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
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
        toast.error(t("submit-invalid-grant-error"));
      } else {
        toast.error(message as string);
      }
    }
  });

  useEffect(() => {
    if (user) {
      router.replace("/account");
    }
  }, [user, router]);

  if (!user)
    return (
      <>
        <Head>
          <title>Cube Baby Presets - Sign In</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <div className="flex h-screen w-full flex-col items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col gap-8 pt-6">
              <p className="pt-6 pb-4 text-center text-2xl font-bold text-foreground">
                Cube Baby Presets
              </p>

              <form onSubmit={onSubmit}>
                <FieldGroup>
                  <Field data-invalid={!!errors.email || undefined}>
                    <FieldLabel htmlFor="email">{`${t("email-field")} *`}</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      aria-invalid={!!errors.email}
                      {...register("email")}
                    />
                    {errors.email?.message && (
                      <FieldError>{errors.email.message}</FieldError>
                    )}
                  </Field>
                  <Field data-invalid={!!errors.password || undefined}>
                    <FieldLabel htmlFor="password">{`${t("password-field")} *`}</FieldLabel>
                    <Input
                      id="password"
                      type="password"
                      aria-invalid={!!errors.password}
                      required
                      {...register("password")}
                    />
                    {errors.password?.message && (
                      <FieldError>{errors.password.message}</FieldError>
                    )}
                  </Field>
                  <Button className="mt-2 w-full" type="submit" disabled={!isValid}>
                    {isSubmitting ? <Spinner /> : t("signin-button")}
                  </Button>
                </FieldGroup>
              </form>

              <span className="pt-1 text-center text-sm">
                <span className="text-muted-foreground">{t("no-account")}</span>
                {` `}
                <Link
                  href="/signup"
                  className="font-bold text-primary hover:underline"
                >
                  {t("no-account-link")}
                </Link>
              </span>
            </CardContent>
          </Card>
        </div>
      </>
    );

  return (
    <div className="m-6 flex justify-center">
      <Spinner />
    </div>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: await serverSideTranslations(locale!, ["signin"]),
});

export default SignIn;
