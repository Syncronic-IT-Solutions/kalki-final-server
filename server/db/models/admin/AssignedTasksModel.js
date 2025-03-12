"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("../../config"));
const BookingHistoryModel_1 = __importDefault(require("../pujas/BookingHistoryModel"));
const AgentDetailsModel_1 = __importDefault(require("./AgentDetailsModel"));
class AssignedTasksModel extends sequelize_1.Model {
    static associate() {
        AssignedTasksModel.belongsTo(BookingHistoryModel_1.default, {
            foreignKey: 'booking_id',
            as: 'booking',
        });
        AssignedTasksModel.belongsTo(AgentDetailsModel_1.default, {
            foreignKey: 'agent_id',
            as: 'agent',
        });
    }
}
AssignedTasksModel.init({
    booking_id: {
        type: sequelize_1.DataTypes.STRING(20),
        primaryKey: true,
        references: {
            model: 'booking_history',
            key: 'booking_id',
        },
        onDelete: 'CASCADE',
    },
    agent_id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: 'agent',
            key: 'agent_id',
        },
        onDelete: 'CASCADE',
    },
    task_status: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: false,
    },
    agent_commission: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
}, {
    sequelize: config_1.default,
    tableName: 'assigned_tasks',
    timestamps: true,
    createdAt: 'created',
    updatedAt: 'updated',
    underscored: true,
});
exports.default = AssignedTasksModel;
