"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = authenticateUserToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function authenticateUserToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        console.log('No token provided');
        res.status(403).json({ success: false, message: 'No token provided.' });
        return;
    }
    jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error('Token verification error:', err);
            return res.status(401).json({ success: false, message: 'Failed to authenticate token.' });
        }
        console.log('Decoded token:', decoded);
        // Attach the decoded token to the request  
        req.body.temple = decoded; // Ensure the token includes temple_id
        next(); // Proceed to the next middleware or route handler
    });
}
