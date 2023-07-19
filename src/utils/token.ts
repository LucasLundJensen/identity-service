import crypto from "crypto";

export const DURATION_TWENTYFOUR_HOURS = Date.now() + 1000 * 60 * 60 * 24;

export function generateRandomToken(): string {
	const buf = crypto.randomBytes(16);
	return buf.toString("hex");
}
