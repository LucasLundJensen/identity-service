import Provider, {
	AccountClaims,
	Configuration,
	interactionPolicy,
} from "oidc-provider";
import config from "./config.js";
import { server } from "./index.js";
import path from "path";
import fs from "fs";
import { promisify } from "util";
import { getUserById } from "./services/user.service.js";
import Adapter from "./adapter.js";
import knex from "./database.js";
import { User } from "types/user.types.js";
const readFileAsync = promisify(fs.readFile);

const clientsFile = await readFileAsync(
	path.join(config.CONFIG_FOLDER_PATH, "clients.json"),
	"utf-8"
);

const adapter = Adapter(knex);

// Get base policies out and add "create" which is used for registration.
const policies = interactionPolicy.base();
policies.add(
	new interactionPolicy.Prompt({ name: "create", requestable: true }),
	0
);

const configuration: Configuration = {
	adapter: adapter,
	features: {
		devInteractions: {
			enabled: false,
		},
	},
	clients: [...JSON.parse(clientsFile)],
	clientBasedCORS(ctx, origin, client) {
		return true;
	},
	interactions: {
		url(ctx, interaction) {
			return `/oidc/interaction/${interaction.uid}`;
		},
		policy: policies,
	},
	claims: {
		email: ["email"],
	},
	async findAccount(ctx, sub) {
		const user = (await getUserById(+sub)).data;
		if (user === null)
			return {
				accountId: sub,
				async claims() {
					return {
						sub,
					};
				},
			};

		return {
			accountId: sub,
			async claims(use, scope) {
				return getUserClaimsFromScope(user, scope);
			},
		};
	},
	async loadExistingGrant(ctx) {
		let grantId = ctx.oidc.result?.consent?.grantId;
		if (!grantId && ctx.oidc.client) {
			grantId = ctx.oidc.session?.grantIdFor(ctx.oidc.client.clientId);
		}

		if (grantId) {
			const grant = await ctx.oidc.provider.Grant.find(grantId);

			if (!grant) {
				server.log.error("No grant found based on grantId: %s", grantId);
				return;
			}

			if (ctx.oidc.account && ctx.oidc.session) {
				if (grant.exp && grant.exp < ctx.oidc.session.exp) {
					grant.exp = ctx.oidc.session.exp;
					await grant.save();
				}
			}

			return grant;
		} else if (
			ctx.oidc.client &&
			ctx.oidc.client.clientSecret &&
			isFirstParty(ctx.oidc.client.clientId, ctx.oidc.client.clientSecret)
		) {
			if (!ctx.oidc.session) {
				server.log.error(
					"No session in creating new grant for a first party application"
				);
				return;
			}
			const grant = new ctx.oidc.provider.Grant({
				clientId: ctx.oidc.client.clientId,
				accountId: ctx.oidc.session.accountId,
			});

			// This defines what scopes and claims to give first-party applications by default, since they'll be skipping the consent page.
			grant.addOIDCScope("openid email");
			grant.addOIDCClaims(["email"]);
			// grant.addResourceScope(
			// 	"urn:example:resource-indicator",
			// 	"api:read api:write"
			// );
			await grant.save();

			return grant;
		}
	},
};

/**
 * Gets all user claims based on scope
 * @param user
 * @param scope
 * @returns An account claim used by OIDC.
 */
function getUserClaimsFromScope(user: User, scope: string): AccountClaims {
	const scopes = scope.split(" ");

	const claims: AccountClaims = {
		sub: user.id.toString(),
	};

	scopes.forEach((requestedScope) => {
		if (user[requestedScope]) {
			claims[requestedScope] = user[requestedScope];
		}
	});

	return claims;
}

function isFirstParty(clientId: string, clientSecret: string): boolean {
	// Check if  the clientId & secret also has "isFirstParty" defined in the configuration file, this allows them to skip the consent screen.
	const clients: Array<{
		client_id: string;
		client_secret: string;
		isFirstParty: boolean;
	}> = JSON.parse(clientsFile);
	const client = clients.find(
		(e) => e.client_id === clientId && e.client_secret === clientSecret
	);
	if (!client || !client.isFirstParty) return false;
	return true;
}

const oidc = new Provider(
	`http://${config.HOST}:${config.PORT}`,
	configuration
);

// function handleOIDCError(
// 	ctx: KoaContextWithOIDC,
// 	err: errors.OIDCProviderError
// ) {
// 	server.log.error(err, "Error from OIDC");
// }

// oidc.on("grant.error", handleOIDCError);
// oidc.on("introspection.error", handleOIDCError);
// oidc.on("server_error", handleOIDCError);

// oidc.on("authorization.accepted", (ctx) => {
// 	server.log.error(ctx.oidc.entities, "Entities from OIDC");
// });

// oidc.on("authorization.success", (ctx) => {
// 	server.log.error(ctx.oidc, "Entities from OIDC");
// });

// oidc.on("grant.success", (ctx) => {
// 	server.log.debug(ctx.oidc, "Grant Success");
// });

export default oidc;
