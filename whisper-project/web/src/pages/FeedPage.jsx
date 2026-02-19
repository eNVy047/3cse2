import React from 'react';
import { SquareActivity, RefreshCw } from "lucide-react";
import { useRandomPosts } from '../hooks/usePosts';
import PostCard from '../components/PostCard';

const FeedPage = () => {
    const { data: posts, isLoading, isError, refetch } = useRandomPosts();

    if (isLoading) {
        return (
            <div className="p-8 max-w-xl mx-auto flex items-center justify-center min-h-[50vh]">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-8 max-w-xl mx-auto text-center">
                <p className="text-error mb-4">Failed to load feed</p>
                <button onClick={() => refetch()} className="btn btn-primary btn-sm gap-2">
                    <RefreshCw size={16} /> Retry
                </button>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-xl mx-auto">


            <button
                onClick={() => refetch()}
                className="btn btn-primary btn-circle shadow-lg fixed bottom-6 right-6 z-50"
                title="Refresh Feed"
            >
                <RefreshCw size={24} />
            </button>

            <div className="space-y-6">
                {posts && posts.length > 0 ? (
                    posts.map((post) => (
                        <PostCard key={post._id} post={post} />
                    ))
                ) : (
                    <div className="text-center py-10 text-base-content/60">
                        <p>No posts found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FeedPage;
