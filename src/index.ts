import fastify from "fastify";
import fastifyMiddie from "@fastify/middie";
import { envToLogger } from "./logging.js";
import config from "./config.js";
import oidc from "./oidc.js";
// import { addUser, getUserById } from "./services/user.service";
import redisClient from "./redis.js";

export const server = fastify({ logger: envToLogger(config.ENV) ?? true });

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
