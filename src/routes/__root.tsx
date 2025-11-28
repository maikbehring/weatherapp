import {
	LayoutCard,
	NotificationProvider,
	Text,
} from "@mittwald/flow-remote-react-components";
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
	const [RemoteRoot, setRemoteRoot] =
		useState<typeof import("@mittwald/flow-remote-react-components/RemoteRoot").default | null>(
			null,
		);

	useEffect(() => {
		setIsClient(true);
		try {
			setIsEmbedded(window.self !== window.top);
		} catch {
			setIsEmbedded(false);
		}

		// Dynamically import RemoteRoot only on client-side to avoid SSR issues with @reduxjs/toolkit
		if (typeof window !== "undefined") {
			import("@mittwald/flow-remote-react-components/RemoteRoot").then(
				(module) => {
					setRemoteRoot(() => module.default);
				},
			);
		}
	}, []);

	const renderContent = () => {
		if (!isClient || !RemoteRoot) {
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
