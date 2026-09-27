import { useQuery } from "@tanstack/react-query";
import { UserService } from "../services/userService";

export const useProfile = (userId?: string) => {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => (userId ? UserService.getProfile(userId) : undefined),
    enabled: !!userId,
  });
};
