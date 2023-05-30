import fastify from "fastify";
import fastifyMiddie from "@fastify/middie";
import fasitfyView from '@fastify/view';
import ejs from 'ejs';
import { envToLogger } from "./logging.js";
import config from "./config.js";
import oidc from "./oidc.js";
// import { addUser, getUserById } from "./services/user.service";
import redisClient from "./redis.js";

import AuthRoutes from "./routes/auth.routes.js";

export const server = fastify({ logger: envToLogger(config.ENV) ?? true });

const start = async () => {
	try {
		await redisClient.connect();

		await server.register(fastifyMiddie);
		await server.register(fasitfyView, {
			engine: {
				ejs
			}
		});

		await server.register(AuthRoutes)

		server.use("/oidc", oidc.callback());

		await server.listen({ port: +config.PORT, host: config.HOST });
		server.log.info({}, `Fastify server is running on port ${config.PORT}`);
	} catch (error) {
		server.log.error(error, "Fastify server crashed while starting");
		process.exit(1);
	}
};

start();
