import Link from "next/link";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetStaticProps } from "next";
import { useUser } from "../hooks/useUser";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { UserService } from "../services/userService";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

const SignUp = () => {
  const { t } = useTranslation("signup");
  const router = useRouter();
  const { user } = useUser();

  const schema = z
    .object({
      username: z
        .string()
        .min(1, t("username-field-required-error"))
        .refine(
          UserService.isUsernameAvailable,
          t("username-unavailable-error")
        ),
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
      path: ["confirmPassword"],
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
      toast.success(t("submit-success-message"));
    } catch ({ message }: any) {
      toast.error(message as string);
    }
  });

  useEffect(() => {
    if (user) {
      router.replace("/account");
    }
  }, [user, router]);

  return (
    <>
      <Head>
        <title>Cube Baby Presets - Sign Un</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex h-screen w-full flex-col items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col gap-8 pt-6">
            <p className="pt-6 pb-4 text-center text-2xl font-bold text-foreground">
              Cube Baby Presets
            </p>

            <form onSubmit={handleSignup}>
              <FieldGroup>
                <Field data-invalid={!!errors.username || undefined}>
                  <FieldLabel htmlFor="username">{`${t("username-field")} *`}</FieldLabel>
                  <Input
                    id="username"
                    aria-invalid={!!errors.username}
                    {...register("username")}
                  />
                  {errors.username?.message && (
                    <FieldError>{errors.username.message}</FieldError>
                  )}
                </Field>
                <Field data-invalid={!!errors.email || undefined}>
                  <FieldLabel htmlFor="email">{`${t("email-field")} *`}</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    aria-invalid={!!errors.email}
                    required
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
                    {...register("password")}
                  />
                  {errors.password?.message && (
                    <FieldError>{errors.password.message}</FieldError>
                  )}
                </Field>
                <Field data-invalid={!!errors.confirmPassword || undefined}>
                  <FieldLabel htmlFor="confirmPassword">{`${t("confirm-password-field")} *`}</FieldLabel>
                  <Input
                    id="confirmPassword"
                    type="password"
                    aria-invalid={!!errors.confirmPassword}
                    {...register("confirmPassword")}
                  />
                  {errors.confirmPassword?.message && (
                    <FieldError>{errors.confirmPassword.message}</FieldError>
                  )}
                </Field>
                <Button className="mt-2 w-full" disabled={!isValid} type="submit">
                  {isSubmitting ? <Spinner /> : t("signup-button")}
                </Button>
              </FieldGroup>
            </form>

            <span className="pt-1 text-center text-sm">
              <span className="text-muted-foreground">{t("with-account")}</span>
              {` `}
              <Link
                href="/signin"
                className="font-bold text-primary hover:underline"
              >
                {t("with-account-link")}
              </Link>
            </span>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: await serverSideTranslations(locale!, ["signup"]),
});

export default SignUp;
