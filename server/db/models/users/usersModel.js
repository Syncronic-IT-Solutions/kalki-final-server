"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("../../config")); // Adjust this import as per your file structure
class UserModel extends sequelize_1.Model {
    // Define the associations between User and BookingHistory, and Review
    static associate(models) {
        UserModel.hasMany(models.BookingHistoryModel, {
            foreignKey: 'userid',
            as: 'bookings',
        });
        UserModel.hasMany(models.ReviewsModel, {
            foreignKey: 'userid',
            as: 'reviews',
        });
    }
}
// Initialize the model
UserModel.init({
    userid: {
        type: sequelize_1.DataTypes.STRING(20), // Change to string with a max length
        allowNull: false,
        primaryKey: true, // Make userid the primary key
        unique: true, // Ensure it is unique
    },
    phonenumber: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: false,
        unique: true,
    },
    password: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    email: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
        unique: true,
    },
    username: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: true,
        defaultValue: 'Kalki Seva Bhakth', // Set default username value
    },
    otp_verified: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    profile_pic_url: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    gender: {
        type: sequelize_1.DataTypes.STRING(10),
        allowNull: true,
    },
    address: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    status: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'active',
    }
}, {
    sequelize: config_1.default,
    tableName: 'users', // Ensure this matches the actual table name in your DB
    timestamps: true, // Enable createdAt and updatedAt columns
    createdAt: 'created', // Map Sequelize's `createdAt` to `created`
    updatedAt: 'updated', // Map Sequelize's `updatedAt` to `updated`
    underscored: true, // Optionally use snake_case for column names
});
exports.default = UserModel;
