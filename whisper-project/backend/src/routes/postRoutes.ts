import { Router } from "express";
import multer from "multer";
import {
    createPost,
    getPostById,
    getPosts,
    getUserPosts,
    getRandomPosts,
    likePost,
    addComment,
    deletePost,
} from "../controllers/postController";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB per file
    },
    fileFilter: (req, file, cb) => {
        // Accept images only
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Only image files are allowed"));
        }
    },
});

// Create post (with image upload)
router.post("/", requireAuth, upload.array("images", 10), createPost);

// Get feed posts
router.get("/", getPosts);

// Get random posts
router.get("/random", getRandomPosts);

// Get single post by ID
router.get("/:postId", getPostById);

// Get user's posts
router.get("/user/:userId", getUserPosts);

// Like/unlike post
router.post("/:postId/like", requireAuth, likePost);

// Add comment
router.post("/:postId/comment", requireAuth, addComment);

// Delete post
router.delete("/:postId", requireAuth, deletePost);

export default router;
