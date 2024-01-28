import 'express-async-errors'
import express, { Request, Response } from "express";
import errorHandler from "./middlewares/ErrorHandler";
import bodyParser from "body-parser";
import cors from 'cors';
import router from "./routes";
import morgan from 'morgan'
import helmet from 'helmet';
require('newrelic');
import { createWriteStream } from 'fs';
import { join } from 'path';
const app = express();

app.use(helmet())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())
// create a write stream (in append mode)
var accessLogStream = createWriteStream(join(__dirname, 'access.log'), { flags: 'a' })

// app.use(morgan('combined', { stream: accessLogStream }))
app.use(morgan('dev'))

app.get('/healthcheck', async (req: Request, res: Response) => {
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

export default app;

