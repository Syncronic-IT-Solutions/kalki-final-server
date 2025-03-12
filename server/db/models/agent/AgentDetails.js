"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("../../config"));
class AgentDetailsModel extends sequelize_1.Model {
}
AgentDetailsModel.init({
    agent_id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        references: {
            model: 'agent',
            key: 'agent_id',
        },
        onDelete: 'CASCADE',
    },
    gender: {
        type: sequelize_1.DataTypes.STRING(10),
        allowNull: true,
    },
    phone_number: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: true,
    },
    dateofbirth: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    address: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    aadhaarnumber: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: true,
    },
    pannumber: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: true,
    },
    bankaccount_number: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: true,
    },
    ifsccode: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: true,
    },
    branch: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: true,
    },
    aadhaar_image_upload: {
        type: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.STRING),
        allowNull: true,
    },
    pan_image_upload: {
        type: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.STRING),
        allowNull: true,
    },
}, {
    sequelize: config_1.default,
    tableName: 'agent_details',
    timestamps: true,
    createdAt: 'created',
    updatedAt: 'updated',
    underscored: true,
});
exports.default = AgentDetailsModel;
