import mongoose from "mongoose";

let categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: Boolean, default: true },
    publish: {
      type: Boolean,
      required: true,
      default: true,
    },
    publishAt: {
      type: Date,
      default: Date.now,
    },
    createdBy: {
      type: mongoose.mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    image: {
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
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);

let CategoryModel = mongoose.model("Blog-Category", categorySchema);
export default CategoryModel;
