import express, { Request, Response } from 'express';
import PujaPackagesModel from '../../db/models/pujas/PujaPackagesModel';
import PackageFeaturesModel from '../../db/models/pujas/PackageFeaturesModel';
import sequelizeConnection from '../../db/config';
import authenticateUserToken from '../../middleWare/userAuthmiddleware';
import ReviewsModel from '../../db/models/pujas/ReviewsModel';
import PujaImagesAndVideoModel from '../../db/models/pujas/pujaImagesAndVediosModel';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import BookingHistoryModel from '../../db/models/pujas/BookingHistoryModel';
import PujaModel from '../../db/models/pujas/PujaModel';
import PujaDatesModel from '../../db/models/pujas/pujaDatesModel';
import UserModel from '../../db/models/users/usersModel';
import { Transaction } from 'sequelize';

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

// Define custom file type to include the location URL from AWS S3
interface CustomFile extends Express.Multer.File {
  location: string; // Location URL of the uploaded file
}

// Set up multer storage configuration with AWS S3
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.BUCKET_NAME as string,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      cb(null, `puja_images/${Date.now()}_${file.originalname}`);
    },
  }),
});



const JWT_SECRET = process.env.JWT_SECRET!;

PujaModel.associate();
PujaPackagesModel.associate();
PujaDatesModel.associate();
PujaImagesAndVideoModel.associate();
PackageFeaturesModel.associate();




// Function to generate a custom unique ID
function generateCustomPujaId(prefix: string): string {
  const randomSuffix = Math.floor(Math.random() * 10000); // Generate a random 4-digit number
  return `${prefix}${randomSuffix}`;
}
// Function to generate a custom unique Package ID
function generateCustomPackageId(prefix: string, usedIds: Set<string>): string {
  let packageId;
  do {
    const randomSuffix = Math.floor(Math.random() * 10000);
    packageId = `${prefix}${randomSuffix}`;
  } while (usedIds.has(packageId));
  usedIds.add(packageId);
  return packageId;
}

