import { MittwaldAPIV2Client, assertStatus } from "@mittwald/api-client";
import { getAccessToken } from "@mittwald/ext-bridge/node";
import { createServerFn } from "@tanstack/react-start";
import { verifyAccessToInstance } from "~/middlewares/verify-access-to-instance";
import { env } from "~/env";

export const getOrganization = createServerFn({ method: "POST" })
	.middleware([verifyAccessToInstance])
	.handler(async ({ context }) => {
		// Get access token for mittwald API
		const { publicToken: accessToken } = await getAccessToken(
			context.sessionToken,
			env.EXTENSION_SECRET,
		);

		// Create mittwald API client
		const client = await MittwaldAPIV2Client.newWithToken(accessToken);

		let organizationId: string = context.contextId;

		// Try to get organization directly using contextId
		// If that fails (e.g., contextId is a project ID), get it from the project
		try {
			const orgResult = await client.customer.getCustomer({
				customerId: context.contextId,
			});
			assertStatus(orgResult, 200);

			return {
				id: orgResult.data.id,
				name: orgResult.data.name,
				description: orgResult.data.description ?? null,
				createdAt: orgResult.data.createdAt,
				updatedAt: orgResult.data.updatedAt,
			};
		} catch (error) {
			// If contextId is not a customer ID, try to get it from the project
			if (context.projectId) {
				const projectResult = await client.project.getProject({
					projectId: context.projectId,
				});
				assertStatus(projectResult, 200);

				organizationId = projectResult.data.customerId;
			} else {
				throw new Error(
					"Could not determine organization ID from contextId or projectId",
				);
			}
		}

		// Get organization information using the resolved organization ID
		const result = await client.customer.getCustomer({
			customerId: organizationId,
		});

		// Assert status and get the data
		assertStatus(result, 200);

		return {
			id: result.data.id,
			name: result.data.name,
			description: result.data.description ?? null,
			createdAt: result.data.createdAt,
			updatedAt: result.data.updatedAt,
		};
	});

