"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("../../config"));
class ReviewsModel extends sequelize_1.Model {
    // Define the associations
    static associate(models) {
        ReviewsModel.belongsTo(models.UserModel, { foreignKey: 'userid', as: 'users' }); // This defines the UserModel association
        ReviewsModel.belongsTo(models.PujaModel, { foreignKey: 'puja_id', as: 'puja' }); // This defines the PujaModel association
        ReviewsModel.belongsTo(models.BookingHistoryModel, { foreignKey: 'booking_id', as: 'booking' }); // This defines the BookingHistoryModel association
    }
}
ReviewsModel.init({
    review_id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
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
    booking_id: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: false,
        references: {
            model: 'booking_history',
            key: 'booking_id',
        },
        onDelete: 'CASCADE',
    },
    rating: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5,
        },
    },
    review: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    uploads_url: {
        type: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.TEXT),
        allowNull: true,
    },
    verified_user: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
}, {
    sequelize: config_1.default,
    tableName: 'reviews',
    timestamps: true,
    createdAt: 'created',
    updatedAt: 'updated',
    underscored: true,
});
exports.default = ReviewsModel;
