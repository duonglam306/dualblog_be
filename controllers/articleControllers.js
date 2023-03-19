import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { Article, Comment } from "../models/articleModel.js";
import User from "../models/userModel.js";
import Tag from "../models/tagModel.js";

// @desc    Fetch all articles
// @route   GET /api/articles
// @access  Public
const getArticles = asyncHandler(async (req, res) => {
    const pageSize = Number(req.query.limit) || 20;
    const page = Number(req.query.offset) || 1;

    let filterOptions = {};
    let authImages;
    let uniqueAuthImages;
    let total;
    let totalTag = [];
    let totalAuthor;

    if (req.query.tag) {
        filterOptions = { ...filterOptions, tagList: { $in: req.query.tag } };
        const articlesTag = await Article.find({
            tagList: { $in: req.query.tag },
        });
        total = articlesTag.length;
        authImages = articlesTag.map((item) => item.auth_image);
        totalAuthor = [...new Set(authImages)].length;
        uniqueAuthImages = [...new Set(authImages)].slice(0, 10);
    }

    if (req.query.author) {
        filterOptions = { ...filterOptions, auth_name: req.query.author };
        const yourArticles = await Article.find({
            auth_name: { $in: req.query.author },
        });
        total = yourArticles.length;
        let tags = yourArticles.map((item) => item.tagList);
        for (const lst of tags) for (const tag of lst) totalTag.push(tag);
        totalTag = [...new Set(totalTag)];
    }

    if (req.query.favorited) {
        const user = await User.findOne({ username: req.query.favorited });
        if (user) {
            const favoriteList = user.favoriteList.map((item) =>
                mongoose.Types.ObjectId(item)
            );
            const articlesFavorite = await Article.find({
                _id: { $in: favoriteList },
            });
            total = articlesFavorite.length;
            authImages = articlesFavorite.map((item) => item.auth_image);
            totalAuthor = [...new Set(authImages)].length;
            uniqueAuthImages = [...new Set(authImages)].slice(0, 10);
            filterOptions = {
                ...filterOptions,
                _id: { $in: favoriteList },
            };
        }
    }

    const count = await Article.countDocuments(filterOptions);

    const articles = await Article.find(filterOptions)
        .sort({ createdAt: -1 })
        .limit(pageSize)
        .skip(pageSize * (page - 1));

    if (req.headers.authorization) {
        let token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ _id: decoded.id });
        res.json({
            articles: articles.map((item) => item.checkFavorite(user)),
            page,
            pages: Math.ceil(count / pageSize),
            total: total ? total : null,
            totalAuthor: totalAuthor ? totalAuthor : null,
            totalTag: totalTag ? totalTag : null,
            authImages: uniqueAuthImages ? uniqueAuthImages : null,
        });
    } else {
        res.json({
            articles: articles.map((item) => item.checkFavorite()),
            page,
            pages: Math.ceil(count / pageSize),
            total: total ? total : null,
            totalAuthor: totalAuthor ? totalAuthor : null,
            totalTag: totalTag ? totalTag : null,
            authImages: uniqueAuthImages ? uniqueAuthImages : null,
        });
    }
});

// @desc    Fetch all articles feed
// @route   GET /api/articles/feed
// @access  Private
const getArticlesFeed = asyncHandler(async (req, res) => {
    const pageSize = Number(req.query.limit) || 20;
    const page = Number(req.query.offset) || 1;

    let token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({ _id: decoded.id });
    if (user) {
        const count = await Article.countDocuments({
            auth_id: { $in: user.followList },
        });
        const articles = await Article.find({
            auth_id: { $in: user.followList },
        })
            .sort({ createdAt: -1 })
            .limit(pageSize)
            .skip(pageSize * (page - 1));

        res.json({
            articles: articles.map((item) => item.checkFavorite(user)),
            page,
            pages: Math.ceil(count / pageSize),
        });
    } else {
        res.status(401);
        throw new Error("Not Authorization");
    }
});

// @desc    Search article
// @route   GET /api/articles/search
// @access  Public
const searchArticles = asyncHandler(async (req, res) => {
    const pageSize = Number(req.query.limit) || 20;
    const page = Number(req.query.offset) || 1;

    const keyword = req.query.keyword
        ? {
              title: {
                  $regex: req.query.keyword,
                  $options: "i",
              },
          }
        : {};

    const count = await Article.countDocuments({
        ...keyword,
    });
    const articles = await Article.find({
        ...keyword,
    })
        .limit(pageSize)
        .skip(pageSize * (page - 1));

    if (req.headers.authorization) {
        let token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ _id: decoded.id });
        res.json({
            articles: articles.map((item) => item.checkFavorite(user)),
            page,
            pages: Math.ceil(count / pageSize),
        });
    } else {
        res.json({
            articles: articles.map((item) => item.checkFavorite()),
            page,
            pages: Math.ceil(count / pageSize),
        });
    }
});

