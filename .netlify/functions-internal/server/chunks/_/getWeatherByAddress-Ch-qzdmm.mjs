import { z } from 'zod';
import { c as createServerRpc, v as verifyAccessToInstance } from './verify-access-to-instance-B19RDFwj.mjs';
import { c as createServerFn } from './ssr.mjs';
import 'util';
import 'stream';
import 'path';
import 'http';
import 'https';
import 'url';
import 'fs';
import 'crypto';
import 'assert';
import 'tty';
import 'os';
import 'zlib';
import 'events';
import 'react/jsx-dev-runtime';
import '@tanstack/react-query';
import '@tanstack/react-router';
import 'react/jsx-runtime';
import 'react';
import '@mittwald/flow-remote-react-components';
import '@tanstack/react-query-devtools';
import '@weissaufschwarz/mitthooks/index';
import '@prisma/client';
import 'prisma-field-encryption';
import 'envalid';
import 'node:async_hooks';
import '@tanstack/react-router/ssr/server';

const requestSchema = z.object({
  address: z.string().min(3, "Adresse ist zu kurz")
});
const geocodingResponseSchema = z.object({
  results: z.array(z.object({
    name: z.string(),
    country: z.string().optional(),
    admin1: z.string().optional(),
    latitude: z.number(),
    longitude: z.number()
  })).optional()
});
const weatherResponseSchema = z.object({
  current_weather: z.object({
    temperature: z.number(),
    windspeed: z.number(),
    weathercode: z.number(),
    time: z.string()
  }),
  daily: z.object({
    time: z.array(z.string()),
    temperature_2m_max: z.array(z.number()),
    temperature_2m_min: z.array(z.number()),
    weathercode: z.array(z.number())
  }).optional()
});
const getWeatherByAddress_createServerFn_handler = createServerRpc("src_server_api_getWeatherByAddress_ts--getWeatherByAddress_createServerFn_handler", "/_serverFn", (opts, signal) => {
  return getWeatherByAddress.__executeServer(opts, signal);
});
const getWeatherByAddress = createServerFn({
  method: "POST"
}).middleware([verifyAccessToInstance]).handler(getWeatherByAddress_createServerFn_handler, async ({
  data
}) => {
  var _a2, _b2, _c;
  var _a, _b;
  const {
    address
  } = requestSchema.parse(data);
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
  if (!((_a = geocode.results) == null ? void 0 : _a.length)) {
    throw new Error("Keine Treffer f\xFCr diese Adresse gefunden");
  }
  const location = geocode.results[0];
  const weatherUrl = new URL("https://api.open-meteo.com/v1/forecast");
  weatherUrl.searchParams.set("latitude", location.latitude.toString());
  weatherUrl.searchParams.set("longitude", location.longitude.toString());
  weatherUrl.searchParams.set("current_weather", "true");
  weatherUrl.searchParams.set("daily", "weathercode,temperature_2m_max,temperature_2m_min");
  weatherUrl.searchParams.set("forecast_days", "7");
  weatherUrl.searchParams.set("timezone", "auto");
  const weatherResponse = await fetch(weatherUrl);
  if (!weatherResponse.ok) {
    throw new Error("Wetterdaten konnten nicht geladen werden");
  }
  const weather = weatherResponseSchema.parse(await weatherResponse.json());
  const forecast = (_a2 = (_b = weather.daily) == null ? void 0 : _b.time.map((date, index) => {
    var _a3, _b3, _c3;
    var _a22, _b22, _c2;
    return {
      date,
      weathercode: (_a3 = (_a22 = weather.daily) == null ? void 0 : _a22.weathercode[index]) != null ? _a3 : 0,
      maxTemp: (_b3 = (_b22 = weather.daily) == null ? void 0 : _b22.temperature_2m_max[index]) != null ? _b3 : 0,
      minTemp: (_c3 = (_c2 = weather.daily) == null ? void 0 : _c2.temperature_2m_min[index]) != null ? _c3 : 0
    };
  })) != null ? _a2 : [];
  return {
    location: {
      name: location.name,
      country: (_c = (_b2 = location.country) != null ? _b2 : location.admin1) != null ? _c : "",
      latitude: location.latitude,
      longitude: location.longitude
    },
    weather: weather.current_weather,
    forecast
  };
});

export { getWeatherByAddress_createServerFn_handler };
//# sourceMappingURL=getWeatherByAddress-Ch-qzdmm.mjs.map
