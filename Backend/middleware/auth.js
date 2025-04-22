const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            req.auth = null;
            return next();
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            console.warn('Token is missing in Authorization header');
            req.auth = null;
            return next();
        }

        try {
            const decodedToken = await jwt.verify(token, process.env.SECRET_TOKEN);
            req.auth = { userId: decodedToken.userId };
        } catch (verificationError) {
            console.error('Token verification failed:', verificationError);
            req.auth = null;
        }

        next();
    } catch (error) {
        console.error('Unexpected error in authentication middleware:', error);
        req.auth = null;
        next();
    }
};