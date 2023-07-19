import Ajv, { JSONSchemaType } from "ajv";
import addFormats from "ajv-formats";

const v = new Ajv.default();
addFormats.default(v);

interface LocalLogin {
	email: string;
	password: string;
}

const schema: JSONSchemaType<LocalLogin> = {
	type: "object",
	properties: {
		email: { type: "string", format: "email" },
		password: { type: "string" },
	},
	required: ["email", "password"],
	additionalProperties: false,
};

const LocalValidator = v.compile(schema);

export default LocalValidator;
