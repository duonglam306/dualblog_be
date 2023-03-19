import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import path from "path";
import hbs from "nodemailer-express-handlebars";
import User from "../models/userModel.js";
import { Article, Comment } from "../models/articleModel.js";
import generateToken from "../utils/generateToken.js";

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    let error = {};

    let isEmpty = false;

    if (!email) {
        error = {
            ...error,
            email: ["can't be empty"],
        };
        isEmpty = true;
    }
    if (!password) {
        error = {
            ...error,
            password: ["can't be empty"],
        };
        isEmpty = true;
    }

    if (isEmpty) {
        res.status(422);
        res.json({
            errors: error,
        });
    } else {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                user: {
                    email: user.email,
                    token: generateToken(user._id),
                    username: user.username,
                    bio: user.bio,
                    about: user.about,
                    image: user.image,
                    followList: user.followList,
                    subscriberList: user.subscriberList,
                    favoriteList: user.favoriteList,
                },
            });
        } else {
            res.status(401);
            throw new Error("Invalid email or password");
        }
    }
});

// @desc    Register user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    let error = {};

    let isEmpty = false;

    if (!email) {
        error = {
            ...error,
            email: ["can't be empty"],
        };
        isEmpty = true;
    }
    if (!username) {
        error = {
            ...error,
            username: ["can't be empty"],
        };
        isEmpty = true;
    }
    if (!password) {
        error = {
            ...error,
            password: ["can't be empty"],
        };
        isEmpty = true;
    }

    if (isEmpty) {
        res.status(422);
        res.json({
            errors: error,
        });
    } else {
        const emailExist = await User.findOne({ email });

        const userExist = await User.findOne({ username });

        if (userExist || emailExist) {
            res.status(400);
            throw new Error("Username or email already taken.");
        }

        let activateToken = jwt.sign(
            { username, email, password },
            process.env.JWT_SECRET,
            { expiresIn: "180000" }
        );
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const handlebarOptions = {
            viewEngine: {
                extName: ".handlebars",
                partialsDir: path.resolve("./controllers/activateAccount"),
                defaultLayout: false,
            },
            viewPath: path.resolve("./controllers/activateAccount"),
            extName: ".handlebars",
        };

        transporter.use("compile", hbs(handlebarOptions));

        var mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Account Verification - DualBlog",
            template: "email",
            context: {
                url_activate: `${process.env.CLIENT_URL}/user/activate/${activateToken}`,
                url_client: process.env.CLIENT_URL,
            },
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                res.status(401);
                throw new Error("Send verify account email failed");
            } else {
                res.json({
                    message: info.response,
                });
            }
        });
    }
});

// @desc    Activate account
// @route   POST /api/user/emailActivate
// @access  Public
const activateAccount = asyncHandler(async (req, res) => {
    const { token } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { username, email, password } = decoded;
    const existUser = await User.findOne({ email });
    if (!existUser) {
        const user = await User.create({
            username,
            email,
            password,
        });
        if (user) {
            res.status(201).json({
                user: {
                    email: user.email,
                    token: generateToken(user._id),
                    username: user.username,
                    bio: user.image,
                    about: user.about,
                    image: user.image,
                    followList: user.followList,
                    subscriberList: user.subscriberList,
                    favoriteList: user.favoriteList,
                },
            });
        } else {
            res.status(400);
            throw new Error("Invalid token");
        }
    } else {
        res.status(201).json({
            existUser: {
                email: existUser.email,
                token: generateToken(existUser._id),
                username: existUser.username,
                bio: existUser.image,
                about: existUser.about,
                image: existUser.image,
                followList: existUser.followList,
                subscriberList: existUser.subscriberList,
                favoriteList: existUser.favoriteList,
            },
        });
    }
});

// @desc    Forgot password
// @route   POST /api/user/forgotPassword
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    let error = {};

    let isEmpty = false;

    if (!email) {
        error = {
            ...error,
            email: ["can't be empty"],
        };
        isEmpty = true;
    }

    if (isEmpty) {
        res.status(422);
        res.json({
            errors: error,
        });
    } else {
        const user = await User.findOne({ email });

        if (!user) {
            res.status(401);
            throw new Error("The email address is incorrect.");
        }

        let resetToken = jwt.sign({ email }, process.env.JWT_SECRET, {
            expiresIn: "180000",
        });
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const handlebarOptions = {
            viewEngine: {
                extName: ".handlebars",
                partialsDir: path.resolve("./controllers/resetPassword"),
                defaultLayout: false,
            },
            viewPath: path.resolve("./controllers/resetPassword"),
            extName: ".handlebars",
        };

        transporter.use("compile", hbs(handlebarOptions));

        var mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Reset Password - DualBlog",
            template: "email",
            context: {
                url_reset: `${process.env.CLIENT_URL}/user/resetPassword/${resetToken}`,
            },
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                res.status(401);
                throw new Error("Send verify account email failed");
            } else {
                res.json({
                    message: info.response,
                });
            }
        });
    }
});

