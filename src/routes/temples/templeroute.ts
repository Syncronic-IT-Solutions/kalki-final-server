import express, { Request, Response } from 'express';
import TemplesModel from '../../db/models/temples/TemplesModel';
import dotenv from 'dotenv';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';
import TempleImagesModel from '../../db/models/temples/TempleImagesModel';

dotenv.config();

if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.BUCKET_REGION || !process.env.BUCKET_NAME) {
    throw new Error('Missing necessary AWS configuration in .env file');
}

// ✅ Initialize S3 client
const s3 = new S3Client({
    region: process.env.BUCKET_REGION.trim(),
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

// ✅ Define custom file type to include location URL
interface CustomFile extends Express.Multer.File {
    location: string;
}

// ✅ Set up multer storage configuration with S3
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.BUCKET_NAME as string,
        metadata: (req, file, cb) => {
            cb(null, { fieldName: file.fieldname });
        },
        key: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(null, `temple_media/${uniqueSuffix}_${file.originalname}`);
        },
    }),
});

const createTemple = express.Router();

createTemple.post('/createTemple', upload.fields([
    { name: 'temple_thumbnail', maxCount: 1 }, // Single temple thumbnail
    { name: 'temple_media', maxCount: 10 } // Multiple media files (images/videos)
]), async (req: any, res: any) => {
    try {
        console.log('Files received:', req.files);
        console.log('Request body:', req.body);

        const { temple_name, temple_location, temple_description, phone_number, email, website, opening_hours, latitude, longitude, facilities, festivals } = req.body;

        // Ensure opening_hours is a string, even if it's passed as an array or object
        const openingHoursString = Array.isArray(opening_hours) ? opening_hours.join(", ") : typeof opening_hours === 'object' ? JSON.stringify(opening_hours) : opening_hours;

        // Validate required fields
        if (!temple_name || !temple_location || !temple_description || !phone_number || !email || !latitude || !longitude) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Process uploaded files
        const temple_thumbnail = req.files?.temple_thumbnail ? (req.files.temple_thumbnail[0] as CustomFile).location : null;
        const uploadedFiles = req.files?.temple_media as CustomFile[] || [];

        const image_urls = uploadedFiles.filter(file => file.mimetype.startsWith('image/')).map(file => file.location);
        const video_urls = uploadedFiles.filter(file => file.mimetype.startsWith('video/')).map(file => file.location);

        // Optional fields for facilities and festivals
        const parsedFacilities = facilities ? JSON.parse(facilities) : [];
        const parsedFestivals = festivals ? JSON.parse(festivals) : [];

        // Opening timings - ensure it's an object
        const opening_timings = req.body.opening_timings ? req.body.opening_timings : null;

        // Create the temple entry
        const temple = await TemplesModel.create({
            temple_name,
            temple_location,
            temple_description,
            phone_number,
            email,
            website,
            opening_hours: openingHoursString, // Use the string version of opening_hours
            latitude,
            longitude,
            temple_thumbnail,
            temple_images_url: image_urls,
            temple_video_url: video_urls,
            history: req.body.history || null, // History (optional)
            opening_timings: opening_timings, // Use structured timings object
            facilities: parsedFacilities, // Array of facilities
            festivals: parsedFestivals, // Array of festivals
        });

        // Retrieve the media URLs for the response
        const mediaUrls = {
            image_urls: temple.temple_images_url,
            video_urls: temple.temple_video_url
        };

        // Return temple data with media URLs
        const responseData = {
            temple_id: temple.temple_id,
            temple_name: temple.temple_name,
            temple_location: temple.temple_location,
            temple_description: temple.temple_description,
            phone_number: temple.phone_number,
            email: temple.email,
            website: temple.website,
            opening_hours: temple.opening_hours,
            latitude: temple.latitude,
            longitude: temple.longitude,
            temple_thumbnail: temple.temple_thumbnail,
            media_urls: mediaUrls, // Add media URLs to the response
            history: temple.history,
            opening_timings: temple.opening_timings,
            facilities: temple.facilities,
            festivals: temple.festivals,
            created: temple.createdAt,
            updated: temple.updatedAt,
        };

        return res.status(201).json({ message: 'Temple created successfully', data: responseData });
    } catch (error: any) {
        console.error('Error creating temple:', error);
        return res.status(500).json({ error: 'Database error', details: error.message });
    }
});


createTemple.get('/getAllTemples', async (req: any, res: any) => {
    try {
        const temples = await TemplesModel.findAll();
        return res.status(200).json({ message: 'Temples fetched successfully', data: temples });
    } catch (error: any) {
        console.error('Error fetching temples:', error);
        return res.status(500).json({ error: 'Database error', details: error.message });
    }
});

