"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("../../config"));
const PujaModel_1 = __importDefault(require("./PujaModel"));
class PujaDatesModel extends sequelize_1.Model {
    static associate() {
        PujaDatesModel.belongsTo(PujaModel_1.default, {
            foreignKey: 'puja_id', // Make sure this matches the foreign key in PujaDatesModel
            as: 'puja', // This alias is optional, but it must match the 'include' clause in your query
        });
    }
}
// Initialize the model
PujaDatesModel.init({
    sr_no: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    puja_id: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: false,
        references: {
            model: 'puja', // Table name for the foreign key
            key: 'puja_id', // Column in the foreign table
        },
        onDelete: 'CASCADE', // Cascade deletion when parent record is deleted
    },
    puja_date: {
        type: sequelize_1.DataTypes.DATEONLY, // DATE without time component
        allowNull: false,
    },
    created_by: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
}, {
    sequelize: config_1.default,
    tableName: 'puja_dates',
    timestamps: true,
    createdAt: 'created', // Map Sequelize's `createdAt` to `created`
    updatedAt: 'updated', // Map Sequelize's `updatedAt` to `updated`
    underscored: true, // Use snake_case for column names
});
exports.default = PujaDatesModel;
