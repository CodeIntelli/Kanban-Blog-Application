import { UserModel } from "../Models";
import { ErrorHandler, SendToken } from "../Services";
import cloudinary from "cloudinary";
const UserController = {
  // [ + ] GET USER DETAILS

  async getUserDetails(req, res, next) {
    try {
      const user = await UserModel.findById(req.user.id);
      res.status(200).json({ success: true, user });
    } catch (error) {
      return new ErrorHandler(error, 500);
    }
  },

  // [ + ] GET ALL USER DETAIL LOGIC

  async getAllUserDetails(req, res, next) {
    try {
      const users = await UserModel.find();
      res.status(200).json({ success: true, users });
    } catch (error) {
      return new ErrorHandler(error, 500);
    }
  },

  // [ + ] UPDATE PASSWORD LOGIC

  async updatePassword(req, res, next) {
    try {
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
      await user.save();
      SendToken(user, 200, res);
      res.status(200).json({ success: true, user });
    } catch (error) {
      return new ErrorHandler(error, 500);
    }
  },

  // [ + ] GET SINGLE USER LOGIC

  async getSingleUser(req, res, next) {
    try {
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

  // [ + ] UPDATE USER ROLE LOGIC

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

  // [ + ] UPDATE USER DETAIL LOGIC

  async updateUserDetails(req, res, next) {
    try {
      const newUserData = {
        name: req.body.name,
        email: req.body.email,
      };
      if (req.body.avatar !== "") {
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

      const user = await UserModel.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      });

      res.status(200).json({
        success: true,
      });

      next();
    } catch (error) {
      return new ErrorHandler(error, 500);
    }
  },

  // [ + ] DELETE USER LOGIC

  async deleteUser(req, res, next) {
    try {
      console.log(req.params.id);
      const user = await UserModel.findById(req.params.id);
      if (!user) {
        return next(
          new ErrorHandler(`User does not exist with Id: ${req.params.id}`, 400)
        );
      }

      let userStatus = user.status;

      let DeactivatedUser = {
        status: "Deactivate",
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

  // [ + ] Delete User - Admin

  async deleteUserAdmin(req, res, next) {
    try {
      console.log(req.params.id);
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
