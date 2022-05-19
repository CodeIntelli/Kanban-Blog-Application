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
BlogRoutes.get("/category/:id", CategoryController.specificCategory);
BlogRoutes.put("/category/:id", CategoryController.editCategory);
BlogRoutes.delete("/blockcategory/:id", CategoryController.blockCategory);
BlogRoutes.delete("/category/:id", CategoryController.removeCategory);

// [ - ] BLOG ROUTES
export default BlogRoutes;
