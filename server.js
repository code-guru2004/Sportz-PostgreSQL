import dotenv from "dotenv";

dotenv.config({
    path: "./.env"
});

import http from "http";
import app from "./src/app.js";

const PORT = process.env.PORT || 5000;

/*
|--------------------------------------------------------------------------
| Initialize Server
|--------------------------------------------------------------------------
*/

const startServer = async () => {
    try {
        /*
        |--------------------------------------------------------------------------
        | Create HTTP Server
        |--------------------------------------------------------------------------
        */

        const server = http.createServer(app);

        /*
        |--------------------------------------------------------------------------
        | Start Listening
        |--------------------------------------------------------------------------
        */

        server.listen(PORT, () => {
            console.log(`
=================================
Server Running Successfully
=================================
Port: ${PORT}
Environment: ${process.env.NODE_ENV}
=================================
            `);
        });

        /*
        |--------------------------------------------------------------------------
        | Handle Unhandled Promise Rejections
        |--------------------------------------------------------------------------
        */

        process.on(
            "unhandledRejection",
            (error) => {
                console.log(`
=================================
Unhandled Rejection
=================================
${error.message}
=================================
                `);
                server.close(() => {
                    process.exit(1);
                });
            }
        );

        /*
        |--------------------------------------------------------------------------
        | Handle Uncaught Exceptions
        |--------------------------------------------------------------------------
        */

        process.on(
            "uncaughtException",
            (error) => {
                console.log(`
=================================
Uncaught Exception
=================================
${error.message}
=================================
                `);
                process.exit(1);
            }
        );

    } catch (error) {
        console.log(`
=================================
Server Startup Failed
=================================
${error.message}
=================================
        `);
        process.exit(1);
    }
};

startServer();