import { UserModel } from "../Models";
import { ErrorHandler, SendToken, SuccessHandler } from "../Services";
import cloudinary from "cloudinary";
import bcrypt from "bcryptjs";
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
const UserController = {
  // [ + ] GET USER DETAILS
  async getUserDetails(req, res, next) {
    try {
      const user = await UserModel.findById(req.user.id);
      SuccessHandler(200, user, "User Details Display Successfully", res);
    } catch (error) {
      return new ErrorHandler(error, 500);
    }
  },

  // [ + ] GET ALL USER DETAIL LOGIC
  async getAllUserDetails(req, res, next) {
    try {
      const users = await UserModel.find(
        { __v: 0 },
        { __v: 0, createdAt: 0 }
      ).sort({ createdAt: -1 });
      SuccessHandler(200, users, "User Details Display Successfully", res);
    } catch (error) {
      return new ErrorHandler(error, 500);
    }
  },

  // [ . ] UPDATE USER PASSWORD

  async updatePassword(req, res, next) {
    try {
      const UserValidation = Joi.object({
        oldPassword: Joi.string().required().messages({
          "string.base": `User Name should be a type of 'text'`,
          "string.empty": `User Name cannot be an empty field`,
          "string.min": `User Name should have a minimum length of {3}`,
          "any.required": `User Name is a required field`,
        }),
        newPassword: Joi.string()
          .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
          .required(),
        confirmPassword: Joi.ref("password"),
      });
      const { error } = UserValidation.validate(req.body);
      if (error) {
        return next(error);
      }

      const user = await UserModel.findById(req.user.id).select("+password");
      const isPasswordMatched = await user.comparePassword(
        req.body.oldPassword
      );
      if (!isPasswordMatched) {
        return next(new ErrorHandler("Old Password Is Incorrect", 400));
      }
      if (req.body.newPassword !== req.body.confirmPassword) {
        return next(new ErrorHandler("Password Doesn't match", 400));
      }
      user.password = req.body.newPassword;
      user.save();
      SendToken(user, 200, res);
      SuccessHandler(200, user, "Password Change Successfully", res);
    } catch (error) {
      return new ErrorHandler(error, 500);
    }
  },

  // [ . ] GET SINGLE USER LOGIC

  async getSingleUser(req, res, next) {
    try {
      if (!isValidObjectId(req.params.id)) {
        res.status(422).json({
          success: false,
          code: 422,
          data: "",
          message: `${req.params.id} is not valid MongoDB ID`,
        });
      }
      const user = await UserModel.findById(req.params.id);

      if (!user) {
        return next(
          new ErrorHandler(`User does not exist with Id: ${req.params.id}`)
        );
      }

      res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      return new ErrorHandler(error, 500);
    }
  },

  // [ . ] UPDATE USER ROLE LOGIC

  async updateUserRole(req, res, next) {
    try {
      const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
      };

      await UserModel.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      });

      res.status(200).json({
        success: true,
      });
    } catch (error) {
      return new ErrorHandler(error, 500);
    }
  },

  // [ . ] UPDATE USER DETAIL LOGIC

  async updateUserDetails(req, res, next) {
    try {
      // console.log("data");
      // if ((req.body = {})) {
      //   next(new ErrorHandler("Please Fill Some Value", 400));
      // }
      const UserValidation = Joi.object({
        name: Joi.string().trim().min(3).max(30).required().messages({
          "string.base": `User Name should be a type of 'text'`,
          "string.empty": `User Name cannot be an empty field`,
          "string.min": `User Name should have a minimum length of {3}`,
          "any.required": `User Name is a required field`,
        }),
        email: Joi.string().email().trim().required().messages({
          "string.base": `User Email should be a type of 'text'`,
          "string.empty": `User Email cannot be an empty field`,
          "any.required": `User Email is a required field`,
        }),
        avatar: Joi.string(),
      });
      const { error } = UserValidation.validate(req.body);
      if (error) {
        return next(error);
      }

      const newUserData = {
        name: req.body.name,
        email: req.body.email,
      };
      console.log(5247);
      console.log(req.body.avatar);
      if (req.body.avatar !== undefined && req.body.avatar !== "") {
        console.log("22424");
        const user = await UserModel.findById(req.user.id);

        const imageId = user.avatar.public_id;

        await cloudinary.v2.uploader.destroy(imageId);

        const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
          folder: "avatars",
          width: 150,
          crop: "scale",
        });

        newUserData.avatar = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }

      console.log("req", req.user.id, 34);
      const user = await UserModel.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      });

      res.status(200).json({
        success: true,
        user,
      });

      next();
    } catch (error) {
      return new ErrorHandler(error, 500);
    }
  },

  // [ . ] DELETE USER LOGIC

  async deleteUser(req, res, next) {
    try {
      if (!isValidObjectId(req.params.id)) {
        res.status(422).json({
          success: false,
          code: 422,
          data: "",
          message: `${req.params.id} is not valid MongoDB ID`,
        });
      }
      const user = await UserModel.findById(req.params.id);
      console.log(user);
      if (!user) {
        return next(
          new ErrorHandler(`User does not exist with Id: ${req.params.id}`, 400)
        );
      }

      let userStatus = user.status;

      let DeactivatedUser = {
        status: "Deactivate",
      };

      let updatedUser = await UserModel.findByIdAndUpdate(
        req.params.id,
        DeactivatedUser,
        {
          new: true,
          runValidators: true,
          useFindAndModify: false,
        }
      );

      res.status(200).json({
        success: true,
        updatedUser,
        message: "User Deleted Successfully",
      });
    } catch (error) {
      return new ErrorHandler(error, 500);
    }
  },

  // [ + ] Delete User - Admin

  async deleteUserAdmin(req, res, next) {
    try {
      if (!isValidObjectId(req.params.id)) {
        res.status(422).json({
          success: false,
          code: 422,
          data: "",
          message: `${req.params.id} is not valid MongoDB ID`,
        });
      }
      const user = await UserModel.findById(req.params.id);
      if (!user) {
        return next(
          new ErrorHandler(`User does not exist with Id: ${req.params.id}`, 400)
        );
      }

      let userStatus = user.status;

      let DeactivatedUser = {
        status: "Blocked",
      };
      // await user.remove();

      await UserModel.findByIdAndUpdate(req.user.id, DeactivatedUser, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      });

      res.status(200).json({
        success: true,
        message: "User Deleted Successfully",
      });
    } catch (error) {
      return new ErrorHandler(error, 500);
    }
  },
};

export default UserController;
