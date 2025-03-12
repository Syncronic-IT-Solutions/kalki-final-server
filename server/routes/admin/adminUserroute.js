"use strict";
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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const AdminUserModel_1 = __importDefault(require("../../db/models/admin/AdminUserModel"));
const adminauthrouter = express_1.default.Router();
adminauthrouter.post('/admin-register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { admin_email, admin_password, admin_user_name, role } = req.body;
    try {
        // Check if the email already exists
        const existingAdmin = yield AdminUserModel_1.default.findOne({ where: { admin_email } });
        if (existingAdmin) {
            return res.status(400).json({ message: 'Email already exists' });
        }
        // Hash the password before saving it
        const hashedPassword = yield bcrypt_1.default.hash(admin_password, 10);
        // Create the new admin user in the database
        const newAdminUser = yield AdminUserModel_1.default.create({
            admin_user_name,
            admin_email,
            admin_password: hashedPassword,
            role: role || 'admin',
            admin_phone: ''
        });
        // Return success message
        res.status(201).json({ message: 'Admin user created successfully', admin_user_id: newAdminUser.admin_user_id });
    }
    catch (err) {
        console.error('Error creating admin user:', err);
        res.status(500).json({ message: 'Server error', details: err.message });
    }
}));
adminauthrouter.post('/admin-login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { admin_email, admin_password } = req.body;
    try {
        // Find the admin user by email
        const adminUser = yield AdminUserModel_1.default.findOne({ where: { admin_email } });
        // If the user doesn't exist, return an error
        if (!adminUser) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        // Compare the provided password with the stored hashed password
        const isPasswordValid = yield bcrypt_1.default.compare(admin_password, adminUser.admin_password);
        if (isPasswordValid) {
            // Password is valid, generate a JWT token
            const payload = {
                email: adminUser.admin_email,
                role: adminUser.role, // admin or superadmin
            };
            const token = jsonwebtoken_1.default.sign(payload, (_a = process.env.JWT_SECRET) !== null && _a !== void 0 ? _a : 'default_secret', { expiresIn: '24h' });
            res.status(200).json({ message: 'Login successful', token });
        }
        else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    }
    catch (err) {
        console.error('Error logging in admin:', err);
        res.status(500).json({ message: 'Server error', details: err.message });
    }
}));
adminauthrouter.get('/profile', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const token = (_a = req.headers['authorization']) === null || _a === void 0 ? void 0 : _a.split(' ')[1]; // Get the token from the Authorization header
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, (_b = process.env.JWT_SECRET) !== null && _b !== void 0 ? _b : 'default_secret');
        const adminUser = yield AdminUserModel_1.default.findOne({ where: { admin_email: decoded.email } });
        if (!adminUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({
            admin_user_name: adminUser.admin_user_name,
            role: adminUser.role,
        });
    }
    catch (err) {
        console.error('Error verifying token:', err);
        res.status(500).json({ message: 'Server error' });
    }
}));
exports.default = adminauthrouter;
