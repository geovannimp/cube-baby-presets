import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useUser } from "@supabase/supabase-auth-helpers/react";
import { supabaseClient } from "@supabase/supabase-auth-helpers/nextjs";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";

import { getURL } from "../utils/helpers";
import LoadingDots from "../components/LoadingDots";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { GetStaticProps } from "next/types";

const SignIn = () => {
  const { t } = useTranslation("signin");
  const router = useRouter();
  const { user } = useUser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type?: "note" | "error";
    content?: string;
  }>({});

  const handleSignin = async () => {
    setLoading(true);
    setMessage({});

    const { error } = await supabaseClient.auth.signIn(
      { email, password },
      { redirectTo: getURL() }
    );
    if (error) {
      setMessage({ type: "error", content: error.message });
    }
    if (!password) {
      setMessage({
        type: "note",
        content: "Check your email for the magic link.",
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      router.replace("/account");
    }
  }, [user]);

  if (!user)
    return (
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
              type="email"
              label={`${t("email-field")} '`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              label={`${t("password-field")} '`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </form>

          <Button
            className="mt-1"
            type="submit"
            onClick={handleSignin}
            disabled={!password.length || !email.length}
          >
            {loading ? <LoadingDots /> : t("signin-button")}
          </Button>

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
