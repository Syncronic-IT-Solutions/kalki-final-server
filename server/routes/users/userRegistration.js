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
const userRegistration = express_1.default.Router();
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
const JWT_SECRET = process.env.JWT_SECRET;
const twilioClient = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
// In-memory OTP storage (for simplicity; use a database for production)
const otpStore = {};
// Generate unique user ID (KSB1001, KSB1002, ...)
const generateUserId = () => __awaiter(void 0, void 0, void 0, function* () {
    const prefix = 'KSB'; // Prefix for user ID
    const latestUser = yield usersModel_1.default.findOne({
        order: [['userid', 'DESC']], // Order by descending userid
        attributes: ['userid'], // Only fetch userid
    });
    if (latestUser) {
        const lastId = parseInt(latestUser.userid.replace(prefix, '')); // Extract numeric part
        const nextId = lastId + 1; // Increment ID by 1
        return `${prefix}${nextId.toString().padStart(4, '0')}`; // Return formatted ID like KSB1001, KSB1002
    }
    // If no users exist, return the first user ID
    return `${prefix}1001`;
});
// Create new account and send OTP
userRegistration.post('/createAccount', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { phonenumber } = req.body;
    if (!phonenumber || phonenumber.length !== 10) {
        return res.status(400).json({ success: false, message: 'Invalid phone number' });
    }
    try {
        const existingUser = yield usersModel_1.default.findOne({ where: { phonenumber } });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'This phone number is already registered' });
        }
        const otp = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit OTP
        otpStore[phonenumber] = { otp, expiresAt: Date.now() + 3600000 }; // OTP expires in 1 hour
        // Send OTP via Twilio
        yield twilioClient.messages.create({
            body: `Your OTP for registration is: ${otp}`,
            from: TWILIO_PHONE_NUMBER,
            to: `+91${phonenumber}`,
        });
        res.status(200).json({ success: true, message: 'OTP sent successfully. Please check your phone.' });
    }
    catch (err) {
        console.error('Error sending OTP:', err.message);
        res.status(500).json({ success: false, message: 'Failed to send OTP', error: err.message });
    }
}));
// Verify OTP and register user
userRegistration.post('/verify-otp', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { phonenumber, otp } = req.body;
    if (!phonenumber || !otp) {
        return res.status(400).json({ error: 'Phone number and OTP are required' });
    }
    try {
        // Verify OTP
        const storedOtpData = otpStore[phonenumber];
        if (!storedOtpData) {
            return res.status(400).json({ error: 'OTP not found or expired' });
        }
        if (storedOtpData.otp !== parseInt(otp) || storedOtpData.expiresAt < Date.now()) {
            delete otpStore[phonenumber]; // Clear the OTP from the store after it's expired or used
            return res.status(400).json({ error: 'Invalid OTP' });
        }
        // Check if user exists, if not, create an entry
        let user = yield usersModel_1.default.findOne({ where: { phonenumber } });
        if (!user) {
            const userId = yield generateUserId(); // Generate unique user ID
            user = yield usersModel_1.default.create({
                userid: userId, // Ensure userId is stored as a string
                phonenumber,
                otp_verified: false,
                username: 'Kalki Seva Bhakth',
                email: '',
                gender: '',
                address: '',
                profile_pic_url: '',
                password: '',
                status: 'active',
            });
        }
        // Update OTP verification status
        yield user.update({ otp_verified: true });
        // Remove OTP from in-memory store
        delete otpStore[phonenumber];
        // Generate JWT token with user ID
        const token = jwt.sign({ phonenumber, user_id: user.userid }, JWT_SECRET, { expiresIn: '24h' });
        res.status(200).json({ success: true, message: 'OTP verified successfully', token });
    }
    catch (error) {
        console.error('Error verifying OTP:', error.message);
        res.status(500).json({ error: `Failed to verify OTP: ${error.message}` });
    }
}));
// Set password after OTP verification
userRegistration.post('/create-password', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { phonenumber, password } = req.body;
    if (!phonenumber || !password) {
        return res.status(400).json({ error: 'Phone number and password are required' });
    }
    try {
        const user = yield usersModel_1.default.findOne({ where: { phonenumber } });
        if (!user || !user.otp_verified) {
            return res.status(400).json({ error: 'User not found or OTP not verified' });
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        yield user.update({ password: hashedPassword });
        res.status(200).json({ success: true, message: 'Password set successfully' });
    }
    catch (error) {
        console.error('Error setting password:', error.message);
        res.status(500).json({ error: `Failed to set password: ${error.message}` });
    }
}));
// Reset password and send OTP
userRegistration.post('/reset-password-send-otp', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
// Verify OTP for password reset
userRegistration.post('/verify-reset-otp', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
exports.default = userRegistration;
