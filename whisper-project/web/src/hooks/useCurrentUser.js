import { useQuery } from "@tanstack/react-query";
import api from "../lib/axios";
import { useAuth } from "@clerk/clerk-react";

export const useCurrentUser = () => {
  const { isSignedIn } = useAuth();

  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data } = await api.get("/users/me");
      return data;
    },
    enabled: !!isSignedIn,
  });
};
