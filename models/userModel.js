import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const userSchema = mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        username: {
            type: String,
            required: true,
            unique: true,
        },
        bio: {
            type: String,
            default: null,
        },
        about: {
            type: String,
            default: null,
        },
        image: {
            type: String,
            default:
                "https://i.pinimg.com/236x/55/6c/38/556c381559c59fd2231498de3014e7c2.jpg",
        },
        followList: [
            {
                type: String,
                required: true,
            },
        ],
        subscriberList: [
            {
                type: String,
                required: true,
            },
        ],
        favoriteList: [
            {
                type: String,
                required: true,
            },
        ],
    },
    {
        timestamps: true,
    }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.checkFollow = function (user) {
    let isFollowing = false;
    if (user) {
        isFollowing = user.followList.indexOf(String(this._id)) > -1;
    }
    return {
        username: this.username,
        bio: this.bio,
        about: this.about,
        image: this.image,
        subscriberList: this.subscriberList,
        followList: this.followList,
        favoriteList: this.favoriteList,
        following: isFollowing,
    };
};

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model("User", userSchema);

export default User;
