import fastify from "fastify";
import { envToLogger } from "./logging";
import config from "./config";
import Auth from "./routes/auth.routes";
import fastifyMiddie from "@fastify/middie";
import "./passport";
import passport from "passport";
import { addUser, getUserById } from "./services/user.service";
import redisClient from "./redis";

export const server = fastify({ logger: envToLogger(config.ENV) ?? true });

const start = async () => {
	try {
		await redisClient.connect();

		await server.register(fastifyMiddie);
		await server.use(passport.initialize());

		await server.register(Auth);

		await server.listen({ port: +config.PORT, host: "0.0.0.0" });
		server.log.info({}, `Fastify server is running on port ${config.PORT}`);
	} catch (error) {
		server.log.error(error, "Fastify server crashed while starting");
		process.exit(1);
	}
};

start();
