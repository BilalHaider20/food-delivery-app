import { Product } from "../../models/index.js";

export const getProductsByCategoryId = async (req, res) => {
    const { categoryId } = req.params;
    try {
        const products = await Product.find({category: categoryId});
        if (!products || products.length === 0) {
            return res.status(404).json({ message: 'No products found for this category' });
        }
        return res.status(200).json({
            message: 'Products fetched successfully',
            products
        });
    } catch (error) {
        console.error('Error fetching products by category ID:', error);
        return res.status(500).json({ message: 'Internal Server Error' }); 
    }
}