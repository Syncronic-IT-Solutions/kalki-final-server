"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("../../config")); // Your sequelize connection
const usersModel_1 = __importDefault(require("../users/usersModel")); // Adjust the path to the user model
const CouponModel_1 = __importDefault(require("../coupons/CouponModel")); // Adjust the path to the coupon model
class UserCouponUsageModel extends sequelize_1.Model {
}
UserCouponUsageModel.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    userid: {
        type: sequelize_1.DataTypes.STRING(50), // Adjusted length for string-based user IDs (e.g., UUID or alphanumeric)
        allowNull: false,
        references: {
            model: usersModel_1.default, // References the User model
            key: 'userid', // Assuming 'userid' is the primary key in the User model
        },
    },
    coupon_id: {
        type: sequelize_1.DataTypes.INTEGER, // Adjusted to INTEGER for auto-incremented coupon_id from CouponModel
        allowNull: false,
        references: {
            model: CouponModel_1.default, // References the Coupon model
            key: 'coupon_id', // Assuming 'coupon_id' is the primary key in the Coupon model
        },
    },
    usage_count: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0, // Default to 0 when a coupon is first used
    },
    created_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    updated_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    sequelize: config_1.default, // Ensure correct sequelize connection
    tableName: 'user_coupon_usages', // The table name
    timestamps: true, // Enable automatic createdAt and updatedAt fields
    createdAt: 'created_at', // Use custom names for timestamps
    updatedAt: 'updated_at', // Use custom names for timestamps
    underscored: true, // Use snake_case for column names (created_at, updated_at)
});
exports.default = UserCouponUsageModel;
