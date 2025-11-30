"use client";

import {
	Content,
	Heading,
	Text,
	LayoutCard,
	AlertBadge,
	CartesianChart,
	Line,
	CartesianGrid,
	XAxis,
	YAxis,
	ChartLegend,
} from "@mittwald/flow-remote-react-components";

interface ForecastDay {
	date: string;
	minTemp: number;
	maxTemp: number;
	weathercode: number;
}

interface ForecastSummary {
	maxDay: ForecastDay;
	minDay: ForecastDay;
}

interface WeatherCardProps {
	title: string;
	subtitle?: string;
	timestamp: string;
	description: string;
	temperature: number;
	windspeed: number;
	weathercode: number;
	funMessage: string;
	forecast?: ForecastDay[];
}

const forecastDateFormatter = new Intl.DateTimeFormat("de-DE", {
	weekday: "short",
	day: "2-digit",
	month: "2-digit",
});

function formatDate(dateString: string) {
	const date = new Date(dateString);
	return forecastDateFormatter.format(date);
}

function summarizeForecast(forecast: ForecastDay[]): ForecastSummary | null {
	if (!forecast.length) {
		return null;
	}

	return forecast.reduce(
		(acc, day) => ({
			maxDay: day.maxTemp > acc.maxDay.maxTemp ? day : acc.maxDay,
			minDay: day.minTemp < acc.minDay.minTemp ? day : acc.minDay,
		}),
		{ maxDay: forecast[0], minDay: forecast[0] },
	);
}

function StatTile({
	label,
	value,
	emphasize = false,
}: {
	label: string;
	value: string;
	emphasize?: boolean;
}) {
	return (
		<Content
			style={{
				background: "var(--flow-color-surface-strong)",
				borderRadius: "0.875rem",
				padding: "1rem",
			}}
		>
			<Heading level={emphasize ? 1 : 2} style={{ margin: 0 }}>
				{value}
			</Heading>
			<Text>{label}</Text>
		</Content>
	);
}

export function WeatherCard({
	title,
	subtitle,
	timestamp,
	description,
	temperature,
	windspeed,
	weathercode,
	funMessage,
	forecast,
}: WeatherCardProps) {
	const forecastSummary = forecast ? summarizeForecast(forecast) : null;

	// Calculate Y-axis domain for the chart to handle negative values properly
	// Round to whole numbers to avoid floating-point precision issues in labels
	const chartDomain = forecast
		? (() => {
				const allTemps = forecast.flatMap((day) => [day.maxTemp, day.minTemp]);
				const minTemp = Math.min(...allTemps);
				const maxTemp = Math.max(...allTemps);
				// Add padding (10% of range) to both sides
				const range = maxTemp - minTemp;
				const padding = range * 0.1;
				// Round to whole numbers (floor for min, ceil for max)
				const roundedMin = Math.floor(minTemp - padding);
				const roundedMax = Math.ceil(maxTemp + padding);
				return [roundedMin, roundedMax] as [number, number];
		  })()
		: undefined;

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
					gap: "0.25rem",
				}}
			>
				<Heading level={2}>{title}</Heading>
				{subtitle && <Text>{subtitle}</Text>}
				<Text>Stand: {timestamp}</Text>
				<AlertBadge>{description}</AlertBadge>
				<Text style={{ fontStyle: "italic" }}>{funMessage}</Text>
			</Content>

			<Content
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
					gap: "1rem",
					marginTop: "1.25rem",
				}}
			>
				<StatTile label="Temperatur" value={`${temperature}°C`} emphasize />
				<StatTile label="Windgeschwindigkeit" value={`${windspeed} km/h`} />
				<StatTile label="Wettercode" value={`${weathercode}`} />
			</Content>

			{forecast && forecast.length > 0 && (
				<Content
					style={{
						marginTop: "1.5rem",
						display: "flex",
						flexDirection: "column",
						gap: "0.75rem",
					}}
				>
					<Heading level={3}>7-Tage-Vorschau</Heading>
					<CartesianChart
						height="260px"
						data={forecast.map((day) => ({
							label: formatDate(day.date),
							max: day.maxTemp,
							min: day.minTemp,
						}))}
					>
						<CartesianGrid />
						<XAxis dataKey="label" />
						<YAxis domain={chartDomain} />
						<ChartLegend />
						<Line
							dataKey="max"
							color="sea-green"
							type="monotone"
						/>
						<Line
							dataKey="min"
							color="sea-blue"
							type="monotone"
						/>
					</CartesianChart>
					{forecastSummary && (
						<Content
							style={{
								display: "grid",
								gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
								gap: "0.75rem",
							}}
						>
							<StatTile
								label={`Höchster Wert (${formatDate(forecastSummary.maxDay.date)})`}
								value={`${forecastSummary.maxDay.maxTemp}°C`}
								emphasize
							/>
							<StatTile
								label={`Niedrigster Wert (${formatDate(forecastSummary.minDay.date)})`}
								value={`${forecastSummary.minDay.minTemp}°C`}
							/>
						</Content>
					)}
				</Content>
			)}
		</LayoutCard>
	);
}


