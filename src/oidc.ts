import Provider from "oidc-provider";
import config from "./config.js";
import clients from "../config/clients.json" assert { type: "json" };

const configuration = {
	clients,
};

const oidc = new Provider(
	`http://${config.HOST}:${config.PORT}`,
	configuration
);

export default oidc;
