import { createClient } from "../utils/supabase/client";
import { getURL } from "../utils/helpers";

export interface Profile {
  id: string;
  username: string;
}

const supabase = createClient();

const signin = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<Profile> => {
  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    throw error ?? new Error("Sign in failed");
  }

  const { error: profileError, data: profile } = await supabase
    .from("profiles")
    .select()
    .eq("id", data.user.id)
    .single();

  if (profile) {
    return profile as Profile;
  }

  throw profileError ?? new Error("Profile not found");
};

const signup = async ({
  username,
  email,
  password,
}: {
  username: string;
  email: string;
  password: string;
}) => {
  const { error, data } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username },
      emailRedirectTo: getURL(),
    },
  });

  if (data.user) {
    return data.user;
  }

  throw error ?? new Error("Sign up failed");
};

const updateUserProfile = async (
  userId: string,
  { username }: Partial<Profile>
): Promise<Profile> => {
  const { error, data: profile } = await supabase
    .from("profiles")
    .update({ username })
    .eq("id", userId)
    .select()
    .single();

  if (profile) {
    return profile as Profile;
  }

  throw error ?? new Error("Failed to update profile");
};

const getProfile = async (userId: string) => {
  const { error, data: profile } = await supabase
    .from("profiles")
    .select()
    .eq("id", userId)
    .single();

  if (profile) {
    return profile as Profile;
  }

  throw error ?? new Error("Profile not found");
};

const isUsernameAvailable = async (username: string) => {
  const { data: profiles } = await supabase
    .from("profiles")
    .select("username")
    .eq("username", username);

  return !profiles?.length;
};

const logout = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
};

export const UserService = {
  signin,
  signup,
  getProfile,
  logout,
  isUsernameAvailable,
  updateUserProfile,
};