// @desc    Fetch all articles relative
// @route   GET /api/articles/relative
// @access  Public
const getArticlesRelative = asyncHandler(async (req, res) => {
    const pageSize = Number(req.query.limit) || 5;
    const page = Number(req.query.offset) || 1;
    let filterOptions = { slug: { $nin: req.query.slug } };

    if (req.query.tag) {
        filterOptions = { ...filterOptions, tagList: { $in: req.query.tag } };
    }

    if (req.query.author) {
        filterOptions = { ...filterOptions, auth_name: req.query.author };
    }
    const count = await Article.countDocuments(filterOptions);

    const articles = await Article.find(filterOptions)
        .limit(pageSize)
        .skip(pageSize * (page - 1));
    if (articles) {
        if (req.headers.authorization) {
            let token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findOne({ _id: decoded.id });
            res.json({
                articles: articles.map((item) => item.checkFavorite(user)),
                total: count,
            });
        } else {
            res.json({
                articles: articles.map((item) => item.checkFavorite()),
                total: count,
            });
        }
    } else {
        res.status(404);
        throw new Error("Articles not found");
    }
});

// @desc    Fetch single article by slug
// @route   GET /api/articles/:slug
// @access  Public
const getArticleBySlug = asyncHandler(async (req, res) => {
    const article = await Article.findOne({ slug: req.params.slug });

    if (article) {
        if (req.headers.authorization) {
            let token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findOne({ _id: decoded.id });
            res.json({
                article: article.checkFavorite(user),
            });
        } else {
            res.json({
                article: article.checkFavorite(),
            });
        }
    } else {
        res.status(404);
        throw new Error("Article not found");
    }
});

// @desc    Fetch some article popular
// @route   GET /api/articles/popular
// @access  Public
const getArticlesPopular = asyncHandler(async (req, res) => {
    const articles = await Article.find({})
        .sort({ favoriteCount: -1 })
        .limit(6);
    if (articles) {
        res.json({ articles });
    } else {
        res.status(404);
        throw new Error("Article not found");
    }
});

// @desc    Create article
// @route   POST /api/articles
// @access  Private
const createArticle = asyncHandler(async (req, res) => {
    const { title, description, body, tagList, thumbnail_url } = req.body;

    let error = {};

    let isEmpty = false;

    if (!title) {
        error = {
            ...error,
            title: ["can't be empty"],
        };
        isEmpty = true;
    }
    if (!thumbnail_url) {
        error = {
            ...error,
            thumbnailUrl: ["can't be empty"],
        };
        isEmpty = true;
    }
    if (!description) {
        error = {
            ...error,
            description: ["can't be empty"],
        };
        isEmpty = true;
    }
    if (!body) {
        error = {
            ...error,
            body: ["can't be empty"],
        };
        isEmpty = true;
    }

    if (isEmpty) {
        res.status(422);
        res.json({
            errors: error,
        });
    } else {
        let token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findOne({ _id: decoded.id });

        if (!user) {
            res.status(401);
            throw new Error("Not Authorization");
        }

        const uniqTags = [...new Set(tagList)];

        const article = await Article.create({
            title,
            description,
            body,
            tagList: uniqTags,
            thumbnail_url,
            auth_id: user._id,
            auth_name: user.username,
            auth_image: user.image,
            slug: "",
        });

        uniqTags.forEach(async (element) => {
            const tag = await Tag.findOne({ name: element });
            if (tag) {
                tag.amount += 1;
                await tag.save();
            } else {
                await Tag.create({ name: element });
            }
        });
        if (article) {
            res.json({ article: article.checkFavorite(user) });
        } else {
            res.status(404);
            throw new Error("Article not found");
        }
    }
});

// @desc    Update article
// @route   PUT /api/articles/:slug
// @access  Private
const updateArticle = asyncHandler(async (req, res) => {
    const { title, description, body, thumbnailUrl } = req.body;

    let error = {};

    let isEmpty = false;

    if (!title) {
        error = {
            ...error,
            title: ["can't be empty"],
        };
        isEmpty = true;
    }
    if (!thumbnailUrl) {
        error = {
            ...error,
            thumbnailUrl: ["can't be empty"],
        };
        isEmpty = true;
    }
    if (!description) {
        error = {
            ...error,
            description: ["can't be empty"],
        };
        isEmpty = true;
    }
    if (!body) {
        error = {
            ...error,
            body: ["can't be empty"],
        };
        isEmpty = true;
    }

    if (isEmpty) {
        res.status(422);
        res.json({
            errors: error,
        });
    } else {
        let token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findOne({ _id: decoded.id });

        if (!user) {
            res.status(401);
            throw new Error("Not Authorization");
        }

        const article = await Article.findOne({
            slug: req.params.slug,
            auth_id: decoded.id,
        });

        if (article) {
            article.title = title ? title : article.title;
            article.description = description
                ? description
                : article.description;
            article.body = body ? body : article.body;
            article.thumbnail_url = thumbnailUrl
                ? thumbnailUrl
                : article.thumbnail_url;

            await article.save();

            res.json({ article: article.checkFavorite(user) });
        } else {
            res.status(404);
            throw new Error("Article not found");
        }
    }
});

