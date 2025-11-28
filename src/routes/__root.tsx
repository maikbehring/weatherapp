import {
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
import { useEffect, useState } from "react";

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
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

	return (
		<RootDocument>
			{isClient ? (
				<RemoteRoot>
					<NotificationProvider>
						<LayoutCard>
							<Outlet />
						</LayoutCard>
					</NotificationProvider>
				</RemoteRoot>
			) : (
				<LayoutCard>
					<Text>
						Lade mittwald Extension … Bitte öffne sie innerhalb des mStudio.
					</Text>
				</LayoutCard>
			)}
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
