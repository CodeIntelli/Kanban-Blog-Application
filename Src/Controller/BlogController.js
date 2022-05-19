import {
  ErrorHandler,
  SendEmail,
  SendToken,
  SuccessHandler,
} from "../Services";
import cloudinary from "cloudinary";
import Joi from "joi";
const ObjectId = require("mongoose").Types.ObjectId;
function isValidObjectId(id) {
  if (ObjectId.isValid(id)) {
    if (String(new ObjectId(id)) === id) {
      return true;
    }
    return false;
  }
  return false;
}

const BlogController = {
  // [ - ]Add Blog
  // [ - ]Read All Blog - Sorting, Latest Blog Filter
  // [ - ]Read Specific Blog
  // [ - ]Update Blog
  // [ - ]Delete Blog
  // [ - ]Read Later Blog
  // [ - ]Favourite Blog
};
export default BlogController;