// @desc    Reset password
// @route   PUT /user/resetPassword/:resetToken
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
    const resetPasswordToken = req.params.resetToken;

    const { password, newPassword } = req.body;
    let error = {};

    let isEmpty = false;

    if (!password) {
        error = {
            ...error,
            password: ["can't be empty"],
        };
        isEmpty = true;
    }
    if (!newPassword) {
        error = {
            ...error,
            newPassword: ["can't be empty"],
        };
        isEmpty = true;
    }

    if (isEmpty) {
        res.status(422);
        res.json({
            errors: error,
        });
    } else {
        const decoded = jwt.verify(resetPasswordToken, process.env.JWT_SECRET);
        const { email } = decoded;

        const user = await User.findOne({
            email,
        });

        if (!user) {
            res.status(404);
            throw new Error("User not found");
        }

        user.password = req.body.password;
        const newUser = await user.save();

        res.json({
            user: {
                email: newUser.email,
                token: generateToken(newUser._id),
                username: newUser.username,
                bio: newUser.bio,
                about: newUser.about,
                image: newUser.image,
                followList: newUser.followList,
                subscriberList: newUser.subscriberList,
                favoriteList: newUser.favoriteList,
            },
        });
    }
});

// @desc    Get current user
// @route   GET /api/user
// @access  Private
const getCurrentUser = asyncHandler(async (req, res) => {
    const userId = res.user._id;
    const user = await User.findOne({ _id: userId });
    if (user) {
        res.json({
            user: {
                email: user.email,
                token: generateToken(user._id),
                username: user.username,
                bio: user.bio,
                about: user.about,
                image: user.image,
                followList: user.followList,
                subscriberList: user.subscriberList,
                favoriteList: user.favoriteList,
            },
        });
    } else {
        res.status(404);
        throw new Error("User not found");
    }
});

// @desc    Update user
// @route   PUT /api/user
// @access  Private
const updateUser = asyncHandler(async (req, res) => {
    const { username, image, bio, about, password, newPassword } = req.body;

    let error = {};

    let isEmpty = false;

    if (!username) {
        error = {
            ...error,
            username: ["can't be empty"],
        };
        isEmpty = true;
    }
    if (!image) {
        error = {
            ...error,
            image: ["can't be empty"],
        };
        isEmpty = true;
    }

    if (isEmpty) {
        res.status(422);
        res.json({
            errors: error,
        });
    } else {
        const userId = res.user._id;
        const user = await User.findOne({ _id: userId });
        if (user) {
            if (user.username !== username) {
                const existUsername = await User.findOne({
                    username: username,
                });

                if (existUsername) {
                    res.status(400);
                    throw new Error("Username already exists");
                }
            }

            user.username = username || user.username;
            user.image =
                image ||
                "https://i.pinimg.com/236x/55/6c/38/556c381559c59fd2231498de3014e7c2.jpg";
            user.bio = bio;
            user.about = about;

            if (password && newPassword) {
                if (await user.matchPassword(password)) {
                    user.password = newPassword;
                } else {
                    res.status(401);
                    throw new Error("Old password or new password incorrect");
                }
            }
            await Article.updateMany(
                { auth_id: { $in: userId } },
                { auth_name: user.username, auth_image: user.image }
            );
            await Comment.updateMany(
                { auth_id: { $in: userId } },
                { auth_name: user.username, auth_image: user.image }
            );
            await Comment.updateMany(
                { parent_auth_id: { $in: userId } },
                { parent_auth_name: user.username }
            );
            const newUser = await user.save();

            res.json({
                user: {
                    email: newUser.email,
                    token: generateToken(newUser._id),
                    username: newUser.username,
                    bio: newUser.bio,
                    about: newUser.about,
                    image: newUser.image,
                    followList: newUser.followList,
                    subscriberList: newUser.subscriberList,
                    favoriteList: newUser.favoriteList,
                },
            });
        } else {
            res.status(404);
            throw new Error("User not found");
        }
    }
});

// @desc    Get profile
// @route   GET /api/profiles/:username
// @access  Public
const getProfiles = asyncHandler(async (req, res) => {
    const username = req.params.username;
    const user = await User.findOne({ username: username });
    const listFollowUser = await User.find({ _id: { $in: user.followList } });
    if (user) {
        if (req.headers.authorization) {
            let token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userCurrent = await User.findOne({ _id: decoded.id });
            res.json({
                profile: user.checkFollow(userCurrent),
                listFollow: listFollowUser.map((item) =>
                    item.checkFollow(user)
                ),
            });
        } else {
            res.json({
                profile: user.checkFollow(),
                listFollow: listFollowUser.map((item) =>
                    item.checkFollow(user)
                ),
            });
        }
    } else {
        res.status(404);
        throw new Error("User not found");
    }
});

