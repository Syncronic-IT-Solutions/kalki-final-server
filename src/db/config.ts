import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

function getConnection() {
  // Use environment variables for database credentials
  const sequelize = new Sequelize('kalkiseva', 'postgres', 'admin', {
    host: 'localhost',
    port: 5432,
    dialect: 'postgres',
    logging: false
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

const sequelizeConnection = getConnection();

sequelizeConnection.sync({ force: false }).then(() => {
  console.log('Database sync complete!');
}).catch((error) => {
  console.error('Error syncing database:', error);
});




export default sequelizeConnection;
