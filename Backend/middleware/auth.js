const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res, next) => {
    try {
        if (!req.headers.authorization) {
            console.warn('Authorization header is missing'); // Log missing header
            req.auth = null; // Allow the request to proceed without authentication
            return next();
        }
        const token = req.headers.authorization.split(' ')[1];
        if (!token) {
            console.warn('Token is missing in Authorization header'); // Log missing token
            req.auth = null; // Allow the request to proceed without authentication
            return next();
        }
        console.log(`Token received: ${token}`); // Log the token received
        const decodedToken = jwt.verify(token, process.env.SECRET_TOKEN);
        console.log(`Decoded token: ${JSON.stringify(decodedToken)}`); // Log the decoded token
        req.auth = {
            userId: decodedToken.userId
        };
        next();
    } catch (error) {
        console.error('Authentication error:', error); // Log the error details
        req.auth = null; // Allow the request to proceed without authentication
        next();
    }
};