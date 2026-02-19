import { useUser } from "@clerk/clerk-react";
import { User, Mail, Grid, Loader2 } from "lucide-react";
import { useUserPosts } from "../hooks/usePosts";
import { useCurrentUser } from "../hooks/useCurrentUser";
import PostCard from "../components/PostCard";
import EditProfileModal from "../components/EditProfileModal";
import ActivityBar from "../components/ActivityBar";
import { useState } from "react";

const ProfilePage = () => {
    const { user: clerkUser } = useUser();
    const { data: currentUser } = useCurrentUser();
    const { data: posts, isLoading } = useUserPosts(clerkUser?.id);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    if (!clerkUser) return null;

    // Prefer backend data (currentUser) over Clerk data (clerkUser) where available
    const displayUser = currentUser || {
        name: clerkUser.fullName,
        email: clerkUser.primaryEmailAddress?.emailAddress,
        avatar: clerkUser.imageUrl,
        createdAt: clerkUser.createdAt,
    };

    return (
        <div className="h-full overflow-y-auto p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Profile Header */}
                <div className="bg-base-100 rounded-2xl p-6 shadow-sm border border-base-200 flex flex-col md:flex-row items-center md:items-start gap-6">
                    <div className="avatar">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-primary/10">
                            <img src={displayUser.avatar || clerkUser.imageUrl} alt={displayUser.name} />
                        </div>
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-2">
                        <h1 className="text-2xl md:text-3xl font-bold">{displayUser.name}</h1>
                        {displayUser.bio && (
                            <p className="text-base-content/70 max-w-lg mx-auto md:mx-0">{displayUser.bio}</p>
                        )}
                        <div className="flex items-center justify-center md:justify-start gap-2 text-base-content/60 pt-1">
                            <Mail size={16} />
                            <span>{displayUser.email || clerkUser.primaryEmailAddress?.emailAddress}</span>
                        </div>
                        <p className="text-sm text-base-content/50">
                            Joined {new Date(displayUser.createdAt || clerkUser.createdAt).toLocaleDateString()}
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <button
                            className="btn btn-outline btn-sm"
                            onClick={() => setIsEditModalOpen(true)}
                        >
                            Edit Profile
                        </button>
                    </div>
                </div>

                {/* Activity Bar */}
                <ActivityBar stats={displayUser.stats} joinedAt={displayUser.createdAt || clerkUser.createdAt} />

                {/* Posts Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-base-200">
                        <Grid size={20} />
                        <h2 className="font-semibold text-lg">My Posts</h2>
                        <span className="badge badge-neutral badge-sm">{posts?.length || 0}</span>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="animate-spin text-primary" size={30} />
                        </div>
                    ) : posts && posts.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6">
                            {posts.map(post => (
                                <PostCard key={post._id} post={post} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-base-100 rounded-xl border border-dashed border-base-300">
                            <p className="text-base-content/50">No posts yet</p>
                        </div>
                    )}
                </div>
            </div>

            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                currentUser={currentUser}
            />
        </div>
    );
};

export default ProfilePage;

