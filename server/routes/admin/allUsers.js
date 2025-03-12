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
const usersModel_1 = __importDefault(require("../../db/models/users/usersModel"));
const JWT_SECRET = process.env.JWT_SECRET;
const userslist = express_1.default.Router();
userslist.get('/getallusers', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield usersModel_1.default.findAll();
        if (!users.length) {
            return res.status(404).json({ error: 'No users found' });
        }
        res.status(200).json({ success: true, message: 'Users fetched successfully', users });
    }
    catch (err) {
        console.error('Error fetching users:', err.message);
        res.status(500).json({ error: 'An error occurred while fetching users.' });
    }
}));
userslist.get('/getuserById/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const user = yield usersModel_1.default.findOne({ where: { userid: id } });
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
userslist.put('/updateuserById/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name, email, phone, location, status } = req.body;
    try {
        const user = yield usersModel_1.default.findOne({ where: { userid: id } });
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found.' });
        }
        user.username = name || user.username;
        user.email = email || user.email;
        user.phonenumber = phone || user.phonenumber;
        user.address = location || user.address;
        user.status = status || user.status;
        yield user.save();
        res.status(200).json({ success: true, message: 'User updated successfully', user });
    }
    catch (err) {
        console.error('Error updating user details:', err.message);
        res.status(500).json({ success: false, error: 'An error occurred while updating user details.' });
    }
}));
exports.default = userslist;
