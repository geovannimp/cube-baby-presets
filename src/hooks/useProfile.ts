import { useQuery } from "@tanstack/react-query";
import { UserService } from "../services/userService";

export const useProfile = (userId?: string) => {
  return useQuery(
    ["profile", userId],
    async () => (userId ? UserService.getProfile(userId) : undefined),
    {
      enabled: !!userId,
    }
  );
};
