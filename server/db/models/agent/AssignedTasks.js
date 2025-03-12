"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("../../config"));
class AssignedTasksModel extends sequelize_1.Model {
}
// Initialize the model
AssignedTasksModel.init({
    booking_id: {
        type: sequelize_1.DataTypes.STRING(20), // Adjusted to STRING to match booking_history
        primaryKey: true,
        references: {
            model: 'booking_history', // Reference to the booking_history table
            key: 'booking_id',
        },
        onDelete: 'CASCADE', // If the booking is deleted, also delete the assigned task
    },
    agent_id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: 'agent', // Reference to the 'agent' table
            key: 'agent_id',
        },
        onDelete: 'CASCADE', // If the agent is deleted, also delete the assigned task
    },
    task_status: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: false, // Status is required
    },
    agent_commission: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false, // Commission is required
    },
}, {
    sequelize: config_1.default, // Sequelize connection instance
    tableName: 'assigned_tasks', // Table name
    timestamps: true, // Enable timestamps to handle `createdAt` and `updatedAt`
    createdAt: 'created', // Map Sequelize's `createdAt` to `created`
    updatedAt: 'updated', // Map Sequelize's `updatedAt` to `updated`
    underscored: true, // Use snake_case for column names
});
// Export the model and attributes for use in other parts of the application
exports.default = AssignedTasksModel;
