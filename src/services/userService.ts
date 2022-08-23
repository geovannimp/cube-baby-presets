import { supabaseClient } from "@supabase/supabase-auth-helpers/nextjs";
import { getURL } from "../utils/helpers";

export interface Profile {
  id: string;
  username: string;
}

const signin = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<Profile> => {
  const { error, user } = await supabaseClient.auth.signIn(
    { email, password },
    { redirectTo: getURL() }
  );
  if (user) {
    const { error, data: profile } = await supabaseClient
      .from<Profile>("profiles")
      .select()
      .eq("id", user.id)
      .single();

    if (profile) {
      return profile;
    } else {
      throw error;
    }
  } else {
    throw error;
  }
};

// https://github.com/supabase/supabase/discussions/3491
const signup = async ({
  username,
  email,
  password,
}: {
  username: string;
  email: string;
  password: string;
}) => {
  const { error, user: createdUser } = await supabaseClient.auth.signUp(
    {
      email,
      password,
    },
    {
      data: {
        username,
      },
    }
  );
  if (createdUser) {
    return createdUser;
  } else {
    throw error;
  }
};

const updateUserProfile = async (
  userId: string,
  { username }: Partial<Profile>
): Promise<Profile> => {
  const { error, body: profile } = await supabaseClient
    .from<Profile>("profiles")
    .update({ username })
    .eq("id", userId)
    .single();

  if (profile) {
    return profile;
  } else {
    throw error;
  }
};

const getProfile = async (userId: string) => {
  const { error, body: profile } = await supabaseClient
    .from<Profile>("profiles")
    .select()
    .eq("id", userId)
    .single();

  if (profile) {
    return profile;
  } else {
    throw error;
  }
};

const logout = async () => {
  const { error } = await supabaseClient.auth.signOut();

  if (error) {
    throw error;
  } else {
    throw error;
  }
};

export const UserService = {
  signin,
  signup,
  getProfile,
  logout,
};
