import {
	Content,
	Heading,
	LayoutCard,
	NotificationProvider,
	Text,
} from "@mittwald/flow-remote-react-components";
import RemoteRoot from "@mittwald/flow-remote-react-components/RemoteRoot";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import type { ReactNode } from "react";

export const Route = createRootRouteWithContext<{
	queryClient: QueryClient;
}>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "My mittwald Extension",
			},
		],
	}),
	component: RootComponent,
});

function RootComponent() {
	// Check if we're in a browser without mittwald context
	const isDirectBrowserAccess =
		typeof window !== "undefined" &&
		!window.location.search.includes("mittwald") &&
		!document.referrer.includes("mittwald");

	if (isDirectBrowserAccess) {
		return (
			<RootDocument>
				<LayoutCard>
					<Content style={{ padding: "2rem", textAlign: "center" }}>
						<Heading level={1}>mittwald Extension</Heading>
						<Text>
							Diese Extension ist für die Verwendung im mittwald mStudio
							konzipiert.
						</Text>
						<Text>
							Bitte öffnen Sie die Extension über das mittwald mStudio.
						</Text>
					</Content>
				</LayoutCard>
			</RootDocument>
		);
	}

	return (
		<RootDocument>
			<RemoteRoot>
				<NotificationProvider>
					<LayoutCard>
						<Outlet />
					</LayoutCard>
				</NotificationProvider>
			</RemoteRoot>
		</RootDocument>
	);
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				{children}
				<Scripts />
				<TanStackRouterDevtools position="bottom-right" />
				<ReactQueryDevtools buttonPosition="bottom-left" />
			</body>
		</html>
	);
}
