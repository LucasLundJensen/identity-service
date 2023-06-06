import argon from "argon2";
import { server } from "../index.js";
import knex from "../database.js";
import { User } from "../types/user.types.js";
import { APIResponse } from "../types/api.types.js";

export async function getAllUsers(): Promise<
	APIResponse<Pick<User, "id" | "email">[]>
> {
	try {
		const users = await knex<User>("users").select("id").select("email");

		server.log.debug(users, "Retrieved users");

		return {
			data: users,
			status: "Found",
			message: "Successfully retrieved users",
		};
	} catch (error) {
		server.log.error(error, "Failed to retrieve all users from database");
		return {
			data: null,
			status: "OperationFailed",
			message: "Failed to retrieve all users",
		};
	}
}

export async function getUserById(id: number): Promise<APIResponse<User>> {
	try {
		const user = await knex<User>("users").where("id", id).first();

		if (!user) {
			return {
				data: null,
				status: "NotFound",
				message: "User with that ID doesn't exist",
			};
		}

		return {
			data: user,
			status: "Found",
			message: "User with ID found",
		};
	} catch (error) {
		server.log.error(error, "Failed to retrieve user from database");
		return {
			data: null,
			status: "OperationFailed",
			message: "Unable to retrieve user.",
		};
	}
}

export async function getUserByEmail(
	email: string
): Promise<APIResponse<User>> {
	try {
		const user = await knex<User>("users").where("email", email).first();

		if (!user) {
			return {
				data: null,
				status: "NotFound",
				message: "User with that email doesn't exist",
			};
		}

		return {
			data: user,
			status: "Found",
			message: "User with email found",
		};
	} catch (error) {
		server.log.error(error, "Failed to retrieve user from database");
		return {
			data: null,
			status: "OperationFailed",
			message: "Unable to retrieve user.",
		};
	}
}

export async function addUser(
	data: Pick<User, "email" | "password">
): Promise<APIResponse<Pick<User, "id" | "email">[]>> {
	// Make sure email isn't already registered.
	const existingResponse = await getUserByEmail(data.email);
	if (existingResponse.data) {
		server.log.debug(existingResponse, "User with that email already exists");
		return {
			data: null,
			status: "AlreadyExists",
			message: "User already exists",
		};
	}

	// Encrypt the password
	let hashedPassword;
	try {
		hashedPassword = await argon.hash(data.password);
		data.password = hashedPassword;
	} catch (error) {
		server.log.error(error, "Failed to hash user password");
		return {
			data: null,
			status: "OperationFailed",
			message: "Unable to add user, data processing failed.",
		};
	}

	try {
		// Save the user to the database
		const insertedUser = await knex<User>("users")
			.insert({
				email: data.email,
				password: data.password,
			})
			.returning(["id", "email"]);

		server.log.debug(insertedUser, "Inserted user");
		return {
			data: insertedUser,
			status: "Added",
			message: "User has been successfully added",
		};
	} catch (error) {
		server.log.error(error, "Failed to insert user into database!");
		return {
			data: null,
			status: "OperationFailed",
			message: "Unable to add user.",
		};
	}
}
