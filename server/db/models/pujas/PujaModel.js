"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("../../config"));
const PujaPackagesModel_1 = __importDefault(require("./PujaPackagesModel"));
const BookingHistoryModel_1 = __importDefault(require("./BookingHistoryModel"));
const pujaImagesAndVediosModel_1 = __importDefault(require("./pujaImagesAndVediosModel"));
const ReviewsModel_1 = __importDefault(require("./ReviewsModel"));
const pujaDatesModel_1 = __importDefault(require("./pujaDatesModel"));
class PujaModel extends sequelize_1.Model {
    static associate() {
        // Renamed one of the 'packages' aliases to 'pujaPackages' to avoid conflict
        PujaModel.hasMany(PujaPackagesModel_1.default, { foreignKey: 'puja_id', as: 'pujapackages' }); // Renamed alias here
        PujaModel.hasMany(pujaDatesModel_1.default, { foreignKey: 'puja_id', as: 'puja_dates' });
        PujaModel.hasMany(BookingHistoryModel_1.default, { foreignKey: 'puja_id', as: 'bookingHistory' });
        PujaModel.hasMany(pujaImagesAndVediosModel_1.default, { foreignKey: 'puja_id', as: 'pujaImagesAndVideos' });
        PujaModel.hasMany(ReviewsModel_1.default, { foreignKey: 'puja_id', as: 'reviews' });
    }
}
PujaModel.init({
    puja_id: {
        type: sequelize_1.DataTypes.STRING(20),
        primaryKey: true,
    },
    puja_name: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    puja_special: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    puja_description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    temple_name: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    temple_location: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    puja_thumbnail_url: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    temple_description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    temple_image_url: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    status: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'active',
    },
    created_by: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
}, {
    sequelize: config_1.default,
    tableName: 'puja',
    timestamps: true,
    createdAt: 'created',
    updatedAt: 'updated',
    underscored: true,
});
exports.default = PujaModel;
