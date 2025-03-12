"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("../../config"));
class TrackingModel extends sequelize_1.Model {
}
// Initialize the model
TrackingModel.init({
    sr_no: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    booking_id: {
        type: sequelize_1.DataTypes.STRING(20), // Changed to STRING(20) to match booking_history
        allowNull: false,
        references: {
            model: 'booking_history', // Table name for the foreign key
            key: 'booking_id', // Column in the foreign table
        },
        onDelete: 'CASCADE', // Cascade deletion when parent record is deleted
    },
    tracking_number: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    tracking_link: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    status: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: false,
    },
    created_by: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
    },
}, {
    sequelize: config_1.default,
    tableName: 'tracking',
    timestamps: true,
    createdAt: 'created', // Map Sequelize's `createdAt` to `created`
    updatedAt: 'updated', // Automatically handle createdAt and updatedAt
    underscored: true, // Use snake_case for column names
});
exports.default = TrackingModel;
