import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import api from "../lib/axios";
import { toast } from "react-hot-toast";

export const useLikePost = () => {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (postId) => {
            const token = await getToken();
            const { data } = await api.post(
                `/posts/${postId}/like`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return data;
        },
        onSuccess: (updatedPost) => {
            // Invalidate relevant queries to refresh data
            queryClient.setQueryData(["random-posts"], (oldPosts) => {
                if (!oldPosts) return [];
                return oldPosts.map((p) => (p._id === updatedPost._id ? updatedPost : p));
            });
            // queryClient.invalidateQueries({ queryKey: ["random-posts"] });
        },
        onError: (error) => {
            toast.error("Failed to like post");
            console.error(error);
        },
    });
};

export const useAddComment = () => {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ postId, text }) => {
            const token = await getToken();
            const { data } = await api.post(
                `/posts/${postId}/comment`,
                { text },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return data;
        },
        onSuccess: (updatedPost) => {
            queryClient.setQueryData(["random-posts"], (oldPosts) => {
                if (!oldPosts) return [];
                return oldPosts.map((p) => (p._id === updatedPost._id ? updatedPost : p));
            });
            toast.success("Comment added!");
        },
        onError: (error) => {
            toast.error("Failed to add comment");
            console.error(error);
        },
    });
};
