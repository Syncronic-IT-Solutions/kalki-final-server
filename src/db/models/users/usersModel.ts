import { DataTypes, Model, Optional } from 'sequelize';
import sequelizeConnection from '../../config';  // Adjust this import as per your file structure

// Define the attributes for the User model
interface UserAttributes {
  userid: string;
  phonenumber: string;
  password: string;
  email: string;
  username: string | null;
  otp_verified: boolean;
  profile_pic_url: string | null;
  gender: string | null;
  address: string | null;
  status: string;
}

// Define the input type for optional fields
export interface UserInput extends Optional<UserAttributes, 'userid' | 'username' | 'otp_verified' | 'profile_pic_url' | 'gender' | 'address' | 'status'> {}

// Define the output type for required fields
export interface UserOutput extends Required<UserAttributes> {}

class UserModel extends Model<UserAttributes, UserInput> implements UserAttributes {
  public userid!: string;
  public phonenumber!: string;
  public password!: string;
  public email!: string;
  public username!: string | null;
  public otp_verified!: boolean;
  public profile_pic_url!: string | null;
  public gender!: string | null;
  public address!: string | null;
  public status!: string;

  // Timestamps (createdAt and updatedAt)
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Define the associations between User and BookingHistory, and Review
  static associate(models: any) {
    UserModel.hasMany(models.BookingHistoryModel, {
      foreignKey: 'userid',
      as: 'bookings',
    });

    UserModel.hasMany(models.ReviewsModel, {  // Add this association
      foreignKey: 'userid',
      as: 'reviews',
    });
  }
}

// Initialize the model
UserModel.init(
  {
    userid: {
      type: DataTypes.STRING(20),  // Change to string with a max length
      allowNull: false,
      primaryKey: true,  // Make userid the primary key
      unique: true, // Ensure it is unique
    },
    phonenumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    username: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: 'Kalki Seva Bhakth', // Set default username value
    },
    otp_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    profile_pic_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    gender: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'active',
    }
  },
  {
    sequelize: sequelizeConnection,
    tableName: 'users', // Ensure this matches the actual table name in your DB
    timestamps: true, // Enable createdAt and updatedAt columns
    createdAt: 'created', // Map Sequelize's `createdAt` to `created`
    updatedAt: 'updated', // Map Sequelize's `updatedAt` to `updated`
    underscored: true, // Optionally use snake_case for column names
  }
);

export default UserModel;
export { UserAttributes };
