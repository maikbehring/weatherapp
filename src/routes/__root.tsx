"use client";

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

type RemoteRootComponent = (typeof import("@mittwald/flow-remote-react-components/RemoteRoot"))["default"];
type ReduxProviderComponent = (typeof import("~/providers/ReduxProvider"))["ReduxProvider"];

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
	const [RemoteRootComponent, setRemoteRootComponent] =
		useState<RemoteRootComponent | null>(null);
	const [ReduxProviderComponent, setReduxProviderComponent] =
		useState<ReduxProviderComponent | null>(null);

	useEffect(() => {
		setIsClient(true);
		try {
			setIsEmbedded(window.self !== window.top);
		} catch {
			setIsEmbedded(false);
		}

		if (typeof window !== "undefined") {
			// Dynamically import both to avoid SSR bundling issues
			Promise.all([
				import("@mittwald/flow-remote-react-components/RemoteRoot").then(
					(module) => module.default,
				),
				import("~/providers/ReduxProvider").then(
					(module) => module.ReduxProvider,
				),
			]).then(([RemoteRoot, ReduxProvider]) => {
				setRemoteRootComponent(() => RemoteRoot);
				setReduxProviderComponent(() => ReduxProvider);
			});
		}
	}, []);

	const renderContent = () => {
		if (!isClient || !RemoteRootComponent || !ReduxProviderComponent) {
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

		const RemoteRoot = RemoteRootComponent;
		const ReduxProvider = ReduxProviderComponent;

		return (
			<ReduxProvider>
				<RemoteRoot>
					<NotificationProvider>
						<LayoutCard>
							<Outlet />
						</LayoutCard>
					</NotificationProvider>
				</RemoteRoot>
			</ReduxProvider>
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
