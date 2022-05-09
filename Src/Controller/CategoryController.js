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
        images: Joi.array().required(),
      });
      console.log("Data");
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
  async allCategory(req, res, next) {
    try {
      if (req.params.id) {
        let specificCat = await CategoryModel.findById(req.params.id);
        if (!specificCat) {
          return next(new ErrorHandler("Category not found", 404));
        }

        SuccessHandler(
          200,
          specificCat,
          "Specific Category Response Display Successfully",
          res
        );
      } else {
        const current_page = Number(req.query.page) || 1;
        const skipRecord = req.query.resultPerPage * (current_page - 1);
        let allCat = await CategoryModel.find()
          .limit(req.query.resultPerPage)
          .skip(skipRecord);

        SuccessHandler(
          200,
          allCat,
          "Category Response Display Successfully",
          res
        );
      }
    } catch (err) {
      return new ErrorHandler(err, 500);
    }
  },
  async editCategory(req, res, next) {
    try {
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
      if (!category) {
        new ErrorHandler("Category Not Found", 404);
      }
      let { name, description, status, publish, images } = req.body;
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

      let Categoryimages = [];

      if (typeof req.body.images === "string") {
        Categoryimages.push(req.body.images);
      } else {
        Categoryimages = req.body.images;
      }
      console.log(0.1);
      if (Categoryimages !== undefined) {
        // Deleting Images From Cloudinary
        console.log(0, Categoryimages);
        for (let i = 0; i < category.Categoryimages.length; i++) {
          console.log(category.Categoryimages[i].public_id);
          await cloudinary.v2.uploader.destroy(
            category.Categoryimages[i].public_id
          );
        }
        const imagesLinks = [];
        console.log(1);
        for (let i = 0; i < Categoryimages.length; i++) {
          const result = await cloudinary.v2.uploader.upload(
            Categoryimages[i],
            {
              folder: "blogCategoriesMedia",
            }
          );
          imagesLinks.push({
            public_id: result.public_id,
            url: result.secure_url,
          });
          console.log(req.body.images);
          console.log(imagesLinks);
          console.log(2);
        }
        req.body.images = imagesLinks;
      }
      let editedData = {
        name: catTitle,
        description,
        status,
        publish,
        images,
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
  async removeCategory(req, res, next) {
    let category = await CategoryModel.findById(req.params.id);
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
    SuccessHandler(200, "", "Category Removed Successfully", res);
  },

  async deletePermenantlyCategory(req, res, next) {
    const category = await CategoryModel.findById(req.params.id);
    if (!category) {
      return next(new ErrorHander("category not found", 404));
    }
    for (let i = 0; i < category.images.length; i++) {
      await cloudinary.v2.uploader.destroy(category.images[i].public_id);
    }
    await category.remove();
    SuccessHandler(200, "", "Category Removed Successfully", res);
  },
};

export default CategoryController;
