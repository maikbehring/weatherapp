import { MittwaldAPIV2Client, assertStatus } from "@mittwald/api-client";
import { getAccessToken } from "@mittwald/ext-bridge/node";
import { createServerFn } from "@tanstack/react-start";
import { verifyAccessToInstance } from "~/middlewares/verify-access-to-instance";
import { env } from "~/env";

function isPermissionDenied(error: unknown): boolean {
	if (error && typeof error === "object") {
		if ("status" in error && typeof error.status === "number") {
			return error.status === 403;
		}
		// Check for ApiClientError-like structure
		if ("response" in error) {
			const response = (error as { response?: { status?: number } }).response;
			if (response && typeof response.status === "number") {
				return response.status === 403;
			}
		}
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

				const address = orgResult.data.owner?.address
					? {
							street: orgResult.data.owner.address.street || "",
							houseNumber: orgResult.data.owner.address.houseNumber || "",
							city: orgResult.data.owner.address.city || "",
							zip: orgResult.data.owner.address.zip || "",
							countryCode: orgResult.data.owner.address.countryCode || "",
							addressPrefix:
								orgResult.data.owner.address.addressPrefix || undefined,
						}
					: null;

				return {
					id: orgResult.data.customerId,
					name: orgResult.data.name,
					customerNumber: orgResult.data.customerNumber,
					creationDate: orgResult.data.creationDate,
					memberCount: orgResult.data.memberCount,
					projectCount: orgResult.data.projectCount,
					address,
				};
			} catch (customerError) {
				// If it's a permission denied error, log it and return null (optional feature)
				if (isPermissionDenied(customerError)) {
					console.log(
						"Permission denied when trying to get customer (optional feature, continuing without organization data):",
						customerError instanceof Error
							? customerError.message
							: String(customerError),
					);
					// Return null instead of throwing - this is an optional feature
					return null;
				}

				// If it's a 404, contextId might not be a customer ID
				console.log(
					"Customer not found with contextId:",
					customerError instanceof Error
						? customerError.message
						: String(customerError),
				);
				// Return null for 404 as well - optional feature
				return null;
			}
		} catch (error) {
			console.log(
				"Error in getOrganization (optional feature, continuing without organization data):",
				error,
			);
			// Return null instead of throwing - organization data is optional
			return null;
		}
	});

