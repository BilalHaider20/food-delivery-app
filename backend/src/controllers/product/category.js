import { Category } from "../../models/index.js";

export const getAllCategories = async (req, res) => {
    try{
        const categories = await Category.find();
        return res.json({
            message: 'Categories fetched successfully',
            categories
        });
    }catch (error) {
        console.error('Error fetching categories:', error);
        return res.status(500).json({ message: 'Internal Server Error', error });
    }
}