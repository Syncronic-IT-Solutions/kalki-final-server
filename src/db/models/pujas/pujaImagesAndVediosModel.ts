import { DataTypes, Model, Optional } from 'sequelize';
import sequelizeConnection from '../../config';
import PujaModel from './PujaModel';

interface PujaImagesAndVideoAttributes {
  sr_no: number;
  puja_id: string;
  puja_images_url: string[]; 
  puja_video_url: string[]; 
}
export interface PujaImagesAndVideoInput extends Optional<PujaImagesAndVideoAttributes, 'sr_no' |"puja_images_url"| 'puja_video_url' > {}

export interface PujaImagesAndVideoOutput extends Required<PujaImagesAndVideoAttributes> {}

class PujaImagesAndVideoModel extends Model<PujaImagesAndVideoAttributes, PujaImagesAndVideoInput> implements PujaImagesAndVideoAttributes {
  public sr_no!: number;
  public puja_id!: string;
  public puja_images_url!: string[];
  public puja_video_url!: string[];

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public static associate() {
    PujaImagesAndVideoModel.belongsTo(PujaModel, {
      foreignKey: 'puja_id', 
      as: 'puja', 
    });
  }
}

// Initialize the model
PujaImagesAndVideoModel.init(
  {
    sr_no: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    puja_id: {
      type: DataTypes.STRING(20),
      allowNull: false,
      references: {
        model: 'puja', 
        key: 'puja_id', 
      },
      onDelete: 'CASCADE',
    },
    puja_images_url: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: false,
    },
    puja_video_url: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: true,
    },
  },
  {
    sequelize: sequelizeConnection,
    tableName: 'puja_images_and_video',
    timestamps: true,
    createdAt: 'created',
    updatedAt: 'updated',
    underscored: true,
  }
);

export default PujaImagesAndVideoModel; 
export { PujaImagesAndVideoAttributes };