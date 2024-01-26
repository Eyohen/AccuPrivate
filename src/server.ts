import app from "./app";
import KafkaService from "./kafka";
import { initiateDB, Database } from "./models";
import logger from "./utils/Logger";
require('newrelic');

// Asynchronous function to start the server
async function startServer(): Promise<void> {
    try {
        // Initialize the database (You may want to add a comment describing what "initiateDB" does)
        await initiateDB(Database);

        await KafkaService.start()
        console.log('Kafka Connected Successfully')

        // Synchronize the database (you may want to add options like force: true to reset the database)
        await Database.sync({ alter: true });
        console.log('Database Sync Completed')

        // Start the server and listen on port 3000
        app.listen(process.env.PORT || 3000, () => {
            logger.info("Server Started on Port 3000");
            console.log('Server Connected Successfully')
        });
    } catch (err) {
        console.error(err)
        // Log any errors that occur during server startup
        logger.error(err); 
        // Exit the process with a non-zero status code to indicate an error
        process.exit(1);
    }


    var logStream = require('fs').createWriteStream('./logFile.log', {flags: 'a'});

    
}

// Call the function to start the server
startServer();