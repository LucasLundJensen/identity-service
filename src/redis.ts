import { createClient } from "redis";
import { server } from "./index.js";
import config from "./config.js";

const client = createClient({
	url: `redis://${config.REDIS_USERNAME}:${config.REDIS_PASSWORD}@${config.REDIS_URL}:6379`,
});

client.on("error", (err) => server.log.error(err, "Error in redis"));

export default client;
