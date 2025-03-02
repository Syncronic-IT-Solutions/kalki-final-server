import express from 'express';
import bcrypt from 'bcrypt';
import AgentDetailsModel from '../../db/models/admin/AgentDetailsModel';
import dotenv from 'dotenv';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';
import AgentModel from '../../db/models/agent/AgentModel';

dotenv.config();

if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.BUCKET_REGION || !process.env.BUCKET_NAME) {
    throw new Error('Missing AWS configuration in .env file');
}

const s3 = new S3Client({
    region: process.env.BUCKET_REGION.trim(),
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const upload = multer({
    storage: multerS3({
        s3,
        bucket: process.env.BUCKET_NAME as string,
        contentType: multerS3.AUTO_CONTENT_TYPE,
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
        } else {
            cb(new Error('Invalid file type. Only JPG, PNG, and JPEG are allowed.'));
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 }, 
});

const agentDetails = express.Router();

agentDetails.post('/upload_details',upload.fields([
        { name: 'aadhaar_image_upload', maxCount: 2 },
        { name: 'pan_image_upload', maxCount: 2 },
    ]),
    async (req: any, res: any) => {
        try {
            const {
                gender,
                dateofbirth,
                address,
                aadhaarnumber,
                pannumber,
                bankaccount_number,
                ifsccode,
                branch,
                phone_number,
            } = req.body;

            const agent_id = req.user?.id;
            if (!agent_id) {
                return res.status(400).json({ error: 'Invalid token: agent_id not found' });
            }
            const parsedDate = dateofbirth ? new Date(dateofbirth) : null;

            const aadhaar_image_upload = req.files?.['aadhaar_image_upload']
                ? (req.files['aadhaar_image_upload'] as Express.MulterS3.File[]).map(file => file.location)
                : [];

            const pan_image_upload = req.files?.['pan_image_upload']
                ? (req.files['pan_image_upload'] as Express.MulterS3.File[]).map(file => file.location)
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
            const newDetails = await AgentDetailsModel.create({
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
        } catch (error: any) {
            console.error('Error uploading agent details:', error);
            return res.status(500).json({ message: 'Internal server error', details: error.message });
        }
    }
);

agentDetails.put('/change-password', async (req: any, res: any) => {
    const { agent_password, new_password } = req.body;
    const { id: agentId } =  req.user;
    if (!agent_password || !new_password) {
        return res.status(400).json({ message: 'Current password and new password are required.' });
    }

    try {
        const agent = await AgentModel.findByPk(agentId);
        if (!agent) {
            return res.status(404).json({ message: 'Agent not found.' });
        }
        const isPasswordValid = await bcrypt.compare(agent_password, agent.agent_password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Incorrect current password.' });
        }
        const hashedPassword = await bcrypt.hash(new_password, 10);
        await agent.update({
            agent_password: hashedPassword
        });

        res.status(200).json({ message: 'Password updated successfully.' });
    } catch (error: any) {
        console.error('Error updating password:', error);
        res.status(500).json({ message: 'Server error', details: error.message });
    }
});

agentDetails.put('/update', async (req: any, res: any) => {
    const { new_name } = req.body;
    const { id: agentId } =  req.user;
    if (!new_name) {
        return res.status(400).json({ message: 'New agent name is required.' });
    }

    try {
        const agent = await AgentModel.findByPk(agentId);
        if (!agent) {
            return res.status(404).json({ message: 'Agent not found.' });
        }

        await agent.update({
            agent_name: new_name
        });

        res.status(200).json({ message: 'Agent name updated successfully.' });
    } catch (error: any) {
        console.error('Error updating agent name:', error);
        res.status(500).json({ message: 'Server error', details: error.message });
    }
});
export default agentDetails;
