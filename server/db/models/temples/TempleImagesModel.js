"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("../../config"));
class TempleImagesModel extends sequelize_1.Model {
}
// Initialize the model
TempleImagesModel.init({
    sr_no: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    temple_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'temples',
            key: 'temple_id',
        },
        onDelete: 'CASCADE',
    },
    image_urls: {
        type: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.TEXT), // Store multiple image URLs
        allowNull: true,
    },
    video_urls: {
        type: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.TEXT), // Store multiple video URLs
        allowNull: true,
    },
}, {
    sequelize: config_1.default,
    tableName: 'temple_images',
    timestamps: true,
    createdAt: 'created',
    updatedAt: 'updated',
    underscored: true,
});
exports.default = TempleImagesModel;
