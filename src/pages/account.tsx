import { GetServerSideProps, NextPage } from "next";

import { createPagesServerClient } from "../utils/supabase/pages";

// `/account` was a second, own-presets-only profile. It now just forwards to
// the profile page, so old links and bookmarks keep working. Signed-out
// visitors still land on the sign-in page, as before.
const Account: NextPage = () => null;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const supabase = createPagesServerClient(ctx);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      redirect: {
        destination: "/signin",
        permanent: false,
      },
    };
  }

  return {
    redirect: {
      destination: `/profile/${user.id}`,
      permanent: false,
    },
  };
};

export default Account;
