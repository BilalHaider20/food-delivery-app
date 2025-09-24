import fastify from "fastify";
import { confirmOrder, createOrder, getOrderById, getOrders, updateOrderStatus } from "../controllers/order/order.js";
import { verifyToken } from "../middleware/auth.js";

export const orderRoutes = async (fastify, options)=>{
    fastify.addHook("preHandler", async (req, res)=>{
        const isAuthenticated = await verifyToken(req, res);
        if(!isAuthenticated){
            return res.status(401).send({message:"Unauthorized"});
        }
    });


    fastify.get("/order/:orderId",getOrderById);
    fastify.get("order", getOrders );
    fastify.post("/order", createOrder);
    fastify.post("/order/:orderId/confirm", confirmOrder);
    fastify.patch("/order/:orderId/status", updateOrderStatus);
}