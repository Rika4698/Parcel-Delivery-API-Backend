"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.envVars = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const loadEnvVariables = () => {
    const requiredEnvVariables = ["PORT", "DB_URL", "NODE_ENV", "BCRYPT_SALT_ROUND", "JWT_ACCESS_EXPIRES", "JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET", "JWT_REFRESH_EXPIRES", "ADMIN_EMAIL", "ADMIN_PASSWORD", "ADMIN_NAME", "GOOGLE_CLIENT_SECRET", "GOOGLE_CLIENT_ID", "GOOGLE_CALLBACK_URL", "EXPRESS_SESSION_SECRET", "FRONTEND_URL", "SMTP_PASS", "SMTP_PORT", "SMTP_HOST", "SMTP_USER", "SMTP_FROM"];
    requiredEnvVariables.forEach(key => {
        if (!process.env[key]) {
            throw new Error(`Missing require environment variable ${key}`);
        }
    });
    return {
        PORT: process.env.PORT,
        DB_URL: process.env.DB_URL,
        NODE_ENV: process.env.NODE_ENV,
        BCRYPT_SALT_ROUND: Number(process.env.BCRYPT_SALT_ROUND),
        JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
        JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES,
        JWT_REFRESH_SECRET: process.env.JWT_REFRESH_Secret,
        JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES,
        ADMIN_EMAIL: process.env.ADMIN_EMAIL,
        ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
        ADMIN_NAME: process.env.ADMIN_NAME,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
        GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
        EXPRESS_SESSION_SECRET: process.env.EXPRESS_SESSION_SECRET,
        FRONTEND_URL: process.env.FRONTEND_URL,
        EMAIL_SENDER: {
            SMTP_FROM: process.env.SMTP_FROM,
            SMTP_PASS: process.env.SMTP_PASS,
            SMTP_PORT: process.env.SMTP_PORT,
            SMTP_HOST: process.env.SMTP_HOST,
            SMTP_USER: process.env.SMTP_USER,
        },
    };
};
exports.envVars = loadEnvVariables();
