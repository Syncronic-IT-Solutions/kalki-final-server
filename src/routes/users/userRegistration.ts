import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import UserModel from '../../db/models/users/usersModel';

const userRegistration = express.Router();

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID!;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN!;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER!;
const JWT_SECRET = process.env.JWT_SECRET!;
const twilioClient = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

// In-memory OTP storage (for simplicity; use a database for production)
const otpStore: { [key: string]: { otp: number; expiresAt: number } } = {};

// Generate unique user ID (KSB1001, KSB1002, ...)
const generateUserId = async (): Promise<string> => {
    const prefix = 'KSB'; // Prefix for user ID
    const latestUser = await UserModel.findOne({
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
};

// Create new account and send OTP
userRegistration.post('/createAccount', async (req: any, res: any) => {
    const { phonenumber } = req.body;

    if (!phonenumber || phonenumber.length !== 10) {
        return res.status(400).json({ success: false, message: 'Invalid phone number' });
    }

    try {
        const existingUser = await UserModel.findOne({ where: { phonenumber } });

        if (existingUser) {
            return res.status(400).json({ success: false, message: 'This phone number is already registered' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit OTP
        otpStore[phonenumber] = { otp, expiresAt: Date.now() + 3600000 }; // OTP expires in 1 hour

        // Send OTP via Twilio
        await twilioClient.messages.create({
            body: `Your OTP for registration is: ${otp}`,
            from: TWILIO_PHONE_NUMBER,
            to: `+91${phonenumber}`,
        });

        res.status(200).json({ success: true, message: 'OTP sent successfully. Please check your phone.' });
    } catch (err: any) {
        console.error('Error sending OTP:', err.message);
        res.status(500).json({ success: false, message: 'Failed to send OTP', error: err.message });
    }
});

// Verify OTP and register user
userRegistration.post('/verify-otp', async (req: any, res: any) => {
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
        let user = await UserModel.findOne({ where: { phonenumber } });
        if (!user) {
            const userId = await generateUserId(); // Generate unique user ID

            user = await UserModel.create({
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
        await user.update({ otp_verified: true });

        // Remove OTP from in-memory store
        delete otpStore[phonenumber];

        // Generate JWT token with user ID
        const token = jwt.sign({ phonenumber, user_id: user.userid }, JWT_SECRET, { expiresIn: '24h' });

        res.status(200).json({ success: true, message: 'OTP verified successfully', token });
    } catch (error: any) {
        console.error('Error verifying OTP:', error.message);
        res.status(500).json({ error: `Failed to verify OTP: ${error.message}` });
    }
});

// Set password after OTP verification
userRegistration.post('/create-password', async (req: any, res: any) => {
    const { phonenumber, password } = req.body;

    if (!phonenumber || !password) {
        return res.status(400).json({ error: 'Phone number and password are required' });
    }

    try {
        const user = await UserModel.findOne({ where: { phonenumber } });

        if (!user || !user.otp_verified) {
            return res.status(400).json({ error: 'User not found or OTP not verified' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await user.update({ password: hashedPassword });

        res.status(200).json({ success: true, message: 'Password set successfully' });
    } catch (error: any) {
        console.error('Error setting password:', error.message);
        res.status(500).json({ error: `Failed to set password: ${error.message}` });
    }
});

// Reset password and send OTP
userRegistration.post('/reset-password-send-otp', async (req: any, res: any) => {
    const { phonenumber } = req.body;

    if (!phonenumber || phonenumber.length !== 10) {
        return res.status(400).json({ success: false, message: 'Invalid phone number' });
    }

    try {
        const user = await UserModel.findOne({ where: { phonenumber } });

        if (!user) {
            return res.status(400).json({ success: false, message: 'This phone number is not registered' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit OTP
        otpStore[phonenumber] = { otp, expiresAt: Date.now() + 3600000 }; // OTP expires in 1 hour

        // Send OTP via Twilio
        await twilioClient.messages.create({
            body: `Your OTP for password reset is: ${otp}`,
            from: TWILIO_PHONE_NUMBER,
            to: `+91${phonenumber}`,
        });

        res.status(200).json({ success: true, message: 'OTP sent successfully' });
    } catch (err: any) {
        console.error('Error sending OTP:', err.message);
        res.status(500).json({ success: false, message: 'Failed to send OTP', error: err.message });
    }
});

// Verify OTP for password reset
userRegistration.post('/verify-reset-otp', async (req: any, res: any) => {
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
    } catch (error: any) {
        console.error('Error verifying OTP:', error.message);
        res.status(500).json({ error: `Failed to verify OTP: ${error.message}` });
    }
});

export default userRegistration;
