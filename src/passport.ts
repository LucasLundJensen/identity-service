import passport from "passport";
import passportLocal from "passport-local";
import passportBearer from "passport-http-bearer";

import LocalValidator from "./schemas/local.schema";
import { server } from "src";

const LocalStrategy = passportLocal.Strategy;
const BearerStrategy = passportBearer.Strategy;

passport.use(
	new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
		// 1. Validate Login Schema
		const validated = LocalValidator({ email, password });
		if (validated !== true) {
			server.log.debug(
				validated,
				"Failed to validate local user authentication information."
			);
			//TODO: Return error to user.
			return;
		}

		// 2. Get User from Database/Redis
		// 3. Compare entered password with encrypted password
	})
);
