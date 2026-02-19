import { useQuery } from "@tanstack/react-query";
import api from "../lib/axios";

export const useRandomPosts = () => {
    return useQuery({
        queryKey: ["random-posts"],
        queryFn: async () => {
            const { data } = await api.get("/posts/random");
            return data;
        },
        refetchOnWindowFocus: false, // Don't refetch every time user switches tabs
    });
};

export const useUserPosts = (userId) => {
    return useQuery({
        queryKey: ["user-posts", userId],
        queryFn: async () => {
            const { data } = await api.get(`/posts/user/${userId}`);
            return data;
        },
        enabled: !!userId,
    });
};
