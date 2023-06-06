import { FastifyInstance, FastifyPluginAsync } from "fastify";
import argon from "argon2";
import oidc from "../oidc.js";
import { getUserByEmail } from "../services/user.service.js";

const AuthRoutes: FastifyPluginAsync = async (server: FastifyInstance) => {
	server.get("/.well-known/openid-configuration", async (req, res) => {
		res.redirect("http://localhost:4000/oidc/.well-known/openid-configuration");
	});
	server.get("/oidc/interaction/:uid", async (req, res) => {
		try {
			server.log.info("Interaction :UID endpoint activated");

			const { uid, prompt, params, session } = await oidc.interactionDetails(
				req.raw,
				res.raw
			);

			server.log.info(session, "Interaction Details fetched");

			const client = await oidc.Client.find(params.client_id as string);
			server.log.debug(
				`Interaction endpoint called with prompt ${prompt.name}`
			);

			switch (prompt.name) {
				case "login": {
					return res.view("src/templates/login.ejs", {
						client,
						uid,
						details: prompt.details,
						params,
						title: "Sign-in",
						session: session || undefined,
						dbg: {
							params: params,
							prompt: prompt,
						},
					});
				}
				case "consent": {
					return res.view("src/templates/authorize.ejs", {
						client,
						uid,
						details: prompt.details,
						params,
						title: "Authorize",
						session: session || undefined,
						dbg: {
							params: params,
							prompt: prompt,
						},
					});
				}
				default:
					return undefined;
			}
		} catch (err) {
			return err;
		}
	});

	server.post<{
		Body: {
			email: string;
			password: string;
		};
	}>("/oidc/interaction/:uid/login", async (req, res) => {
		try {
			const {
				prompt: { name },
			} = await oidc.interactionDetails(req.raw, res.raw);

			if (name !== "login") return;

			const user = await getUserByEmail(req.body.email);
			if (user.status != "Found" || user.data === null) return;

			const verified = await argon.verify(
				user.data.password,
				req.body.password
			);
			if (!verified) return;

			const result = {
				login: {
					accountId: user.data.id.toString(),
				},
			};
			return await oidc.interactionFinished(req.raw, res.raw, result, {
				mergeWithLastSubmission: false,
			});
		} catch (err) {
			return err;
		}
	});

	server.post("/oidc/interaction/:uid/confirm", async (req, res) => {
		try {
			server.log.info("CONFIRM ENDPOINT HAS BEEN REACHED!");
			const interactionDetails = await oidc.interactionDetails(
				req.raw,
				res.raw
			);
			const {
				prompt: { name },
			} = interactionDetails;
			const accountId = interactionDetails.session?.accountId;
			const params = interactionDetails.params as any;
			const details = interactionDetails.prompt.details as any;

			if (name === "login" && accountId) {
				return await oidc.interactionFinished(
					req.raw,
					res.raw,
					{
						login: { accountId: accountId },
					},
					{ mergeWithLastSubmission: false }
				);
			}

			if (name === "consent") {
				let { grantId } = interactionDetails;
				let grant = new oidc.Grant({
					accountId,
					clientId: params.client_id,
				});

				if (grantId) {
					// we'll be modifying existing grant in existing session
					const existingGrant = await oidc.Grant.find(grantId);
					if (existingGrant) {
						grant = existingGrant;
					}
				}

				if (details.missingOIDCScope) {
					grant.addOIDCScope(details.missingOIDCScope.join(" "));
				}
				if (details.missingOIDCClaims) {
					grant.addOIDCClaims(details.missingOIDCClaims);
				}
				if (details.missingResourceScopes) {
					for (const [indicator, scopes] of Object.entries(
						details.missingResourceScopes
					)) {
						grant.addResourceScope(indicator, (scopes as any[]).join(" "));
					}
				}

				grantId = await grant.save();

				const consent: { grantId?: string } = {};
				if (!interactionDetails.grantId) {
					// we don't have to pass grantId to consent, we're just modifying existing one
					consent.grantId = grantId;
				}

				const result = { consent };
				return await oidc.interactionFinished(req.raw, res.raw, result, {
					mergeWithLastSubmission: true,
				});
			}

			return;
		} catch (err) {
			return err;
		}
	});

	server.get("/interaction/:uid/abort", async (req, res) => {
		try {
			const result = {
				error: "access_denied",
				error_description: "End-User aborted interaction",
			};
			return await oidc.interactionFinished(req.raw, res.raw, result, {
				mergeWithLastSubmission: false,
			});
		} catch (err) {
			return err;
		}
	});
};

export default AuthRoutes;
