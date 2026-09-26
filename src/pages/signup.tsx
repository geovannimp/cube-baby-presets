import Link from "next/link";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useMemo } from "react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetStaticProps } from "next";
import { useForm } from "@tanstack/react-form";
import { useUser } from "../hooks/useUser";
import { z } from "zod";
import { toast } from "sonner";

import { UserService } from "../services/userService";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { AuthShell } from "../components/AuthShell";
import { fieldErrorMessage } from "../utils/fieldErrorMessage";

const SignUp = () => {
  const { t } = useTranslation("signup");
  const router = useRouter();
  const { user } = useUser();

  const schema = useMemo(
    () =>
      z
        .object({
          username: z.string().min(1, t("username-field-required-error")),
          email: z
            .string({
              required_error: t("email-field-required-error"),
            })
            .min(1, t("email-field-required-error"))
            .email(t("email-field-validation-error")),
          password: z
            .string({
              required_error: t("password-field-required-error"),
            })
            .min(6, t("password-field-min-length-error")),
          confirmPassword: z
            .string({
              required_error: t("password-field-required-error"),
            })
            .min(1, t("password-field-required-error")),
        })
        .required()
        .refine((data) => data.password === data.confirmPassword, {
          message: t("password-confirmation-do-not-match"),
          path: ["confirmPassword"],
        }),
    [t]
  );

  const form = useForm({
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validators: {
      onSubmit: schema,
      onSubmitAsync: async ({ value }) => {
        const available = await UserService.isUsernameAvailable(value.username);
        if (!available) {
          return {
            fields: {
              username: t("username-unavailable-error"),
            },
          };
        }
        return undefined;
      },
    },
    onSubmit: async ({ value }) => {
      try {
        await UserService.signup({
          email: value.email,
          username: value.username,
          password: value.password,
        });
        toast.success(t("submit-success-message"));
      } catch ({ message }: any) {
        toast.error(message as string);
      }
    },
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
        <form
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            void form.handleSubmit();
          }}
          noValidate
        >
          <FieldGroup>
            <form.Field name="username">
              {(field) => {
                const error = fieldErrorMessage(field.state.meta.errors);
                return (
                  <Field data-invalid={error ? true : undefined}>
                    <FieldLabel htmlFor={field.name}>{`${t("username-field")} *`}</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      autoComplete="username"
                      autoFocus
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      aria-invalid={!!error}
                    />
                    {error ? <FieldError>{error}</FieldError> : null}
                  </Field>
                );
              }}
            </form.Field>
            <form.Field name="email">
              {(field) => {
                const error = fieldErrorMessage(field.state.meta.errors);
                return (
                  <Field data-invalid={error ? true : undefined}>
                    <FieldLabel htmlFor={field.name}>{`${t("email-field")} *`}</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="email"
                      autoComplete="email"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      aria-invalid={!!error}
                    />
                    {error ? <FieldError>{error}</FieldError> : null}
                  </Field>
                );
              }}
            </form.Field>
            <form.Field name="password">
              {(field) => {
                const error = fieldErrorMessage(field.state.meta.errors);
                const descriptionId = `${field.name}-description`;
                return (
                  <Field data-invalid={error ? true : undefined}>
                    <FieldLabel htmlFor={field.name}>{`${t("password-field")} *`}</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="password"
                      autoComplete="new-password"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      aria-invalid={!!error}
                      aria-describedby={descriptionId}
                    />
                    <FieldDescription id={descriptionId}>
                      {t("password-field-description")}
                    </FieldDescription>
                    {error ? <FieldError>{error}</FieldError> : null}
                  </Field>
                );
              }}
            </form.Field>
            <form.Field name="confirmPassword">
              {(field) => {
                const error = fieldErrorMessage(field.state.meta.errors);
                return (
                  <Field data-invalid={error ? true : undefined}>
                    <FieldLabel htmlFor={field.name}>
                      {`${t("confirm-password-field")} *`}
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="password"
                      autoComplete="new-password"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      aria-invalid={!!error}
                    />
                    {error ? <FieldError>{error}</FieldError> : null}
                  </Field>
                );
              }}
            </form.Field>
            <form.Subscribe selector={(state) => state.isSubmitting}>
              {(isSubmitting) => (
                <Button
                  className="mt-3 h-11 w-full text-base"
                  size="lg"
                  disabled={isSubmitting}
                  type="submit"
                >
                  {isSubmitting ? <Spinner /> : t("signup-button")}
                </Button>
              )}
            </form.Subscribe>
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
