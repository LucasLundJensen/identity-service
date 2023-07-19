import url from "url";

// Call this function with importMetaUrl as `import.meta.url`.
export const __dirname = (importMetaUrl: string) =>
	url.fileURLToPath(new URL(".", importMetaUrl));
