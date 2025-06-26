import { Customer, DeliveryPartner } from "../../models";

export const updateUser = async (req, reply) => {
    try {
        const { userId } = req.user;
        const updateUser = req.body;

        let user = await Customer.findById(userId) || await DeliveryPartner.findById(userId);

        if(!user) {
            return reply.status(404).send({ message: 'User not found' });
        }
        // Update user fields
         let userModel;

         if(user.role === "Customer") {
            userModel = Customer;
         }else if(user.role === "DeliveryPartner") {
            userModel = DeliveryPartner;
         } else {
            return reply.status(403).send({ message: 'Invalid Role' });
         }

         const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            { $set: updateUser },
            { new: true, runValidators: true }
         )

        if (!updatedUser) {
            return reply.status(404).send({ message: 'User not found to update' });
        }
        return reply.status(200).send({
            message: 'User updated successfully',
            user: updatedUser
        });
        
    } catch (error) {
        console.error('Error updating user:', error);
        return reply.status(500).send({ message: 'Failed to update user', error });
    }
}