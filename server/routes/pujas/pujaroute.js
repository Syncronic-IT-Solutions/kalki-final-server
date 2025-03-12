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
const PujaPackagesModel_1 = __importDefault(require("../../db/models/pujas/PujaPackagesModel"));
const PackageFeaturesModel_1 = __importDefault(require("../../db/models/pujas/PackageFeaturesModel"));
const config_1 = __importDefault(require("../../db/config"));
const userAuthmiddleware_1 = __importDefault(require("../../middleWare/userAuthmiddleware"));
const ReviewsModel_1 = __importDefault(require("../../db/models/pujas/ReviewsModel"));
const pujaImagesAndVediosModel_1 = __importDefault(require("../../db/models/pujas/pujaImagesAndVediosModel"));
const multer_1 = __importDefault(require("multer"));
const multer_s3_1 = __importDefault(require("multer-s3"));
const client_s3_1 = require("@aws-sdk/client-s3");
const dotenv_1 = __importDefault(require("dotenv"));
const PujaModel_1 = __importDefault(require("../../db/models/pujas/PujaModel"));
const pujaDatesModel_1 = __importDefault(require("../../db/models/pujas/pujaDatesModel"));
const usersModel_1 = __importDefault(require("../../db/models/users/usersModel"));
const sequelize_1 = require("sequelize");
dotenv_1.default.config();
if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.BUCKET_REGION || !process.env.BUCKET_NAME) {
    throw new Error('Missing necessary AWS configuration in .env file');
}
// Initialize S3 client
const s3 = new client_s3_1.S3Client({
    region: process.env.BUCKET_REGION.trim(),
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});
// Set up multer storage configuration with AWS S3
const upload = (0, multer_1.default)({
    storage: (0, multer_s3_1.default)({
        s3: s3,
        bucket: process.env.BUCKET_NAME,
        metadata: (req, file, cb) => {
            cb(null, { fieldName: file.fieldname });
        },
        key: (req, file, cb) => {
            cb(null, `puja_images/${Date.now()}_${file.originalname}`);
        },
    }),
});
const JWT_SECRET = process.env.JWT_SECRET;
PujaModel_1.default.associate();
PujaPackagesModel_1.default.associate();
pujaDatesModel_1.default.associate();
pujaImagesAndVediosModel_1.default.associate();
PackageFeaturesModel_1.default.associate();
// Function to generate a custom unique ID
function generateCustomPujaId(prefix) {
    const randomSuffix = Math.floor(Math.random() * 10000); // Generate a random 4-digit number
    return `${prefix}${randomSuffix}`;
}
// Function to generate a custom unique Package ID
function generateCustomPackageId(prefix, usedIds) {
    let packageId;
    do {
        const randomSuffix = Math.floor(Math.random() * 10000);
        packageId = `${prefix}${randomSuffix}`;
    } while (usedIds.has(packageId));
    usedIds.add(packageId);
    return packageId;
}
const createPuja = express_1.default.Router();
// Route for creating Puja
// createPuja.post('/createPuja', authenticateUserToken, upload.fields([
//   { name: 'puja_thumbnail_url', maxCount: 1 },
//   { name: 'temple_image_url', maxCount: 5 },
//   { name: 'puja_media', maxCount: 10 },
// ]), async (req: any, res: any) => {
//   console.log("Received request to create Puja");
//   const transaction = await sequelizeConnection.transaction();
//   try {
//     // Extract form data
//     const {
//       puja_name,
//       puja_special,
//       puja_description,
//       temple_name,
//       temple_location,
//       temple_description,
//       packages: packagesString,
//       puja_dates: pujaDatesString,
//       created_by,
//     } = req.body;
//     // Validate required fields
//     if (!puja_name || !temple_name || !temple_location) {
//       return res.status(400).json({ error: 'Missing required fields: puja_name, temple_name, temple_location' });
//     }
//     // Parse JSON fields (packages and puja_dates)
//     const packagesData = packagesString ? JSON.parse(packagesString) : [];
//     const puja_dates = pujaDatesString ? JSON.parse(pujaDatesString) : [];
//     // Validate puja_dates format
//     if (!Array.isArray(puja_dates) || puja_dates.length === 0) {
//       return res.status(400).json({ error: 'Invalid puja_dates format. It must be a non-empty array of dates.' });
//     }
//     // Handle file uploads
//     let puja_thumbnail_url: string | undefined;
//     if (req.files && req.files['puja_thumbnail_url']) {
//       puja_thumbnail_url = (req.files['puja_thumbnail_url'] as any[])[0]?.location;
//     }
//     let temple_image_url: string | undefined;
//     if (req.files && req.files['temple_image_url']) {
//       temple_image_url = (req.files['temple_image_url'] as any[])[0]?.location;
//     }
//     let image_urls: string[] = [];
//     let video_urls: string[] = [];
//     if (req.files && req.files['puja_media']) {
//       const uploadedFiles = (req.files['puja_media'] as any[]);
//       image_urls = uploadedFiles
//         .filter((file) => file.mimetype.startsWith('image/'))
//         .map((file) => file.location);
//       video_urls = uploadedFiles
//         .filter((file) => file.mimetype.startsWith('video/'))
//         .map((file) => file.location);
//     }
//     console.log("Raw request body: ", req.body);
//     // Generate a unique Puja ID
//     const customPujaId = generateCustomPujaId('KSP');
//     console.log("Generated custom Puja ID: ", customPujaId);
//     // Step 1: Create the Puja record
//     const newPuja = await PujaModel.create({
//       puja_id: customPujaId,
//       puja_name,
//       puja_special,
//       puja_description,
//       temple_name,
//       temple_location,
//       puja_thumbnail_url,
//       temple_image_url,
//       temple_description,
//       created_by: created_by || null,
//     }, { transaction });
//     console.log("New Puja created: ", newPuja);
//     // Step 2: Store Puja Dates
//     const pujaDatesToInsert = puja_dates.map((date: string) => ({
//       puja_id: newPuja.puja_id,
//       puja_date: new Date(date),
//       created_by: created_by || null,
//     }));
//     await PujaDatesModel.bulkCreate(pujaDatesToInsert, { transaction });
//     // Step 3: Handle Packages with Prices for Each Date
//     const createdPackages: any[] = [];
//     const usedPackageIds = new Set<string>();
//     for (const puja_date of puja_dates) {
//       for (const pkg of packagesData) {
//         const packageId = generateCustomPackageId('PKG', usedPackageIds);
//         const createdPackage = await PujaPackagesModel.create({
//           package_name: pkg.package_name,
//           price: pkg.price[puja_date], // Fetch price for the specific date
//           number_of_devotees: pkg.number_of_devotees,
//           puja_id: newPuja.puja_id,
//           package_id: packageId,
//           puja_date: new Date(puja_date),
//           puja_speciality: pkg.puja_speciality || '',
//           package_description: pkg.package_description || '',
//         }, { transaction });
//         createdPackages.push(createdPackage);
//         // Step 4: Insert Package Features
//         if (pkg.features && pkg.features.length > 0) {
//           const featuresToInsert = pkg.features.map((feature: string) => ({
//             puja_id: newPuja.puja_id,
//             package_id: createdPackage.package_id,
//             feature,
//             created_by: created_by || null,
//           }));
//           await PackageFeaturesModel.bulkCreate(featuresToInsert, { transaction });
//         }
//       }
//     }
//     // Step 5: Store Images & Videos in PujaImagesAndVideoModel
//     if (image_urls.length > 0 || video_urls.length > 0) {
//       await PujaImagesAndVideoModel.create({
//         puja_id: newPuja.puja_id,
//         puja_images_url: image_urls,
//         puja_video_url: video_urls,
//       }, { transaction });
//     }
//     // Step 6: Commit the Transaction
//     await transaction.commit();
//     console.log("Transaction committed successfully");
//     // Send the success response
//     res.status(201).json({
//       message: 'Puja, Packages, Dates, and Features created successfully',
//       data: {
//         puja: newPuja,
//         packages: createdPackages,
//         puja_dates: puja_dates,
//         media: { image_urls, video_urls },
//       },
//     });
//   } catch (error: any) {
//     // Rollback the transaction on error
//     await transaction.rollback();
//     console.error("Transaction failed, rolling back", error);
//     res.status(500).json({ error: 'Database error', details: error.message });
//   }
// });
// createPuja.post('/createPuja', authenticateUserToken, upload.fields([
//   { name: 'puja_thumbnail_url', maxCount: 1 },
//   { name: 'temple_image_url', maxCount: 5 },
//   { name: 'puja_media', maxCount: 10 },
// ]), async (req: any, res: any) => {
//   console.log("Received request to create Puja");
//   const transaction = await sequelizeConnection.transaction();
//   try {
//     // Extract form data
//     const {
//       puja_name,
//       puja_special,
//       puja_description,
//       temple_name,
//       temple_location,
//       temple_description,
//       packages: packagesString,
//       puja_dates: pujaDatesString,
//       created_by,
//     } = req.body;
//     // Validate required fields
//     if (!puja_name || !temple_name || !temple_location) {
//       return res.status(400).json({ error: 'Missing required fields: puja_name, temple_name, temple_location' });
//     }
//     // Check if packagesString and pujaDatesString are valid JSON and parse them
//     let packagesData = [];
//     let puja_dates = [];
//     try {
//       if (packagesString) {
//         packagesData = JSON.parse(packagesString);
//       }
//     } catch (error) {
//       console.error("Invalid JSON format for packagesString:", packagesString);
//       return res.status(400).json({ error: 'Invalid JSON format for packages.' });
//     }
//     try {
//       if (pujaDatesString) {
//         puja_dates = JSON.parse(pujaDatesString);
//       }
//     } catch (error) {
//       console.error("Invalid JSON format for puja_datesString:", pujaDatesString);
//       return res.status(400).json({ error: 'Invalid JSON format for puja_dates.' });
//     }
//     if (!Array.isArray(puja_dates) || puja_dates.length === 0) {
//       return res.status(400).json({ error: 'Invalid puja_dates format. It must be a non-empty array of dates.' });
//     }
//     // Handle file uploads
//     let puja_thumbnail_url: string | undefined;
//     if (req.files && req.files['puja_thumbnail_url']) {
//       puja_thumbnail_url = (req.files['puja_thumbnail_url'] as any[])[0]?.location;
//     }
//     let temple_image_url: string | undefined;
//     if (req.files && req.files['temple_image_url']) {
//       temple_image_url = (req.files['temple_image_url'] as any[])[0]?.location;
//     }
//     let image_urls: string[] = [];
//     let video_urls: string[] = [];
//     if (req.files && !Array.isArray(req.files) && 'puja_media' in req.files) {
//       const uploadedFiles = (req.files['puja_media'] as CustomFile[]);
//       image_urls = uploadedFiles
//         .filter((file) => file.mimetype.startsWith('image/'))
//         .map((file) => file.location);
//       video_urls = uploadedFiles
//         .filter((file) => file.mimetype.startsWith('video/'))
//         .map((file) => file.location);
//     }
//     console.log("Raw request body: ", req.body);
//     // Generate Puja ID
//     const customPujaId = generateCustomPujaId('KSP');
//     console.log("Generated custom Puja ID: ", customPujaId);
//     // Step 1: Create the Puja
//     const newPuja = await PujaModel.create({
//       puja_id: customPujaId,
//       puja_name,
//       puja_special,
//       puja_description,
//       temple_name,
//       temple_location,
//       puja_thumbnail_url,
//       temple_image_url,
//       temple_description,
//       created_by: created_by || null,
//     }, { transaction });
//     console.log("New Puja created: ", newPuja);
//     // Step 2: Store Puja Dates
//     const pujaDatesToInsert = puja_dates.map((date: string) => ({
//       puja_id: newPuja.puja_id,
//       puja_date: new Date(date),
//       created_by: created_by || null,
//     }));
//     await PujaDatesModel.bulkCreate(pujaDatesToInsert, { transaction });
//     // Step 3: Handle Packages with Different Prices for Each Date
//     const createdPackages: any[] = [];
//     const usedPackageIds = new Set<string>();
//     for (const puja_date of puja_dates) {
//       for (const pkg of packagesData) {
//         const packageId = generateCustomPackageId('PKG', usedPackageIds);
//         const createdPackage = await PujaPackagesModel.create({
//           package_name: pkg.package_name,
//           price: pkg.price[puja_date], // Fetch price for the specific date
//           number_of_devotees: pkg.number_of_devotees,
//           puja_id: newPuja.puja_id,
//           package_id: packageId,
//           puja_date: new Date(puja_date), // Associate the package with the puja_date
//           puja_speciality: pkg.puja_speciality || '',
//           package_description: pkg.package_description || '',
//         }, { transaction });
//         createdPackages.push(createdPackage);
//         // Step 4: Insert Package Features
//         if (pkg.features && pkg.features.length > 0) {
//           const featuresToInsert = pkg.features.map((feature: string) => ({
//             puja_id: newPuja.puja_id,
//             package_id: createdPackage.package_id,
//             feature: feature,
//             created_by: created_by || null,
//           }));
//           await PackageFeaturesModel.bulkCreate(featuresToInsert, { transaction });
//         }
//       }
//     }
//     // Step 5: Store Images & Videos in PujaImagesAndVideoModel
//     if (image_urls.length > 0 || video_urls.length > 0) {
//       await PujaImagesAndVideoModel.create({
//         puja_id: newPuja.puja_id,
//         puja_images_url: image_urls,
//         puja_video_url: video_urls,
//       }, { transaction });
//     }
//     // Step 6: Commit Transaction
//     await transaction.commit();
//     console.log("Transaction committed successfully");
//     // Send response
//     res.status(201).json({
//       message: 'Puja, Packages, Dates, and Features created successfully',
//       data: {
//         puja: newPuja,
//         packages: createdPackages,
//         puja_dates: puja_dates,
//         media: { image_urls, video_urls },
//       },
//     });
//   } catch (error: any) {
//     // Rollback transaction on error
//     await transaction.rollback();
//     console.error("Transaction failed, rolling back", error);
//     res.status(500).json({ error: 'Database error', details: error.message });
//   }
// });
createPuja.post('/createPuja', userAuthmiddleware_1.default, upload.fields([
    { name: 'puja_thumbnail_url', maxCount: 1 },
    { name: 'temple_image_url', maxCount: 5 },
    { name: 'puja_media', maxCount: 10 },
]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    console.log("Received request to create Puja");
    const transaction = yield config_1.default.transaction();
    try {
        // Extract form data
        const { puja_name, puja_special, puja_description, temple_name, temple_location, temple_description, packages: packagesString, puja_dates: pujaDatesString, created_by, } = req.body;
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
        let puja_thumbnail_url;
        if (req.files && req.files['puja_thumbnail_url']) {
            puja_thumbnail_url = (_a = req.files['puja_thumbnail_url'][0]) === null || _a === void 0 ? void 0 : _a.location;
        }
        let temple_image_url;
        if (req.files && req.files['temple_image_url']) {
            temple_image_url = (_b = req.files['temple_image_url'][0]) === null || _b === void 0 ? void 0 : _b.location;
        }
        let image_urls = [];
        let video_urls = [];
        if (req.files && !Array.isArray(req.files) && 'puja_media' in req.files) {
            const uploadedFiles = req.files['puja_media'];
            image_urls = uploadedFiles
                .filter((file) => file.mimetype.startsWith('image/'))
                .map((file) => file.location);
            video_urls = uploadedFiles
                .filter((file) => file.mimetype.startsWith('video/'))
                .map((file) => file.location);
        }
        // Generate Puja ID
        const customPujaId = generateCustomPujaId('KSP');
        // Step 1: Create the Puja
        const newPuja = yield PujaModel_1.default.create({
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
        // Step 2: Store Puja Dates
        const pujaDatesToInsert = puja_dates.map((date) => ({
            puja_id: newPuja.puja_id,
            puja_date: new Date(date),
            created_by: created_by || null,
        }));
        yield pujaDatesModel_1.default.bulkCreate(pujaDatesToInsert, { transaction });
        // Step 3: Handle Packages with Different Prices for Each Date
        const createdPackages = [];
        const usedPackageIds = new Set();
        for (const puja_date of puja_dates) {
            for (const pkg of packagesData) {
                const packageId = generateCustomPackageId('PKG', usedPackageIds);
                const createdPackage = yield PujaPackagesModel_1.default.create({
                    package_name: pkg.package_name,
                    price: pkg.price[puja_date], // Fetch price for the specific date
                    number_of_devotees: pkg.number_of_devotees,
                    puja_id: newPuja.puja_id,
                    package_id: packageId,
                    puja_date: new Date(puja_date),
                    puja_speciality: pkg.puja_speciality || '', // Ensure puja_speciality is handled
                }, { transaction });
                createdPackages.push(createdPackage);
                // Step 4: Insert Package Features
                if (pkg.features && pkg.features.length > 0) {
                    const featuresToInsert = pkg.features.map((feature) => ({
                        puja_id: newPuja.puja_id,
                        package_id: createdPackage.package_id,
                        feature: feature,
                        created_by: created_by || null,
                    }));
                    yield PackageFeaturesModel_1.default.bulkCreate(featuresToInsert, { transaction });
                }
            }
        }
        // Step 5: Store Images & Videos in PujaImagesAndVideoModel
        if (image_urls.length > 0 || video_urls.length > 0) {
            yield pujaImagesAndVediosModel_1.default.create({
                puja_id: newPuja.puja_id,
                puja_images_url: image_urls,
                puja_video_url: video_urls,
            }, { transaction });
        }
        // Step 6: Fetch the features for each package
        const allFeatures = yield PackageFeaturesModel_1.default.findAll({
            where: {
                package_id: createdPackages.map((pkg) => pkg.package_id),
            },
        });
        // Step 7: Map features back to the respective packages
        createdPackages.forEach((pkg) => {
            pkg.features = allFeatures
                .filter((feature) => feature.package_id === pkg.package_id)
                .map((feature) => feature.feature);
        });
        // Step 8: Commit Transaction
        yield transaction.commit();
        // Step 9: Send response with features included
        res.status(201).json({
            message: 'Puja, Packages, Dates, and Features created successfully',
            data: {
                puja: newPuja,
                packages: createdPackages,
                puja_dates: puja_dates,
                media: { image_urls, video_urls },
            },
        });
    }
    catch (error) {
        // Rollback transaction on error
        yield transaction.rollback();
        res.status(500).json({ error: 'Database error', details: error.message });
    }
}));
createPuja.put('/updatePuja/:id', userAuthmiddleware_1.default, upload.fields([
    { name: 'puja_thumbnail_url', maxCount: 1 },
    { name: 'temple_image_url', maxCount: 5 },
    { name: 'puja_media', maxCount: 10 },
]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    console.log("Received request to update Puja with ID:", req.params.id);
    const transaction = yield config_1.default.transaction();
    try {
        // Extract form data
        const { puja_name, puja_special, puja_description, temple_name, temple_location, temple_description, packages: packagesString, puja_dates: pujaDatesString, created_by, } = req.body;
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
        let puja_thumbnail_url;
        if (req.files && req.files['puja_thumbnail_url']) {
            puja_thumbnail_url = (_a = req.files['puja_thumbnail_url'][0]) === null || _a === void 0 ? void 0 : _a.location;
        }
        let temple_image_url;
        if (req.files && req.files['temple_image_url']) {
            temple_image_url = (_b = req.files['temple_image_url'][0]) === null || _b === void 0 ? void 0 : _b.location;
        }
        let image_urls = [];
        let video_urls = [];
        if (req.files && !Array.isArray(req.files) && 'puja_media' in req.files) {
            const uploadedFiles = req.files['puja_media'];
            image_urls = uploadedFiles
                .filter((file) => file.mimetype.startsWith('image/'))
                .map((file) => file.location);
            video_urls = uploadedFiles
                .filter((file) => file.mimetype.startsWith('video/'))
                .map((file) => file.location);
        }
        console.log("Raw request body: ", req.body);
        // Step 1: Fetch the existing Puja by ID
        const existingPuja = yield PujaModel_1.default.findOne({ where: { puja_id: req.params.id } });
        if (!existingPuja) {
            return res.status(404).json({ error: 'Puja not found with the provided ID.' });
        }
        // Step 2: Update Puja
        yield existingPuja.update({
            puja_name,
            puja_special,
            puja_description,
            temple_name,
            temple_location,
            puja_thumbnail_url: puja_thumbnail_url || existingPuja.puja_thumbnail_url,
            temple_image_url: temple_image_url || existingPuja.temple_image_url,
            temple_description,
            created_by: created_by || existingPuja.created_by,
        }, { transaction });
        console.log("Puja updated: ", existingPuja);
        // Step 3: Update Puja Dates
        const existingPujaDates = yield pujaDatesModel_1.default.findAll({ where: { puja_id: existingPuja.puja_id } });
        const existingPujaDatesIds = new Set(existingPujaDates.map((date) => date.puja_date.toISOString()));
        const pujaDatesToInsert = puja_dates.filter((date) => !existingPujaDatesIds.has(date)).map((date) => ({
            puja_id: existingPuja.puja_id,
            puja_date: new Date(date),
            created_by: created_by || null,
        }));
        // Delete the dates that were removed
        yield pujaDatesModel_1.default.destroy({
            where: {
                puja_id: existingPuja.puja_id,
                puja_date: { [sequelize_1.Op.notIn]: puja_dates },
            },
            transaction,
        });
        // Insert the new dates
        yield pujaDatesModel_1.default.bulkCreate(pujaDatesToInsert, { transaction });
        // Step 4: Update Packages with Different Prices for Each Date
        const createdPackages = [];
        const usedPackageIds = new Set();
        for (const puja_date of puja_dates) {
            for (const pkg of packagesData) {
                const existingPackage = yield PujaPackagesModel_1.default.findOne({
                    where: {
                        puja_id: existingPuja.puja_id,
                        puja_date: new Date(puja_date),
                        package_name: pkg.package_name,
                    },
                });
                const packageId = existingPackage ? existingPackage.package_id : generateCustomPackageId('PKG', usedPackageIds);
                const createdPackage = yield PujaPackagesModel_1.default.upsert({
                    package_name: pkg.package_name,
                    price: pkg.price[puja_date], // Fetch price for the specific date
                    number_of_devotees: pkg.number_of_devotees,
                    puja_id: existingPuja.puja_id,
                    package_id: packageId,
                    puja_date: new Date(puja_date), // Associate the package with the puja_date
                    puja_speciality: pkg.puja_speciality || '',
                    package_description: pkg.package_description || '',
                }, { transaction });
                createdPackages.push(createdPackage[0]);
                // Step 5: Update Package Features
                if (pkg.features && pkg.features.length > 0) {
                    const featuresToInsert = pkg.features.map((feature) => ({
                        puja_id: existingPuja.puja_id,
                        package_id: createdPackage[0].package_id,
                        feature: feature,
                        created_by: created_by || null,
                    }));
                    yield PackageFeaturesModel_1.default.bulkCreate(featuresToInsert, { transaction });
                }
            }
        }
        // Step 6: Update Images & Videos in PujaImagesAndVideoModel
        if (image_urls.length > 0 || video_urls.length > 0) {
            yield pujaImagesAndVediosModel_1.default.upsert({
                puja_id: existingPuja.puja_id,
                puja_images_url: image_urls,
                puja_video_url: video_urls,
            }, { transaction });
        }
        // Step 7: Commit Transaction
        yield transaction.commit();
        console.log("Transaction committed successfully");
        // Send response
        res.status(200).json({
            message: 'Puja, Packages, Dates, and Features updated successfully',
            data: {
                puja: existingPuja,
                packages: createdPackages,
                puja_dates: puja_dates,
                media: { image_urls, video_urls },
            },
        });
    }
    catch (error) {
        // Rollback transaction on error
        yield transaction.rollback();
        console.error("Transaction failed, rolling back", error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
}));
// createPuja.get('/getPujas', async (_req: any, res: any) => {
//   try {
//     // Fetch all pujas along with associated data
//     const pujas = await PujaModel.findAll({
//       include: [
//         {
//           model: PujaPackagesModel,
//           as: 'pujapackages',
//           attributes: ['package_id', 'package_name', 'package_description', 'number_of_devotees', 'price', 'puja_date'],
//           required: false,
//           include: [
//             {
//               model: PackageFeaturesModel,
//               as: 'features',
//               attributes: ['feature'],
//               required: false,
//             },
//           ],
//         },
//         {
//           model: PujaDatesModel,
//           as: 'puja_dates',
//           attributes: ['puja_date'],
//           required: false,
//         },
//         {
//           model: PujaImagesAndVideoModel,
//           as: 'pujaImagesAndVideos',
//           attributes: ['puja_images_url', 'puja_video_url'],
//           required: false,
//         },
//         {
//           model: ReviewsModel,
//           as: 'reviews',
//           attributes: ['rating', 'review', 'uploads_url', 'verified_user'],
//           required: false,
//         },
//       ],
//       logging: console.log, // For debugging; remove in production
//     });
//     if (!pujas || pujas.length === 0) {
//       return res.status(404).json({ error: "No pujas found" });
//     }
//     // Cast the first puja instance to any so we can access additional properties
//     const pujaData: any = pujas[0].toJSON();
//     // Build the puja details object (use optional chaining for safety)
//     const puja = {
//       puja_id: pujaData.puja_id,
//       puja_name: pujaData.puja_name,
//       puja_special: pujaData.puja_special,
//       puja_description: pujaData.puja_description,
//       temple_name: pujaData.temple_name,
//       temple_location: pujaData.temple_location,
//       temple_description: pujaData.temple_description,
//       puja_thumbnail_url: pujaData.puja_thumbnail_url,
//       temple_image_url: pujaData.temple_image_url,
//       status: pujaData.status,
//       created_by: pujaData.created_by,
//       created: pujaData.created,   // created comes from mapping createdAt to 'created'
//       updated: pujaData.updated,   // updated comes from mapping updatedAt to 'updated'
//     };
//     // Transform packages (if any)
//     const packages = (pujaData.pujapackages || []).map((pkg: any) => ({
//       package_id: pkg.package_id,
//       package_name: pkg.package_name,
//       package_description: pkg.package_description,
//       number_of_devotees: pkg.number_of_devotees,
//       price: pkg.price,
//       puja_date: pkg.puja_date,
//       features: (pkg.features || []).map((f: any) => f.feature),
//     }));
//     // Transform puja_dates into an array of date strings (YYYY-MM-DD)
//     const puja_dates = (pujaData.puja_dates || []).map((d: any) => {
//       const dt = new Date(d.puja_date);
//       return dt.toISOString().split("T")[0];
//     });
//     // Merge media records (if any)
//     let image_urls: string[] = [];
//     let video_urls: string[] = [];
//     if (pujaData.pujaImagesAndVideos && pujaData.pujaImagesAndVideos.length > 0) {
//       pujaData.pujaImagesAndVideos.forEach((media: any) => {
//         if (media.puja_images_url) {
//           image_urls = image_urls.concat(media.puja_images_url);
//         }
//         if (media.puja_video_url) {
//           video_urls = video_urls.concat(media.puja_video_url);
//         }
//       });
//     }
//     const media = { image_urls, video_urls };
//     const responseData = {
//       puja,
//       packages,
//       puja_dates,
//       media,
//     };
//     res.status(200).json({
//       message: "Puja, Packages, Dates, and Features fetched successfully",
//       data: responseData,
//     });
//   } catch (error: any) {
//     console.error("Error fetching pujas:", error);
//     res.status(500).json({ error: "Database error", details: error.message });
//   }
// });
// createPuja.get('/getPujas', async (_req: any, res: any) => {
//   try {
//     // Fetch all pujas along with associated data
//     const pujas = await PujaModel.findAll({
//       include: [
//         {
//           model: PujaPackagesModel,
//           as: 'pujapackages',
//           attributes: ['package_id', 'package_name', 'package_description', 'number_of_devotees', 'price', 'puja_date'],
//           required: false,
//           include: [
//             {
//               model: PackageFeaturesModel,
//               as: 'features',
//               attributes: ['feature'],
//               required: false,
//             },
//           ],
//         },
//         {
//           model: PujaDatesModel,
//           as: 'puja_dates',
//           attributes: ['puja_date'],
//           required: false,
//         },
//         {
//           model: PujaImagesAndVideoModel,
//           as: 'pujaImagesAndVideos',
//           attributes: ['puja_images_url', 'puja_video_url'],
//           required: false,
//         },
//         {
//           model: ReviewsModel,
//           as: 'reviews', // Ensure this is the correct alias
//           attributes: ['rating', 'review', 'uploads_url', 'verified_user'],
//           required: false,
//         },
//       ],
//      // logging: console.log, // For debugging; remove in production
//     });
//     if (!pujas || pujas.length === 0) {
//       return res.status(404).json({ error: "No pujas found" });
//     }
//     // Format each puja in the result
//     const formattedPujas = pujas.map((pujaData: any) => {
//       const puja = {
//         puja_id: pujaData.puja_id,
//         puja_name: pujaData.puja_name,
//         puja_special: pujaData.puja_special,
//         puja_description: pujaData.puja_description,
//         temple_name: pujaData.temple_name,
//         temple_location: pujaData.temple_location,
//         temple_description: pujaData.temple_description,
//         puja_thumbnail_url: pujaData.puja_thumbnail_url,
//         temple_image_url: pujaData.temple_image_url,
//         status: pujaData.status,
//         created_by: pujaData.created_by,
//         created: pujaData.created,   // created comes from mapping createdAt to 'created'
//         updated: pujaData.updated,   // updated comes from mapping updatedAt to 'updated'
//       };
//       // Transform packages (if any)
//       const packages = (pujaData.pujapackages || []).map((pkg: any) => ({
//         package_id: pkg.package_id,
//         package_name: pkg.package_name,
//         package_description: pkg.package_description,
//         number_of_devotees: pkg.number_of_devotees,
//         price: pkg.price,
//         puja_date: pkg.puja_date,
//         features: (pkg.features || []).map((f: any) => f.feature),
//       }));
//       // Transform puja_dates into an array of date strings (YYYY-MM-DD)
//       const puja_dates = (pujaData.puja_dates || []).map((d: any) => {
//         const dt = new Date(d.puja_date);
//         return dt.toISOString().split("T")[0];
//       });
//       // Merge media records (if any)
//       let image_urls: string[] = [];
//       let video_urls: string[] = [];
//       if (pujaData.pujaImagesAndVideos && pujaData.pujaImagesAndVideos.length > 0) {
//         pujaData.pujaImagesAndVideos.forEach((media: any) => {
//           if (media.puja_images_url) {
//             image_urls = image_urls.concat(media.puja_images_url);
//           }
//           if (media.puja_video_url) {
//             video_urls = video_urls.concat(media.puja_video_url);
//           }
//         });
//       }
//       const media = { image_urls, video_urls };
//       // Ensure reviews are included correctly
//       const reviews = (pujaData.reviews || []).map((review: any) => ({
//         rating: review.rating,
//         review: review.review,
//         uploads_url: review.uploads_url,
//         verified_user: review.verified_user,
//       }));
//       // Return the formatted puja data
//       return {
//         puja,
//         packages,
//         puja_dates,
//         media,
//         reviews, // Add reviews here
//       };
//     });
//     // Return the response
//     // Backend code adjustment
// res.status(200).json({
//   message: "Puja, Packages, Dates, Features, and Reviews fetched successfully",
//   data: [formattedPujas], // Wrap the formatted puja in an array
// });
//   } catch (error: any) {
//     console.error("Error fetching pujas:", error);
//     res.status(500).json({ error: "Database error", details: error.message });
//   }
// });
createPuja.get('/getPujas', (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Fetch all pujas along with associated data
        const pujas = yield PujaModel_1.default.findAll({
            include: [
                {
                    model: PujaPackagesModel_1.default,
                    as: 'pujapackages',
                    attributes: ['package_id', 'package_name', 'package_description', 'number_of_devotees', 'price', 'puja_date'],
                    required: false,
                    include: [
                        {
                            model: PackageFeaturesModel_1.default,
                            as: 'features',
                            attributes: ['feature'],
                            required: false,
                        },
                    ],
                },
                {
                    model: pujaDatesModel_1.default,
                    as: 'puja_dates',
                    attributes: ['puja_date'],
                    required: false,
                },
                {
                    model: pujaImagesAndVediosModel_1.default,
                    as: 'pujaImagesAndVideos',
                    attributes: ['puja_images_url', 'puja_video_url'],
                    required: false,
                },
                {
                    model: ReviewsModel_1.default,
                    as: 'reviews',
                    attributes: ['rating', 'review', 'uploads_url', 'verified_user'],
                    required: false,
                },
            ],
        });
        if (!pujas || pujas.length === 0) {
            return res.status(404).json({ error: "No pujas found" });
        }
        // Format each puja in the result
        // Format each puja in the result
        const formattedPujas = pujas.map((pujaData) => {
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
                created: pujaData.created,
                updated: pujaData.updated,
                total_rating: 0, // Initialize total_rating inside the puja object
                reviews_count: 0, // Initialize reviews_count inside the puja object
            };
            // Transform packages (if any)
            const packages = (pujaData.pujapackages || []).map((pkg) => ({
                package_id: pkg.package_id,
                package_name: pkg.package_name,
                package_description: pkg.package_description,
                number_of_devotees: pkg.number_of_devotees,
                price: pkg.price,
                puja_date: pkg.puja_date,
                features: (pkg.features || []).map((f) => f.feature),
            }));
            // Transform puja_dates into an array of date strings (YYYY-MM-DD)
            const puja_dates = (pujaData.puja_dates || []).map((d) => {
                const dt = new Date(d.puja_date);
                return dt.toISOString().split("T")[0];
            });
            // Merge media records (if any)
            let image_urls = [];
            let video_urls = [];
            if (pujaData.pujaImagesAndVideos && pujaData.pujaImagesAndVideos.length > 0) {
                pujaData.pujaImagesAndVideos.forEach((media) => {
                    if (media.puja_images_url) {
                        image_urls = image_urls.concat(media.puja_images_url);
                    }
                    if (media.puja_video_url) {
                        video_urls = video_urls.concat(media.puja_video_url);
                    }
                });
            }
            const media = { image_urls, video_urls };
            // Ensure reviews are included correctly
            const reviews = (pujaData.reviews || []).map((review) => ({
                rating: review.rating,
                review: review.review,
                uploads_url: review.uploads_url,
                verified_user: review.verified_user,
            }));
            // Calculate total rating and reviews count
            const reviewsCount = reviews.length;
            const totalRating = reviewsCount > 0
                ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviewsCount
                : 0;
            // Add total_rating and reviews_count to the puja object
            puja.total_rating = totalRating;
            puja.reviews_count = reviewsCount;
            // Return the formatted puja data
            return {
                puja,
                packages,
                puja_dates,
                media,
                reviews,
            };
        });
        res.status(200).json({
            message: "Puja, Packages, Dates, Features, and Reviews fetched successfully",
            data: formattedPujas, // Return formatted pujas directly (no extra array wrapping)
        });
    }
    catch (error) {
        console.error("Error fetching pujas:", error);
        res.status(500).json({ error: "Database error", details: error.message });
    }
}));
// createPuja.get('/getPuja/:id', async (req: any, res: any) => {
//   const { id } = req.params;
//   try {
//     // Fetching the Puja details by ID
//     const pooja = await PujaModel.findByPk(id, {
//       include: [
//         {
//           model: PujaPackagesModel,
//           as: 'pujapackages', 
//           attributes: ['package_id', 'package_name', 'puja_date', 'package_description', 'number_of_devotees', 'price'],
//           include: [
//             {
//               model: PackageFeaturesModel,
//               as: 'features', // Ensure alias matches the model
//               attributes: ['feature'],
//               required: false, // Allow it to be empty if no features exist
//             },
//           ],
//         },
//         {
//           model: PujaDatesModel,
//           as: 'puja_dates',
//           attributes: ['puja_date'],
//           required: false,
//         },
//         {
//           model: PujaImagesAndVideoModel,
//           as: 'pujaImagesAndVideos', // Ensure alias matches model
//           attributes: ['puja_images_url', 'puja_video_url'],
//           required: false,
//         },
//         {
//           model: ReviewsModel,
//           as: 'reviews', // Alias for reviews
//           attributes: ['rating', 'review', 'uploads_url', 'verified_user'],
//           include: [
//             {
//               model: UserModel,
//               as: 'users', // Alias for UserModel
//               attributes: ['username'],
//               required: false,
//             },
//           ],
//           required: false,
//         },
//         {
//           model: BookingHistoryModel,
//           as: 'bookingHistory',
//           attributes: [
//             'booking_id', 'puja_id', 'devotee_names', 'puja_date', 'devotee_gothra',
//             'devotee_date_of_birth', 'total_amount', 'booking_status', 'puja_status'
//           ],
//           where: { puja_id: id },
//           order: [['created_at', 'DESC']],  // Use 'created_at' instead of 'created'
//           limit: 5,
//           required: false,
//         }
//       ],
//     });
//     if (!pooja) {
//       return res.status(404).json({ message: 'Pooja not found' });
//     }
//     res.status(200).json({
//       message: 'Pooja fetched successfully',
//       data: pooja,
//     });
//   } catch (error: any) {
//     console.error('Error fetching Pooja:', error);
//     res.status(500).json({ error: 'Database error', details: error.message });
//   }
// });
createPuja.get('/getPuja/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        // Fetching the Puja details by ID
        const pooja = yield PujaModel_1.default.findByPk(id, {
            include: [
                {
                    model: PujaPackagesModel_1.default,
                    as: 'pujapackages',
                    attributes: ['package_id', 'package_name', 'puja_date', 'package_description', 'number_of_devotees', 'price'],
                    include: [
                        {
                            model: PackageFeaturesModel_1.default,
                            as: 'features', // Ensure alias matches the model
                            attributes: ['feature'],
                            required: false, // Allow it to be empty if no features exist
                        },
                    ],
                },
                {
                    model: pujaDatesModel_1.default,
                    as: 'puja_dates',
                    attributes: ['puja_date'],
                    required: false,
                },
                {
                    model: pujaImagesAndVediosModel_1.default,
                    as: 'pujaImagesAndVideos', // Ensure alias matches model
                    attributes: ['puja_images_url', 'puja_video_url'],
                    required: false,
                },
                {
                    model: ReviewsModel_1.default,
                    as: 'reviews', // Alias for reviews
                    attributes: ['rating', 'review', 'uploads_url', 'verified_user'],
                    include: [
                        {
                            model: usersModel_1.default,
                            as: 'users', // Alias for UserModel
                            attributes: ['username'],
                            required: false,
                        },
                    ],
                    required: false,
                },
            ],
        });
        if (!pooja) {
            return res.status(404).json({ message: 'Pooja not found' });
        }
        res.status(200).json({
            message: 'Pooja fetched successfully',
            data: pooja,
        });
    }
    catch (error) {
        console.error('Error fetching Pooja:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
}));
createPuja.delete('/delete-puja/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const puja = yield PujaModel_1.default.findByPk(id);
        if (!puja) {
            return res.status(404).json({ message: 'Puja not found' });
        }
        yield puja.destroy();
        res.status(200).json({ message: 'Puja deleted successfully' });
    }
    catch (error) {
        console.error('Error updating Pooja:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
}));
exports.default = createPuja;
