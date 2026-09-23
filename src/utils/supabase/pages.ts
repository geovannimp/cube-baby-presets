import {
  createServerClient,
  parseCookieHeader,
  serializeCookieHeader,
} from "@supabase/ssr";

type CookieContext = {
  req: { headers: { cookie?: string } };
  res: {
    appendHeader: (name: string, value: string) => void;
    setHeader: (
      name: string,
      value: string | number | readonly string[]
    ) => void;
  };
};

export function createPagesServerClient(context: CookieContext) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "public-anon-key",
    {
      cookies: {
        getAll() {
          return parseCookieHeader(context.req.headers.cookie ?? "");
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value, options }) =>
            context.res.appendHeader(
              "Set-Cookie",
              serializeCookieHeader(name, value, options)
            )
          );
          Object.entries(headers).forEach(([key, value]) =>
            context.res.setHeader(key, value)
          );
        },
      },
    }
  );
}
