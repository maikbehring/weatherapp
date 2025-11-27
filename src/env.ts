import { cleanEnv, str, url } from "envalid";

const envSchema = {
	// Database
	DATABASE_URL: url(),
	PRISMA_FIELD_ENCRYPTION_KEY: str(),

	// mittwald
	EXTENSION_ID: str(),
	EXTENSION_SECRET: str(),

	NODE_ENV: str({
		choices: ["development", "test", "production"],
		default: "development",
	}),
};

// Validate and clean the environment
// Only validate on server-side, not in browser
let env: ReturnType<typeof cleanEnv<typeof envSchema>>;

if (typeof window === "undefined") {
	// Server-side: validate all env vars
	env = cleanEnv(process.env, envSchema);
} else {
	// Client-side: use defaults (env vars are not available in browser anyway)
	env = {
		DATABASE_URL: "postgresql://localhost:5432/dummy",
		PRISMA_FIELD_ENCRYPTION_KEY: "dummy-key",
		EXTENSION_ID: "",
		EXTENSION_SECRET: "",
		NODE_ENV: "development",
	} as ReturnType<typeof cleanEnv<typeof envSchema>>;
}

export { env };
