import app from "./app";
import KafkaService from "./kafka";
import { initiateDB, Database } from "./models";
import logger from "./utils/Logger";

// Asynchronous function to start the server
async function startServer(): Promise<void> {
    try {
        // Initialize the database (You may want to add a comment describing what "initiateDB" does)
        await initiateDB(Database);

        await KafkaService.start()

        // Synchronize the database (you may want to add options like force: true to reset the database)
        await Database.sync({ alter: true });

        // Start the server and listen on port 3000
        app.listen(process.env.PORT || 3000, () => {
            logger.info("Server Started on Port 3000");
        });
    } catch (err) {
        console.error(err)
        // Log any errors that occur during server startup
        logger.error(err); 5
        // Exit the process with a non-zero status code to indicate an error
        process.exit(1);
    }
}

// Call the function to start the server
startServer();