const createPuja = express.Router();

 createPuja.post('/createPuja', authenticateUserToken, upload.fields([
  { name: 'puja_thumbnail_url', maxCount: 1 },
  { name: 'temple_image_url', maxCount: 5 },
  { name: 'puja_media', maxCount: 10 },
]), async (req: any, res: any) => {
  console.log("Received request to create Puja");

  const transaction = await sequelizeConnection.transaction();

  try {
    // Extract form data
    const {
      puja_name,
      puja_special,
      puja_description,
      temple_name,
      temple_location,
      temple_description,
      packages: packagesString,
      puja_dates: pujaDatesString,
      created_by,
    } = req.body;

    // Validate required fields
    if (!puja_name || !temple_name || !temple_location) {
      return res.status(400).json({ error: 'Missing required fields: puja_name, temple_name, temple_location' });
    }

    // Parse JSON fields
    const packagesData = packagesString ? JSON.parse(packagesString) : [];
    const puja_dates = pujaDatesString ? JSON.parse(pujaDatesString) : [];

    if (!Array.isArray(puja_dates) || puja_dates.length === 0) {
      return res.status(400).json({ error: 'Invalid puja_dates format. It must be a non-empty array of dates.' });
    }

    // Handle file uploads
    let puja_thumbnail_url: string | undefined;
    if (req.files && req.files['puja_thumbnail_url']) {
      puja_thumbnail_url = (req.files['puja_thumbnail_url'] as any[])[0]?.location;
    }

    let temple_image_url: string | undefined;
    if (req.files && req.files['temple_image_url']) {
      temple_image_url = (req.files['temple_image_url'] as any[])[0]?.location;
    }

    let image_urls: string[] = [];
    let video_urls: string[] = [];
    if (req.files && !Array.isArray(req.files) && 'puja_media' in req.files) {
      const uploadedFiles = (req.files['puja_media'] as CustomFile[]);
      image_urls = uploadedFiles
        .filter((file) => file.mimetype.startsWith('image/'))
        .map((file) => file.location);
      video_urls = uploadedFiles
        .filter((file) => file.mimetype.startsWith('video/'))
        .map((file) => file.location);
    }

    console.log("Raw request body: ", req.body);

    // Generate Puja ID
    const customPujaId = generateCustomPujaId('KSP');
    console.log("Generated custom Puja ID: ", customPujaId);

    // Step 1: Create the Puja
    const newPuja = await PujaModel.create({
      puja_id: customPujaId,
      puja_name,
      puja_special,
      puja_description,
      temple_name,
      temple_location,
      puja_thumbnail_url,
      temple_image_url,
      temple_description,
      created_by: created_by || null,
    }, { transaction });

    console.log("New Puja created: ", newPuja);

    // Step 2: Store Puja Dates
    const pujaDatesToInsert = puja_dates.map((date: string) => ({
      puja_id: newPuja.puja_id,
      puja_date: new Date(date),
      created_by: created_by || null,
    }));

    await PujaDatesModel.bulkCreate(pujaDatesToInsert, { transaction });

    // Step 3: Handle Packages with Different Prices for Each Date
    const createdPackages: any[] = [];
    const usedPackageIds = new Set<string>();

    for (const puja_date of puja_dates) {
      for (const pkg of packagesData) {
        const packageId = generateCustomPackageId('PKG', usedPackageIds);

        const createdPackage = await PujaPackagesModel.create({
          package_name: pkg.package_name,
          price: pkg.price[puja_date], // Fetch price for the specific date
          number_of_devotees: pkg.number_of_devotees,
          puja_id: newPuja.puja_id,
          package_id: packageId,
          puja_date: new Date(puja_date), // Associate the package with the puja_date
        }, { transaction });

        createdPackages.push(createdPackage);

        // Step 4: Insert Package Features
        if (pkg.features && pkg.features.length > 0) {
          const featuresToInsert = pkg.features.map((feature: string) => ({
            puja_id: newPuja.puja_id,
            package_id: createdPackage.package_id,
            feature: feature,
            created_by: created_by || null,
          }));

          await PackageFeaturesModel.bulkCreate(featuresToInsert, { transaction });
        }
      }
    }

    // Step 5: Store Images & Videos in PujaImagesAndVideoModel
    if (image_urls.length > 0 || video_urls.length > 0) {
      await PujaImagesAndVideoModel.create({
        puja_id: newPuja.puja_id,
        puja_images_url: image_urls,
        puja_video_url: video_urls,
      }, { transaction });
    }

    // Step 6: Commit Transaction
    await transaction.commit();
    console.log("Transaction committed successfully");

    // Send response
    res.status(201).json({
      message: 'Puja, Packages, Dates, and Features created successfully',
      data: {
        puja: newPuja,
        packages: createdPackages,
        puja_dates: puja_dates,
        media: { image_urls, video_urls },
      },
    });

  } catch (error: any) {
    // Rollback transaction on error
    await transaction.rollback();
    console.error("Transaction failed, rolling back", error);
    res.status(500).json({ error: 'Database error', details: error.message });
  }
});

