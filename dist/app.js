"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("express-async-errors");
// Import required modules and dependencies
const express_1 = __importDefault(require("express"));
const ErrorHandler_1 = __importDefault(require("./middlewares/ErrorHandler"));
const models_1 = require("./models");
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = __importDefault(require("./routes"));
const Constants_1 = require("./utils/Constants");
const morgan_1 = __importDefault(require("morgan"));
const Logger_1 = __importDefault(require("./utils/Logger"));
const helmet_1 = __importDefault(require("helmet"));
// Create an Express application
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)('dev'));
// Define a route for health checks
app.get('/healthcheck', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Respond with a JSON message indicating server status
    res.status(200).json({
        status: "success",
        message: "Server is working",
    });
}));
app.use('/api/v0', routes_1.default);
console.log(Constants_1.NODE_ENV);
app.use(ErrorHandler_1.default);
app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Route not found'
    });
});
// Asynchronous function to start the server
function startServer() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Initialize the database (You may want to add a comment describing what "initiateDB" does)
            yield (0, models_1.initiateDB)(models_1.Database);
            // Synchronize the database (you may want to add options like force: true to reset the database)
            yield models_1.Database.sync({ alter: true });
            // Start the server and listen on port 3000
            app.listen(process.env.PORT || 3000, () => {
                Logger_1.default.info("Server Started on Port 3000");
            });
        }
        catch (err) {
            console.error(err);
            // Log any errors that occur during server startup
            Logger_1.default.error(err);
            5;
            // Exit the process with a non-zero status code to indicate an error
            process.exit(1);
        }
    });
}
// Call the function to start the server
startServer();
