import Provider, { Configuration } from "oidc-provider";
import config from "./config.js";
import path from "path";
import fs from "fs";
import { promisify } from "util";
import { getUserByEmail } from "./services/user.service.js";

const readFileAsync = promisify(fs.readFile);

const clients = await readFileAsync(
	path.join(config.CONFIG_FOLDER_PATH, "clients.json"),
	"utf-8"
);

const configuration: Configuration = {
	clients: JSON.parse(clients),
	clientBasedCORS(ctx, origin, client) {
		return true;
	},
	async findAccount(ctx, sub) {
		const user = await getUserByEmail(sub);

		if (user.data === null) return undefined;

		return {
			accountId: sub,
			claims(use, scope, claims, rejected) {
				return {
					sub,
					user: user.data,
				};
			},
		};
	},
};

const oidc = new Provider(
	`http://${config.HOST}:${config.PORT}`,
	configuration
);

export default oidc;
