import {
	MittwaldAPIV2Client,
	assertStatus,
	ApiClientError,
} from "@mittwald/api-client";
import { getAccessToken } from "@mittwald/ext-bridge/node";
import { createServerFn } from "@tanstack/react-start";
import { verifyAccessToInstance } from "~/middlewares/verify-access-to-instance";
import { env } from "~/env";

function isPermissionDenied(error: unknown): boolean {
	if (error instanceof ApiClientError) {
		return error.status === 403;
	}
	if (error && typeof error === "object" && "status" in error) {
		return error.status === 403;
	}
	return false;
}

export const getOrganization = createServerFn({ method: "POST" })
	.middleware([verifyAccessToInstance])
	.handler(async ({ context }) => {
		try {
			// Get access token for mittwald API
			const { publicToken: accessToken } = await getAccessToken(
				context.sessionToken,
				env.EXTENSION_SECRET,
			);

			// Create mittwald API client
			const client = await MittwaldAPIV2Client.newWithToken(accessToken);

			// Strategy 1: Try to get customer directly using contextId
			try {
				const orgResult = await client.customer.getCustomer({
					customerId: context.contextId,
				});
				assertStatus(orgResult, 200);

				return {
					id: orgResult.data.customerId,
					name: orgResult.data.name,
					customerNumber: orgResult.data.customerNumber,
					creationDate: orgResult.data.creationDate,
					memberCount: orgResult.data.memberCount,
					projectCount: orgResult.data.projectCount,
				};
			} catch (customerError) {
				// If it's a permission denied error, throw it immediately
				if (isPermissionDenied(customerError)) {
					console.error(
						"Permission denied when trying to get customer:",
						customerError instanceof Error
							? customerError.message
							: String(customerError),
					);
					throw new Error(
						"Zugriff verweigert: Die Extension hat keine Berechtigung, Organisationsinformationen abzurufen. Bitte überprüfe die Extension-Berechtigungen im mittwald Marketplace.",
					);
				}

				// If it's a 404, contextId might not be a customer ID
				console.log(
					"Customer not found with contextId, trying alternative approach:",
					customerError instanceof Error
						? customerError.message
						: String(customerError),
				);
			}

			// Strategy 2: If we can't get customer directly, return error
			// (We can't use project.getProject because extension might not have permission)
			throw new Error(
				"Organisation konnte nicht abgerufen werden: contextId ist keine gültige Customer-ID und die Extension hat möglicherweise keine Berechtigung für alternative Abrufmethoden.",
			);
		} catch (error) {
			console.error("Error in getOrganization:", error);
			// Re-throw our custom error messages
			if (error instanceof Error && error.message.includes("Zugriff verweigert")) {
				throw error;
			}
			if (
				error instanceof Error &&
				error.message.includes("Organisation konnte nicht abgerufen werden")
			) {
				throw error;
			}
			// For other errors, provide a generic message
			throw new Error(
				`Fehler beim Abrufen der Organisation: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	});

