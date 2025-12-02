"use client";

import {
	Content,
	Heading,
	Text,
	LayoutCard,
} from "@mittwald/flow-remote-react-components";

interface Address {
	street: string;
	houseNumber: string;
	city: string;
	zip: string;
	countryCode: string;
	addressPrefix?: string;
}

interface OrganizationCardProps {
	name: string;
	customerNumber: string;
	creationDate: string;
	id: string;
	memberCount: number;
	projectCount: number;
	address: Address | null;
}

export function OrganizationCard({
	name,
	customerNumber,
	creationDate,
	id,
	memberCount,
	projectCount,
	address,
}: OrganizationCardProps) {
	const formattedDate = new Intl.DateTimeFormat("de-DE", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(creationDate));

	return (
		<LayoutCard
			style={{
				padding: "1.5rem",
				borderRadius: "1rem",
			}}
		>
			<Content
				style={{
					display: "flex",
					flexDirection: "column",
					gap: "0.75rem",
				}}
			>
				<Heading level={2}>Organisation</Heading>
				<Content
					style={{
						display: "flex",
						flexDirection: "column",
						gap: "0.5rem",
					}}
				>
					<Content
						style={{
							display: "flex",
							flexDirection: "column",
							gap: "0.25rem",
						}}
					>
						<Text style={{ fontWeight: "bold" }}>Name:</Text>
						<Text>{name}</Text>
					</Content>

					<Content
						style={{
							display: "flex",
							flexDirection: "column",
							gap: "0.25rem",
						}}
					>
						<Text style={{ fontWeight: "bold" }}>Kundennummer:</Text>
						<Text>{customerNumber}</Text>
					</Content>

					<Content
						style={{
							display: "flex",
							flexDirection: "column",
							gap: "0.25rem",
						}}
					>
						<Text style={{ fontWeight: "bold" }}>ID:</Text>
						<Text style={{ fontFamily: "monospace", fontSize: "0.875rem" }}>
							{id}
						</Text>
					</Content>

					<Content
						style={{
							display: "flex",
							flexDirection: "column",
							gap: "0.25rem",
						}}
					>
						<Text style={{ fontWeight: "bold" }}>Mitglieder:</Text>
						<Text>{memberCount}</Text>
					</Content>

					<Content
						style={{
							display: "flex",
							flexDirection: "column",
							gap: "0.25rem",
						}}
					>
						<Text style={{ fontWeight: "bold" }}>Projekte:</Text>
						<Text>{projectCount}</Text>
					</Content>

					<Content
						style={{
							display: "flex",
							flexDirection: "column",
							gap: "0.25rem",
						}}
					>
						<Text style={{ fontWeight: "bold" }}>Erstellt am:</Text>
						<Text>{formattedDate}</Text>
					</Content>

					{address && (
						<Content
							style={{
								display: "flex",
								flexDirection: "column",
								gap: "0.25rem",
								marginTop: "0.5rem",
								paddingTop: "0.5rem",
								borderTop: "1px solid rgba(0, 0, 0, 0.1)",
							}}
						>
							<Text style={{ fontWeight: "bold" }}>Adresse:</Text>
							<Content
								style={{
									display: "flex",
									flexDirection: "column",
									gap: "0.125rem",
								}}
							>
								{address.addressPrefix && (
									<Text style={{ fontStyle: "italic" }}>
										{address.addressPrefix}
									</Text>
								)}
								<Text>
									{address.street} {address.houseNumber}
								</Text>
								<Text>
									{address.zip} {address.city}
								</Text>
								{address.countryCode && (
									<Text>{address.countryCode}</Text>
								)}
							</Content>
						</Content>
					)}
				</Content>
			</Content>
		</LayoutCard>
	);
}

