"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("../../config"));
class TemplesModel extends sequelize_1.Model {
}
// Initialize the model
TemplesModel.init({
    temple_id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    temple_name: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    temple_location: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    temple_description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    phone_number: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: true,
    },
    email: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: true,
    },
    website: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    opening_hours: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    latitude: {
        type: sequelize_1.DataTypes.DECIMAL(9, 6),
        allowNull: true,
    },
    longitude: {
        type: sequelize_1.DataTypes.DECIMAL(9, 6),
        allowNull: true,
    },
    temple_thumbnail: {
        type: sequelize_1.DataTypes.STRING(255), // Store image URL as a string
        allowNull: true,
    },
    temple_images_url: {
        type: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.STRING), // Array of strings for multiple image URLs
        allowNull: true,
    },
    temple_video_url: {
        type: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.STRING), // Array of strings for multiple video URLs
        allowNull: true,
    },
    history: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    facilities: {
        type: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.STRING), // Array of strings for multiple facilities
        allowNull: true,
    },
    festivals: {
        type: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.STRING), // Array of strings for multiple festivals
        allowNull: true,
    },
    status: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'active',
    },
}, {
    sequelize: config_1.default,
    tableName: 'temples',
    timestamps: true, // Enable timestamps to handle createdAt and updatedAt
    createdAt: 'created', // Map Sequelize's createdAt to created
    updatedAt: 'updated', // Map Sequelize's updatedAt to updated
    underscored: true, // Use snake_case for column names
});
exports.default = TemplesModel;
