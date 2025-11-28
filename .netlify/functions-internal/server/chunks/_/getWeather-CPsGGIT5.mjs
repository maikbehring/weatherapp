import { z } from 'zod';
import { c as createServerRpc, v as verifyAccessToInstance } from './verify-access-to-instance-B19RDFwj.mjs';
import { a as cityMap, b as cityIds } from './cities-CbyeSF_C.mjs';
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
  cityId: z.enum(cityIds)
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
const getWeather_createServerFn_handler = createServerRpc("src_server_api_getWeather_ts--getWeather_createServerFn_handler", "/_serverFn", (opts, signal) => {
  return getWeather.__executeServer(opts, signal);
});
const getWeather = createServerFn({
  method: "POST"
}).middleware([verifyAccessToInstance]).handler(getWeather_createServerFn_handler, async ({
  data
}) => {
  var _a2;
  var _a;
  const {
    cityId
  } = requestSchema.parse(data);
  const city = cityMap[cityId];
  if (!city) {
    throw new Error("Unbekannte Stadt");
  }
  const weatherUrl = new URL("https://api.open-meteo.com/v1/forecast");
  weatherUrl.searchParams.set("latitude", city.latitude.toString());
  weatherUrl.searchParams.set("longitude", city.longitude.toString());
  weatherUrl.searchParams.set("current_weather", "true");
  weatherUrl.searchParams.set("daily", "weathercode,temperature_2m_max,temperature_2m_min");
  weatherUrl.searchParams.set("forecast_days", "7");
  weatherUrl.searchParams.set("timezone", "auto");
  const response = await fetch(weatherUrl);
  if (!response.ok) {
    throw new Error("Fehler beim Abrufen der Wetterdaten");
  }
  const rawWeather = await response.json();
  const weather = weatherResponseSchema.parse(rawWeather);
  const forecast = (_a2 = (_a = weather.daily) == null ? void 0 : _a.time.map((date, index) => {
    var _a3, _b2, _c2;
    var _a22, _b, _c;
    return {
      date,
      weathercode: (_a3 = (_a22 = weather.daily) == null ? void 0 : _a22.weathercode[index]) != null ? _a3 : 0,
      maxTemp: (_b2 = (_b = weather.daily) == null ? void 0 : _b.temperature_2m_max[index]) != null ? _b2 : 0,
      minTemp: (_c2 = (_c = weather.daily) == null ? void 0 : _c.temperature_2m_min[index]) != null ? _c2 : 0
    };
  })) != null ? _a2 : [];
  return {
    city: {
      id: city.id,
      name: city.name
    },
    weather: weather.current_weather,
    forecast
  };
});

export { getWeather_createServerFn_handler };
//# sourceMappingURL=getWeather-CPsGGIT5.mjs.map
