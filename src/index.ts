import fastify from "fastify";
import { envToLogger } from "./logging";
import config from "./config";

export const server = fastify({ logger: envToLogger(config.ENV) ?? true });

const start = async () => {
	try {
		await server.listen({ port: +config.PORT });
		server.log.info({}, `Fastify server is running on port ${config.PORT}`);
	} catch (error) {
		server.log.error(error, "Fastify server crashed while starting");
		process.exit(1);
	}
};

start();
