export interface APIResponse<T> {
	message?: string;
	data: T | T[] | null;
	status: APIStatus;
}

export type APIStatus =
	| "AlreadyExists"
	| "Added"
	| "Deleted"
	| "Found"
	| "OperationFailed"
	| "NotFound";
