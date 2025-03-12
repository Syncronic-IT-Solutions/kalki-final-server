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
const JWT_SECRET = process.env.JWT_SECRET;
const userDetailsUpdate = express_1.default.Router();
// Middleware to parse JSON
userDetailsUpdate.use(express_1.default.json());
userDetailsUpdate.put('/update-profile', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Request body:', req.body);
    const { username, email, gender, address, profile_pic_url } = req.body;
    const { phonenumber } = req.body.temple;
    if (!username || !email) {
        console.log('Missing username or email.');
        return res.status(400).json({ error: 'Name and email are required.' });
    }
    console.log('Fetching user with phonenumber:', phonenumber);
    try {
        const user = yield usersModel_1.default.findOne({ where: { phonenumber } });
        if (!user) {
            console.log('User not found for phonenumber:', phonenumber);
            return res.status(404).json({ error: 'User not found.' });
        }
        console.log('User found:', user);
        user.username = username;
        user.email = email;
        user.gender = gender;
        user.address = address;
        user.profile_pic_url = profile_pic_url;
        console.log('Saving updated user:', user);
        yield user.save();
        res.status(200).json({ success: true, message: 'Profile updated successfully', user });
    }
    catch (err) {
        console.error('Error during profile update:', err);
        res.status(500).json({ error: 'An error occurred while updating the profile.', details: err.message });
    }
}));
userDetailsUpdate.put('/update-user/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Request body:', req.body);
    const { username, email, gender, address, status } = req.body;
    const userId = req.params.id; // Get userId from URL parameter
    // Check if username and email are provided
    if (!username || !email) {
        console.log('Missing username or email.');
        return res.status(400).json({ error: 'Username and email are required.' });
    }
    console.log('Fetching user with userId:', userId);
    try {
        // Find the user by userId
        const user = yield usersModel_1.default.findOne({ where: { userid: userId } });
        if (!user) {
            console.log('User not found for userId:', userId);
            return res.status(404).json({ error: 'User not found.' });
        }
        console.log('User found:', user);
        // Update the user's profile information
        user.username = username;
        user.email = email;
        user.gender = gender;
        user.address = address;
        user.status = status;
        console.log('Saving updated user:', user);
        // Save the updated user data
        yield user.save();
        // Return success response
        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                username: user.username,
                email: user.email,
                gender: user.gender,
                address: user.address,
                status: user.status,
                updated: user.updatedAt, // You might want to include the updated time
            },
        });
    }
    catch (err) {
        console.error('Error during profile update:', err);
        res.status(500).json({ error: 'An error occurred while updating the profile.', details: err.message });
    }
}));
userDetailsUpdate.post('/change-password', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { password, new_password } = req.body;
    const { phonenumber } = req.body.temple; // Retrieve phone_number from the decoded token
    if (!password || !new_password) {
        return res.status(400).json({ error: 'Current password and new password are required.' });
    }
    try {
        // Find the user using the phone_number from the token
        const user = yield usersModel_1.default.findOne({ where: { phonenumber } });
        if (!user || !user.otp_verified) {
            return res.status(400).json({ error: 'User not found or OTP not verified.' });
        }
        // Check if the current password is correct
        const validPassword = yield bcrypt_1.default.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid current password.' });
        }
        // Hash the new password
        const hashedNewPassword = yield bcrypt_1.default.hash(new_password, 10);
        // Update the user's password
        yield user.update({ password: hashedNewPassword });
        res.status(200).json({ success: true, message: 'Password changed successfully' });
    }
    catch (error) {
        console.error('Error changing password:', error.message);
        res.status(500).json({ error: `Failed to change password: ${error.message}` });
    }
}));
userDetailsUpdate.get('/getuserDetails', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { phonenumber } = req.body.temple; // Extract phone_number from the decoded token
    try {
        const user = yield usersModel_1.default.findOne({ where: { phonenumber } });
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        res.status(200).json({ success: true, message: 'User details fetched successfully', user });
    }
    catch (err) {
        console.error('Error fetching user details:', err.message);
        res.status(500).json({ error: 'An error occurred while fetching user details.' });
    }
}));
userDetailsUpdate.post('/logout', (req, res) => {
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
exports.default = userDetailsUpdate;