createPuja.get('/getPujas', async (_req: any, res: any) => {
  try {
    // Fetch all pujas along with associated data
    const pujas = await PujaModel.findAll({
      include: [
        {
          model: PujaPackagesModel,
          as: 'pujapackages',
          attributes: ['package_id', 'package_name', 'package_description', 'number_of_devotees', 'price', 'puja_date'],
          required: false,
          include: [
            {
              model: PackageFeaturesModel,
              as: 'features',
              attributes: ['feature'],
              required: false,
            },
          ],
        },
        {
          model: PujaDatesModel,
          as: 'puja_dates',
          attributes: ['puja_date'],
          required: false,
        },
        {
          model: PujaImagesAndVideoModel,
          as: 'pujaImagesAndVideos',
          attributes: ['puja_images_url', 'puja_video_url'],
          required: false,
        },
        {
          model: ReviewsModel,
          as: 'reviews',
          attributes: ['rating', 'review', 'uploads_url', 'verified_user'],
          required: false,
        },
      ],
      logging: console.log, // For debugging; remove in production
    });

    if (!pujas || pujas.length === 0) {
      return res.status(404).json({ error: "No pujas found" });
    }

    // Cast the first puja instance to any so we can access additional properties
    const pujaData: any = pujas[0].toJSON();

    // Build the puja details object (use optional chaining for safety)
    const puja = {
      puja_id: pujaData.puja_id,
      puja_name: pujaData.puja_name,
      puja_special: pujaData.puja_special,
      puja_description: pujaData.puja_description,
      temple_name: pujaData.temple_name,
      temple_location: pujaData.temple_location,
      temple_description: pujaData.temple_description,
      puja_thumbnail_url: pujaData.puja_thumbnail_url,
      temple_image_url: pujaData.temple_image_url,
      status: pujaData.status,
      created_by: pujaData.created_by,
      created: pujaData.created,   // created comes from mapping createdAt to 'created'
      updated: pujaData.updated,   // updated comes from mapping updatedAt to 'updated'
    };

    // Transform packages (if any)
    const packages = (pujaData.pujapackages || []).map((pkg: any) => ({
      package_id: pkg.package_id,
      package_name: pkg.package_name,
      package_description: pkg.package_description,
      number_of_devotees: pkg.number_of_devotees,
      price: pkg.price,
      puja_date: pkg.puja_date,
      features: (pkg.features || []).map((f: any) => f.feature),
    }));

    // Transform puja_dates into an array of date strings (YYYY-MM-DD)
    const puja_dates = (pujaData.puja_dates || []).map((d: any) => {
      const dt = new Date(d.puja_date);
      return dt.toISOString().split("T")[0];
    });

    // Merge media records (if any)
    let image_urls: string[] = [];
    let video_urls: string[] = [];
    if (pujaData.pujaImagesAndVideos && pujaData.pujaImagesAndVideos.length > 0) {
      pujaData.pujaImagesAndVideos.forEach((media: any) => {
        if (media.puja_images_url) {
          image_urls = image_urls.concat(media.puja_images_url);
        }
        if (media.puja_video_url) {
          video_urls = video_urls.concat(media.puja_video_url);
        }
      });
    }
    const media = { image_urls, video_urls };

    const responseData = {
      puja,
      packages,
      puja_dates,
      media,
    };

    res.status(200).json({
      message: "Puja, Packages, Dates, and Features fetched successfully",
      data: responseData,
    });
  } catch (error: any) {
    console.error("Error fetching pujas:", error);
    res.status(500).json({ error: "Database error", details: error.message });
  }
});


createPuja.get('/getPuja/:id', async (req: any, res: any) => {
  const { id } = req.params;

  try {
    // Fetching the Pooja details
    const pooja = await PujaModel.findByPk(id, {
      include: [
        {
          model: PujaPackagesModel,
          as: 'pujapackages', // ✅ Ensure alias matches the model
          attributes: ['package_id', 'package_name', 'package_description', 'number_of_devotees', 'price'],
          include: [
            {
              model: PackageFeaturesModel,
              as: 'features', // ✅ Ensure alias matches the model
              attributes: ['feature'],
              required: false, // Allow it to be empty if no features exist
            },
          ],
        },
        {
          model: PujaDatesModel,
          as: 'puja_dates',
          attributes: ['puja_date'],
          required: false,
        },
        {
          model: PujaImagesAndVideoModel,
          as: 'pujaImagesAndVideos', // ✅ Ensure alias matches model
          attributes: ['puja_images_url', 'puja_video_url'],
          required: false,
        },
        {
          model: ReviewsModel,
          as: 'reviews',
          attributes: ['rating', 'review', 'uploads_url', 'verified_user'],
          include: [
            {
              model: UserModel,
              as: 'users',
              attributes: ['username'],
              required: false,
            },
          ],
          required: false,
        },
        {
          model: BookingHistoryModel,
          as: 'bookingHistory',
          attributes: [
            'booking_id', 'puja_id', 'devotee_names', 'puja_date', 'devotee_gothra',
            'devotee_date_of_birth', 'total_amount', 'booking_status', 'puja_status'
          ],
          where: { puja_id: id },
          order: [['created', 'DESC']],
          limit: 5,
          required: false, // ✅ Prevents query failure if no bookings exist
        }
      ],
    });

    if (!pooja) {
      return res.status(404).json({ message: 'Pooja not found' });
    }

    res.status(200).json({
      message: 'Pooja fetched successfully',
      data: pooja,
    });
  } catch (error: any) {
    console.error('Error fetching Pooja:', error);
    res.status(500).json({ error: 'Database error', details: error.message });
  }
});

createPuja.delete('/delete-puja/:id', async (req: any, res: any) => {
  const { id } = req.params;

  try {
    const puja = await PujaModel.findByPk(id);
    if (!puja) {
      return res.status(404).json({ message: 'Puja not found' });
    }

    await puja.destroy();
    res.status(200).json({ message: 'Puja deleted successfully' });
  } catch (error: any) {
    console.error('Error updating Pooja:', error);
    res.status(500).json({ error: 'Database error', details: error.message });
  }

});

export default createPuja;
