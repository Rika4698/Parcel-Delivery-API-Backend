import express, { Request, Response } from "express";
import cors from "cors";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import { notFound } from "./app/middlewares/notFound";
import { router } from "./app/routes";
import expressSession from 'express-session';
import { envVars } from "./app/config/env";
import './app/config/passport';
import passport from "passport";
import cookieParser from "cookie-parser";


const app = express();
app.set('trust proxy', true);

app.use(expressSession({
    secret: envVars.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
})
);

app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());


app.use(express.json());

app.use(express.urlencoded({ extended: true }));
const allowedOrigins = [envVars.FRONTEND_URL, "http://localhost:5173", "http://localhost:3000"];

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin) return callback(null, true);

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            // Allow dynamic Vercel preview deployments
            if (origin.endsWith('.vercel.app')) {
                return callback(null, true);
            }

            callback(new Error('Not allowed by CORS'));
        },
        credentials: true,
    })
);

app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        message: 'Welcome to Parcel Delivery API',
    });

});

app.use(globalErrorHandler)
app.use(notFound)


export default app;