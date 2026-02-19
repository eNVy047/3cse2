import type { Request, Response, NextFunction } from "express";
import type { AuthRequest } from "../middleware/auth";
import { User } from "../models/User";
import Post from "../models/Post";
import { uploadToCloudinary } from "../config/cloudinary";

export const searchUsers = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;
    if (!query || typeof query !== "string") {
      return res.status(200).json([]);
    }

    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
    }).select("name email avatar bio _id clerkId");

    res.status(200).json(users);
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ error: "Failed to search users" });
  }
};

// Update user profile
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { name, bio } = req.body;
    const file = req.file;

    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (file) {
      const imageUrl = await uploadToCloudinary(file.buffer);
      user.avatar = imageUrl;
    }

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;

    await user.save();

    res.json(user);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
};

// Get current authenticated user
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await User.findOne({ clerkId: userId }).select("-__v");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const postsCount = await Post.countDocuments({ author: user._id });
    const likesAggregation = await Post.aggregate([
      { $match: { author: user._id } },
      { $project: { likesCount: { $size: "$likes" } } },
      { $group: { _id: null, totalLikes: { $sum: "$likesCount" } } },
    ]);
    const likesReceived = likesAggregation.length > 0 ? likesAggregation[0].totalLikes : 0;

    res.status(200).json({ ...user.toObject(), stats: { postsCount, likesReceived } });
  } catch (error) {
    console.error("Error fetching current user:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find().select("-__v");
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// Get user by clerkId
export const getUserByClerkId = async (req: Request, res: Response) => {
  try {
    const { clerkId } = req.params;
    const user = await User.findOne({ clerkId }).select("-__v");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const postsCount = await Post.countDocuments({ author: user._id });
    const likesAggregation = await Post.aggregate([
      { $match: { author: user._id } },
      { $project: { likesCount: { $size: "$likes" } } },
      { $group: { _id: null, totalLikes: { $sum: "$likesCount" } } },
    ]);
    const likesReceived = likesAggregation.length > 0 ? likesAggregation[0].totalLikes : 0;

    res.status(200).json({ ...user.toObject(), stats: { postsCount, likesReceived } });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
};
