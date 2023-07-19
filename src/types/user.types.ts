export interface User {
	id: number;
	email: string;
	password: string;
	active: boolean;
	signUpToken: string;
	signUpTokenDuration: number;
	[key: string]: any;
}
