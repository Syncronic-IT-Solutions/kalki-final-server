"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jwt = __importStar(require("jsonwebtoken"));
const usersModel_1 = __importDefault(require("../../db/models/users/usersModel"));
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
const JWT_SECRET = process.env.JWT_SECRET;
const twilioClient = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
const otpStore = {};
const userAuth = express_1.default.Router();
userAuth.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { phonenumber, password } = req.body;
    if (!phonenumber || !password) {
        return res.status(400).json({ error: 'Phone number and password are required.' });
    }
    try {
        // Find user by phone number
        const user = yield usersModel_1.default.findOne({ where: { phonenumber } });
        if (!user) {
            return res.status(400).json({ error: 'User not found.' });
        }
        // Check if the user's OTP is verified
        if (!user.otp_verified) {
            return res.status(400).json({ error: 'OTP not verified.' });
        }
        // Check if the user status is 'active'
        if (user.status !== 'active') {
            return res.status(400).json({ error: 'User is not active.' });
        }
        // Validate password
        const validPassword = yield bcrypt_1.default.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ success: false, message: 'Invalid credentials.' });
        }
        // Generate JWT token
        const token = jwt.sign({ userid: user.userid, phonenumber: user.phonenumber }, // Include user_id in the payload
        process.env.JWT_SECRET, { expiresIn: '24h' });
        // Send response with token, username, and user_id
        return res.status(200).json({
            success: true,
            message: 'Login successful',
            token, // JWT token
            username: user.username, // Include username in response
            userid: user.userid, // Include user_id in response
        });
    }
    catch (error) {
        console.error('Error logging in:', error.message);
        return res.status(500).json({ error: `Failed to login: ${error.message}` });
    }
}));
userAuth.post('/reset-password-send-otp', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { phonenumber } = req.body;
    if (!phonenumber || phonenumber.length !== 10) {
        return res.status(400).json({ success: false, message: 'Invalid phone number' });
    }
    try {
        const user = yield usersModel_1.default.findOne({ where: { phonenumber } });
        if (!user) {
            return res.status(400).json({ success: false, message: 'This phone number is not registered' });
        }
        const otp = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit OTP
        otpStore[phonenumber] = { otp, expiresAt: Date.now() + 3600000 }; // OTP expires in 1 hour
        // Send OTP via Twilio
        yield twilioClient.messages.create({
            body: `Your OTP for password reset is: ${otp}`,
            from: TWILIO_PHONE_NUMBER,
            to: `+91${phonenumber}`,
        });
        res.status(200).json({ success: true, message: 'OTP sent successfully' });
    }
    catch (err) {
        console.error('Error sending OTP:', err.message);
        res.status(500).json({ success: false, message: 'Failed to send OTP', error: err.message });
    }
}));
userAuth.post('/verify-reset-otp', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { phone_number, otp } = req.body;
    if (!phone_number || !otp) {
        return res.status(400).json({ error: 'Phone number and OTP are required' });
    }
    try {
        // Verify OTP
        const storedOtpData = otpStore[phone_number];
        if (!storedOtpData) {
            return res.status(400).json({ error: 'OTP not found or expired' });
        }
        if (storedOtpData.otp !== parseInt(otp) || storedOtpData.expiresAt < Date.now()) {
            delete otpStore[phone_number]; // Clear the OTP from the store after it's expired or used
            return res.status(400).json({ error: 'Invalid OTP' });
        }
        // Remove OTP from in-memory store
        delete otpStore[phone_number];
        res.status(200).json({ success: true, message: 'OTP verified successfully' });
    }
    catch (error) {
        console.error('Error verifying OTP:', error.message);
        res.status(500).json({ error: `Failed to verify OTP: ${error.message}` });
    }
}));
userAuth.post('/logout', (req, res) => {
    var _a;
    const token = (_a = req.headers['authorization']) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
    if (!token) {
        return res.status(400).json({ success: false, message: 'Token not found.' });
    }
    try {
        // Verify the JWT token
        const decoded = jwt.verify(token, JWT_SECRET);
        // The token is verified and the user can be logged out
        // You can add logic here if you need to record the logout event in the database
        res.status(200).json({ success: true, message: 'Logout successful.' });
    }
    catch (error) {
        console.error('Error logging out:', error.message);
        res.status(500).json({ success: false, message: 'Failed to log out.', error: error.message });
    }
});
// userAuth.post('/logout', (req : any, res : any) => {
//     // Logic to handle logout (e.g., invalidate token, clear session, etc.)
//     res.json({ message: 'Logged out successfully' });
//   });
// Logout endpoint (for token-based authentication)
userAuth.post('/logout', (req, res) => {
    // If you're using JWT stored in a cookie, you can clear the cookie to invalidate it
    res.clearCookie('token'); // Clear the token cookie (if you're storing it in a cookie)
    // If you're using localStorage or sessionStorage on the client, the client should handle that
    res.status(200).json({ success: true, message: 'Logged out successfully' });
});
exports.default = userAuth;
