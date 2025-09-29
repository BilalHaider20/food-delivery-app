import jwt from 'jsonwebtoken';
import { Customer, DeliveryPartner } from '../../models/index.js';


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

export const loginCustomer = async (req, res) => {
    try {
        const { phone } = req.body;
        let customer = await Customer.findOne({ phone });

        if (!customer) {
            customer = new Customer({
                phone,
                role: 'Customer',
                isActivated: true
            })
            await customer.save();
        }

        const { accessToken, refreshToken } = generateToken(customer);

        return res.status(200).json({
            message: 'Login successful',
            accessToken,
            refreshToken,
            customer
        })

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Login Error', error });

    }
}


export const loginDeliveryPartner = async (req, res) => {
    try {
        const { email, password } = req.body;
        let deliveryPartner = await DeliveryPartner.findOne({ email });

        if (!deliveryPartner) {
            return res.status(404).json({ message: 'Delivery Partner not found' });
        }

        const isMatch = password === deliveryPartner?.password
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const { accessToken, refreshToken } = generateToken(deliveryPartner);

        return res.status(200).json({
            message: 'Login successful',
            accessToken,
            refreshToken,
            deliveryPartner
        })

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Internal Server Error', error });

    }
}


export const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({ message: 'Refresh token is required' });
        }

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: 'Invalid refresh token', error: err });
            }

            let user;
            if (decoded.role === 'Customer') {
                user = await Customer.findById(decoded.userId);
            } else if (decoded.role === 'DeliveryPartner') {
                user = await DeliveryPartner.findById(decoded.userId);
            } else {
                return res.status(403).json({ message: 'Invalid Role' });
            }
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateToken(user);

            return res.status(200).json({
                message: "Token Refreshed "
                , accessToken: newAccessToken, refreshToken: newRefreshToken
            });
        });

    } catch (error) {
        console.error('Refresh token error:', error);
        return res.status(500).json({ message: 'Internal Server Error', error });
    }
}


export const fetchUser = async (req, res) => {
    const { userId, role } = req.user;

    try {
        let user;
        if (role === "Customer") {
            user = await Customer.findById(userId);
        } else if (role === "DeliveryPartner") {
            user = await DeliveryPartner.findById(userId);
        } else {
            return res.status(403).json({ message: 'Invalid Role' });
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({
            message: 'User fetched successfully',
            user
        });
    } catch (error) {
        console.error('Fetch user error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}