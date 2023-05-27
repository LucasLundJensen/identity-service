import dotenv from "dotenv";
import path from "path";
import * as url from "url";
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

dotenv.config({ path: path.join(__dirname, "../", ".env") });

const config = {
	ENV: process.env.ENV || "development",
	PORT: process.env.PORT || "4000",
	DB_CONNECTION_STRING: process.env.DB_CONNECTION_STRING || "",
	POSTGRES_DATABASE: process.env.POSTGRES_DATABASE || "identity",
	POSTGRES_USER: process.env.POSTGRES_USER || "identity_user",
	POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD || "",
};

export default config;
