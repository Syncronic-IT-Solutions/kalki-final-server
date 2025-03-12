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
const bcrypt_1 = __importDefault(require("bcrypt"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken")); // Add this import
const dotenv_1 = __importDefault(require("dotenv"));
const AgentModel_1 = __importDefault(require("../../db/models/agent/AgentModel"));
dotenv_1.default.config();
const agentRouter = express_1.default.Router();
const transporter = nodemailer_1.default.createTransport({
    secure: true,
    host: 'smtp.gmail.com',
    port: 465,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});
// ✅ Email Sending Function with Error Handling
function sendMail(to, subject, message) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
            console.error('❌ Invalid or missing recipient email:', to);
            return;
        }
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: to,
            subject: subject,
            html: message
        };
        try {
            const info = yield transporter.sendMail(mailOptions);
            console.log('✅ Email sent successfully:', info.response);
        }
        catch (error) {
            console.error('❌ Error sending email:', error);
        }
    });
}
agentRouter.post('/create-agent', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { agent_name, agent_email } = req.body;
    const { role, id: superAdminId } = req.body.temple;
    // Check if the user is a super admin
    if (role !== 'superadmin') {
        return res.status(403).json({ message: 'Access denied. Only super admins can create agents.' });
    }
    // Basic validation
    if (!agent_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(agent_email)) {
        return res.status(400).json({ message: 'Invalid or missing agent email.' });
    }
    try {
        // Check if the email already exists
        const existingAgent = yield AgentModel_1.default.findOne({ where: { agent_email } });
        if (existingAgent) {
            return res.status(409).json({ message: 'Agent with this email already exists.' });
        }
        // Generate random password and hash it
        const generatedPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = yield bcrypt_1.default.hash(generatedPassword, 10);
        // Create a new agent in the database
        const newAgent = yield AgentModel_1.default.create({
            agent_name,
            agent_email,
            agent_password: hashedPassword,
            status: 'active',
            created_by: superAdminId, // Reference to the super admin
            verified: false,
        });
        // Send the password to the agent's email
        const emailSubject = 'Your Agent Account Password';
        const emailMessage = `
            <p>Hello ${agent_name},</p>
            <p>Your agent account has been created successfully. Your login password is: <strong>${generatedPassword}</strong></p>
            <p>Please log in and change your password immediately for security reasons.</p>
            <p>Best regards,</p>
            <p>Your Company Name</p>
        `;
        sendMail(agent_email, emailSubject, emailMessage);
        res.status(201).json({ message: 'Agent created successfully. Password sent to email.', agent: newAgent });
    }
    catch (error) {
        console.error('Error creating agent:', error);
        res.status(500).json({ message: 'Server error', details: error.message });
    }
}));
agentRouter.get('/all-agents', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const agents = yield AgentModel_1.default.findAll(); // Fetch all agents
        res.status(200).json({ agents });
    }
    catch (error) {
        console.error('Error fetching agents:', error);
        res.status(500).json({ message: 'Server error', details: error.message });
    }
}));
agentRouter.get('/agent/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params; // Get agent ID from request params
    try {
        const agent = yield AgentModel_1.default.findByPk(id); // Find agent by ID
        if (!agent) {
            return res.status(404).json({ message: 'Agent not found.' });
        }
        res.status(200).json({ agent });
    }
    catch (error) {
        console.error('Error fetching agent by ID:', error);
        res.status(500).json({ message: 'Server error', details: error.message });
    }
}));
agentRouter.post('/forgot-password', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { agent_email } = req.body;
    // Validate input
    if (!agent_email) {
        return res.status(400).json({ message: 'Email is required.' });
    }
    try {
        // Check if agent exists with the provided email
        const agent = yield AgentModel_1.default.findOne({ where: { agent_email } });
        if (!agent) {
            return res.status(404).json({ message: 'Agent not found with this email.' });
        }
        // Generate a password reset token (valid for 1 hour)
        const resetToken = jsonwebtoken_1.default.sign({ agentId: agent.agent_id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        // Create the reset password link (this URL will be used in the email)
        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        // Send the reset password link to the agent's email
        const emailSubject = 'Password Reset Request';
        const emailMessage = `
            <p>Hello ${agent.agent_name},</p>
            <p>We received a request to reset your password. Click the link below to reset your password:</p>
            <p><a href="${resetLink}">${resetLink}</a></p>
            <p>If you did not request this, please ignore this email.</p>
            <p>Best regards,</p>
            <p>Your Company Name</p>
        `;
        sendMail(agent_email, emailSubject, emailMessage);
        res.status(200).json({ message: 'Password reset link sent to email.' });
    }
    catch (error) {
        console.error('Error in forgot password route:', error);
        res.status(500).json({ message: 'Server error', details: error.message });
    }
}));
agentRouter.post('/reset-password', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token, new_password } = req.body;
    // Validate input
    if (!token || !new_password) {
        return res.status(400).json({ message: 'Token and new password are required.' });
    }
    try {
        // Verify the reset token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // Find the agent by ID (from the decoded token)
        const agent = yield AgentModel_1.default.findByPk(decoded.agentId);
        if (!agent) {
            return res.status(404).json({ message: 'Agent not found.' });
        }
        // Hash the new password
        const hashedPassword = yield bcrypt_1.default.hash(new_password, 10);
        // Update the password in the database
        yield agent.update({ agent_password: hashedPassword });
        res.status(200).json({ message: 'Password reset successful.' });
    }
    catch (error) {
        console.error('Error in reset password route:', error);
        res.status(500).json({ message: 'Server error', details: error.message });
    }
}));
exports.default = agentRouter;
