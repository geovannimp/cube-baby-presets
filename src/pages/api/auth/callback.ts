import type { NextApiRequest, NextApiResponse } from "next";
import { createPagesServerClient } from "../../../utils/supabase/pages";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const code = req.query.code;
  const next = typeof req.query.next === "string" ? req.query.next : "/";
  if (typeof code === "string") {
    const supabase = createPagesServerClient({ req, res });
    await supabase.auth.exchangeCodeForSession(code);
  }
  res.redirect(next);
}
