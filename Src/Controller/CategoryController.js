import { CategoryModel } from "../Models";
import { APIFeatures, ErrorHandler, SendToken } from "../Services";
import cloudinary from "cloudinary";
import Joi from "joi";
import moment from "moment";
import { SuccessHandler } from "../Services";
const ObjectId = require("mongoose").Types.ObjectId;

function isValidObjectId(id) {
  if (ObjectId.isValid(id)) {
    if (String(new ObjectId(id)) === id) return true;
    return false;
  }
  return false;
}

const CategoryController = {
  // [ > ] Add New Category - Admin
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
        images: Joi.array().required(),
      });
      const { error } = CategoryValidation.validate(req.body);
      if (error) {
        return next(error);
      }
      let { name, description, status, publish, publishAt, createdBy, images } =
        req.body;
      let catTitle = name.toLowerCase();
      const exist = await CategoryModel.exists({ name: catTitle });
      if (exist) {
        return next(
          new ErrorHandler("This Category is already Registered", 409)
        );
      }
      let Categoryimages = [];
      if (typeof req.body.images === "string") {
        Categoryimages.push(req.body.images);
      } else {
        Categoryimages = req.body.images;
      }
      const imagesLink = [];
      for (let i = 0; i < Categoryimages.length; i++) {
        const result = await cloudinary.v2.uploader.upload(Categoryimages[i], {
          folder: "blogCategoriesMedia",
        });
        imagesLink.push({
          public_id: result.public_id,
          url: result.secure_url,
        });
      }
      req.body.images = imagesLink;
      let newCat = new CategoryModel({
        name: catTitle,
        description,
        status,
        publish,
        publishAt,
        createdBy: req.user.id,
        images: imagesLink,
      });
      newCat.save();
      SuccessHandler(200, newCat, "Category Created Successfully", res);
    } catch (err) {
      return new ErrorHandler(err, 500);
    }
  },

  // [ + ] All Category List
  async allCategory(req, res, next) {
    try {
      console.log("entry block");
      debugger;
      const current_page = Number(req.query.page) || 1;
      const skipRecord = req.query.resultPerPage * (current_page - 1);
      let allCat = await CategoryModel.find()
        .limit(req.query.resultPerPage)
        .skip(skipRecord)
        .sort({ publishAt: -1 });

      SuccessHandler(
        200,
        allCat,
        "Category Response Display Successfully",
        res
      );
    } catch (err) {
      return new ErrorHandler(err, 500);
    }
  },

  // [ + ] Specific Category Record
  async specificCategory(req, res, next) {
    try {
      if (!isValidObjectId(req.params.id)) {
        res.status(422).json({
          success: false,
          code: 422,
          data: "",
          message: `${req.params.id} is not valid MongoDB ID`,
        });
      }
      let specificCat = await CategoryModel.findById(req.params.id);
      if (!specificCat) {
        // return new ErrorHandler("Category not found", 404);
        res.send("data not found");
      }
      SuccessHandler(
        200,
        specificCat,
        "Specific Category Response Display Successfully",
        res
      );
    } catch (err) {
      return new ErrorHandler(err, 500);
    }
  },

  // [ > ] Edit Category - Admin
  async editCategory(req, res, next) {
    try {
      if (!isValidObjectId(req.params.id)) {
        res.status(422).json({
          success: false,
          code: 422,
          data: "",
          message: `${req.params.id} is not valid MongoDB ID`,
        });
      }
      const CategoryValidation = Joi.object({
        name: Joi.string().trim().min(3).max(30).messages({
          "string.base": `Category Title should be a type of 'text'`,
          "string.empty": `Category Title cannot be an empty field`,
          "string.min": `Category Title should have a minimum length of {3}`,
          "any.required": `Category Title is a required field`,
        }),
        description: Joi.string().trim().messages({
          "string.base": `Category Description should be a type of 'text'`,
          "string.empty": `Category Description cannot be an empty field`,
          "any.required": `Category Description is a required field`,
        }),
        status: Joi.boolean(),
        publish: Joi.boolean(),
        images: Joi.array(),
      });
      const { error } = CategoryValidation.validate(req.body);
      if (error) {
        return next(error);
      }

      let category = await CategoryModel.findById(req.params.id);
      console.log(req.params.id);
      if (!category) {
        console.log("null");
        new ErrorHandler("Category Not Found", 404);
      }
      let publishAt;
      let { name, description, status, publish, images } = req.body;
      if (publish) {
        publishAt: new Date().now;
      }
      let catTitle;
      if (name) {
        catTitle = name.toLowerCase();
        const exist = await CategoryModel.exists({ name: catTitle });
        if (exist) {
          return next(
            new ErrorHandler("This Category is already Registered", 409)
          );
        }
      }
      let editedImages = [];
      const imagesLinks = [];
      if (typeof req.body.images === "string") {
        editedImages.push(req.body.images);
      } else {
        editedImages = req.body.images;
      }

      if (editedImages !== undefined) {
        for (let i = 0; i < category.images.length; i++) {
          await cloudinary.v2.uploader.destroy(category.images[i].public_id);
        }
        for (let i = 0; i < editedImages.length; i++) {
          const result = await cloudinary.v2.uploader.upload(editedImages[i], {
            folder: "blogCategoriesMedia",
          });
          imagesLinks.push({
            public_id: result.public_id,
            url: result.secure_url,
          });
        }
        req.body.images = imagesLinks;
      }
      let editedData = {
        name: catTitle,
        description,
        status,
        publish,
        publishAt,
        images: req.body.images,
      };
      let editedCategory = await CategoryModel.findByIdAndUpdate(
        req.params.id,
        editedData,
        {
          new: true,
        }
      );
      SuccessHandler(200, editedCategory, "Category Updated Successfully", res);
    } catch (err) {
      return new ErrorHandler(err, 500);
    }
  },

  // [ > ] Block Category - Admin
  async blockCategory(req, res, next) {
    try {
      if (!isValidObjectId(req.params.id)) {
        res.status(422).json({
          success: false,
          code: 422,
          data: "",
          message: `${req.params.id} is not valid MongoDB ID`,
        });
      }

      let category = CategoryModel.findById(req.params.id);
      if (!category) {
        new ErrorHandler("Category Not Found", 404);
      }
      let editedData = {
        status: false,
      };
      let editedCategory = await CategoryModel.findByIdAndUpdate(
        req.params.id,
        editedData,
        {
          new: true,
        }
      );
      SuccessHandler(200, "", "Category Blocked Successfully", res);
    } catch (err) {
      return new ErrorHandler(err, 500);
    }
  },

  // [ > ] Edit Category - Admin
  async removeCategory(req, res, next) {
    try {
      if (!isValidObjectId(req.params.id)) {
        res.status(422).json({
          success: false,
          code: 422,
          data: "",
          message: `${req.params.id} is not valid MongoDB ID`,
        });
      }
      const category = await CategoryModel.findById(req.params.id);
      if (!category) {
        return next(new ErrorHander("category not found", 404));
      }
      for (let i = 0; i < category.images.length; i++) {
        await cloudinary.v2.uploader.destroy(category.images[i].public_id);
      }
      await category.remove();
      SuccessHandler(200, "", "Category Removed Successfully", res);
    } catch (err) {
      return new ErrorHandler(err, 500);
    }
  },
};

export default CategoryController;
