import { Router } from "express";
import { protectRoute } from "../middleware/auth";
import { requireAuth } from "../middleware/requireAuth";
import { getUsers, getUserByClerkId, getCurrentUser, updateProfile, searchUsers } from "../controllers/userController";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

router.put("/update", requireAuth, upload.single("avatar"), updateProfile);
router.get("/search", protectRoute, searchUsers);
router.get("/me", requireAuth, getCurrentUser);
router.get("/", protectRoute, getUsers);
router.get("/:clerkId", protectRoute, getUserByClerkId);

export default router;
