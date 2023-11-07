// Import necessary modules from Sequelize
import { Dialect, DataTypes } from 'sequelize'
import { Sequelize } from 'sequelize-typescript';
import logger from '../utils/Logger';
// Define database connection parameters
const db: string = 'accuvend'; // Database name
const user: string = 'postgres'; // Database user
const pass: string = 'postgres'; // Database password
const port: number = 5432; // Database port
const dialect: Dialect = 'postgres'; // Database dialect (PostgreSQL)
const host: string = 'localhost'; // Database host

// Create a new Sequelize instance for database connection and add Models
const Database = new Sequelize(db, user, pass, {
    host: host,
    dialect: dialect,
    port: port,
    logging: false,
});

// Asynchronous function to initiate the database connection
async function initiateDB(db: Sequelize): Promise<void> {
    try {
        // Attempt to authenticate the database connection
        await db.authenticate();

        // Add all Sequelize models in the specified directory
        await db.addModels([__dirname + '/**/*.model.ts']);

        // Log a success message when the connection is established
        logger.info('Connection has been established successfully.');
    } catch (error) {
        // Handle errors if unable to connect to the database
        logger.error('Unable to connect to the database:', error);
    }
}

// Export Sequelize, the Database instance, the initiateDB function, and DataTypes for use in other parts of the application
export { Sequelize, Database, initiateDB, DataTypes }
