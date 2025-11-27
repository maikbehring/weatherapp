import { PrismaClient } from "@prisma/client";
import { fieldEncryptionExtension } from "prisma-field-encryption";
import { env } from "./env";

const createPrismaClient = () =>
	new PrismaClient({
		log:
			env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
	}).$extends(
		fieldEncryptionExtension({
			encryptionKey: env.PRISMA_FIELD_ENCRYPTION_KEY,
		}),
	);

const globalForPrisma = globalThis as unknown as {
	prisma: ReturnType<typeof createPrismaClient> | undefined;
};

// Only initialize Prisma on server-side
// In browser, this will be undefined and should not be used
const getDb = () => {
	if (typeof window !== "undefined") {
		// Browser: return a dummy object that throws if used
		return new Proxy({} as ReturnType<typeof createPrismaClient>, {
			get() {
				throw new Error(
					"Database access is only available server-side. This extension should be accessed through mittwald mStudio.",
				);
			},
		});
	}

	// Server-side: initialize Prisma
	return globalForPrisma.prisma ?? createPrismaClient();
};

export const db = getDb();

export type PrismaInstance = typeof db;

if (typeof window === "undefined") {
	globalForPrisma.prisma = db as ReturnType<typeof createPrismaClient>;
}
