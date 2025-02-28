import { DataTypes, Model, Optional } from 'sequelize';
import sequelizeConnection from '../../config';

// Define the attributes for the Puja entity
interface PujaAttributes {
  puja_id: string;
  puja_date: Date;
  speciality?: string;
  packages: {
    package_id: string;
    package_name: string;
    package_description?: string | null;
    number_of_devotees?: number | null;
    price: number;
    features: string[];
  }[];
  created_by?: number | null;
}

export interface PujaInput extends Optional<PujaAttributes, 'created_by'> {}

class PujaDatesModel extends Model<PujaAttributes, PujaInput> implements PujaAttributes {
  public puja_id!: string;
  public puja_date!: Date;
  public speciality?: string;
  public packages!: {
    package_id: string;
    package_name: string;
    package_description?: string | null;
    number_of_devotees?: number | null;
    price: number;
    features: string[];
  }[];
  public created_by!: number | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize the model
PujaDatesModel.init(
  {
    puja_id: {
      type: DataTypes.STRING(20),
      allowNull: false,
      references: {
        model: 'puja',
        key: 'puja_id',
      },
      onDelete: 'CASCADE',
    },
    puja_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    speciality: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    packages: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize: sequelizeConnection,
    tableName: 'puja_dates_packages',
    timestamps: true,
    createdAt: 'created',
    updatedAt: 'updated',
    underscored: true,
  }
);

export default PujaDatesModel;
