import mongoose from "mongoose";
import { categories, products } from "./seedData.js";
import {Product, Category} from "./src/models/index.js";
import "dotenv/config";

async function seedDatabase(){
    try{

        await mongoose.connect(process.env.MONGO_URI);
        await Product.deleteMany({});
        await Category.deleteMany({});

        const categoryDocs = await Category.insertMany(categories);
        
        const categoryMap = categoryDocs.reduce((map, category)=>{
            map[category.name] = category._id;
            return map;
        },{});

        const productWithCategory = products.map(product=>{
            return ({
                ...product,
                category: categoryMap[product.category]
            })
        });

        await Product.insertMany(productWithCategory);

        console.log("Database seeded successfully");
    }catch(error){
        console.error("Error seeding database:", error);

    } finally{
        mongoose.connection.close();
    }
}

seedDatabase();