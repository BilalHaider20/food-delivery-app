import express from "express"
import { getAllCategories } from "../controllers/product/category.js"
import { getProductsByCategoryId } from "../controllers/product/product.js";


const router = express.Router();

// GET /api/products/categories
router.get('/categories', getAllCategories);

// GET /api/products/category/:categoryId
router.get('/category/:categoryId', getProductsByCategoryId);

export default router;