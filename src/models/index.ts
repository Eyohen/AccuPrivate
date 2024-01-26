// Import necessary modules from Sequelize
import Redis from 'ioredis'
import { Dialect, DataTypes } from 'sequelize'
import { Sequelize } from 'sequelize-typescript';
import logger from '../utils/Logger';
import { DB_CONFIG, REDIS_HOST, REDIS_PASSWORD, REDIS_PORT, REDIS_URL } from '../utils/Constants';

console.log(DB_CONFIG.URL)
// Create a new Sequelize instance for database connection and add Models
const Database = new Sequelize(DB_CONFIG.URL, {
    logging: true,
    pool:{
        max: 20,
        min: 1,
        idle: 5000,
    }
});


// Asynchronous function to initiate the database connection
async function initiateDB(db: Sequelize): Promise<void> {
    try {
        // Attempt to authenticate the database connection
        await db.authenticate();

        // Add all Sequelize models in the specified directory for ts files
        await db.addModels([__dirname + '/**/*.model.ts']);

        // Add all Sequelize models in the specified directory for js files
        await db.addModels([__dirname + '/**/*.model.js']);

        // Log a success message when the connection is established
        logger.info('Connection has been established successfully.');
    } catch (error) {
        console.log(error)
        // Handle errors if unable to connect to the database
        logger.error('Unable to connect to the database:', error);
    }
}

const redisClient = new Redis(REDIS_URL)
console.log(REDIS_URL)

redisClient.on('error', (error) => {
    logger.info('An error occured while connecting to REDIS')
    console.error(error)
    logger.error(error)
    process.exit(1)
})

redisClient.on('connect', () => {
    logger.info('Connection to REDIS database successful')
})

// Export Sequelize, the Database instance, the initiateDB function, and DataTypes for use in other parts of the application
export { Sequelize, Database, initiateDB, DataTypes, redisClient }
