import { createClient } from "redis";
import { server } from "./index";

const client = createClient({
	url: "redis://",
});

client.on("error", (err) => server.log.error(err, "Error in redis"));

export default client;
