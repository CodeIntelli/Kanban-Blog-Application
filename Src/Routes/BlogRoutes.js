import { CategoryController, BlogController } from "../Controller";
import { Authentication, Authorization } from "../Middleware";
import express from "express";
let BlogRoutes = express.Router();
// [ - ] CATEGORY ROUTES

/* BlogRoutes.get();
BlogRoutes.post();
BlogRoutes.patch();
BlogRoutes.delete(); */

BlogRoutes.post(
  "/category",
  Authentication,
  Authorization("admin"),
  CategoryController.newCategory
);
BlogRoutes.get("/category", CategoryController.allCategory);
BlogRoutes.get("/category/:id", CategoryController.allCategory);
BlogRoutes.put("/category/:id", CategoryController.editCategory);
BlogRoutes.delete("/category/:id", CategoryController.removeCategory);
BlogRoutes.delete(
  "/categoryRemove/:id",
  CategoryController.deletePermenantlyCategory
);

// [ - ] BLOG ROUTES
export default BlogRoutes;
