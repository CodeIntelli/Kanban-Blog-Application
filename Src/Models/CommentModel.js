import mongoose from "mongoose";
let CommentSchema = new mongoose.Schema(
  {
    title: String,
    commentDescription: String,
    likes: {
      type: Number,
      default: 0,
    },
    likedBy: [
      {
        type: mongoose.mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    blogId: {
      type: mongoose.mongoose.Schema.Types.ObjectID,
      required: true,
      ref: "Blog",
    },
    userId: {
      type: mongoose.mongoose.Schema.Types.ObjectID,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);
let CommentModel = mongoose.model("Blog-Comment", CommentSchema);
export default CommentModel;
