import Provider, { Configuration } from "oidc-provider";
import config from "./config.js";
import clients from "../config/clients.json" assert { type: "json" };

/**
 * Rewrite the interactions.url function to reflect the path we setup for fastify to use.
 */

const configuration: Configuration = {
	clients: [
		...clients as any,
	],
	interactions: {
		url(ctx, interaction) {
			return `oidc/interaction/${interaction.uid}`
		},
	},
	clientBasedCORS(ctx, origin, client) {
		return true;
	},
};

const oidc = new Provider(
	`http://${config.HOST}:${config.PORT}`,
	configuration
);

export default oidc;
