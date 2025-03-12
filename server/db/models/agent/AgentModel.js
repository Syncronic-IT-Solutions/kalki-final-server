"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("../../config"));
class AgentModel extends sequelize_1.Model {
}
AgentModel.init({
    agent_id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    agent_name: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    agent_email: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
        unique: true, // Ensure email is unique
    },
    agent_password: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.STRING(20),
        defaultValue: 'active',
    },
    created_by: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    verified: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
    },
    agent_profile_image_url: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
}, {
    sequelize: config_1.default,
    tableName: 'agent',
    timestamps: true,
    createdAt: 'created',
    updatedAt: 'updated',
    underscored: true,
});
exports.default = AgentModel;
