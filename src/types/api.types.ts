export interface APIResponse<T> {
	message?: string;
	data: T | T[];
	status: APIStatus;
}

export type APIStatus =
	| "AlreadyExists"
	| "Added"
	| "Deleted"
	| "Found"
	| "OperationFailed"
	| "NotFound";
