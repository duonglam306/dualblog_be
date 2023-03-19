import mongoose from "mongoose";

const tagSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    amount: {
        type: Number,
        default: 1
    },
},
{
    timestamps: true,
});

const Tag = mongoose.model('Tag', tagSchema);

export default Tag;