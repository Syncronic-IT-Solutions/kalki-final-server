"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");

function getConnection() {
    // Use hardcoded database credentials
    const sequelize = new sequelize_1.Sequelize(
        'kalki-seva-database',  // Database name
        'kalkiuser',             // Database username
        'Kalki@1234',            // Database password
        {
            host: 'kalki-seva-database.cp4iy4yycx9p.ap-south-1.rds.amazonaws.com', // Database host
            port: 5432,  // Database port
            dialect: 'postgres',
            logging: false,
        }
    );

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

exports.default = sequelizeConnection;
