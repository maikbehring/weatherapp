import {
	Button,
	Heading,
	Text,
	Content,
	TextField,
	SegmentedControl,
	Segment,
} from "@mittwald/flow-remote-react-components";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { cities, type CityId } from "~/constants/cities";
import { getWeather } from "~/server/functions/getWeather";
import { getWeatherByAddress } from "~/server/functions/getWeatherByAddress";
import { WeatherCard } from "~/components/WeatherCard";

const weatherCodeDescriptions: Record<number, string> = {
	0: "Klarer Himmel",
	1: "Überwiegend klar",
	2: "Teilweise bewölkt",
	3: "Bewölkt",
	45: "Nebel",
	48: "Raureif-Nebel",
	51: "Leichter Niesel",
	53: "Mäßiger Niesel",
	55: "Starker Niesel",
	61: "Leichter Regen",
	63: "Mäßiger Regen",
	65: "Starker Regen",
	71: "Leichter Schneefall",
	73: "Mäßiger Schneefall",
	75: "Starker Schneefall",
	95: "Gewitter",
	96: "Gewitter mit Hagel",
	99: "Heftiges Gewitter mit Hagel",
};

export const Route = createFileRoute("/")({
	component: RouteComponent,
});

type SegmentChangeEvent =
	| string
	| (CustomEvent<{ value?: string }> & {
			target?: { value?: string } | null;
	  })
	| undefined;

