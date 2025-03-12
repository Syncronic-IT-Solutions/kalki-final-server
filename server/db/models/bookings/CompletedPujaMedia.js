"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("../../config"));
class CompletedPujaUserVideosModel extends sequelize_1.Model {
}
CompletedPujaUserVideosModel.init({
    sr_no: {
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
    video_url_path: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
}, {
    sequelize: config_1.default,
    tableName: 'completed_puja_user_videos',
    timestamps: true,
    createdAt: 'created',
    updatedAt: 'updated',
    underscored: true,
});
exports.default = CompletedPujaUserVideosModel;
