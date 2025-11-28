import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { verifyAccessToInstance } from "~/middlewares/verify-access-to-instance";
import { cityIds, cityMap, type CityId } from "~/constants/cities";

const requestSchema = z.object({
	cityId: z.enum(cityIds),
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

export const getWeather = createServerFn({ method: "POST" })
	.middleware([verifyAccessToInstance])
	.handler(async ({ data }) => {
		const { cityId } = requestSchema.parse(data);
		const city = cityMap[cityId as CityId];

		if (!city) {
			throw new Error("Unbekannte Stadt");
		}

		const weatherUrl = new URL("https://api.open-meteo.com/v1/forecast");
		weatherUrl.searchParams.set("latitude", city.latitude.toString());
		weatherUrl.searchParams.set("longitude", city.longitude.toString());
		weatherUrl.searchParams.set("current_weather", "true");
		weatherUrl.searchParams.set(
			"daily",
			"weathercode,temperature_2m_max,temperature_2m_min",
		);
		weatherUrl.searchParams.set("forecast_days", "7");
		weatherUrl.searchParams.set("timezone", "auto");

		const response = await fetch(weatherUrl);

		if (!response.ok) {
			throw new Error("Fehler beim Abrufen der Wetterdaten");
		}

		const rawWeather = await response.json();
		const weather = weatherResponseSchema.parse(rawWeather);

		const forecast =
			weather.daily?.time.map((date, index) => ({
				date,
				weathercode: weather.daily?.weathercode[index] ?? 0,
				maxTemp: weather.daily?.temperature_2m_max[index] ?? 0,
				minTemp: weather.daily?.temperature_2m_min[index] ?? 0,
			})) ?? [];

		return {
			city: {
				id: city.id,
				name: city.name,
			},
			weather: weather.current_weather,
			forecast,
		};
	});


