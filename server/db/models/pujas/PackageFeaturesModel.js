"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("../../config"));
const PujaPackagesModel_1 = __importDefault(require("./PujaPackagesModel"));
class PackageFeaturesModel extends sequelize_1.Model {
    // Define associations
    static associate() {
        PackageFeaturesModel.belongsTo(PujaPackagesModel_1.default, {
            foreignKey: 'package_id',
            targetKey: 'package_id',
            as: 'pujaPackage',
        });
    }
}
PackageFeaturesModel.init({
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
        references: {
            model: 'puja_packages',
            key: 'package_id',
        },
        onDelete: 'CASCADE',
    },
    feature: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    created_by: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
}, {
    sequelize: config_1.default,
    tableName: 'package_features',
    timestamps: true,
    underscored: true,
});
exports.default = PackageFeaturesModel;
