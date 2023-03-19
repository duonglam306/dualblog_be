import express from "express";
import {
    getArticles,
    getArticleBySlug,
    getArticlesFeed,
    getArticlesPopular,
    createArticle,
    updateArticle,
    deleteArticle,
    createComment,
    getComments,
    deleteComment,
    favoriteArticle,
    unFavoriteArticle,
    getArticlesRelative,
    searchArticles,
} from "../controllers/articleControllers.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();

router.route("/").get(getArticles);
router.route("/search").get(searchArticles);
router.route("/relative").get(getArticlesRelative);
router.route("/popular").get(getArticlesPopular);
router.post("/", protect, createArticle);
router.route("/feed").get(protect, getArticlesFeed);
router.delete("/:slug/comments/:id", protect, deleteComment);
router.route("/:slug/comments").get(getComments);
router.post("/:slug/comments", protect, createComment);
router.delete("/:slug/favorite", protect, unFavoriteArticle);
router.post("/:slug/favorite", protect, favoriteArticle);
router.delete("/:slug", protect, deleteArticle);
router.route("/:slug").get(getArticleBySlug).put(protect, updateArticle);

export default router;
