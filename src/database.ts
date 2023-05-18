import Knex from "knex";
import config from "./config";

const knex = Knex({
	client: "pg",
	connection: {
		host: "127.0.0.1",
		port: 5432,
		user: config.POSTGRES_USER,
		password: config.POSTGRES_PASSWORD,
		database: config.POSTGRES_DATABASE,
	},
});

export default knex;
