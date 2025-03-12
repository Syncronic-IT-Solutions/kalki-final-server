import { DataTypes, Model, Optional } from 'sequelize';
import sequelizeConnection from '../../config'; // Your sequelize connection

interface CouponAttributes {
  coupon_id: number;
  coupon_code: string;
  description: string;
  discount_type: string;  // No need to make it optional if it’s required in the API
  discount_percentage?: number;
  maximum_discount_amount?: number;
  discount_amount: number;
  valid_from: Date;
  valid_to: Date;
  status: string;
  usage_limit_per_user: number;
  created_at: Date;
  updated_at: Date;
}

// Define the input type for optional fields (coupon_id is auto-generated and status has a default value)
export interface CouponInput extends Optional<CouponAttributes, 'coupon_id' | 'status'> {}

// Define the output type for required fields
export interface CouponOutput extends Required<CouponAttributes> {}

class CouponModel extends Model<CouponAttributes, CouponInput> implements CouponAttributes {
  public coupon_id!: number;
  public coupon_code!: string;
  public description!: string;
  public discount_type!: string;
  public discount_percentage?: number;
  public maximum_discount_amount?: number;
  public discount_amount!: number;
  public valid_from!: Date;
  public valid_to!: Date;
  public status!: string;
  public usage_limit_per_user!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

CouponModel.init(
  {
    coupon_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      unique: true,
      autoIncrement: true, // Auto-increment enabled
    },
    coupon_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true, // Ensure the coupon code is unique
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    discount_type: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        isIn: [['percentage', 'fixed']], // Restrict to only 'percentage' or 'fixed'
      },
    },
    discount_percentage: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: {
        min: 0,
        max: 100,
      },
    },
    maximum_discount_amount: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: {
        min: 0,
      },
    },
    discount_amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    valid_from: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    valid_to: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'active', // Default value for status
    },
    usage_limit_per_user: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1, // Default limit of one time per user
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW, // Automatically set the current timestamp
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW, // Automatically set the current timestamp
    },
  },
  {
    sequelize: sequelizeConnection, // Ensure connection to the database
    tableName: 'coupons', // The name of the table for coupons
    timestamps: true, // Enable automatic createdAt and updatedAt fields
    createdAt: 'created_at', // Rename the default createdAt column to created_at
    updatedAt: 'updated_at', // Rename the default updatedAt column to updated_at
    underscored: true, // Use snake_case for column names (e.g., created_at, updated_at)
  }
);

export default CouponModel;
export { CouponAttributes };
