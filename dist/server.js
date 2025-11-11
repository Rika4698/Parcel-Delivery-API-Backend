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
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app"));
const env_1 = require("./app/config/env");
const createAdmin_1 = require("./app/utils/createAdmin");
let server;
const port = Number(env_1.envVars.PORT) || 5000;
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose_1.default.connect(env_1.envVars.DB_URL);
        console.log("Connected to DB !!");
        // server = app.listen(port, "0.0.0.0", () => {
        //     console.log(`Server is listening to port ${port}`);
        // });
        server = app_1.default.listen(port, "0.0.0.0", function () {
            console.log(`Server is listening to port ${port}`);
        });
    }
    catch (error) {
        console.log(error);
    }
});
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield startServer();
    yield (0, createAdmin_1.createAdmin)();
}))();
process.on('SIGTERM', () => {
    console.log('SIGTERM signal signal received. Shutting down the server gracefully..');
    if (server) {
        server.close(() => {
            console.log("Server closed.");
            process.exit(1);
        });
    }
    process.exit(1);
});
process.on('SIGINT', () => {
    console.log('SIGINT signal received. Shutting down the server gracefully..');
    if (server) {
        server.close(() => {
            console.log("Server closed");
            process.exit(1);
        });
    }
    process.exit(1);
});
process.on('unhandledRejection', err => {
    console.log('Unhandled Promise Rejection detected. Shutting down the server..', err);
    if (server) {
        server.close(() => {
            console.log("Server closed");
            process.exit(1);
        });
    }
    process.exit(1);
});
process.on('uncaughtException', err => {
    console.log("Uncaught Exception detected. Shutting down the server..", err);
    if (server) {
        server.close(() => {
            console.log("Server closed");
            process.exit(1);
        });
    }
    process.exit(1);
});
