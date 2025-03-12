import { DataTypes, Model, Optional } from 'sequelize';
import sequelizeConnection from '../../config'; // Your sequelize connection
import UserModel from '../users/usersModel'; // Adjust the path to the user model
import CouponModel from '../coupons/CouponModel'; // Adjust the path to the coupon model

interface UserCouponUsageAttributes {
  id: number; // Auto-incremented ID for the usage record
  userid: string; // User ID (string or UUID)
  coupon_id: number; // Coupon ID (linked to the Coupon model)
  usage_count: number; // The number of times the user has used the coupon
  created_at: Date;
  updated_at: Date;
}

// Optional: Exclude 'id', 'created_at', and 'updated_at' for when creating records
export interface UserCouponUsageInput extends Optional<UserCouponUsageAttributes, 'id' | 'created_at' | 'updated_at'> {}

export interface UserCouponUsageOutput extends Required<UserCouponUsageAttributes> {}

class UserCouponUsageModel extends Model<UserCouponUsageAttributes, UserCouponUsageInput> implements UserCouponUsageAttributes {
  public id!: number;
  public userid!: string;
  public coupon_id!: number; // Adjusted to number to match CouponModel's coupon_id type
  public usage_count!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

UserCouponUsageModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    userid: {
      type: DataTypes.STRING(50), // Adjusted length for string-based user IDs (e.g., UUID or alphanumeric)
      allowNull: false,
      references: {
        model: UserModel, // References the User model
        key: 'userid', // Assuming 'userid' is the primary key in the User model
      },
    },
    coupon_id: {
      type: DataTypes.INTEGER, // Adjusted to INTEGER for auto-incremented coupon_id from CouponModel
      allowNull: false,
      references: {
        model: CouponModel, // References the Coupon model
        key: 'coupon_id', // Assuming 'coupon_id' is the primary key in the Coupon model
      },
    },
    usage_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0, // Default to 0 when a coupon is first used
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize: sequelizeConnection, // Ensure correct sequelize connection
    tableName: 'user_coupon_usages', // The table name
    timestamps: true, // Enable automatic createdAt and updatedAt fields
    createdAt: 'created_at', // Use custom names for timestamps
    updatedAt: 'updated_at', // Use custom names for timestamps
    underscored: true, // Use snake_case for column names (created_at, updated_at)
  }
);

export default UserCouponUsageModel;
export { UserCouponUsageAttributes };
