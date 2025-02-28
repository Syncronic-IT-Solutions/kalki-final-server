import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";
import sequelizeConnection from "../../config";

interface PujaAttributes {
  puja_id: string;
  puja_name: string;
  puja_special?: string | null;
  puja_description?: string | null;
  temple_name?: string | null;
  temple_location?: string | null;
  puja_thumbnail_url?: string | null;
  temple_description?: string | null;
  temple_image_url?: string | null;
  puja_images_url?: string[] | null;
  puja_video_url?: string[] | null;
  status: string;
  created_by?: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

class PujaModel
  extends Model<InferAttributes<PujaModel>, InferCreationAttributes<PujaModel>>
  implements PujaAttributes
{
  public puja_id!: string;
  public puja_name!: string;
  public puja_special!: string | null;
  public puja_description!: string | null;
  public temple_name!: string | null;
  public temple_location!: string | null;
  public puja_thumbnail_url!: string | null;
  public temple_description!: string | null;
  public temple_image_url!: string | null;
  public puja_images_url!: string[] | null;
  public puja_video_url!: string[] | null;
  public status!: string;
  public created_by!: number | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PujaModel.init(
  {
    puja_id: {
      type: DataTypes.STRING(20),
      primaryKey: true,
      unique: true,
    },
    puja_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    puja_special: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    puja_description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    temple_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    temple_location: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    puja_thumbnail_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    temple_description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    temple_image_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    puja_images_url: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null,
    },
    puja_video_url: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null,
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "active",
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize: sequelizeConnection,
    tableName: "puja",
    timestamps: true,
    createdAt: 'created', // Map Sequelize's `createdAt` to `created`
    updatedAt: 'updated', // Map Sequelize's `updatedAt` to `updated`
    underscored: true,
  }
);

export default PujaModel;
