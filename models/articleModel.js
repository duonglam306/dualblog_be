import mongoose from "mongoose";

const commentSchema = mongoose.Schema(
    {
        body: {
            type: String,
            required: true,
        },
        auth_id: {
            type: String,
            required: true,
        },
        auth_name: {
            type: String,
            required: true,
        },
        auth_image: {
            type: String,
            required: true,
        },
        article_id: {
            type: String,
            required: true,
        },
        parent_id: {
            type: String,
            default: null,
        },
        parent_body: {
            type: String,
            default: null,
        },
        parent_auth_id: {
            type: String,
            default: null,
        },
        parent_auth_name: {
            type: String,
            default: null,
        },
        level: {
            type: Number,
            default: 1,
        },
        replyList: [
            {
                type: String,
                required: true,
            },
        ],
        replyContentList: []
    },
    {
        timestamps: true,
    }
);

const articleSchema = mongoose.Schema(
    {
        slug: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        body: {
            type: String,
            required: true,
        },
        thumbnail_url: {
            type: String,
            required: true,
        },
        tagList: [
            {
                type: String,
                required: true,
            },
        ],
        favoriteCount: {
            type: Number,
            required: true,
            default: 0,
        },

        commentList: [
            {
                type: String,
                required: true,
            },
        ],
        auth_id: {
            type: String,
            required: true,
        },
        auth_name: {
            type: String,
            required: true,
        },
        auth_image: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

articleSchema.methods.checkFavorite = function (user) {
    let isFavorite = false;
    if (user) {
        isFavorite = user.favoriteList.indexOf(String(this._id)) > -1;
    }
    return {
        slug: this.slug,
        title: this.title,
        description: this.description,
        body: this.body,
        thumbnail_url: this.thumbnail_url,
        tagList: this.tagList,
        favorited: isFavorite,
        favoriteCount: this.favoriteCount,
        commentList: this.commentList,
        auth_id: this.auth_id,
        auth_name: this.auth_name,
        auth_image: this.auth_image,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
    };
};

articleSchema.pre("validate", function (next) {
    let newTitle = this.title.toLowerCase().split("?").join("");
    newTitle = newTitle.split("/").join("");
    newTitle = newTitle.split("&").join("");
    newTitle = newTitle.split("=").join("");
    newTitle = newTitle.split("  ").join(" ");
    this.slug = newTitle.split(" ").join("-") + "-" + String(this._id);
    next();
});

const Article = mongoose.model("Article", articleSchema);
const Comment = mongoose.model("Comment", commentSchema);

export { Article, Comment };
