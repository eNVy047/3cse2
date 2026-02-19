import mongoose, { Schema, Document } from "mongoose";

export interface IComment {
    user: mongoose.Types.ObjectId;
    text: string;
    createdAt: Date;
}

export interface IPost extends Document {
    author: mongoose.Types.ObjectId;
    images: string[];
    caption: string;
    taggedUsers: mongoose.Types.ObjectId[];
    likes: mongoose.Types.ObjectId[];
    comments: IComment[];
    createdAt: Date;
    updatedAt: Date;
}

const commentSchema = new Schema<IComment>({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    text: {
        type: String,
        required: true,
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const postSchema = new Schema<IPost>(
    {
        author: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        images: {
            type: [String],
            required: true,
            validate: {
                validator: (v: string[]) => v.length > 0 && v.length <= 10,
                message: "Post must have between 1 and 10 images",
            },
        },
        caption: {
            type: String,
            trim: true,
            maxlength: 2200,
            default: "",
        },
        taggedUsers: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        likes: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        comments: [commentSchema],
    },
    {
        timestamps: true,
    }
);

// Indexes for better query performance
postSchema.index({ createdAt: -1 });
postSchema.index({ author: 1, createdAt: -1 });

const Post = mongoose.model<IPost>("Post", postSchema);

export default Post;
