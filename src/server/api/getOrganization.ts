import { MittwaldAPIV2Client, assertStatus } from "@mittwald/api-client";
import { getAccessToken } from "@mittwald/ext-bridge/node";
import { createServerFn } from "@tanstack/react-start";
import { verifyAccessToInstance } from "~/middlewares/verify-access-to-instance";
import { env } from "~/env";

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

			let organizationId: string = context.contextId;

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
				// contextId is not a customer ID, try to get it from the project
				console.log(
					"contextId is not a customer ID, trying project:",
					customerError instanceof Error ? customerError.message : String(customerError),
				);
			}

			// Strategy 2: Get organization ID from project if contextId failed
			if (context.projectId) {
				try {
					const projectResult = await client.project.getProject({
						projectId: context.projectId,
					});
					assertStatus(projectResult, 200);

					organizationId = projectResult.data.customerId;
				} catch (projectError) {
					console.error(
						"Failed to get project:",
						projectError instanceof Error
							? projectError.message
							: String(projectError),
					);
					throw new Error(
						`Failed to get organization: Could not get customer ID from project. Original error: ${projectError instanceof Error ? projectError.message : String(projectError)}`,
					);
				}
			} else {
				throw new Error(
					"Failed to get organization: contextId is not a customer ID and no projectId available",
				);
			}

			// Get customer information using the organization ID from project
			const result = await client.customer.getCustomer({
				customerId: organizationId,
			});
			assertStatus(result, 200);

			return {
				id: result.data.customerId,
				name: result.data.name,
				customerNumber: result.data.customerNumber,
				creationDate: result.data.creationDate,
				memberCount: result.data.memberCount,
				projectCount: result.data.projectCount,
			};
		} catch (error) {
			console.error("Error in getOrganization:", error);
			throw new Error(
				`Failed to get organization: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	});

