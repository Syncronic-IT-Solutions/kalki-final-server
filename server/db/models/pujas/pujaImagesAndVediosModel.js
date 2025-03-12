"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("../../config"));
const PujaModel_1 = __importDefault(require("./PujaModel"));
class PujaImagesAndVideoModel extends sequelize_1.Model {
    static associate() {
        PujaImagesAndVideoModel.belongsTo(PujaModel_1.default, {
            foreignKey: 'puja_id',
            as: 'puja',
        });
    }
}
// Initialize the model
PujaImagesAndVideoModel.init({
    sr_no: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
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
    puja_images_url: {
        type: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.TEXT),
        allowNull: false,
    },
    puja_video_url: {
        type: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.TEXT),
        allowNull: true,
    },
}, {
    sequelize: config_1.default,
    tableName: 'puja_images_and_video',
    timestamps: true,
    createdAt: 'created',
    updatedAt: 'updated',
    underscored: true,
});
exports.default = PujaImagesAndVideoModel;
