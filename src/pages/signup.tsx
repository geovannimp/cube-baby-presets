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
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { AuthShell } from "../components/AuthShell";

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
        <title>Cube Baby Presets - Sign Up</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <AuthShell
        title={t("signup-button")}
        footer={
          <p className="text-sm leading-relaxed">
            <span className="text-muted-foreground">{t("with-account")}</span>
            {` `}
            <Link
              href="/signin"
              className="font-semibold text-primary underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none dark:text-[oklch(0.82_0.12_255)]"
            >
              {t("with-account-link")}
            </Link>
          </p>
        }
      >
        <form onSubmit={handleSignup} noValidate>
          <FieldGroup>
            <Field data-invalid={!!errors.username || undefined}>
              <FieldLabel htmlFor="username">{`${t("username-field")} *`}</FieldLabel>
              <Input
                id="username"
                autoComplete="username"
                autoFocus
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
                autoComplete="email"
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
                autoComplete="new-password"
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
                autoComplete="new-password"
                aria-invalid={!!errors.confirmPassword}
                {...register("confirmPassword")}
              />
              {errors.confirmPassword?.message && (
                <FieldError>{errors.confirmPassword.message}</FieldError>
              )}
            </Field>
            <Button
              className="mt-3 h-11 w-full text-base"
              size="lg"
              disabled={!isValid || isSubmitting}
              type="submit"
            >
              {isSubmitting ? <Spinner /> : t("signup-button")}
            </Button>
          </FieldGroup>
        </form>
      </AuthShell>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: await serverSideTranslations(locale!, ["common", "signup"]),
});

export default SignUp;
