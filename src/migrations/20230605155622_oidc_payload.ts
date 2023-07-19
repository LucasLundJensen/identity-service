import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
	return knex.schema.createTable("oidc_payloads", (table) => {
		table.string("id");
        table.integer("type");
        table.text("payload");
        table.string("grantId");
        table.string("userCode");
        table.string("uid");
        table.dateTime("expiresAt");
        table.dateTime("consumedAt");
        table.primary(["id", "type"]);
	});
}

export async function down(knex: Knex): Promise<void> {
	return knex.schema.dropTable("oidc_payloads");
}
