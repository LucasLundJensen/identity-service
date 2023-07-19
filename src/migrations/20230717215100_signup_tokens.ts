import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
	return knex.schema.alterTable("users", (table) => {
		table.boolean("active");
		table.string("signUpToken");
		table.bigInteger("signUpTokenDuration");
	});
}

export async function down(knex: Knex): Promise<void> {
	return knex.schema.alterTable("users", (table) => {
		table.dropColumn("signUpToken");
		table.dropColumn("signUpTokenDuration");
		table.dropColumn("active");
	});
}
