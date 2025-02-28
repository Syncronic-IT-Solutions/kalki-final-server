import { DataTypes, Model, Optional } from 'sequelize';
import sequelizeConnection from '../../config';

interface AgentAttributes {
  agent_id: number;
  agent_name: string;
  agent_email: string;
  agent_password: string;
  status: string;
  created_by: number | null;
  verified: boolean;
  agent_profile_image_url: string | null;
}

export interface AgentInput extends Optional<AgentAttributes, 'agent_id'> {}

export interface AgentOutput extends Required<AgentAttributes> {}

class AgentModel extends Model<AgentAttributes, AgentInput> implements AgentAttributes {
  public agent_id!: number;
  public agent_name!: string;
  public agent_email!: string;
  public agent_password!: string;
  public status!: string;
  public created_by!: number | null;
  public verified!: boolean;
  public agent_profile_image_url!: string | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

AgentModel.init(
  {
    agent_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    agent_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    agent_email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true, // Ensure email is unique
    },
    agent_password: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'active',
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    agent_profile_image_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize: sequelizeConnection,
    tableName: 'agent',
    timestamps: true,
    createdAt: 'created',
    updatedAt: 'updated',
    underscored: true,
  }
);

export default AgentModel;