function RouteComponent() {
	const initialCityId = (cities[0]?.id ?? "") as CityId;
	const [selectedCityId, setSelectedCityId] = useState<CityId>(initialCityId);
	const [customAddress, setCustomAddress] = useState("");
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

	const {
		data: weatherData,
		isLoading,
		isFetching,
		error,
		refetch,
	} = useQuery({
		queryKey: ["weather", selectedCityId],
		queryFn: () =>
			getWeather({
				data: { cityId: selectedCityId },
			} as any),
		enabled: isClient && Boolean(selectedCityId),
	});

	const customWeatherMutation = useMutation({
		mutationFn: (address: string) =>
			getWeatherByAddress({
				data: { address },
			} as any),
	});

	const [activeWeatherSource, setActiveWeatherSource] = useState<
		"city" | "custom"
	>("city");

	const formattedTimestamp = useMemo(() => {
		if (!weatherData) {
			return "";
		}

		const timestamp = new Date(weatherData.weather.time);
		return new Intl.DateTimeFormat("de-DE", {
			dateStyle: "medium",
			timeStyle: "short",
		}).format(timestamp);
	}, [weatherData]);

	const weatherDescription = useMemo(() => {
		if (!weatherData) {
			return "";
		}

		return describeWeatherCode(weatherData.weather.weathercode);
	}, [weatherData]);


	const handleAddressSubmit = () => {
		const trimmedAddress = customAddress.trim();

		if (!trimmedAddress) {
			return;
		}

		customWeatherMutation.mutate(trimmedAddress);
		setActiveWeatherSource("custom");
	};

	const handleSegmentChange = (valueOrEvent: SegmentChangeEvent) => {
		if (!valueOrEvent) {
			return;
		}

		if (typeof valueOrEvent === "string") {
			setSelectedCityId(valueOrEvent as CityId);
			setActiveWeatherSource("city");
			return;
		}

		const detailValue =
			typeof valueOrEvent.detail === "object"
				? valueOrEvent.detail?.value
				: undefined;
		const targetValue = valueOrEvent.target?.value;
		const resolvedValue = detailValue ?? targetValue;

		if (resolvedValue) {
			setSelectedCityId(resolvedValue as CityId);
			setActiveWeatherSource("city");
		}
	};

	return (
		<Content>
			<Heading>Aktuelle Wetterübersicht</Heading>
			<Text>Wähle eine Stadt aus, um die aktuellen Wetterdaten zu laden.</Text>
			<Content>
				<Heading level={3}>Deine lokale Adresse</Heading>
				<Text>
					Ergänze deine Adresse, falls du das Wetter für einen anderen Ort im
					Blick behalten möchtest.
				</Text>
				<Text>Adresse</Text>
				<TextField
					placeholder="z. B. Musterstraße 12, 12345 Musterstadt"
					value={customAddress}
					onChange={(e: any) => {
						const value = typeof e === "string" 
							? e 
							: e?.target?.value ?? e?.detail?.value ?? "";
						setCustomAddress(String(value || ""));
					}}
				/>
				<Button
					onPress={handleAddressSubmit}
					isDisabled={!customAddress.trim() || customWeatherMutation.isPending}
				>
					{customWeatherMutation.isPending
						? "Adresse wird geladen …"
						: "Wetter für Adresse laden"}
				</Button>
				<Text>
					{customAddress
						? `Eingegebene Adresse: ${customAddress}`
						: "Noch keine Adresse eingetragen."}
				</Text>
				{customWeatherMutation.error && (
					<Text>
						Fehler:{" "}
						{customWeatherMutation.error instanceof Error
							? customWeatherMutation.error.message
							: "Unbekannter Fehler"}
					</Text>
				)}
			</Content>

			<Content>
				<Heading level={3}>Schnellauswahl</Heading>
				<Text>Tippe auf eine Stadt, um sofort neue Messwerte zu laden.</Text>
				<SegmentedControl
					aria-label="Stadt auswählen"
					value={selectedCityId}
					onChange={handleSegmentChange}
				>
					{cities.map((city) => (
						<Segment
							key={city.id}
							id={city.id}
							value={city.id}
							aria-pressed={selectedCityId === city.id}
							onPress={() => {
								setSelectedCityId(city.id as CityId);
								setActiveWeatherSource("city");
							}}
						>
							{city.name}
						</Segment>
					))}
				</SegmentedControl>
			</Content>

			{isLoading && <Text>Wetterdaten werden geladen …</Text>}

			{error && (
				<Text>
					Fehler: {error instanceof Error ? error.message : "Unbekannter Fehler"}
				</Text>
			)}

			{weatherData && (
				activeWeatherSource === "city" && (
					<WeatherCard
						title={weatherData.city.name}
						timestamp={formattedTimestamp}
						description={weatherDescription}
						temperature={weatherData.weather.temperature}
						windspeed={weatherData.weather.windspeed}
						weathercode={weatherData.weather.weathercode}
						funMessage={getFunMessage(
							weatherData.weather.weathercode,
							weatherData.weather.temperature,
						)}
						forecast={weatherData.forecast}
					/>
				)
			)}

			{activeWeatherSource === "custom" && customWeatherMutation.data && (
				<WeatherCard
					title={`Adresse: ${customWeatherMutation.data.location.name}`}
					subtitle={customWeatherMutation.data.location.country}
					timestamp={new Intl.DateTimeFormat("de-DE", {
						dateStyle: "medium",
						timeStyle: "short",
					}).format(new Date(customWeatherMutation.data.weather.time))}
					description={
						weatherCodeDescriptions[
							customWeatherMutation.data.weather.weathercode
						] ??
						`Wettercode ${customWeatherMutation.data.weather.weathercode}`
					}
					temperature={customWeatherMutation.data.weather.temperature}
					windspeed={customWeatherMutation.data.weather.windspeed}
					weathercode={customWeatherMutation.data.weather.weathercode}
					funMessage={getFunMessage(
						customWeatherMutation.data.weather.weathercode,
						customWeatherMutation.data.weather.temperature,
					)}
					forecast={customWeatherMutation.data.forecast}
				/>
			)}

			<Button onPress={() => refetch()}>
				{isFetching ? "Aktualisierung läuft …" : "Wetter aktualisieren"}
			</Button>
		</Content>
	);
}


function getFunMessage(weathercode: number, temperature: number) {
	if (temperature <= 0) {
		return "Perfektes Wetter, um den Kühlschrank draußen stehen zu lassen.";
	}

	if (temperature >= 25) {
		return "Flip-Flops an, Ventilator an – dein Laptop schwitzt schon mit.";
	}

	if (weathercode >= 61 && weathercode <= 65) {
		return "Regen? Bonuspunkte, wenn du den Schirm als WLAN-Verstärker nutzt.";
	}

	if (weathercode === 2) {
		return "Teilweise bewölkt – wie dein Deployment, nur ohne Warnungen.";
	}

	return "Mittwald meint: Immer schön wetterfest deployen!";
}

function describeWeatherCode(code: number) {
	return weatherCodeDescriptions[code] ?? `Wettercode ${code}`;
}

