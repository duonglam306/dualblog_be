import express from "express";
import {
    authUser,
    registerUser,
    getCurrentUser,
    updateUser,
    getProfiles,
    followUser,
    unFollowUser,
    getFollowList,
    getUnFollowList,
    searchUsers,
    activateAccount,
    forgotPassword,
    resetPassword,
} from "../controllers/userControllers.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/users/login", authUser);
router.route("/users/search").get(searchUsers);
router.route("/user").get(protect, getCurrentUser).put(protect, updateUser);
router.route("/profiles/:username/followList").get(getFollowList);
router.route("/profiles/unFollowList").get(getUnFollowList);
router.post("/users", registerUser);
router.post("/profiles/:username/follow", protect, followUser);
router.delete("/profiles/:username/follow", protect, unFollowUser);
router.route("/profiles/:username").get(getProfiles);
router.post("/user/emailActivate", activateAccount);
router.post('/user/forgotPassword', forgotPassword);
router.put('/user/resetPassword/:resetToken', resetPassword);

export default router;
