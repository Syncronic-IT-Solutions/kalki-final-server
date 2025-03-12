"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("../../config")); // Your sequelize connection
class CouponModel extends sequelize_1.Model {
}
CouponModel.init({
    coupon_id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        unique: true,
        autoIncrement: true, // Auto-increment enabled
    },
    coupon_code: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: false,
        unique: true, // Ensure the coupon code is unique
    },
    description: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    discount_type: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: false,
        validate: {
            isIn: [['percentage', 'fixed']], // Restrict to only 'percentage' or 'fixed'
        },
    },
    discount_percentage: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: true,
        validate: {
            min: 0,
            max: 100,
        },
    },
    maximum_discount_amount: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: true,
        validate: {
            min: 0,
        },
    },
    discount_amount: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
        validate: {
            min: 0,
        },
    },
    valid_from: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    valid_to: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'active', // Default value for status
    },
    usage_limit_per_user: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1, // Default limit of one time per user
    },
    created_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW, // Automatically set the current timestamp
    },
    updated_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW, // Automatically set the current timestamp
    },
}, {
    sequelize: config_1.default, // Ensure connection to the database
    tableName: 'coupons', // The name of the table for coupons
    timestamps: true, // Enable automatic createdAt and updatedAt fields
    createdAt: 'created_at', // Rename the default createdAt column to created_at
    updatedAt: 'updated_at', // Rename the default updatedAt column to updated_at
    underscored: true, // Use snake_case for column names (e.g., created_at, updated_at)
});
exports.default = CouponModel;
