import type { Knex } from "knex";
import config from "./config.js";

const databaseConfig: { [key: string]: Knex.Config } = {
	development: {
		client: "pg",
		connection: {
			database: config.POSTGRES_DATABASE,
			user: config.POSTGRES_USER,
			password: config.POSTGRES_PASSWORD,
		},
		pool: {
			min: 2,
			max: 10,
		},
		migrations: {
			tableName: "knex_migrations",
			directory: "./migrations/",
		},
	},

	staging: {
		client: "pg",
		connection: {
			database: config.POSTGRES_DATABASE,
			user: config.POSTGRES_USER,
			password: config.POSTGRES_PASSWORD,
		},
		pool: {
			min: 2,
			max: 10,
		},
		migrations: {
			tableName: "knex_migrations",
			directory: "./migrations/",
		},
	},

	production: {
		client: "pg",
		connection: {
			database: config.POSTGRES_DATABASE,
			user: config.POSTGRES_USER,
			password: config.POSTGRES_PASSWORD,
		},
		pool: {
			min: 2,
			max: 10,
		},
		migrations: {
			tableName: "knex_migrations",
			directory: "./migrations/",
		},
	},
};

export default databaseConfig;
