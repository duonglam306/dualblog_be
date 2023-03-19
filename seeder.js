import dotenv from "dotenv";
import colors from "colors";
import users from "./data/users.js";
import articles from "./data/articles.js";
import tags from "./data/tags.js";
import User from "./models/userModel.js";
import Tag from "./models/tagModel.js";
import { Article, Comment } from "./models/articleModel.js";
import connectDB from "./config/db.js";

dotenv.config();

connectDB();

const importData = async () => {
    try {
        await User.deleteMany();
        await Tag.deleteMany();
        await Article.deleteMany();
        await Comment.deleteMany();

        const createUsers = await User.insertMany(users);

        const sampleArticles = articles.map((article, index) => {
            if (index < 2) {
                return {
                    ...article,
                    auth_id: createUsers[1]._id,
                    auth_name: createUsers[1].username,
                    auth_image: createUsers[1].image,
                    slug: "",
                };
            }
            if (index < 6 && index >= 2) {
                return {
                    ...article,
                    auth_id: createUsers[1]._id,
                    auth_name: createUsers[1].username,
                    auth_image: createUsers[1].image,
                    slug: "",
                };
            }
            return {
                ...article,
                auth_id: createUsers[0]._id,
                auth_name: createUsers[0].username,
                auth_image: createUsers[0].image,
                slug: "",
            };
        });

        await Article.insertMany(sampleArticles);
        await Tag.insertMany(tags);

        console.log("Data imported successfully!".green.inverse);

        process.exit();
    } catch (error) {
        console.error(`${error}`.red.inverse);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await User.deleteMany();
        await Tag.deleteMany();
        await Article.deleteMany();
        await Comment.deleteMany();

        console.log("Data destroyed successfully!".green.inverse);

        process.exit();
    } catch (error) {
        console.error(`${error}`.red.inverse);
        process.exit(1);
    }
};

if (process.argv[2] === "-d") {
    destroyData();
} else importData();
