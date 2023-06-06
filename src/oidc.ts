import Provider, {
	Configuration,
	KoaContextWithOIDC,
	errors,
} from "oidc-provider";
import config from "./config.js";
import { server } from "./index.js";
import path from "path";
import fs from "fs";
import { promisify } from "util";
import { getUserByEmail, getUserById } from "./services/user.service.js";
import Adapter from "./adapter.js";
import knex from "./database.js";
import { User } from "types/user.types.js";
const readFileAsync = promisify(fs.readFile);

const clients = await readFileAsync(
	path.join(config.CONFIG_FOLDER_PATH, "clients.json"),
	"utf-8"
);

const adapter = Adapter(knex);

const configuration: Configuration = {
	adapter: adapter,
	features: {
		devInteractions: {
			enabled: false,
		},
	},
	clients: JSON.parse(clients),
	clientBasedCORS(ctx, origin, client) {
		return true;
	},
	interactions: {
		url(ctx, interaction) {
			return `/oidc/interaction/${interaction.uid}`;
		},
	},
	async findAccount(ctx, sub) {
		const user = (await getUserById(+sub)).data;
		if (user === null) return undefined;

		return {
			accountId: sub,
			async claims(use, scope) {
				if (user) {
					return {
						sub: user.id.toString(),
					};
				}
				return {
					sub,
				};
			},
		};
	},
};

const oidc = new Provider(
	`http://${config.HOST}:${config.PORT}`,
	configuration
);

function handleOIDCError(
	ctx: KoaContextWithOIDC,
	err: errors.OIDCProviderError
) {
	server.log.error(err, "Error from OIDC");
	server.log.error(ctx.oidc.entities, "Entities from OIDC");
}

oidc.on("grant.error", handleOIDCError);
oidc.on("introspection.error", handleOIDCError);
oidc.on("server_error", handleOIDCError);

oidc.on("authorization.accepted", (ctx) => {
	server.log.error(ctx.oidc.entities, "Entities from OIDC");
});

oidc.on("authorization.success", (ctx) => {
	server.log.error(ctx.oidc.entities, "Entities from OIDC");
});

export default oidc;
