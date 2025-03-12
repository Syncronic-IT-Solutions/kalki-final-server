import { DataTypes, Model, Optional } from 'sequelize';
import sequelizeConnection from '../../config';
import BookingHistoryModel from '../bookings/BookingHistoryModel';
import UserModel from '../users/usersModel';
import PujaModel from './PujaModel';

interface ReviewsAttributes {
  review_id: number;
  userid: string;
  puja_id: string;
  booking_id: string;
  rating: number;
  review: string | null;
  uploads_url: string[];
  verified_user: boolean;
}

export interface ReviewsInput extends Optional<ReviewsAttributes, 'review_id' | 'review' | 'uploads_url'> {}

export interface ReviewsOutput extends Required<ReviewsAttributes> {}

class ReviewsModel extends Model<ReviewsAttributes, ReviewsInput> implements ReviewsAttributes {
  public review_id!: number;
  public userid!: string;
  public puja_id!: string;
  public booking_id!: string;
  public rating!: number;
  public review!: string | null;
  public uploads_url!: string[];
  public verified_user!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Define the associations
  public static associate(models: any) {
    ReviewsModel.belongsTo(models.UserModel, { foreignKey: 'userid', as: 'users' });  // This defines the UserModel association
    ReviewsModel.belongsTo(models.PujaModel, { foreignKey: 'puja_id', as: 'puja' });  // This defines the PujaModel association
    ReviewsModel.belongsTo(models.BookingHistoryModel, { foreignKey: 'booking_id', as: 'booking' });  // This defines the BookingHistoryModel association
  }
}

ReviewsModel.init(
  {
    review_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userid: {
      type: DataTypes.STRING(20),
      allowNull: false,
      references: {
        model: 'users',
        key: 'userid',
      },
      onDelete: 'CASCADE',
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
    booking_id: {
      type: DataTypes.STRING(20),
      allowNull: false,
      references: {
        model: 'booking_history',
        key: 'booking_id',
      },
      onDelete: 'CASCADE',
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    review: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    uploads_url: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: true,
    },
    verified_user: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize: sequelizeConnection,
    tableName: 'reviews',
    timestamps: true,
    createdAt: 'created',
    updatedAt: 'updated',
    underscored: true,
  }
);

export default ReviewsModel;
