export interface APIResponse<T> {
	message?: string;
	data: T | null;
	status: APIStatus;
}

export type APIStatus =
	| "AlreadyExists"
	| "Added"
	| "Deleted"
	| "Found"
	| "OperationFailed"
	| "NotFound"
	| "Updated";
