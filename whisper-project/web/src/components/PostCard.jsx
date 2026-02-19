import { Heart, MessageCircle, Share2, MoreHorizontal, Send } from "lucide-react";
import { Link } from "react-router"; // Added import
import { useState } from "react";
import { useLikePost, useAddComment } from "../hooks/useInteractions";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { toast } from "react-hot-toast";

const PostCard = ({ post }) => {
    const { data: currentUser } = useCurrentUser();
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState("");

    const { mutate: likePost } = useLikePost();
    const { mutate: addComment, isPending: isAddingComment } = useAddComment();

    const isLiked = currentUser && post.likes?.includes(currentUser._id);

    const handleLike = () => {
        likePost(post._id);
    };

    const handleShare = () => {
        const url = `${window.location.origin}/post/${post._id}`;
        navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
    };

    const handleCommentSubmit = (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        addComment({ postId: post._id, text: commentText });
        setCommentText("");
    };

    return (
        <div className="card bg-base-100 shadow-md border border-base-200 overflow-hidden mb-6">
            {/* Header */}
            <div className="p-4 flex items-center justify-between">
                <Link to={`/profile/${post.author.clerkId}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <div className="avatar">
                        <div className="w-10 h-10 rounded-full">
                            <img src={post.author.avatar || post.author.imageUrl || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"} alt={post.author.name} />
                        </div>
                    </div>
                    <div>
                        <p className="font-semibold text-sm">{post.author.name || "Unknown User"}</p>
                        <p className="text-xs text-base-content/60">@{post.author.clerkId?.slice(0, 8) || "user"}</p>
                    </div>
                </Link>
                <button className="btn btn-ghost btn-circle btn-sm">
                    <MoreHorizontal size={20} />
                </button>
            </div>

            {/* Image */}
            {post.images && post.images.length > 0 && (
                <figure className="w-full bg-base-200">
                    <img src={post.images[0]} alt="Post content" className="w-full h-auto object-cover max-h-[500px]" />
                </figure>
            )}

            {/* Actions */}
            <div className="p-4 pb-2">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleLike}
                        className={`btn btn-ghost btn-circle btn-sm ${isLiked ? "text-error" : ""}`}
                    >
                        <Heart size={24} fill={isLiked ? "currentColor" : "none"} />
                    </button>
                    <button onClick={() => setShowComments(!showComments)} className="btn btn-ghost btn-circle btn-sm">
                        <MessageCircle size={24} />
                    </button>
                    <button onClick={handleShare} className="btn btn-ghost btn-circle btn-sm ml-auto">
                        <Share2 size={24} />
                    </button>
                </div>
                <p className="font-semibold text-sm mt-2 pl-1">{post.likes?.length || 0} likes</p>
            </div>

            {/* Caption */}
            <div className="px-4 pb-2">
                <p className="text-sm">
                    <span className="font-semibold mr-2">{post.author.name}</span>
                    {post.caption}
                </p>
                <p className="text-xs text-base-content/50 mt-2 uppercase">
                    {new Date(post.createdAt || Date.now()).toLocaleDateString()}
                </p>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div className="border-t border-base-200 bg-base-50/50 p-4">
                    <h3 className="text-sm font-semibold mb-3">Comments</h3>

                    <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
                        {post.comments?.length > 0 ? (
                            post.comments.map((comment, idx) => (
                                <div key={idx} className="flex gap-2">
                                    <div className="avatar w-6 h-6 rounded-full shrink-0">
                                        <img
                                            src={comment.user?.avatar || comment.user?.imageUrl || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"}
                                            alt="u"
                                            className="rounded-full"
                                        />
                                    </div>
                                    <div className="bg-base-200 rounded-lg p-2 text-xs flex-1">
                                        <span className="font-bold mr-2">{comment.user?.name || "User"}</span>
                                        {comment.text}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-xs text-base-content/50 italic">No comments yet</p>
                        )}
                    </div>

                    <form onSubmit={handleCommentSubmit} className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Add a comment..."
                            className="input input-sm input-bordered w-full"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                        />
                        <button
                            type="submit"
                            className="btn btn-sm btn-primary btn-circle"
                            disabled={isAddingComment || !commentText.trim()}
                        >
                            <Send size={16} />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default PostCard;
