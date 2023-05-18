import Validator from "fastest-validator";

const v = new Validator();

const LocalValidator = v.compile({
	email: { type: "email" },
	password: { type: "string", min: 6 },
});

export default LocalValidator;
