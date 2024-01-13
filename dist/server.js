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
const app_1 = __importDefault(require("./app"));
const kafka_1 = __importDefault(require("./kafka"));
const models_1 = require("./models");
const Logger_1 = __importDefault(require("./utils/Logger"));
// Asynchronous function to start the server
function startServer() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Initialize the database (You may want to add a comment describing what "initiateDB" does)
            yield (0, models_1.initiateDB)(models_1.Database);
            yield kafka_1.default.start();
            console.log('Kafka Connected Successfully');
            // Synchronize the database (you may want to add options like force: true to reset the database)
            yield models_1.Database.sync({ alter: true });
            console.log('Database Sync Completed');
            // Start the server and listen on port 3000
            app_1.default.listen(process.env.PORT || 3000, () => {
                Logger_1.default.info("Server Started on Port 3000");
                console.log('Server Connected Successfully');
            });
        }
        catch (err) {
            console.error(err);
            // Log any errors that occur during server startup
            Logger_1.default.error(err);
            // Exit the process with a non-zero status code to indicate an error
            process.exit(1);
        }
    });
}
// Call the function to start the server
startServer();