createTemple.get('/getTemple/:temple_id', async (req: any, res: any) => {
    try {
        const { temple_id } = req.params;

        // Fetch temple details
        const temple = await TemplesModel.findOne({ where: { temple_id } });
        if (!temple) {
            return res.status(404).json({ message: 'Temple not found' });
        }

        // Fetch associated media URLs
        const media = await TempleImagesModel.findOne({ where: { temple_id } });

        // Combine temple data with media URLs
        const responseData = {
            ...temple.dataValues,
            media_urls: media ? { image_urls: media.image_urls, video_urls: media.video_urls } : { image_urls: [], video_urls: [] },
        };

        return res.status(200).json({ message: 'Temple fetched successfully', data: responseData });
    } catch (error: any) {
        console.error('Error fetching temple:', error);
        return res.status(500).json({ error: 'Database error', details: error.message });
    }
});


// ✅ Add media to an existing temple
createTemple.put('/addTempleMedia/:temple_id', upload.array('temple_media', 10), async (req: any, res: any) => {
    try {
        console.log('Files received:', req.files);
        console.log('Temple ID:', req.params.temple_id);

        const { temple_id } = req.params;

        // ✅ Check if temple exists
        let existingRecord = await TempleImagesModel.findOne({ where: { temple_id } });

        if (!existingRecord) {
            existingRecord = await TempleImagesModel.create({
                temple_id: temple_id,
                image_urls: [],
                video_urls: [],
            });
        }

        const newImageUrls = req.files.filter((file: CustomFile) => file.mimetype.startsWith('image/')).map((file: CustomFile) => file.location);
        const newVideoUrls = req.files.filter((file: CustomFile) => file.mimetype.startsWith('video/')).map((file: CustomFile) => file.location);

        // ✅ Append new images/videos
        await existingRecord.update({
            image_urls: [...existingRecord.image_urls, ...newImageUrls],
            video_urls: [...existingRecord.video_urls, ...newVideoUrls],
        });

        return res.status(200).json({ message: 'Images/videos added successfully', updatedRecord: existingRecord });
    } catch (error: any) {
        console.error('Error adding media:', error);
        return res.status(500).json({ error: 'Database error', details: error.message });
    }
});

createTemple.put('/updateTempleThumbnail/:temple_id', upload.single('temple_thumbnail'), async (req: any, res: any) => {
    try {
        const { temple_id } = req.params;

        // Check if temple exists
        const temple = await TemplesModel.findOne({ where: { temple_id } });
        if (!temple) {
            return res.status(404).json({ message: 'Temple not found' });
        }

        const temple_thumbnail = req.file ? (req.file as CustomFile).location : temple.temple_thumbnail;

        // Update temple with new thumbnail URL
        await temple.update({ temple_thumbnail });

        return res.status(200).json({ message: 'Temple thumbnail updated successfully', updatedTemple: temple });
    } catch (error: any) {
        console.error('Error updating thumbnail:', error);
        return res.status(500).json({ error: 'Database error', details: error.message });
    }
});


// ✅ Route to delete a temple and its media
createTemple.delete('/deleteTemple/:temple_id', async (req: any, res: any) => {
    try {
        const { temple_id } = req.params;

        // Check if temple exists
        const temple = await TemplesModel.findOne({ where: { temple_id } });
        if (!temple) {
            return res.status(404).json({ message: 'Temple not found' });
        }

        // Delete the temple media
        await TempleImagesModel.destroy({ where: { temple_id } });

        // Delete the temple
        await TemplesModel.destroy({ where: { temple_id } });

        return res.status(200).json({ message: 'Temple and its media deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting temple:', error);
        return res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// ✅ Route to delete only media (image/video) URLs of a temple
createTemple.delete('/deleteTempleMedia/:temple_id', async (req: any, res: any) => {
    try {
        const { temple_id } = req.params;

        // Check if media exists for the temple
        let media = await TempleImagesModel.findOne({ where: { temple_id } });
        if (!media) {
            return res.status(404).json({ message: 'No media found for this temple' });
        }

        // Update media to remove image and video URLs (you can also delete individual files if required)
        media.image_urls = [];
        media.video_urls = [];

        // Save the updated media URLs
        await media.save();

        return res.status(200).json({ message: 'Media deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting media:', error);
        return res.status(500).json({ error: 'Database error', details: error.message });
    }
});

export default createTemple;