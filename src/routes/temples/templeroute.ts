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

// Initialize S3 client
const s3 = new S3Client({
    region: process.env.BUCKET_REGION.trim(),
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

// Define custom file type to include location URL
interface CustomFile extends Express.Multer.File {
    location: string;
}

// Set up multer storage configuration with S3
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

// POST endpoint to create temple
createTemple.post('/createTemple', upload.fields([
    { name: 'temple_thumbnail', maxCount: 1 },
    { name: 'temple_media', maxCount: 10 },
]), async (req: any, res: any) => {
    try {
        const { temple_name, temple_location, temple_description, phone_number, email, website, opening_hours, latitude, longitude, history, facilities, festivals } = req.body;

        // Check for required fields
        if (!temple_name || !temple_location || !temple_description || !phone_number || !email || !latitude || !longitude) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Process uploaded files correctly
         const temple_thumbnail = req.files?.temple_thumbnail ? (req.files.temple_thumbnail[0] as CustomFile).location : null;
        const uploadedFiles = req.files?.temple_media as CustomFile[] || [];

        // Store all images and videos as an array
        const image_urls = uploadedFiles.filter(file => file.mimetype.startsWith('image/')).map(file => file.location);
        const video_urls = uploadedFiles.filter(file => file.mimetype.startsWith('video/')).map(file => file.location);

        // Parse optional fields (facilities, festivals, opening hours)
        const parsedOpeningHours = opening_hours ? opening_hours : ""; // Don't parse it, just store it as a string
        const parsedFacilities = facilities ? JSON.parse(facilities) : [];
        const parsedFestivals = festivals ? JSON.parse(festivals) : [];

        // Save the temple data in the TemplesModel
        const temple = await TemplesModel.create({
            temple_name,
            temple_location,
            temple_description,
            phone_number,
            email,
            website,
            opening_hours: parsedOpeningHours,
            latitude,
            longitude,
            temple_thumbnail,
            temple_images_url: image_urls.length > 0 ? image_urls : null,
            temple_video_url: video_urls.length > 0 ? video_urls : null,
            history,
            facilities: parsedFacilities,
            festivals: parsedFestivals,
            status: 'active', // Assuming 'active' as a default status
        });

        // If there are images or videos, save them in the TempleImagesModel
        if (image_urls.length > 0 || video_urls.length > 0) {
            await TempleImagesModel.create({
                temple_id: temple.temple_id, // Foreign key to TemplesModel
                image_urls,
                video_urls,
            });
        }

        // Return success response
        return res.status(201).json({ message: 'Temple created successfully', data: temple });

    } catch (error: any) {
        console.error('Error creating temple:', error);
        return res.status(500).json({ error: 'Database error', details: error.message });
    }
});

createTemple.put('/updateTemple/:id', upload.fields([
    { name: 'temple_thumbnail', maxCount: 1 },
    { name: 'temple_media', maxCount: 10 },
]), async (req: any, res: any) => {
    try {
        const { temple_name, temple_location, temple_description, phone_number, email, website, opening_hours, latitude, longitude, history, facilities, festivals } = req.body;

        // Check for required fields
        if (!temple_name || !temple_location || !temple_description || !phone_number || !email || !latitude || !longitude) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Fetch the existing temple by ID
        const temple = await TemplesModel.findOne({ where: { temple_id: req.params.id } });
        if (!temple) {
            return res.status(404).json({ message: 'Temple not found' });
        }

        // Process uploaded files correctly
        const temple_thumbnail = req.files?.temple_thumbnail ? (req.files.temple_thumbnail[0] as CustomFile).location : temple.temple_thumbnail;
        const uploadedFiles = req.files?.temple_media as CustomFile[] || [];

        // Store all images and videos as an array
        const image_urls = uploadedFiles.filter(file => file.mimetype.startsWith('image/')).map(file => file.location);
        const video_urls = uploadedFiles.filter(file => file.mimetype.startsWith('video/')).map(file => file.location);

        // Parse optional fields (facilities, festivals, opening hours)
        const parsedOpeningHours = opening_hours ? opening_hours : temple.opening_hours; // Default to existing opening hours if not provided
        const parsedFacilities = facilities ? JSON.parse(facilities) : temple.facilities;
        const parsedFestivals = festivals ? JSON.parse(festivals) : temple.festivals;

        // Update the temple data in the TemplesModel
        await temple.update({
            temple_name,
            temple_location,
            temple_description,
            phone_number,
            email,
            website,
            opening_hours: parsedOpeningHours,
            latitude,
            longitude,
            temple_thumbnail,
            history,
            facilities: parsedFacilities,
            festivals: parsedFestivals,
            status: 'active', // Assuming 'active' as a default status
        });

        // If there are new images or videos, update them in the TempleImagesModel
        if (image_urls.length > 0 || video_urls.length > 0) {
            // Ensure temple_images_url and temple_video_url fields are arrays of strings
            await TempleImagesModel.upsert({
                temple_id: temple.temple_id, // Foreign key to TemplesModel
                image_urls: image_urls.length > 0 ? image_urls : [], // Use empty array if no images
                video_urls: video_urls.length > 0 ? video_urls : [], // Use empty array if no videos
            });
        }

        // Return success response
        return res.status(200).json({ message: 'Temple updated successfully', data: temple });

    } catch (error: any) {
        console.error('Error updating temple:', error);
        return res.status(500).json({ error: 'Database error', details: error.message });
    }
});








// // Define the 'getAllTemples' route without authentication middleware
// createTemple.get('/getAllTemples', async (req: any, res: any) => {
//     try {
//         const temples = await TemplesModel.findAll();  // Fetch all temples from the database
//         return res.status(200).json({ message: 'Temples fetched successfully', data: temples });
//     } catch (error: any) {
//         console.error('Error fetching temples:', error);
//         return res.status(500).json({ error: 'Database error', details: error.message });
//     }
// });



// createTemple.get('/getTemple/:temple_id', async (req: any, res: any) => {
//     try {
//         const { temple_id } = req.params;

//         // Fetch temple details
//         const temple = await TemplesModel.findOne({ where: { temple_id } });
//         if (!temple) {
//             return res.status(404).json({ message: 'Temple not found' });
//         }

//         // Fetch associated media URLs
//         const media = await TempleImagesModel.findOne({ where: { temple_id } });

//         // Combine temple data with media URLs
//         const responseData = {
//             ...temple.dataValues,
//             media_urls: media ? { image_urls: media.image_urls, video_urls: media.video_urls } : { image_urls: [], video_urls: [] },
//         };

//         return res.status(200).json({ message: 'Temple fetched successfully', data: responseData });
//     } catch (error: any) {
//         console.error('Error fetching temple:', error);
//         return res.status(500).json({ error: 'Database error', details: error.message });
//     }
// });


//  Add media to an existing temple
createTemple.put('/addTempleMedia/:temple_id', upload.array('temple_media', 10), async (req: any, res: any) => {
    try {
        console.log('Files received:', req.files);
        console.log('Temple ID:', req.params.temple_id);

        const { temple_id } = req.params;

        //  Check if temple exists
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

        //  Append new images/videos
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


// // ✅ Route to delete a temple and its media
// createTemple.delete('/deleteTemple/:temple_id', async (req: any, res: any) => {
//     try {
//         const { temple_id } = req.params;

//         // Check if temple exists
//         const temple = await TemplesModel.findOne({ where: { temple_id } });
//         if (!temple) {
//             return res.status(404).json({ message: 'Temple not found' });
//         }

//         // Delete the temple media
//         await TempleImagesModel.destroy({ where: { temple_id } });

//         // Delete the temple
//         await TemplesModel.destroy({ where: { temple_id } });

//         return res.status(200).json({ message: 'Temple and its media deleted successfully' });
//     } catch (error: any) {
//         console.error('Error deleting temple:', error);
//         return res.status(500).json({ error: 'Database error', details: error.message });
//     }
// });

// // ✅ Route to delete only media (image/video) URLs of a temple
// createTemple.delete('/deleteTempleMedia/:temple_id', async (req: any, res: any) => {
//     try {
//         const { temple_id } = req.params;

//         // Check if media exists for the temple
//         let media = await TempleImagesModel.findOne({ where: { temple_id } });
//         if (!media) {
//             return res.status(404).json({ message: 'No media found for this temple' });
//         }

//         // Update media to remove image and video URLs (you can also delete individual files if required)
//         media.image_urls = [];
//         media.video_urls = [];

//         // Save the updated media URLs
//         await media.save();

//         return res.status(200).json({ message: 'Media deleted successfully' });
//     } catch (error: any) {
//         console.error('Error deleting media:', error);
//         return res.status(500).json({ error: 'Database error', details: error.message });
//     }
// });

export default createTemple;