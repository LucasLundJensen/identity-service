import { server } from "./index";

const pinoConfig = {
	development: {
		transport: {
			target: "pino-pretty",
			options: {
				translateTime: "SYS:HH:MM:ss Z",
				ignore: "pid,hostname",
			},
		},
	},
	production: true,
	test: false,
};

export function envToLogger(environment: string) {
	if (environment === "development") {
		return pinoConfig.development;
	} else if (environment === "test") {
		return pinoConfig.test;
	} else if (environment === "production") {
		return pinoConfig.production;
	} else {
		console.error("Unknown environment for logger, reverting to 'development'");
		return pinoConfig.development;
	}
}
