import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader || !authHeader.startsWith("Bearer ")) return res.status(401).json({message:"Access Token is required"});

        const token = authHeader.split(" ")[1];
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({ 
                    message: 'Invalid or expired token'
                });
            }
            req.user = decoded;
            next();
        });
    } catch (error) {
        return res.status(500).json({ 
            message: 'Token verification failed', 
            error: error.message 
        });
    }
}