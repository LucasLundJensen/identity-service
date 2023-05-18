import type { Knex } from "knex";
import config from "./config";

const databaseConfig: { [key: string]: Knex.Config } = {
	development: {
		client: "postgresql",
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
		},
	},

	staging: {
		client: "postgresql",
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
		},
	},

	production: {
		client: "postgresql",
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
		},
	},
};

module.exports = databaseConfig;
