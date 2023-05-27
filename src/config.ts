import dotenv from "dotenv";
import path from "path";
import { __dirname } from "./utils/path.js";

dotenv.config({ path: path.join(__dirname, "../", ".env") });

const config = {
	ENV: process.env.ENV || "development",
	HOST: process.env.HOST || "0.0.0.0",
	PORT: process.env.PORT || "4000",
	DB_CONNECTION_STRING: process.env.DB_CONNECTION_STRING || "",
	POSTGRES_DATABASE: process.env.POSTGRES_DATABASE || "identity",
	POSTGRES_USER: process.env.POSTGRES_USER || "identity_user",
	POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD || "",
};

export default config;
