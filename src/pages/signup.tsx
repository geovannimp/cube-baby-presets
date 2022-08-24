import Link from "next/link";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState, FormEvent } from "react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetStaticProps } from "next";
import { useUser } from "@supabase/supabase-auth-helpers/react";

import { UserService } from "../services/userService";
import LoadingDots from "../components/LoadingDots";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { Card } from "../components/Card";

const SignUp = () => {
  const { t } = useTranslation("signup");
  const router = useRouter();
  const { user } = useUser();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type?: "note" | "error";
    content?: string;
  }>({});

  const handleSignup = async () => {
    setMessage({});

    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      setMessage({
        type: "error",
        content: "Email is invalid.",
      });
      return;
    }

    if (confirmPassword !== password) {
      setMessage({
        type: "error",
        content: "Passwords must be equal.",
      });
      return;
    }

    if (email && username && password) {
      setLoading(true);
      try {
        await UserService.signup({
          email,
          username,
          password,
        });
        setMessage({
          type: "note",
          content: "Please, check you email to confirm your account.",
        });
      } catch (error) {
        setMessage({ type: "error", content: (error as any)?.message });
      } finally {
        setLoading(false);
      }
    } else {
      setMessage({
        type: "error",
        content: "All fields are required.",
      });
    }
  };

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

          {message.content && (
            <div
              className={`${
                message.type === "error" ? "text-pink-500" : "text-green-500"
              } border ${
                message.type === "error"
                  ? "border-pink-500"
                  : "border-green-500"
              } p-3`}
            >
              {message.content}
            </div>
          )}

          <form className="flex flex-col space-y-2">
            <Input
              label={`${t("username-field")} *`}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <Input
              label={`${t("email-field")} *`}
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label={`${t("password-field")} *`}
              type="password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <Input
              label={`${t("confirm-password-field")} *`}
              type="password"
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </form>

          <Button
            disabled={loading || !email.length || !password.length}
            onClick={handleSignup}
          >
            {loading ? <LoadingDots /> : t("signup-button")}
          </Button>

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
