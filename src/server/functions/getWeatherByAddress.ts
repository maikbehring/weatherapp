import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { verifyAccessToInstance } from "~/middlewares/verify-access-to-instance";

const requestSchema = z.object({
	address: z.string().min(3, "Adresse ist zu kurz"),
});

const geocodingResponseSchema = z.object({
	results: z
		.array(
			z.object({
				name: z.string(),
				country: z.string().optional(),
				admin1: z.string().optional(),
				latitude: z.number(),
				longitude: z.number(),
			}),
		)
		.optional(),
});

const weatherResponseSchema = z.object({
	current_weather: z.object({
		temperature: z.number(),
		windspeed: z.number(),
		weathercode: z.number(),
		time: z.string(),
	}),
	daily: z
		.object({
			time: z.array(z.string()),
			temperature_2m_max: z.array(z.number()),
			temperature_2m_min: z.array(z.number()),
			weathercode: z.array(z.number()),
		})
		.optional(),
});

export const getWeatherByAddress = createServerFn({ method: "POST" })
	.middleware([verifyAccessToInstance])
	.handler(async ({ data }) => {
		const { address } = requestSchema.parse(data);

		const geocodeUrl = new URL("https://geocoding-api.open-meteo.com/v1/search");
		geocodeUrl.searchParams.set("name", address);
		geocodeUrl.searchParams.set("count", "1");
		geocodeUrl.searchParams.set("language", "de");
		geocodeUrl.searchParams.set("format", "json");

		const geocodeResponse = await fetch(geocodeUrl);

		if (!geocodeResponse.ok) {
			throw new Error("Adresse konnte nicht ermittelt werden");
		}

		const geocode = geocodingResponseSchema.parse(await geocodeResponse.json());

		if (!geocode.results?.length) {
			throw new Error("Keine Treffer für diese Adresse gefunden");
		}

		const location = geocode.results[0];

		const weatherUrl = new URL("https://api.open-meteo.com/v1/forecast");
		weatherUrl.searchParams.set("latitude", location.latitude.toString());
		weatherUrl.searchParams.set("longitude", location.longitude.toString());
		weatherUrl.searchParams.set("current_weather", "true");
		weatherUrl.searchParams.set(
			"daily",
			"weathercode,temperature_2m_max,temperature_2m_min",
		);
		weatherUrl.searchParams.set("forecast_days", "7");
		weatherUrl.searchParams.set("timezone", "auto");

		const weatherResponse = await fetch(weatherUrl);

		if (!weatherResponse.ok) {
			throw new Error("Wetterdaten konnten nicht geladen werden");
		}

		const weather = weatherResponseSchema.parse(await weatherResponse.json());

		const forecast =
			weather.daily?.time.map((date, index) => ({
				date,
				weathercode: weather.daily?.weathercode[index] ?? 0,
				maxTemp: weather.daily?.temperature_2m_max[index] ?? 0,
				minTemp: weather.daily?.temperature_2m_min[index] ?? 0,
			})) ?? [];

		return {
			location: {
				name: location.name,
				country: location.country ?? location.admin1 ?? "",
				latitude: location.latitude,
				longitude: location.longitude,
			},
			weather: weather.current_weather,
			forecast,
		};
	});


