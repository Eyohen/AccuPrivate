// Import necessary modules from Sequelize
import { Dialect, DataTypes } from 'sequelize'
import { Sequelize } from 'sequelize-typescript';
import logger from '../utils/Logger';
import { DB_CONFIG } from '../utils/Constants';

// Create a new Sequelize instance for database connection and add Models
const Database = new Sequelize(DB_CONFIG.URL, {
    logging: false
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
