import { getAllCategories } from "../controllers/product/category.js"
import { getProductsByCategoryId } from "../controllers/product/product.js";


export const productRoutes = async(fastify, options)=>{
    fastify.get("products/:categoryId", getProductsByCategoryId);

}


export const categoryRoutes = async (fastify, options)=>{
    fastify.get("/categories", getAllCategories);
}