"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("../../config"));
const PujaModel_1 = __importDefault(require("../pujas/PujaModel"));
const ReviewsModel_1 = __importDefault(require("../pujas/ReviewsModel"));
const usersModel_1 = __importDefault(require("../users/usersModel"));
const pujaDatesModel_1 = __importDefault(require("../pujas/pujaDatesModel"));
const AssignedTasks_1 = __importDefault(require("../agent/AssignedTasks"));
const AgentDetails_1 = __importDefault(require("../agent/AgentDetails"));
class BookingHistoryModel extends sequelize_1.Model {
    static associate() {
        BookingHistoryModel.belongsTo(usersModel_1.default, { foreignKey: 'userid', as: 'user' });
        BookingHistoryModel.belongsTo(PujaModel_1.default, { foreignKey: 'puja_id', as: 'puja' });
        BookingHistoryModel.hasMany(pujaDatesModel_1.default, { foreignKey: 'booking_id', as: 'pujaDates' });
        ~BookingHistoryModel.hasMany(ReviewsModel_1.default, { foreignKey: 'booking_id', as: 'reviews' });
        BookingHistoryModel.hasMany(AssignedTasks_1.default, { foreignKey: 'booking_id', as: 'assignedTasks' });
        BookingHistoryModel.hasMany(AgentDetails_1.default, { foreignKey: 'booking_id', as: 'agentDetails' });
    }
}
BookingHistoryModel.init({
    booking_id: {
        type: sequelize_1.DataTypes.STRING(20),
        primaryKey: true,
    },
    userid: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: false,
        references: {
            model: 'users',
            key: 'userid',
        },
        onDelete: 'CASCADE',
    },
    puja_id: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: false,
        references: {
            model: 'puja',
            key: 'puja_id',
        },
        onDelete: 'CASCADE',
    },
    puja_date: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: false,
    },
    puja_name: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
    },
    package_id: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: false,
    },
    package_name: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
    },
    devotee_names: {
        type: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.STRING),
        allowNull: false,
    },
    devotee_gothra: {
        type: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.STRING),
        allowNull: false,
    },
    devotee_date_of_birth: {
        type: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.DATEONLY),
        allowNull: false,
    },
    special_instructions: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    amount: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    discount_amount: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    coupon_code: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: true,
    },
    total_amount: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    shipping_address: {
        type: sequelize_1.DataTypes.JSONB,
        allowNull: true,
    },
    billing_address: {
        type: sequelize_1.DataTypes.JSONB,
        allowNull: true,
    },
    is_shipping_address_same_as_billing: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    booking_status: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'pending',
    },
    puja_status: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'pending',
    },
    payment_method: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
    },
    payment_reference: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: true,
    },
    completed_image_url_path: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    completed_video_url_path: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
}, {
    sequelize: config_1.default,
    tableName: 'booking_history',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
});
exports.default = BookingHistoryModel;
