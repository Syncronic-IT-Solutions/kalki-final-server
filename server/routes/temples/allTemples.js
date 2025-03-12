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
const TemplesModel_1 = __importDefault(require("../../db/models/temples/TemplesModel"));
const TempleImagesModel_1 = __importDefault(require("../../db/models/temples/TempleImagesModel"));
const allTemples = express_1.default.Router();
// Define the 'getAllTemples' route without authentication middleware
allTemples.get('/getAllTemples', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const temples = yield TemplesModel_1.default.findAll(); // Fetch all temples from the database
        return res.status(200).json({ message: 'Temples fetched successfully', data: temples });
    }
    catch (error) {
        console.error('Error fetching temples:', error);
        return res.status(500).json({ error: 'Database error', details: error.message });
    }
}));
allTemples.get('/getTemple/:temple_id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { temple_id } = req.params;
        // Fetch temple details
        const temple = yield TemplesModel_1.default.findOne({ where: { temple_id } });
        if (!temple) {
            return res.status(404).json({ message: 'Temple not found' });
        }
        // Fetch associated media URLs
        const media = yield TempleImagesModel_1.default.findOne({ where: { temple_id } });
        // Combine temple data with media URLs
        const responseData = Object.assign(Object.assign({}, temple.dataValues), { media_urls: media ? { image_urls: media.image_urls, video_urls: media.video_urls } : { image_urls: [], video_urls: [] } });
        return res.status(200).json({ message: 'Temple fetched successfully', data: responseData });
    }
    catch (error) {
        console.error('Error fetching temple:', error);
        return res.status(500).json({ error: 'Database error', details: error.message });
    }
}));
// ✅ Route to delete a temple and its media
allTemples.delete('/deleteTemple/:temple_id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { temple_id } = req.params;
        // Check if temple exists
        const temple = yield TemplesModel_1.default.findOne({ where: { temple_id } });
        if (!temple) {
            return res.status(404).json({ message: 'Temple not found' });
        }
        // Delete the temple media
        yield TempleImagesModel_1.default.destroy({ where: { temple_id } });
        // Delete the temple
        yield TemplesModel_1.default.destroy({ where: { temple_id } });
        return res.status(200).json({ message: 'Temple and its media deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting temple:', error);
        return res.status(500).json({ error: 'Database error', details: error.message });
    }
}));
// ✅ Route to delete only media (image/video) URLs of a temple
allTemples.delete('/deleteTempleMedia/:temple_id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { temple_id } = req.params;
        // Check if media exists for the temple
        let media = yield TempleImagesModel_1.default.findOne({ where: { temple_id } });
        if (!media) {
            return res.status(404).json({ message: 'No media found for this temple' });
        }
        // Update media to remove image and video URLs (you can also delete individual files if required)
        media.image_urls = [];
        media.video_urls = [];
        // Save the updated media URLs
        yield media.save();
        return res.status(200).json({ message: 'Media deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting media:', error);
        return res.status(500).json({ error: 'Database error', details: error.message });
    }
}));
exports.default = allTemples;
