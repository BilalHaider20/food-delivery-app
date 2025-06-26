import jwt from 'jsonwebtoken';
import { Customer, DeliveryPartner } from '../../models';


export const generateToken = (user) => {
    const accessToken = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1d' }
    )

    const refreshToken = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
    )

    return { accessToken, refreshToken };
}

export const loginCustomer = async (req, reply) => {
    try {
        const { phone } = req.body;
        let customer = await Customer.findOne({ phone });

        if (!customer) {
            customer = new Customer({
                phone,
                role: 'Customer',
                isActive: true
            })
            await customer.save();
        }

        const { accessToken, refreshToken } = generateToken(customer);

        return reply.status(200), send({
            message: 'Login successful',
            accessToken,
            refreshToken,
            customer
        })

    } catch (error) {
        console.error('Login error:', error);
        return reply.status(500).send({ message: 'Login Error', error });

    }
}


export const loginDeliveryPartner = async (req, reply) => {
    try {
        const { email, password } = req.body;
        let deliveryPartner = await DeliveryPartner.findOne({ email });

        if (!deliveryPartner) {
            return reply.status(404).send({ message: 'Delivery Partner not found' });
        }

        const isMatch = password === deliveryPartner?.password
        if (!isMatch) {
            return reply.status(401).send({ message: 'Invalid credentials' });
        }

        const { accessToken, refreshToken } = generateToken(deliveryPartner);

        return reply.status(200), send({
            message: 'Login successful',
            accessToken,
            refreshToken,
            deliveryPartner
        })

    } catch (error) {
        console.error('Login error:', error);
        return reply.status(500).send({ message: 'Internal Server Error', error });

    }
}


export const refreshToken = async (req, reply) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return reply.status(401).send({ message: 'Refresh token is required' });
        }

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                return reply.status(403).send({ message: 'Invalid refresh token', error: err });
            }

            let user;
            if(decoded.role === 'Customer') {
                user = Customer.findById(decoded.userId);
            }else if(decoded.role === 'DeliveryPartner') {
                user = DeliveryPartner.findById(decoded.userId);
            }else{
                return reply.status(403).send({ message: 'Invalid Role' });
            }
            if (!user) {
                return reply.status(404).send({ message: 'User not found' });
            }

            const {accessToken: newAccessToken, refreshToken: newRefreshToken} = generateToken(user);

            return reply.status(200).send({ message: "Token Refreshed "
                , accessToken: newAccessToken, refreshToken: newRefreshToken });
        });

    } catch (error) {
        console.error('Refresh token error:', error);
        return reply.status(500).send({ message: 'Internal Server Error', error });
    }
}


export const fetchUser = async(req, reply)=>{
    const {userId, role} = req.user;

    try {
        let user;
        if(role === "Customer"){
            user = await Customer.findById(userId);
        }else if(role === "DeliveryPartner"){
            user = await DeliveryPartner.findById(userId);
        }else {
            return reply.status(403).send({ message: 'Invalid Role' });
        }

        if(!user) {
            return reply.status(404).send({ message: 'User not found' });
        }

        return reply.status(200).send({
            message: 'User fetched successfully',
            user
        });
    } catch (error) {
        console.error('Fetch user error:', error);
        return reply.status(500).send({ message: 'Internal Server Error' });
    }
}