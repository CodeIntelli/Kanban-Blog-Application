import mongoose from "mongoose";
import CommentModel from "./CategoryModel";
const BlogSchema = new mongoose.Schema(
  {
    postTitle: {
      type: String,
      required: [true, "Please Enter Post Title"],
      unique: true,
    },
    postDescription: {
      type: String,
      required: [true, "Please Enter Post Description"],
    },
    content: {
      type: String,
      required: [true, "Please Enter Post Content"],
    },
    coverImage: {
      public_id: {
        type: String,
        required: true,
        default: "userProfileImage/tzsmxrevyes1xsuyujlk",
      },
      url: {
        type: String,
        required: true,
        default:
          "https://res.cloudinary.com/dm3gs2s0h/image/upload/v1650136405/userProfileImage/tzsmxrevyes1xsuyujlk.png",
      },
    },
    publish: {
      type: Boolean,
      required: true,
      default: true,
    },
    publishAt: {
      type: Date,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    fbauthor: String,
    twitterDescription: String,
    twittertagcreator: String,
    featuredImage: {
      public_id: {
        type: String,
        required: true,
        default: "userProfileImage/tzsmxrevyes1xsuyujlk",
      },
      url: {
        type: String,
        required: true,
        default:
          "https://res.cloudinary.com/dm3gs2s0h/image/upload/v1650136405/userProfileImage/tzsmxrevyes1xsuyujlk.png",
      },
    },
    createdBy: {
      type: mongoose.mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    slug: String,
    fbTagsTitle: String,
    fbDescription: String,
    twittertagtitle: String,
    postCreatedAt: {
      type: Date,
    },
    allowResponses: {
      type: Boolean,
      required: true,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    LikesCount: {
      type: Number,
      default: 0,
    },
    likedBy: [
      {
        type: mongoose.mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    noOfComment: {
      type: Number,
      default: 0,
    },
    shareCount: {
      type: Number,
      default: 0,
    },
    metaTitle: {
      type: String,
      required: true,
    },
    metaDescription: {
      type: String,
      required: true,
    },
    metaKeyword: [
      {
        type: String,
        required: true,
      },
    ],
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);

BlogSchema.virtual("CommentModel", {
  ref: "CommentModel",
  localField: "_id",
  foreignField: "blogId",
});

let BlogModel = mongoose.model("Blog", BlogSchema);
export default BlogModel;
