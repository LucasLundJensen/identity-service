import { FastifyInstance } from "fastify";
import passport from "passport";
import jwt from "jsonwebtoken";
import { User } from "../types/user.types";

export default async function (server: FastifyInstance) {
	server.route({
		method: "POST",
		url: "/login",
		preHandler: (req, res, done) => {
			passport.authenticate(
				"local",
				(err: Error, user: Omit<User, "password">) => {
					if (err) {
						return res.code(500).send({ error: err });
					}

					if (!user) {
						return res.code(404).send({ error: "No user found" });
					}

					// 1. Generate access token

					const accessToken = jwt.sign({ userId: user.id }, "testSecretKey", {
						expiresIn: "10m",
						audience: "http://localhost/",
						issuer: "http://localhost/",
					});


					// 2. Generate refresh token

                    const refreshToken = jwt.sign({ userId: user.id }, "testSecretKey", {
                        expiresIn: "24h",
                        audience: "http://localhost/",
                        issuer: "http://localhost/"
                    })

					// 3. Store access token and refresh token in redis
					// 4. Send refresh token as a cookie
					// 5. Send access token in response

					return res.code(200).send({ accessToken });
				}
			)(req, res);
		},
		handler: (req, res) => {
			// Handler does nothing, as all logic is done in preHandler.
			// Not the optimal solution, but fastify is a bit funny when it comes to working with Passport, in this specific scenario.
			return {};
		},
	});
}
