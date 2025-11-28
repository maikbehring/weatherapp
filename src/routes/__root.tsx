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
	const [isEmbedded, setIsEmbedded] = useState(false);

	useEffect(() => {
		setIsClient(true);
		try {
			setIsEmbedded(window.self !== window.top);
		} catch {
			setIsEmbedded(false);
		}
	}, []);

	const renderContent = () => {
		if (!isClient) {
			return (
				<LayoutCard>
					<Text>Extension wird initialisiert …</Text>
				</LayoutCard>
			);
		}

		if (!isEmbedded) {
			return (
				<LayoutCard>
					<Text>
						Diese Extension benötigt das mittwald mStudio. Bitte teste sie über
						eine eingebettete mStudio-Sitzung oder verwende die mittwald CLI
						Preview.
					</Text>
				</LayoutCard>
			);
		}

		return (
			<RemoteRoot>
				<NotificationProvider>
					<LayoutCard>
						<Outlet />
					</LayoutCard>
				</NotificationProvider>
			</RemoteRoot>
		);
	};

	return <RootDocument>{renderContent()}</RootDocument>;
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
