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
const AgentDetailsModel_1 = __importDefault(require("../../db/models/admin/AgentDetailsModel"));
const dotenv_1 = __importDefault(require("dotenv"));
const multer_1 = __importDefault(require("multer"));
const multer_s3_1 = __importDefault(require("multer-s3"));
const client_s3_1 = require("@aws-sdk/client-s3");
const AgentModel_1 = __importDefault(require("../../db/models/agent/AgentModel"));
dotenv_1.default.config();
if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.BUCKET_REGION || !process.env.BUCKET_NAME) {
    throw new Error('Missing AWS configuration in .env file');
}
const s3 = new client_s3_1.S3Client({
    region: process.env.BUCKET_REGION.trim(),
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});
const upload = (0, multer_1.default)({
    storage: (0, multer_s3_1.default)({
        s3,
        bucket: process.env.BUCKET_NAME,
        contentType: multer_s3_1.default.AUTO_CONTENT_TYPE,
        metadata: (req, file, cb) => {
            cb(null, { fieldName: file.fieldname });
        },
        key: (req, file, cb) => {
            cb(null, `agent_uploads/${Date.now()}_${file.originalname}`);
        },
    }),
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type. Only JPG, PNG, and JPEG are allowed.'));
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 },
});
const agentDetails = express_1.default.Router();
agentDetails.post('/upload_details', upload.fields([
    { name: 'aadhaar_image_upload', maxCount: 2 },
    { name: 'pan_image_upload', maxCount: 2 },
]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { gender, dateofbirth, address, aadhaarnumber, pannumber, bankaccount_number, ifsccode, branch, phone_number, } = req.body;
        const agent_id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!agent_id) {
            return res.status(400).json({ error: 'Invalid token: agent_id not found' });
        }
        const parsedDate = dateofbirth ? new Date(dateofbirth) : null;
        const aadhaar_image_upload = ((_b = req.files) === null || _b === void 0 ? void 0 : _b['aadhaar_image_upload'])
            ? req.files['aadhaar_image_upload'].map(file => file.location)
            : [];
        const pan_image_upload = ((_c = req.files) === null || _c === void 0 ? void 0 : _c['pan_image_upload'])
            ? req.files['pan_image_upload'].map(file => file.location)
            : [];
        console.log('Extracted agent_id:', agent_id);
        console.log('Received files:', req.files);
        console.log('Saving agent details:', {
            agent_id,
            gender,
            dateofbirth: parsedDate,
            address,
            aadhaarnumber,
            pannumber,
            bankaccount_number,
            ifsccode,
            branch,
            phone_number,
            aadhaar_image_upload,
            pan_image_upload,
        });
        const newDetails = yield AgentDetailsModel_1.default.create({
            agent_id,
            gender,
            dateofbirth: parsedDate,
            address,
            aadhaarnumber,
            pannumber,
            bankaccount_number,
            ifsccode,
            branch,
            phone_number,
            aadhaar_image_upload,
            pan_image_upload,
        });
        return res.status(201).json({ message: 'Agent details uploaded successfully', data: newDetails });
    }
    catch (error) {
        console.error('Error uploading agent details:', error);
        return res.status(500).json({ message: 'Internal server error', details: error.message });
    }
}));
agentDetails.put('/change-password', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { agent_password, new_password } = req.body;
    const { id: agentId } = req.user;
    if (!agent_password || !new_password) {
        return res.status(400).json({ message: 'Current password and new password are required.' });
    }
    try {
        const agent = yield AgentModel_1.default.findByPk(agentId);
        if (!agent) {
            return res.status(404).json({ message: 'Agent not found.' });
        }
        const isPasswordValid = yield bcrypt_1.default.compare(agent_password, agent.agent_password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Incorrect current password.' });
        }
        const hashedPassword = yield bcrypt_1.default.hash(new_password, 10);
        yield agent.update({
            agent_password: hashedPassword
        });
        res.status(200).json({ message: 'Password updated successfully.' });
    }
    catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({ message: 'Server error', details: error.message });
    }
}));
agentDetails.put('/update', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { new_name } = req.body;
    const { id: agentId } = req.user;
    if (!new_name) {
        return res.status(400).json({ message: 'New agent name is required.' });
    }
    try {
        const agent = yield AgentModel_1.default.findByPk(agentId);
        if (!agent) {
            return res.status(404).json({ message: 'Agent not found.' });
        }
        yield agent.update({
            agent_name: new_name
        });
        res.status(200).json({ message: 'Agent name updated successfully.' });
    }
    catch (error) {
        console.error('Error updating agent name:', error);
        res.status(500).json({ message: 'Server error', details: error.message });
    }
}));
exports.default = agentDetails;
