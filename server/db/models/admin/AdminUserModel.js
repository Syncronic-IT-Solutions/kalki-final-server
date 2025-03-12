"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("../../config"));
class AdminUsersModel extends sequelize_1.Model {
}
// Initialize the model
AdminUsersModel.init({
    admin_user_id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    admin_user_name: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    admin_email: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
        unique: true, // Ensure email is unique
    },
    admin_phone: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: true, // Phone number is optional
    },
    admin_password: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    role: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: false,
    },
}, {
    sequelize: config_1.default,
    tableName: 'admin_users',
    timestamps: true, // Enable timestamps to handle `createdAt` and `updatedAt`
    createdAt: 'created', // Map Sequelize's `createdAt` to `created`
    updatedAt: 'updated', // Map Sequelize's `updatedAt` to `updated`
    underscored: true, // Use snake_case for column names
});
exports.default = AdminUsersModel;
