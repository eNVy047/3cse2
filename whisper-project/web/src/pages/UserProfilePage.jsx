import { Mail, Grid, Loader2, MessageSquare } from "lucide-react";
import { useUserPosts } from "../hooks/usePosts";
import { useUserProfile } from "../hooks/useUserProfile";
import { useGetOrCreateChat } from "../hooks/useChats";
import PostCard from "../components/PostCard";
import ActivityBar from "../components/ActivityBar";
import { useParams, useNavigate } from "react-router";

const UserProfilePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: userProfile, isLoading: isUserProfileLoading } = useUserProfile(id);
    const { mutate: createChat, isPending: isCreatingChat } = useGetOrCreateChat();
    const { data: posts, isLoading: isPostsLoading } = useUserPosts(userProfile?.clerkId || id);

    const handleMessage = () => {
        if (!userProfile) return;
        createChat(userProfile._id, {
            onSuccess: (chat) => {
                navigate(`/chat?chat=${chat._id}`);
            },
        });
    };

    if (isUserProfileLoading || !userProfile) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="animate-spin text-primary" size={40} />
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Profile Header */}
                <div className="bg-base-100 rounded-2xl p-6 shadow-sm border border-base-200 flex flex-col md:flex-row items-center md:items-start gap-6">
                    <div className="avatar">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-primary/10">
                            <img src={userProfile.avatar || "/avatar-placeholder.png"} alt={userProfile.name} />
                        </div>
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-2">
                        <h1 className="text-2xl md:text-3xl font-bold">{userProfile.name}</h1>
                        {userProfile.bio && (
                            <p className="text-base-content/70 max-w-lg mx-auto md:mx-0">{userProfile.bio}</p>
                        )}
                        <div className="flex items-center justify-center md:justify-start gap-2 text-base-content/60 pt-1">
                            <Mail size={16} />
                            <span>{userProfile.email}</span>
                        </div>
                        <p className="text-sm text-base-content/50">
                            Joined {new Date(userProfile.createdAt).toLocaleDateString()}
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <button
                            className="btn btn-primary btn-sm gap-2"
                            onClick={handleMessage}
                            disabled={isCreatingChat}
                        >
                            {isCreatingChat ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <MessageSquare size={16} />
                            )}
                            Message
                        </button>
                    </div>
                </div>

                {/* Activity Bar */}
                <ActivityBar stats={userProfile.stats} joinedAt={userProfile.createdAt} />

                {/* Posts Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-base-200">
                        <Grid size={20} />
                        <h2 className="font-semibold text-lg">
                            {`${userProfile.name.split(" ")[0]}'s Posts`}
                        </h2>
                        <span className="badge badge-neutral badge-sm">{posts?.length || 0}</span>
                    </div>

                    {isPostsLoading ? (
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
        </div>
    );
};

export default UserProfilePage;
