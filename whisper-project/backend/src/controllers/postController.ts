import type { Request, Response } from "express";
import Post from "../models/Post";
import { User } from "../models/User";
import { uploadToCloudinary, deleteFromCloudinary } from "../config/cloudinary";

// Create a new post
export const createPost = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).auth?.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const { caption, taggedUsers } = req.body;
        const files = req.files as Express.Multer.File[];

        if (!files || files.length === 0) {
            return res.status(400).json({ error: "At least one image is required" });
        }

        if (files.length > 10) {
            return res.status(400).json({ error: "Maximum 10 images allowed" });
        }

        // Find user in database
        const user = await User.findOne({ clerkId: userId });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Upload images to Cloudinary
        const imageUrls: string[] = [];
        for (const file of files) {
            const imageUrl = await uploadToCloudinary(file.buffer);
            imageUrls.push(imageUrl);
        }

        // Parse tagged users if provided
        let parsedTaggedUsers: string[] = [];
        if (taggedUsers) {
            parsedTaggedUsers = typeof taggedUsers === "string"
                ? JSON.parse(taggedUsers)
                : taggedUsers;
        }

        // Create post
        const post: any = await Post.create({
            author: user._id,
            images: imageUrls,
            caption: caption || "",
            taggedUsers: parsedTaggedUsers,
            likes: [],
            comments: [],
        } as any);

        // Populate author details
        await post.populate("author", "clerkId name email avatar");
        await post.populate("taggedUsers", "clerkId name avatar");

        res.status(201).json(post);
    } catch (error) {
        console.error("Error creating post:", error);
        res.status(500).json({ error: "Failed to create post" });
    }
};

// Get post by ID
export const getPostById = async (req: Request, res: Response) => {
    try {
        const { postId } = req.params;

        const post = await Post.findById(postId)
            .populate("author", "clerkId name email avatar")
            .populate("taggedUsers", "clerkId name avatar")
            .populate("comments.user", "clerkId name avatar");

        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        res.status(200).json(post);
    } catch (error) {
        console.error("Error fetching post:", error);
        res.status(500).json({ error: "Failed to fetch post" });
    }
};

// Get feed posts (paginated)
export const getPosts = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("author", "clerkId name email avatar")
            .populate("taggedUsers", "clerkId name avatar")
            .populate("comments.user", "clerkId name avatar");

        const total = await Post.countDocuments();

        res.json({
            posts,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).json({ error: "Failed to fetch posts" });
    }
};

// Get user's posts
export const getUserPosts = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        // Find user by clerkId
        const user = await User.findOne({ clerkId: userId });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const posts = await Post.find({ author: user._id })
            .sort({ createdAt: -1 })
            .populate("author", "clerkId name email avatar")
            .populate("taggedUsers", "clerkId name avatar")
            .populate("comments.user", "clerkId name avatar");

        res.json(posts);
    } catch (error) {
        console.error("Error fetching user posts:", error);
        res.status(500).json({ error: "Failed to fetch user posts" });
    }
};

// Get random posts
export const getRandomPosts = async (req: Request, res: Response) => {
    try {
        const posts = await Post.aggregate([
            { $sample: { size: 10 } },
            {
                $lookup: {
                    from: "users",
                    localField: "author",
                    foreignField: "_id",
                    as: "author",
                },
            },
            { $unwind: "$author" },
            {
                $project: {
                    "author.password": 0,
                    "author.email": 0,
                }
            }
        ]);


        res.json(posts);
    } catch (error) {
        console.error("Error fetching random posts:", error);
        res.status(500).json({ error: "Failed to fetch random posts" });
    }
};

// Like/unlike a post
export const likePost = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).auth?.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const { postId } = req.params;

        const user = await User.findOne({ clerkId: userId });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        const likeIndex = post.likes.indexOf(user._id);
        if (likeIndex > -1) {
            // Unlike
            post.likes.splice(likeIndex, 1);
        } else {
            // Like
            post.likes.push(user._id);
        }

        await post.save();
        await post.populate("author", "clerkId name email avatar");
        await post.populate("taggedUsers", "clerkId name avatar");

        res.json(post);
    } catch (error) {
        console.error("Error liking post:", error);
        res.status(500).json({ error: "Failed to like post" });
    }
};

// Add comment to post
export const addComment = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).auth?.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const { postId } = req.params;
        const { text } = req.body;

        if (!text || text.trim().length === 0) {
            return res.status(400).json({ error: "Comment text is required" });
        }

        const user = await User.findOne({ clerkId: userId });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        post.comments.push({
            user: user._id,
            text: text.trim(),
            createdAt: new Date(),
        });

        await post.save();
        await post.populate("author", "clerkId name email avatar");
        await post.populate("taggedUsers", "clerkId name avatar");
        await post.populate("comments.user", "clerkId name avatar");

        res.json(post);
    } catch (error) {
        console.error("Error adding comment:", error);
        res.status(500).json({ error: "Failed to add comment" });
    }
};

// Delete post
export const deletePost = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).auth?.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const { postId } = req.params;

        const user = await User.findOne({ clerkId: userId });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        // Check if user is the author
        if (post.author.toString() !== user._id.toString()) {
            return res.status(403).json({ error: "Not authorized to delete this post" });
        }

        // Delete images from Cloudinary
        for (const imageUrl of post.images) {
            try {
                await deleteFromCloudinary(imageUrl);
            } catch (error) {
                console.error("Error deleting image from Cloudinary:", error);
            }
        }

        await Post.findByIdAndDelete(postId);

        res.json({ message: "Post deleted successfully" });
    } catch (error) {
        console.error("Error deleting post:", error);
        res.status(500).json({ error: "Failed to delete post" });
    }
};
