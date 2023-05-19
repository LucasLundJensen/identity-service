import passportLocal from "passport-local";
import passportBearer from "passport-http-bearer";
import argon from "argon2";

import passport from "passport";
import LocalValidator from "./schemas/local.schema";
import { server } from "./index";
import { getUserByEmail } from "./services/user.service";
import knex from "./database";
import { User } from "./types/user.types";

const LocalStrategy = passportLocal.Strategy;
const BearerStrategy = passportBearer.Strategy;

passport.use(
	"local",
	new LocalStrategy(
		{ usernameField: "email" },
		async (email, password, done) => {
			console.log("Wow!");

			// 1. Validate Login Schema
			const validated = LocalValidator({ email, password });
			if (validated !== true) {
				server.log.debug(
					validated,
					"Failed to validate local user authentication information."
				);
				return done("validation-failed", false);
			}

			// 2. Get User from Database/Redis
			try {
				// TODO: Add redis search before Knex.

				const user = await knex<User>("users").first().where("email", email);
				if (!user) {
					server.log.debug({}, "User not found while logging in.");
					return done("login-failed", false);
				}

				// 3. Compare entered password with encrypted password
				const isEqual = await argon.verify(user.password, password);
				if (!isEqual) {
					server.log.debug({}, "User password comparison failed");
					return done("login-failed", false);
				}

				return done(false, user);
			} catch (error) {
				server.log.error(error, "Critically failed to authenticate user");
				return done("login-failed", false);
			}
		}
	)
);

passport.serializeUser((user, done) => {
	console.log("Serialize");
	if (user) done(null, user);
});

passport.deserializeUser((user: User, done) => {
	console.log("Deserialize");
	done(null, user);
});
