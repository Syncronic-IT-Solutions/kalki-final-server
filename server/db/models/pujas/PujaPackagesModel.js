"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("../../config"));
const PackageFeaturesModel_1 = __importDefault(require("./PackageFeaturesModel"));
const BookingHistoryModel_1 = __importDefault(require("./BookingHistoryModel"));
const PujaModel_1 = __importDefault(require("./PujaModel"));
class PujaPackagesModel extends sequelize_1.Model {
    constructor() {
        super(...arguments);
        this.puja_speciality = ''; // Default value set here
    }
    static associate() {
        PujaPackagesModel.belongsTo(PujaModel_1.default, {
            foreignKey: 'puja_id',
            as: 'puja',
        });
        PujaPackagesModel.hasMany(PackageFeaturesModel_1.default, {
            foreignKey: 'package_id',
            sourceKey: 'package_id',
            as: 'features',
        });
        PujaPackagesModel.hasMany(BookingHistoryModel_1.default, {
            foreignKey: 'package_id',
            as: 'bookings',
        });
    }
}
PujaPackagesModel.init({
    puja_id: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: false,
        references: {
            model: 'puja',
            key: 'puja_id',
        },
        onDelete: 'CASCADE',
    },
    package_id: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: false,
        primaryKey: true,
    },
    package_name: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    package_description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    number_of_devotees: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    price: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    puja_date: {
        type: sequelize_1.DataTypes.DATEONLY, // DATE without time component
        allowNull: true,
    },
    puja_speciality: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
        defaultValue: '', // Ensure that the field has a default value if not provided
    },
    created_by: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
}, {
    sequelize: config_1.default,
    tableName: 'puja_packages',
    timestamps: true,
    createdAt: 'created',
    updatedAt: 'updated',
    underscored: true,
});
exports.default = PujaPackagesModel;
