import { DataTypes, Model, Optional } from 'sequelize';
import sequelizeConnection from '../../config';
import PackageFeaturesModel from './PackageFeaturesModel';
import BookingHistoryModel from './BookingHistoryModel';
import PujaModel from './PujaModel';

interface PujaPackagesAttributes {
  puja_id: string;
  package_id: string;
  package_name: string;
  package_description?: string | null;
  number_of_devotees?: number | null;
  price: number;
  puja_date: Date;
  puja_speciality: string;  
  created_by?: number | null;
}

export interface PujaPackagesInput extends Optional<PujaPackagesAttributes, 'package_id'> { }

class PujaPackagesModel extends Model<PujaPackagesAttributes, PujaPackagesInput> implements PujaPackagesAttributes {
  public puja_id!: string;
  public package_id!: string;
  public package_name!: string;
  public package_description!: string | null;
  public number_of_devotees!: number | null;
  public price!: number;
  public puja_date!: Date;
  public puja_speciality: string = ''; // Default value set here
  public created_by!: number | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public features?: PackageFeaturesModel[];

  public static associate() {
    PujaPackagesModel.belongsTo(PujaModel, {
      foreignKey: 'puja_id',
      as: 'puja',
    });

    PujaPackagesModel.hasMany(PackageFeaturesModel, {
      foreignKey: 'package_id',
      sourceKey: 'package_id',
      as: 'features',
    });

    PujaPackagesModel.hasMany(BookingHistoryModel, {
      foreignKey: 'package_id',
      as: 'bookings',
    });
  }
}

PujaPackagesModel.init(
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
    package_id: {
      type: DataTypes.STRING(20),
      allowNull: false,
      primaryKey: true,
    },
    package_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    package_description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    number_of_devotees: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    puja_date: {
      type: DataTypes.DATEONLY, // DATE without time component
      allowNull: true,
    },
    puja_speciality: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: '',  // Ensure that the field has a default value if not provided
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize: sequelizeConnection,
    tableName: 'puja_packages',
    timestamps: true,
    createdAt: 'created',
    updatedAt: 'updated',
    underscored: true,
  }
);

export default PujaPackagesModel;
