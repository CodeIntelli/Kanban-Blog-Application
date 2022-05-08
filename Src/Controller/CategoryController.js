import { CategoryModel } from "../Models";
import { APIFeatures, ErrorHandler, SendToken } from "../Services";
import cloudinary from "cloudinary";
import Joi from "joi";
import moment from "moment";
import { SuccessHandler } from "../Services";

const CategoryController = {
  async newCategory(req, res, next) {
    try {
      const CategoryValidation = Joi.object({
        name: Joi.string().trim().min(3).max(30).required().messages({
          "string.base": `Category Title should be a type of 'text'`,
          "string.empty": `Category Title cannot be an empty field`,
          "string.min": `Category Title should have a minimum length of {3}`,
          "any.required": `Category Title is a required field`,
        }),
        description: Joi.string().trim().required().messages({
          "string.base": `Category Description should be a type of 'text'`,
          "string.empty": `Category Description cannot be an empty field`,
          "any.required": `Category Description is a required field`,
        }),
        status: Joi.boolean().default(true),
        publish: Joi.boolean().default(true),
        publishAt: Joi.date().default(moment().format()),
        image: Joi.string(),
      });
      const { error } = CategoryValidation.validate(req.body);
      if (error) {
        return next(error);
      }
      let { name, description, status, publish, publishAt, createdBy, image } =
        req.body;
      let catTitle = name.toLowerCase();
      // check if category in database already exist
      try {
        const exist = await CategoryModel.exists({ catTitle: req.body.name });
        if (exist) {
          return next(
            new ErrorHandler("This Category is already Registered", 409)
          );
        }
      } catch (err) {
        return next(err);
      }
      let newCat = new CategoryModel({
        name: catTitle,
        description,
        status,
        publish,
        publishAt,
        createdBy: req.user.id,
        image,
      });
      newCat.save();
      SuccessHandler(200, newCat, "Category Created Successfully", res);
    } catch (err) {
      return new ErrorHandler(err, 500);
    }
  },
  async allCategory(req, res, next) {
    try {
      const current_page = Number(req.query.page) || 1;
      const skipRecord = req.query.resultPerPage * (current_page - 1);
      let allCat = await CategoryModel.find()
        .limit(req.query.resultPerPage)
        .skip(skipRecord);

      console.log("data get", allCat);
      SuccessHandler(200, allCat, "Category Response Successfully", res);
    } catch (err) {
      return new ErrorHandler(err, 500);
    }
  },
};

export default CategoryController;
