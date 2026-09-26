import type { NextApiRequest, NextApiResponse } from "next";
import { createPagesServerClient } from "../../../utils/supabase/pages";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const supabase = createPagesServerClient({ req, res });
  await supabase.auth.signOut();
  res.redirect(302, "/signin");
}
