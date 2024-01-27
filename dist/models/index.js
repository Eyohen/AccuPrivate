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
exports.redisClient = exports.DataTypes = exports.initiateDB = exports.Database = exports.Sequelize = void 0;
// Import necessary modules from Sequelize
const ioredis_1 = __importDefault(require("ioredis"));
const sequelize_1 = require("sequelize");
Object.defineProperty(exports, "DataTypes", { enumerable: true, get: function () { return sequelize_1.DataTypes; } });
const sequelize_typescript_1 = require("sequelize-typescript");
Object.defineProperty(exports, "Sequelize", { enumerable: true, get: function () { return sequelize_typescript_1.Sequelize; } });
const Logger_1 = __importDefault(require("../utils/Logger"));
const Constants_1 = require("../utils/Constants");
console.log(Constants_1.DB_CONFIG.URL);
// Create a new Sequelize instance for database connection and add Models
const Database = new sequelize_typescript_1.Sequelize(Constants_1.DB_CONFIG.URL, {
    logging: false,
    pool: {
        max: 20,
        min: 0,
        idle: 1000,
        acquire: 30000,
        evict: 10000,
    }
});
exports.Database = Database;
// Asynchronous function to initiate the database connection
function initiateDB(db) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Attempt to authenticate the database connection
            yield db.authenticate();
            // Add all Sequelize models in the specified directory for ts files
            yield db.addModels([__dirname + '/**/*.model.ts']);
            // Add all Sequelize models in the specified directory for js files
            yield db.addModels([__dirname + '/**/*.model.js']);
            // Log a success message when the connection is established
            Logger_1.default.info('Connection has been established successfully.');
        }
        catch (error) {
            console.log(error);
            // Handle errors if unable to connect to the database
            Logger_1.default.error('Unable to connect to the database:', error);
        }
    });
}
exports.initiateDB = initiateDB;
const redisClient = new ioredis_1.default(Constants_1.REDIS_URL);
exports.redisClient = redisClient;
console.log(Constants_1.REDIS_URL);
redisClient.on('error', (error) => {
    Logger_1.default.info('An error occured while connecting to REDIS');
    console.error(error);
    Logger_1.default.error(error);
    process.exit(1);
});
redisClient.on('connect', () => {
    Logger_1.default.info('Connection to REDIS database successful');
});
