import { DataTypes, Model, Optional } from 'sequelize';
import sequelizeConnection from '../../config';

// Define the attributes for the Temples model
interface TemplesAttributes {
  temple_id: number;
  temple_name: string;
  temple_location: string | null;
  temple_description: string | null;
  phone_number: string | null;
  email: string | null;
  website: string | null;
  opening_hours: string | null;
  latitude: number | null;
  longitude: number | null;
  temple_thumbnail: string | null; // New column for temple image thumbnail
  temple_images_url: string[] | null; // New column for storing temple images URLs
  temple_video_url: string[] | null; // New column for storing temple video URLs
  history: string | null; // History of the temple
  facilities: string[] | null; // List of available facilities as array of strings
  festivals: string[] | null; // List of festivals celebrated at the temple
  status: string;
}

// Define the input type for optional fields
export interface TemplesInput extends Optional<
  TemplesAttributes, 
  'temple_id' | 'temple_location' | 'temple_description' | 'phone_number' | 
  'email' | 'website' | 'opening_hours' | 'latitude' | 'longitude' | 
  'temple_thumbnail' | 'temple_images_url' | 'temple_video_url' | 'history' | 
   'facilities' | 'festivals' | 'status'> {}

// Define the output type for required fields
export interface TemplesOutput extends Required<TemplesAttributes> {}

class TemplesModel extends Model<TemplesAttributes, TemplesInput> implements TemplesAttributes {
  public temple_id!: number;
  public temple_name!: string;
  public temple_location!: string | null;
  public temple_description!: string | null;
  public phone_number!: string | null;
  public email!: string | null;
  public website!: string | null;
  public opening_hours!: string | null;
  public latitude!: number | null;
  public longitude!: number | null;
  public temple_thumbnail!: string | null;
  public temple_images_url!: string[] | null; // New column for temple image URLs
  public temple_video_url!: string[] | null; // New column for temple video URLs
  public history!: string | null; // History of the temple
  public facilities!: string[] | null; // List of available facilities
  public festivals!: string[] | null; // List of festivals
  public status!: string;

  // Timestamps (createdAt and updatedAt)
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize the model
TemplesModel.init(
  {
    temple_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    temple_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    temple_location: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    temple_description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    phone_number: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    website: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    opening_hours: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    latitude: {
      type: DataTypes.DECIMAL(9, 6),
      allowNull: true,
    },
    longitude: {
      type: DataTypes.DECIMAL(9, 6),
      allowNull: true,
    },
    temple_thumbnail: {
      type: DataTypes.STRING(255), // Store image URL as a string
      allowNull: true,
    },
    temple_images_url: {
      type: DataTypes.ARRAY(DataTypes.STRING), // Array of strings for multiple image URLs
      allowNull: true,
    },
    temple_video_url: {
      type: DataTypes.ARRAY(DataTypes.STRING), // Array of strings for multiple video URLs
      allowNull: true,
    },
    history: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    facilities: {
      type: DataTypes.ARRAY(DataTypes.STRING), // Array of strings for multiple facilities
      allowNull: true,
    },
    festivals: {
      type: DataTypes.ARRAY(DataTypes.STRING), // Array of strings for multiple festivals
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'active',
    },
  },
  {
    sequelize: sequelizeConnection,
    tableName: 'temples',
    timestamps: true, // Enable timestamps to handle createdAt and updatedAt
    createdAt: 'created',  // Map Sequelize's createdAt to created
    updatedAt: 'updated',  // Map Sequelize's updatedAt to updated
    underscored: true, // Use snake_case for column names
  }
);

export default TemplesModel;
export { TemplesAttributes };