// @desc    Get follow list of user
// @route   GET /api/profiles/:username/followList
// @access  Public
const getFollowList = asyncHandler(async (req, res) => {
    const pageSize = Number(req.query.limit) || 10;
    const page = Number(req.query.offset) || 1;

    const username = req.params.username;

    const user = await User.findOne({ username: username });
    if (user) {
        const count = await User.countDocuments({
            _id: { $in: user.followList },
        });
        const listFollowUser = await User.find({
            _id: { $in: user.followList },
        })
            .limit(pageSize)
            .skip(pageSize * (page - 1));
        if (req.headers.authorization) {
            let token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userCurrent = await User.findOne({ _id: decoded.id });
            res.json({
                users: listFollowUser.map((item) =>
                    item.checkFollow(userCurrent)
                ),
                page,
                pages: Math.ceil(count / pageSize),
                total: count,
            });
        } else {
            res.json({
                users: listFollowUser.map((item) => item.checkFollow()),
                page,
                pages: Math.ceil(count / pageSize),
                total: count,
            });
        }
    } else {
        res.status(404);
        throw new Error("User not found");
    }
});

// @desc    Get unFollow list of user
// @route   GET /api/profiles/unFollowList
// @access  Public
const getUnFollowList = asyncHandler(async (req, res) => {
    const pageSize = Number(req.query.limit) || 10;
    const page = Number(req.query.offset) || 1;

    if (req.headers.authorization) {
        let token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ _id: decoded.id });
        const count = await User.countDocuments({
            _id: { $nin: [...user.followList, user._id] },
        });
        const users = await User.find({
            _id: { $nin: [...user.followList, user._id] },
        });
        res.json({
            users: users.map((item) => item.checkFollow(user)),
            page,
            pages: Math.ceil(count / pageSize),
            total: count,
        });
    } else {
        const users = await User.find({});
        const count = await User.countDocuments({});
        res.json({
            user: users.map((item) => item.checkFollow()),
            page,
            pages: Math.ceil(count / pageSize),
            total: count,
        });
    }
});

// @desc    Follow user
// @route   POST /api/profiles/:username/follow
// @access  Private
const followUser = asyncHandler(async (req, res) => {
    let token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userFollower = await User.findOne({ _id: decoded.id });

    const username = req.params.username;
    const userFollow = await User.findOne({ username: username });

    if (
        userFollow &&
        userFollower &&
        userFollower.followList.indexOf(String(userFollow._id)) === -1
    ) {
        userFollower.followList = [...userFollower.followList, userFollow._id];
        userFollow.subscriberList = [
            ...userFollow.subscriberList,
            userFollower._id,
        ];

        await userFollower.save();
        await userFollow.save();
        res.json({
            profile: userFollow.checkFollow(userFollower),
        });
    } else {
        res.status(404);
        throw new Error("User not found");
    }
});
// @desc    UnFollow user
// @route   DELETE /api/profiles/:username/follow
// @access  Private
const unFollowUser = asyncHandler(async (req, res) => {
    let token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userUnFollower = await User.findOne({ _id: decoded.id });

    const username = req.params.username;
    const userUnFollow = await User.findOne({ username: username });

    if (
        userUnFollow &&
        userUnFollower &&
        userUnFollower.followList.indexOf(String(userUnFollow._id)) !== -1
    ) {
        userUnFollower.followList = userUnFollower.followList.filter(
            (user) => user !== String(userUnFollow._id)
        );
        userUnFollow.subscriberList = userUnFollow.subscriberList.filter(
            (user) => user !== String(userUnFollower._id)
        );

        await userUnFollower.save();
        await userUnFollow.save();
        res.json({
            profile: userUnFollow.checkFollow(userUnFollower),
        });
    } else {
        res.status(404);
        throw new Error("User not found");
    }
});

// @desc    Search user
// @route   GET /api/users/search
// @access  Public
const searchUsers = asyncHandler(async (req, res) => {
    const pageSize = Number(req.query.limit) || 20;
    const page = Number(req.query.offset) || 1;

    const keyword = req.query.keyword
        ? {
              username: {
                  $regex: req.query.keyword,
                  $options: "i",
              },
          }
        : {};

    const count = await User.countDocuments({
        ...keyword,
    });
    const users = await User.find({ ...keyword })
        .limit(pageSize)
        .skip(pageSize * (page - 1));

    if (users) {
        if (req.headers.authorization) {
            let token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userCurrent = await User.findOne({ _id: decoded.id });
            res.json({
                users: users.map((item) => item.checkFollow(userCurrent)),
                page,
                pages: Math.ceil(count / pageSize),
            });
        } else {
            res.json({
                users: users.map((item) => item.checkFollow()),
                page,
                pages: Math.ceil(count / pageSize),
            });
        }
    } else {
        res.status(404);
        throw new Error("User not found");
    }
});

export {
    authUser,
    registerUser,
    getCurrentUser,
    updateUser,
    getProfiles,
    getFollowList,
    getUnFollowList,
    followUser,
    unFollowUser,
    searchUsers,
    activateAccount,
    forgotPassword,
    resetPassword,
};
