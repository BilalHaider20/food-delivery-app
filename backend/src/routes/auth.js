import express from "express";
import { fetchUser, loginCustomer, loginDeliveryPartner, refreshToken } from "../controllers/auth/auth.js"
import { updateUser } from "../controllers/tracking/user.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// POST /api/auth/customer
router.post('/customer', loginCustomer);

// POST /api/auth/delivery  
router.post('/delivery', loginDeliveryPartner);

// POST /api/auth/refresh-token
router.post('/refresh-token', refreshToken);

// GET /api/auth/user
router.get('/user', verifyToken, fetchUser);

router.patch('/user', verifyToken, updateUser);

export default router;