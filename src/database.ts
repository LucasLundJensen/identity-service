import Knex from "knex";
import config from "./config.js";

const knex = Knex.default({
	client: "pg",
	connection: {
		host: "database",
		port: 5432,
		user: config.POSTGRES_USER,
		password: config.POSTGRES_PASSWORD,
		database: config.POSTGRES_DATABASE,
	},
});

export default knex;
