import { DataTypes, Model, Optional } from 'sequelize';
import sequelizeConnection from '../../config';


interface AssignedTasksAttributes {
  booking_id: string;  
  agent_id: number;
  task_status: string;
  agent_commission: number;
}

export interface AssignedTasksInput extends Optional<AssignedTasksAttributes, 'booking_id' | 'agent_id'> {}

export interface AssignedTasksOutput extends Required<AssignedTasksAttributes> {}

class AssignedTasksModel extends Model<AssignedTasksAttributes, AssignedTasksInput> implements AssignedTasksAttributes {
  public booking_id!: string;  
  public agent_id!: number;
  public task_status!: string;
  public agent_commission!: number;

  // Timestamps (createdAt and updatedAt)
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;


}

// Initialize the model
AssignedTasksModel.init(
  {
    booking_id: {
      type: DataTypes.STRING(20),  // Adjusted to STRING to match booking_history
      primaryKey: true,
      references: {
        model: 'booking_history',  // Reference to the booking_history table
        key: 'booking_id',
      },
      onDelete: 'CASCADE',  // If the booking is deleted, also delete the assigned task
    },
    agent_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'agent',  // Reference to the 'agent' table
        key: 'agent_id',
      },
      onDelete: 'CASCADE',  // If the agent is deleted, also delete the assigned task
    },
    task_status: {
      type: DataTypes.STRING(20),
      allowNull: false,  // Status is required
    },
    agent_commission: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,  // Commission is required
    },
  },
  {
    sequelize: sequelizeConnection,  // Sequelize connection instance
    tableName: 'assigned_tasks',  // Table name
    timestamps: true,  // Enable timestamps to handle `createdAt` and `updatedAt`
    createdAt: 'created',  // Map Sequelize's `createdAt` to `created`
    updatedAt: 'updated',  // Map Sequelize's `updatedAt` to `updated`
    underscored: true,  // Use snake_case for column names
  }
);

// Export the model and attributes for use in other parts of the application
export default AssignedTasksModel;
export { AssignedTasksAttributes };
