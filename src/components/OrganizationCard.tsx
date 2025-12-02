"use client";

import {
	Content,
	Heading,
	Text,
	LayoutCard,
} from "@mittwald/flow-remote-react-components";

interface OrganizationCardProps {
	name: string;
	customerNumber: string;
	creationDate: string;
	id: string;
	memberCount: number;
	projectCount: number;
}

export function OrganizationCard({
	name,
	customerNumber,
	creationDate,
	id,
	memberCount,
	projectCount,
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
				</Content>
			</Content>
		</LayoutCard>
	);
}