// @desc    Delete article
// @route   DELETE /api/articles/:slug
// @access  Private
const deleteArticle = asyncHandler(async (req, res) => {
    let token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const article = await Article.findOne({
        slug: req.params.slug,
        auth_id: decoded.id,
    });
    const articleDeleted = article;

    const user = await User.findOne({ _id: decoded.id });

    if (article && user) {
        if (user.favoriteList.indexOf(String(article._id)) > -1) {
            user.favoriteList = user.favoriteList.filter(
                (favorite) => favorite !== String(article._id)
            );
        }
        article.tagList.forEach(async (tag) => {
            const tagExist = await Tag.findOne({ name: tag });
            if (tagExist.amount > 1) {
                tagExist.amount -= 1;
                await tagExist.save();
            } else {
                await tagExist.remove();
            }
        });
        await Comment.deleteMany({ article_id: { $in: String(article._id) } });
        await user.save();
        await article.remove();
        res.json({ message: "Article removed", article: articleDeleted });
    } else {
        res.status(404);
        throw new Error("Article not found");
    }
});

// @desc    Favorite article
// @route   POST /api/articles/:slug/favorite
// @access  Private
const favoriteArticle = asyncHandler(async (req, res) => {
    let token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({ _id: decoded.id });

    const article = await Article.findOne({
        slug: req.params.slug,
    });

    if (!user) {
        res.status(401);
        throw new Error("Not Authorization");
    }

    if (!article) {
        res.status(404);
        throw new Error("Article not found");
    }

    if (
        user.favoriteList.indexOf(String(article._id)) <= -1
    ) {
        user.favoriteList = [...user.favoriteList, String(article._id)];
        article.favoriteCount = article.favoriteCount + 1;

        await user.save();
        await article.save();
        res.json({ article: article.checkFavorite(user) });
    } else {
        res.status(401);
        throw new Error("Not Authorization");
    }
});

// @desc    UnFavorite article
// @route   DELETE /api/articles/:slug/favorite
// @access  Private
const unFavoriteArticle = asyncHandler(async (req, res) => {
    let token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({ _id: decoded.id });

    const article = await Article.findOne({
        slug: req.params.slug,
    });
    if (!user) {
        res.status(401);
        throw new Error("Not Authorization");
    }

    if (!article) {
        res.status(404);
        throw new Error("Article not found");
    }
    if (
        user.favoriteList.indexOf(String(article._id)) > -1
    ) {
        user.favoriteList = user.favoriteList.filter(
            (favorite) => favorite !== String(article._id)
        );
        article.favoriteCount = article.favoriteCount - 1;

        await user.save();
        await article.save();
        res.json({ article: article.checkFavorite() });
    } else {
        res.status(404);
        throw new Error("Article not found");
    }
});

// @desc    Add comment to an article
// @route   POST /api/articles/:slug/comments
// @access  Private
const createComment = asyncHandler(async (req, res) => {
    let token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({ _id: decoded.id });

    const { body, parent } = req.body;

    let error = {};

    let isEmpty = false;

    if (!body) {
        error = {
            ...error,
            body: ["can't be empty"],
        };
        isEmpty = true;
    }

    if (isEmpty) {
        res.status(422);
        res.json({
            errors: error,
        });
    } else {
        const { slug } = req.params;

        const article = await Article.findOne({
            slug: slug,
        });

        if (!article) {
            res.status(404);
            throw new Error("Article not found");
        }

        if (parent) {
            const commentP = await Comment.findOne({ _id: parent });
            let commentPoP;
            let level;
            if (commentP) {
                level = 2;
            } else {
                res.status(404);
                throw new Error("Comment not found");
            }

            if (commentP.parent_id) {
                level = 3;
                commentPoP = await Comment.findOne({ _id: commentP.parent_id });
                if (!commentPoP) {
                    res.status(404);
                    throw new Error("Comment not found");
                }
            }

            const comment = await Comment.create({
                body,
                auth_id: user._id,
                auth_name: user.username,
                auth_image: user.image,
                article_id: article._id,
                parent_id: commentP._id,
                parent_body: commentP.body,
                parent_auth_id: commentP.auth_id,
                parent_auth_name: commentP.auth_name,
                level,
            });
            if (commentPoP) {
                commentPoP.replyList = [...commentPoP.replyList, comment._id];
                await commentPoP.save();
            }
            commentP.replyList = [...commentP.replyList, comment._id];
            await commentP.save();

            article.commentList = [...article.commentList, comment._id];
            await article.save();

            if (level === 2) {
                commentP.replyContentList = await Comment.find({
                    _id: { $in: commentP.replyList },
                });
                await commentP.save();
                res.json({ comment: commentP });
            } else {
                commentPoP.replyContentList = await Comment.find({
                    _id: { $in: commentPoP.replyList },
                });
                await commentPoP.save();
                res.json({ comment: commentPoP });
            }
        } else {
            const comment = await Comment.create({
                body,
                auth_id: user._id,
                auth_name: user.username,
                auth_image: user.image,
                article_id: article._id,
            });

            article.commentList = [...article.commentList, comment._id];

            await article.save();

            res.json({ comment: comment });
        }
    }
});

