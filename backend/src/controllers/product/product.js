import { Product } from "../../models/index.js";

export const getProductsByCategoryId = async (req, reply) => {
    const { categoryId } = req.params;
    try {
        const products = await Product.find({category: categoryId});
        if (!products || products.length === 0) {
            return reply.status(404).send({ message: 'No products found for this category' });
        }
        return reply.send({
            message: 'Products fetched successfully',
            products
        });
    } catch (error) {
        console.error('Error fetching products by category ID:', error);
        return reply.status(500).send({ message: 'Internal Server Error' }); 
    }
}