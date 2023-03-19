import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import asyncHandler from "express-async-handler";
const protect = asyncHandler(async (req, res, next) => {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            res.user = await User.findOne({_id: decoded.id}).select('-password')
            next()
        } catch (error) {
            console.error(error)
            res.status(401)
            throw new Error('Not authorized, token failed');
        }
    }
    if (!token) {
        res.status(401)
        throw new Error('Not authorized, no token');
    }
})

export { protect };