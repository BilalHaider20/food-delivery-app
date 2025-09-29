import authRoutes from "./auth.js";
import productRoutes from "./products.js";
import orderRoutes from "./order.js";

// Function to register all routes
export const registerRoutes = (app) => {
    app.use("/api/auth", authRoutes);
    app.use("/api/products", productRoutes);
    app.use("/api/orders", orderRoutes);

    console.log("✅ All routes registered successfully");
};