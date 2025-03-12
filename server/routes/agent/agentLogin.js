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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const AgentModel_1 = __importDefault(require("../../db/models/agent/AgentModel"));
dotenv_1.default.config();
const agentAuth = express_1.default.Router();
agentAuth.post('/agentLogin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { agent_email, agent_password } = req.body;
    // Validate input
    if (!agent_email || !agent_password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }
    try {
        // Check if the agent exists in the database
        const agent = yield AgentModel_1.default.findOne({ where: { agent_email } });
        if (!agent) {
            return res.status(404).json({ message: 'Agent not found with this email.' });
        }
        // Compare the provided password with the stored hashed password
        const isPasswordValid = yield bcrypt_1.default.compare(agent_password, agent.agent_password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid password.' });
        }
        // Generate JWT token
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined in the environment variables');
        }
        const token = jsonwebtoken_1.default.sign({ id: agent.agent_id, email: agent.agent_email, role: 'agent' }, // Payload
        process.env.JWT_SECRET, // Secret key (from .env)
        { expiresIn: '1h' } // Token expiry time
        );
        // Return the token and agent details (optionally)
        res.status(200).json({
            message: 'Login successful.',
            token,
            agent: {
                agent_id: agent.agent_id,
                agent_name: agent.agent_name,
                agent_email: agent.agent_email,
                status: agent.status,
            }
        });
    }
    catch (error) {
        console.error('Error during agent login:', error);
        res.status(500).json({ message: 'Server error', details: error.message });
    }
}));
exports.default = agentAuth;
