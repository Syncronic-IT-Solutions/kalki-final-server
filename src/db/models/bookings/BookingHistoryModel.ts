import { DataTypes, Model, Optional } from 'sequelize';
import sequelizeConnection from '../../config';
import PujaModel from '../pujas/PujaModel';
import ReviewsModel from '../pujas/ReviewsModel';
import UserModel from '../users/usersModel';
import PujaDatesModel from '../pujas/pujaDatesModel';
import AssignedTasksModel from '../agent/AssignedTasks';
import AgentDetailsModel from '../agent/AgentDetails';

// Define attributes interface
interface BookingHistoryAttributes {
  booking_id: string;
  userid: string;
  puja_id: string;
  puja_date: Date;
  puja_name: string;
  package_id: string;
  package_name: string;
  devotee_names: string[];
  devotee_gothra: string[];
  devotee_date_of_birth: Date[];
  special_instructions: string | null;
  amount: number;
  discount_amount: number;
  coupon_code: string | null;
  total_amount: number;
  shipping_address: any | null;
  billing_address: any | null;
  is_shipping_address_same_as_billing: boolean;
  booking_status: string;
  puja_status: string;
  payment_method: string;
  payment_reference: string; // Fixed typo here
  completed_image_url_path: string | null;
  completed_video_url_path: string | null;
}

// Define input and output interfaces
export interface BookingHistoryInput extends Optional<
  BookingHistoryAttributes,
  | 'booking_id'
  | 'coupon_code'
  | 'shipping_address'
  | 'billing_address'
  | 'booking_status'
  | 'puja_status'
  | 'special_instructions'
  | 'is_shipping_address_same_as_billing'
  | 'payment_reference' // Fixed typo here as well
  | 'completed_image_url_path'
  | 'completed_video_url_path'
> {}

export interface BookingHistoryOutput extends Required<BookingHistoryAttributes> {}

class BookingHistoryModel
  extends Model<BookingHistoryAttributes, BookingHistoryInput>
  implements BookingHistoryAttributes
{
  public booking_id!: string;
  public userid!: string;
  public puja_id!: string;
  public puja_date!: Date;
  public puja_name!: string;
  public package_id!: string;
  public package_name!: string;
  public devotee_names!: string[];
  public devotee_gothra!: string[];
  public devotee_date_of_birth!: Date[];
  public special_instructions!: string | null;
  public amount!: number;
  public discount_amount!: number;
  public coupon_code!: string | null;
  public total_amount!: number;
  public shipping_address!: any | null;
  public billing_address!: any | null;
  public is_shipping_address_same_as_billing!: boolean;
  public booking_status!: string;
  public puja_status!: string;
  public payment_method!: string;
  public payment_reference!: string; // Corrected typo here
  public completed_image_url_path!: string | null;
  public completed_video_url_path!: string | null;

  // Sequelize timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public user!: UserModel;
  public puja!: PujaModel;
  public pujaDates!: PujaDatesModel[]; // Corrected naming
  public reviews!: ReviewsModel[];
  public assignedTasks!: AssignedTasksModel[];
  public agentdetails!: AgentDetailsModel[];
    packages: any;

  public static associate() {
    BookingHistoryModel.belongsTo(UserModel, { foreignKey: 'userid', as: 'user' });
    BookingHistoryModel.belongsTo(PujaModel, { foreignKey: 'puja_id', as: 'puja' });

    BookingHistoryModel.hasMany(PujaDatesModel, { foreignKey: 'booking_id', as: 'pujaDates' });~

    BookingHistoryModel.hasMany(ReviewsModel, { foreignKey: 'booking_id', as: 'reviews' });
    BookingHistoryModel.hasMany(AssignedTasksModel, { foreignKey: 'booking_id', as: 'assignedTasks' });
    BookingHistoryModel.hasMany(AgentDetailsModel, { foreignKey: 'booking_id', as: 'agentDetails' });
  }
}

BookingHistoryModel.init(
  {
    booking_id: {
      type: DataTypes.STRING(20),
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
    puja_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    puja_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    package_id: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    package_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    devotee_names: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
    },
    devotee_gothra: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
    },
    devotee_date_of_birth: {
      type: DataTypes.ARRAY(DataTypes.DATEONLY),
      allowNull: false,
    },
    special_instructions: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    discount_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    coupon_code: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    shipping_address: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    billing_address: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    is_shipping_address_same_as_billing: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    booking_status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'pending',
    },
    puja_status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'pending',
    },
    payment_method: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    payment_reference: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    completed_image_url_path: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    completed_video_url_path: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize: sequelizeConnection,
    tableName: 'booking_history',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
  }
);

export default BookingHistoryModel;