// @desc    Get comments from an article
// @route   GET /api/articles/:slug/comments
// @access  Public
const getComments = asyncHandler(async (req, res) => {
    const pageSize = Number(req.query.limit) || 10;
    const page = Number(req.query.offset) || 1;
    const article = await Article.findOne({
        slug: req.params.slug,
    });

    const count = await Comment.countDocuments({
        _id: { $in: article.commentList },
        level: 1,
    });
    const total = await Comment.countDocuments({
        _id: { $in: article.commentList },
    });
    let comments = await Comment.find({
        _id: { $in: article.commentList },
        level: 1,
    })
        .sort({ createdAt: 1 })
        .limit(pageSize)
        .skip(pageSize * (page - 1));
    for (let index = 0; index < comments.length; index++) {
        comments[index].replyContentList = await Comment.find({
            _id: { $in: comments[index].replyList },
        });
        await comments[index].save();
    }

    if (article) {
        res.json({
            comments: comments,
            page,
            pages: Math.ceil(count / pageSize),
            total,
        });
    } else {
        res.status(404);
        throw new Error("Article not found");
    }
});

// @desc    Delete comment
// @route   DELETE /api/articles/:slug/comments/:id
// @access  Private
const deleteComment = asyncHandler(async (req, res) => {
    const { slug, id } = req.params;
    const article = await Article.findOne({
        slug: slug,
    });
    const comment = await Comment.findOne({ _id: id });

    let numCmtDelete = 0;

    if (!article) {
        res.status(404);
        throw new Error("Article not found");
    }

    if (!comment) {
        res.status(404);
        throw new Error("Comment not found");
    }

    if (comment && comment.level === 3) {
        //Parent
        const commentP = await Comment.findOne({ _id: comment.parent_id });
        commentP.replyList = commentP.replyList.filter((cmt) => cmt !== id);
        await commentP.save();

        //Parent root
        const commentPoP = await Comment.findOne({ _id: commentP.parent_id });
        commentPoP.replyList = commentPoP.replyList.filter((cmt) => cmt !== id);
        await commentPoP.save();

        //Delete from comment list of article
        article.commentList = article.commentList.filter((cmt) => cmt !== id);

        await article.save();

        numCmtDelete = 1;

        await comment.remove();

        commentPoP.replyContentList = await Comment.find({
            _id: { $in: commentPoP.replyList },
        });
        await commentPoP.save();

        res.json({
            comment: commentPoP,
            numCmtDelete,
        });
    } else if (comment && comment.level === 2) {
        //Parent
        const commentP = await Comment.findOne({ _id: comment.parent_id });
        commentP.replyList = commentP.replyList.filter((cmt) => cmt !== id);
        await commentP.save();

        numCmtDelete = comment.replyList.length + 1;

        // Delete replyList of reply comment
        if (comment.replyList.length > 0) {
            await Comment.deleteMany({ _id: { $in: comment.replyList } });
            commentP.replyList = commentP.replyList.filter(
                (cmt) => cmt !== id && comment.replyList.indexOf(cmt) === -1
            );
            await commentP.save();
        }

        // Delete it and reply of if from cmt list of article
        article.commentList = article.commentList.filter(
            (cmt) => cmt !== id && comment.replyList.indexOf(cmt) === -1
        );

        await article.save();

        await comment.remove();
        commentP.replyContentList = await Comment.find({
            _id: { $in: commentP.replyList },
        });
        await commentP.save();

        res.json({
            comment: commentP,
            numCmtDelete,
        });
    } else {
        // Delete all replies
        await Comment.deleteMany({ _id: { $in: comment.replyList } });

        numCmtDelete = comment.replyList.length + 1;

        // Update comment list of article
        article.commentList = article.commentList.filter(
            (cmt) => cmt !== id && comment.replyList.indexOf(cmt) === -1
        );

        let commentDelete = comment;

        await article.save();
        await comment.remove();

        res.json({
            comment: commentDelete,
            numCmtDelete,
        });
    }
});

export {
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
};
