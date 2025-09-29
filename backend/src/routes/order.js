import express from "express"
import { confirmOrder, createOrder, getOrderById, getOrders, updateOrderStatus } from "../controllers/order/order.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

//create order --> POST /api/orders
router.post('/', verifyToken, createOrder);

//confirm order --> PATCH /api/orders/:orderId/confirm
router.post('/:orderId/confirm', verifyToken, confirmOrder);

//update order status --> PATCH /api/orders/:orderId/status
router.patch('/:orderId/status', verifyToken, updateOrderStatus);

// GET /api/orders
router.get('/', verifyToken, getOrders);

// GET /api/orders/:orderId
router.get('/:orderId', verifyToken, getOrderById);

export default router;