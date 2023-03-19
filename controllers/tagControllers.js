import asyncHandler from "express-async-handler";
import Tag from "../models/tagModel.js";

// @desc    Get tags
// @route   GET /api/tags
// @access  Public
const getTags = asyncHandler(async (req, res) => {
    const tags = await Tag.find({}).sort({ amount: -1, createdAt: -1 }).limit(10).skip(0);
    res.json({ tags });
});

// @desc    Search tag
// @route   GET /api/tags/search
// @access  Public
const searchTags = asyncHandler(async (req, res) => {
    const pageSize = Number(req.query.limit) || 30;
    const page = Number(req.query.offset) || 1;

    const keyword = req.query.keyword
        ? {
              name: {
                  $regex: req.query.keyword,
                  $options: "i",
              },
          }
        : {};

    const count = await Tag.countDocuments({
        ...keyword,
    });
    const tags = await Tag.find({
        ...keyword,
    })
        .limit(pageSize)
        .skip(pageSize * (page - 1));
    if (tags) {
        res.json({
            tags: tags,
            page,
            pages: Math.ceil(count / pageSize),
        });
    } else {
        res.status(404);
        throw new Error("Tag not found");
    }
});

export { getTags, searchTags };
