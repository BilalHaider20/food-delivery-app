import { Branch, Customer, DeliveryPartner, Order } from "../../models/index.js";


// item.item
export const createOrder = async (req, res) => {
    try {
        const { userId } = req.user;
        const { items, branch, totalPrice } = req.body;

        const customerData = await Customer.findById(userId);

        if (!customerData) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        const branchData = await Branch.findById(branch);

        if (!branchData) {
            return res.status(404).json({ message: 'Branch not found' });
        }

        const newOrder = new Order({
            customerId: userId,
            branch,
            totalPrice,
            items: items.map(item => ({
                id: item.id,
                quantity: item.quantity,
                count: item.count
            })),
            deliveryLocation: {
                latitude: customerData.liveLocation.latitude,
                longitude: customerData.liveLocation.longitude,
                address: customerData.address || 'no address'

            },
            pickupLocation: {
                latitude: branchData.location.latitude,
                longitude: branchData.location.longitude,
                address: branchData.address || 'no address'
            }
        });

        const savedOrder = await newOrder.save();
        return res.status(201).json(savedOrder);

    } catch (error) {
        console.log('error', error);
        return res.status(500).json({ message: 'Failed to create order', error: error.message });
    }
}


export const confirmOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { userId } = req.user;
        const { deliveryPersonLocation } = req.body;

        const deliveryPerson = await DeliveryPartner.findById(userId);

        if (!deliveryPerson) {
            return res.status(404).json({ message: "Delivery Person not found" });

        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (order.status != 'available') {
            return res.status(404).json({ message: "Order is not available" });
        }

        order.status = "confirmed";
        order.deliveryPartner = userId;
        order.deliveryPersonLocation = {
            latitude: deliveryPersonLocation?.latitude,
            longitude: deliveryPersonLocation?.longitude,
            address: deliveryPersonLocation?.address || "",
        }

        req.io.to(orderId).emit('orderConfirmed', order);
        await order.save();

        return res.status(202).json(order);


    } catch (error) {
        return res.status(500).json({ message: "Failed to confirm order", error });
    }
}


export const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { userId } = req.user;
        const { deliveryPersonLocation, status } = req.body;

        const deliveryPerson = await DeliveryPartner.findById(userId);

        if (!deliveryPerson) {
            return res.status(404).json({ message: "Delivery Person not found" });

        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (['delivered', 'cancelled'].includes(order.status)) {
            return res.status(400).json({ message: "Order is already completed or cancelled" });
        }

        if (order.deliveryPartner.toString() != userId) {
            return res.status(403).json({ message: 'unauthorized' });
        }

        order.status = status;
        order.deliveryPersonLocation = deliveryPersonLocation;
        await order.save();

        req.io.to(orderId).emit("liveTrackingUpdate", order);

        return res.json(order);


    } catch (error) {
        return res.status(500).json({ message: "Failed to update order" });
    }
}


export const getOrders = async (req, res) => {
    try {
        const { status, customerId, deliveryPartnerId, branchId } = req.query;

        let query = {};
        if (status) {
            query.status = status;
        }

        if (customerId) {
            query.customerId = customerId;
        }

        if (deliveryPartnerId) {
            query.deliveryPartner = deliveryPartnerId;
            if (branchId) {  // ✅ Fixed: Only add branch if provided
                query.branch = branchId;
            }
        }

        const orders = await Order.find(query).populate(
            "customer branch items.item deliveryPartner"
        );

        return res.json(orders);

    } catch (error) {
        return res.status(500).json({ message: "Failed to fetch order", error });
    }
}

export const getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId).populate(
            "customer branch items.item deliveryPartner"
        );

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        return res.json(order);

    } catch (error) {
        return res.status(500).json({ message: "Failed to fetch order", error });
    }
} 