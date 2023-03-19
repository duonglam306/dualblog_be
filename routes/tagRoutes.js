import express from "express";
import {
    getTags,
    searchTags
} from "../controllers/tagControllers.js";
const router = express.Router();

router.route("/").get(getTags);
router.route("/search").get(searchTags);

export default router;
