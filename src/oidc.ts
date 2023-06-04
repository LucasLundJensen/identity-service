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
	interactions: {
		url(ctx, interaction) {
			return `oidc/interaction/${interaction.uid}`;
		},
	},
	async findAccount(ctx, sub) {
		const user = await getUserByEmail(sub);

		if (user.data === null) return undefined;

		return {
			accountId: user.data.id.toString(),
			async claims(use, scope) {
				if (user.data) {
					return {
						sub: user.data.id.toString(),
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
}

oidc.on("grant.error", handleOIDCError);
oidc.on("introspection.error", handleOIDCError);
oidc.on("server_error", handleOIDCError);

export default oidc;
