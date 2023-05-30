import fastify from "fastify";
import fastifyMiddie from "@fastify/middie";
import { envToLogger } from "./logging.js";
import config from "./config.js";
import oidc from "./oidc.js";
import redisClient from "./redis.js";
import { addUser } from "./services/user.service.js";

export const server = fastify({ logger: envToLogger(config.NODE_ENV) ?? true });

const start = async () => {
	try {
		await redisClient.connect();

		await server.register(fastifyMiddie);

		server.use("/oidc", oidc.callback());

		await server.listen({ port: +config.PORT, host: config.HOST });
		server.log.info({}, `Fastify server is running on port ${config.PORT}`);
	} catch (error) {
		server.log.error(error, "Fastify server crashed while starting");
		process.exit(1);
	}
};

start();
