import 'express-async-errors'
// Import required modules and dependencies
import express, { Request, Response } from "express";
import errorHandler from "./middlewares/ErrorHandler";
import { Database, initiateDB } from "./models";
import bodyParser from "body-parser";
import cors from 'cors';
import router from "./routes/Routes";
import { BAXI_TOKEN } from "./utils/Constants";
import morgan from 'morgan'
import logger from "./utils/Logger";
import helmet from 'helmet';

// Create an Express application
const app = express();

app.use(helmet())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())
app.use(morgan('dev'))

// Define a route for health checks
app.get('/healthcheck', async (req: Request, res: Response) => {
    // Respond with a JSON message indicating server status
    res.status(200).json({
        status: "success",
        message: "Server is working",
    });
});

app.use('/api/v0', router)

app.use(errorHandler)
app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Route not found'
    })
})


// Asynchronous function to start the server
async function startServer(): Promise<void> {
    try {
        // Initialize the database (You may want to add a comment describing what "initiateDB" does)
        await initiateDB(Database);

        // Synchronize the database (you may want to add options like force: true to reset the database)
        await Database.sync();

        // Start the server and listen on port 3000
        app.listen(process.env.PORT || 3000, () => {
            logger.info("Server Started on Port 3000");
        });
    } catch (err) {
        console.error(err)
        // Log any errors that occur during server startup
        logger.error(err);
        // Exit the process with a non-zero status code to indicate an error
        process.exit(1);
    }
}

// Call the function to start the server
startServer();
