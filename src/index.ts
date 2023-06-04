import fastify from "fastify";
import fastifyMiddie from "@fastify/middie";
import fasitfyView from "@fastify/view";
import fastifyFormbody from "@fastify/formbody";
import ejs from "ejs";
import { envToLogger } from "./logging.js";
import config from "./config.js";
import oidc from "./oidc.js";
import redisClient from "./redis.js";
import { addUser } from "./services/user.service.js";

import AuthRoutes from "./routes/auth.routes.js";

export const server = fastify({ logger: envToLogger(config.NODE_ENV) ?? true });

const start = async () => {
	try {
		await redisClient.connect();

		await server.register(fastifyFormbody);
		await server.register(fastifyMiddie);
		await server.register(fasitfyView, {
			engine: {
				ejs,
			},
		});

		await server.register(AuthRoutes);

		server.use("/oidc", oidc.callback());

		await server.listen({ port: +config.PORT, host: config.HOST });
		server.log.info({}, `Fastify server is running on port ${config.PORT}`);
	} catch (error) {
		server.log.error(error, "Fastify server crashed while starting");
		process.exit(1);
	}
};

start();
