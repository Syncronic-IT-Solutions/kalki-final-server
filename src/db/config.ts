import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

function getConnection() {
  // Use environment variables for database credentials
  const sequelize = new Sequelize({
    database: process.env.DB_NAME || 'kalkinewdatabase',   // Default to 'newdatabasekalki' if not found in .env
    username: process.env.DB_USER || 'postgres',          // Default to 'postgres' if not found in .env
    password: process.env.DB_PASSWORD || 'admin',        // Default to 'admin' if not found in .env
    host: process.env.DB_HOST || 'localhost',            // Default to 'localhost' if not found in .env
    port: Number(process.env.DB_PORT) || 5432,           // Default to 5432 if not found in .env
    dialect: 'postgres',
    logging: false, // Disable logging if you don't want to log all SQL queries
  });

  // Test connection
  sequelize.authenticate()
    .then(() => {
      console.log('Database connected successfully.');
    })
    .catch((error) => {
      console.error('Unable to connect to the database:', error);
      process.exit(1); // Exit the process if the connection fails
    });

  return sequelize;
}

// Assign the return value of getConnection to sequelizeConnection
const sequelizeConnection = getConnection();

// Optionally sync the models (usually done once at the start of the application)
sequelizeConnection.sync({ force: false }).then(() => {
  console.log('Database sync complete!');
}).catch((error) => {
  console.error('Error syncing database:', error);
});

export default sequelizeConnection;
