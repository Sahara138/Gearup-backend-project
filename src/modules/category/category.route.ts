import { Router } from "express";
import { auth } from "../../middlewares/auth.js";
import { Role } from "../../../generated/prisma/enums.js";
import { categoryController } from "./category.controller.js";

const router = Router();

// Public routes
router.get("/", categoryController.getAllCategories);
router.get("/:categoryId", categoryController.getCategoryById);

// For Admin, Category management
router.post("/", auth(Role.ADMIN), categoryController.createCategory);
router.patch("/:categoryId", auth(Role.ADMIN), categoryController.updateCategory);
router.put("/:categoryId", auth(Role.ADMIN), categoryController.updateCategory);
router.delete("/:categoryId", auth(Role.ADMIN), categoryController.deleteCategory);

export const categoryRoutes = router;
