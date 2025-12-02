"use client";

import {
	Content,
	Heading,
	Text,
	LayoutCard,
} from "@mittwald/flow-remote-react-components";

interface OrganizationCardProps {
	name: string;
	description?: string | null;
	createdAt: string;
	id: string;
}

export function OrganizationCard({
	name,
	description,
	createdAt,
	id,
}: OrganizationCardProps) {
	const formattedDate = new Intl.DateTimeFormat("de-DE", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(createdAt));

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

					{description && (
						<Content
							style={{
								display: "flex",
								flexDirection: "column",
								gap: "0.25rem",
							}}
						>
							<Text style={{ fontWeight: "bold" }}>Beschreibung:</Text>
							<Text>{description}</Text>
						</Content>
					)}

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
						<Text style={{ fontWeight: "bold" }}>Erstellt am:</Text>
						<Text>{formattedDate}</Text>
					</Content>
				</Content>
			</Content>
		</LayoutCard>
	);
}

