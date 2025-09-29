import { Customer, DeliveryPartner } from "../../models/index.js";

export const updateUser = async (req, res) => {
    try {
        const { userId } = req.user;
        const updateUser = req.body;

        let user = await Customer.findById(userId) || await DeliveryPartner.findById(userId);

        if(!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Update user fields
         let userModel;

         if(user.role === "Customer") {
            userModel = Customer;
         }else if(user.role === "DeliveryPartner") {
            userModel = DeliveryPartner;
         } else {
            return res.status(403).json({ message: 'Invalid Role' });
         }

         const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            { $set: updateUser },
            { new: true, runValidators: true }
         )

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found to update' });
        }
        return res.status(200).json({
            message: 'User updated successfully',
            user: updatedUser
        });
        
    } catch (error) {
        console.error('Error updating user:', error);
        return res.status(500).json({ message: 'Failed to update user', error });
    }
}