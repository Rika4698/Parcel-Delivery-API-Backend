import {Server} from "http";
import mongoose from "mongoose";
import app from "./app";
import { envVars } from "./app/config/env";



let server : Server;

const startServer = async () => {
    try{
        await mongoose.connect(envVars.DB_URL)
        console.log("Connected to DB !!");

        server = app.listen(envVars.PORT, () => {
            console.log(`Server is listening to port ${envVars.PORT}`);
        });
    } catch (error ){
        console.log(error);
    }
};

(async () => {
    await startServer();
})();

process.on('SIGTERM', () => {
    console.log(
        'SIGTERM signal signal received. Shutting down the server gracefully..'
    );
    if(server){
        server.close(() => {
            console.log("Server closed.");
            process.exit(1);
        });
    }
    process.exit(1);
});

process.on('SIGINT', () => {
    console.log(
        'SIGINT signal received. Shutting down the server gracefully..'
    );
    if(server) {
        server.close(() => {
            console.log("Server closed");
            process.exit(1);
        });
    }
    process.exit(1);
});

process.on('unhandledRejection', err =>{
    console.log(
        'Unhandled Promise Rejection detected. Shutting down the server..',
        err
    );

    if(server) {
        server.close(() => {
            console.log("Server closed");
            process.exit(1);
        });
    }
    process.exit(1);
});

process.on('uncaughtException', err => {
    console.log("Uncaught Exception detected. Shutting down the server..", err);

    if(server) {
        server.close(() => {
            console.log("Server closed");
            process.exit(1);
        });
    }

    process.exit(1);
});