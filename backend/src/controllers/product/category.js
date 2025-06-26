import { Category } from "../../models";

export const getAllCategories = async (req, reply) => {
    try{
        const categories = await Category.find();
        return reply.send({
            message: 'Categories fetched successfully',
            categories
        });
    }catch (error) {
        console.error('Error fetching categories:', error);
        return reply.status(500).send({ message: 'Internal Server Error', error });
    }
}