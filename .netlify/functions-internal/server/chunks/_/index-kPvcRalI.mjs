import { jsxDEV } from 'react/jsx-dev-runtime';
import { Content, Heading, Text, TextField, Button, SegmentedControl, Segment, LayoutCard, AlertBadge, CartesianChart, CartesianGrid, XAxis, YAxis, ChartLegend, Line } from '@mittwald/flow-remote-react-components';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useState, useEffect, useMemo } from 'react';
import { c as cities, a as cityMap, b as cityIds } from './cities-CbyeSF_C.mjs';
import { z } from 'zod';
import { v as verifyAccessToInstance, c as createServerRpc } from './verify-access-to-instance-B19RDFwj.mjs';
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
import '@tanstack/react-router';
import 'react/jsx-runtime';
import '@tanstack/react-query-devtools';
import '@weissaufschwarz/mitthooks/index';
import '@prisma/client';
import 'prisma-field-encryption';
import 'envalid';
import 'node:async_hooks';
import '@tanstack/react-router/ssr/server';

const requestSchema$1 = z.object({
  cityId: z.enum(cityIds)
});
const weatherResponseSchema$1 = z.object({
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
  } = requestSchema$1.parse(data);
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
  const weather = weatherResponseSchema$1.parse(rawWeather);
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
const forecastDateFormatter = new Intl.DateTimeFormat("de-DE", {
  weekday: "short",
  day: "2-digit",
  month: "2-digit"
});
function formatDate(dateString) {
  const date = new Date(dateString);
  return forecastDateFormatter.format(date);
}
function summarizeForecast(forecast) {
  if (!forecast.length) {
    return null;
  }
  return forecast.reduce(
    (acc, day) => ({
      maxDay: day.maxTemp > acc.maxDay.maxTemp ? day : acc.maxDay,
      minDay: day.minTemp < acc.minDay.minTemp ? day : acc.minDay
    }),
    { maxDay: forecast[0], minDay: forecast[0] }
  );
}
function StatTile({
  label,
  value,
  emphasize = false
}) {
  return /* @__PURE__ */ jsxDEV(
    Content,
    {
      style: {
        background: "var(--flow-color-surface-strong)",
        borderRadius: "0.875rem",
        padding: "1rem"
      },
      children: [
        /* @__PURE__ */ jsxDEV(Heading, { level: emphasize ? 1 : 2, style: { margin: 0 }, children: value }, void 0, false, {
          fileName: "/Users/mbehring/Documents/Cursor/mittvibes/weatherapp/src/components/WeatherCard.tsx",
          lineNumber: 83,
          columnNumber: 4
        }, this),
        /* @__PURE__ */ jsxDEV(Text, { children: label }, void 0, false, {
          fileName: "/Users/mbehring/Documents/Cursor/mittvibes/weatherapp/src/components/WeatherCard.tsx",
          lineNumber: 86,
          columnNumber: 4
        }, this)
      ]
    },
    void 0,
    true,
    {
      fileName: "/Users/mbehring/Documents/Cursor/mittvibes/weatherapp/src/components/WeatherCard.tsx",
      lineNumber: 76,
      columnNumber: 3
    },
    this
  );
}
function WeatherCard({
  title,
  subtitle,
  timestamp,
  description,
  temperature,
  windspeed,
  weathercode,
  funMessage,
  forecast
}) {
  const forecastSummary = forecast ? summarizeForecast(forecast) : null;
  const chartDomain = forecast ? (() => {
    const allTemps = forecast.flatMap((day) => [day.maxTemp, day.minTemp]);
    const minTemp = Math.min(...allTemps);
    const maxTemp = Math.max(...allTemps);
    const range = maxTemp - minTemp;
    const padding = range * 0.1;
    const roundedMin = Math.floor(minTemp - padding);
    const roundedMax = Math.ceil(maxTemp + padding);
    return [roundedMin, roundedMax];
  })() : void 0;
  return /* @__PURE__ */ jsxDEV(
    LayoutCard,
    {
      style: {
        padding: "1.5rem",
        borderRadius: "1rem"
      },
      children: [
        /* @__PURE__ */ jsxDEV(
          Content,
          {
            style: {
              display: "flex",
              flexDirection: "column",
              gap: "0.25rem"
            },
            children: [
              /* @__PURE__ */ jsxDEV(Heading, { level: 2, children: title }, void 0, false, {
                fileName: "/Users/mbehring/Documents/Cursor/mittvibes/weatherapp/src/components/WeatherCard.tsx",
                lineNumber: 135,
                columnNumber: 5
              }, this),
              subtitle && /* @__PURE__ */ jsxDEV(Text, { children: subtitle }, void 0, false, {
                fileName: "/Users/mbehring/Documents/Cursor/mittvibes/weatherapp/src/components/WeatherCard.tsx",
                lineNumber: 136,
                columnNumber: 18
              }, this),
              /* @__PURE__ */ jsxDEV(Text, { children: [
                "Stand: ",
                timestamp
              ] }, void 0, true, {
                fileName: "/Users/mbehring/Documents/Cursor/mittvibes/weatherapp/src/components/WeatherCard.tsx",
                lineNumber: 137,
                columnNumber: 5
              }, this),
              /* @__PURE__ */ jsxDEV(AlertBadge, { children: description }, void 0, false, {
                fileName: "/Users/mbehring/Documents/Cursor/mittvibes/weatherapp/src/components/WeatherCard.tsx",
                lineNumber: 138,
                columnNumber: 5
              }, this),
              /* @__PURE__ */ jsxDEV(Text, { style: { fontStyle: "italic" }, children: funMessage }, void 0, false, {
                fileName: "/Users/mbehring/Documents/Cursor/mittvibes/weatherapp/src/components/WeatherCard.tsx",
                lineNumber: 139,
                columnNumber: 5
              }, this)
            ]
          },
          void 0,
          true,
          {
            fileName: "/Users/mbehring/Documents/Cursor/mittvibes/weatherapp/src/components/WeatherCard.tsx",
            lineNumber: 128,
            columnNumber: 4
          },
          this
        ),
        /* @__PURE__ */ jsxDEV(
          Content,
          {
            style: {
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "1rem",
              marginTop: "1.25rem"
            },
            children: [
              /* @__PURE__ */ jsxDEV(StatTile, { label: "Temperatur", value: `${temperature}\xB0C`, emphasize: true }, void 0, false, {
                fileName: "/Users/mbehring/Documents/Cursor/mittvibes/weatherapp/src/components/WeatherCard.tsx",
                lineNumber: 150,
                columnNumber: 5
              }, this),
              /* @__PURE__ */ jsxDEV(StatTile, { label: "Windgeschwindigkeit", value: `${windspeed} km/h` }, void 0, false, {
                fileName: "/Users/mbehring/Documents/Cursor/mittvibes/weatherapp/src/components/WeatherCard.tsx",
                lineNumber: 151,
                columnNumber: 5
              }, this),
              /* @__PURE__ */ jsxDEV(StatTile, { label: "Wettercode", value: `${weathercode}` }, void 0, false, {
                fileName: "/Users/mbehring/Documents/Cursor/mittvibes/weatherapp/src/components/WeatherCard.tsx",
                lineNumber: 152,
                columnNumber: 5
              }, this)
            ]
          },
          void 0,
          true,
          {
            fileName: "/Users/mbehring/Documents/Cursor/mittvibes/weatherapp/src/components/WeatherCard.tsx",
            lineNumber: 142,
            columnNumber: 4
          },
          this
        ),
        forecast && forecast.length > 0 && /* @__PURE__ */ jsxDEV(
          Content,
          {
            style: {
              marginTop: "1.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem"
            },
            children: [
              /* @__PURE__ */ jsxDEV(Heading, { level: 3, children: "7-Tage-Vorschau" }, void 0, false, {
                fileName: "/Users/mbehring/Documents/Cursor/mittvibes/weatherapp/src/components/WeatherCard.tsx",
                lineNumber: 164,
                columnNumber: 6
              }, this),
              /* @__PURE__ */ jsxDEV(
                CartesianChart,
                {
                  height: "260px",
                  data: forecast.map((day) => ({
                    label: formatDate(day.date),
                    max: day.maxTemp,
                    min: day.minTemp
                  })),
                  children: [
                    /* @__PURE__ */ jsxDEV(CartesianGrid, {}, void 0, false, {
                      fileName: "/Users/mbehring/Documents/Cursor/mittvibes/weatherapp/src/components/WeatherCard.tsx",
                      lineNumber: 173,
                      columnNumber: 7
                    }, this),
                    /* @__PURE__ */ jsxDEV(XAxis, { dataKey: "label" }, void 0, false, {
                      fileName: "/Users/mbehring/Documents/Cursor/mittvibes/weatherapp/src/components/WeatherCard.tsx",
                      lineNumber: 174,
                      columnNumber: 7
                    }, this),
                    /* @__PURE__ */ jsxDEV(YAxis, { domain: chartDomain }, void 0, false, {
                      fileName: "/Users/mbehring/Documents/Cursor/mittvibes/weatherapp/src/components/WeatherCard.tsx",
                      lineNumber: 175,
                      columnNumber: 7
                    }, this),
                    /* @__PURE__ */ jsxDEV(ChartLegend, {}, void 0, false, {
                      fileName: "/Users/mbehring/Documents/Cursor/mittvibes/weatherapp/src/components/WeatherCard.tsx",
                      lineNumber: 176,
                      columnNumber: 7
                    }, this),
                    /* @__PURE__ */ jsxDEV(
                      Line,
                      {
                        dataKey: "max",
                        color: "sea-green",
                        type: "monotone"
                      },
                      void 0,
                      false,
                      {
                        fileName: "/Users/mbehring/Documents/Cursor/mittvibes/weatherapp/src/components/WeatherCard.tsx",
                        lineNumber: 177,
                        columnNumber: 7
                      },
                      this
                    ),
                    /* @__PURE__ */ jsxDEV(
                      Line,
                      {
                        dataKey: "min",
                        color: "sea-blue",
                        type: "monotone"
                      },
                      void 0,
                      false,
                      {
                        fileName: "/Users/mbehring/Documents/Cursor/mittvibes/weatherapp/src/components/WeatherCard.tsx",
                        lineNumber: 182,
                        columnNumber: 7
                      },
                      this
                    )
                  ]
                },
                void 0,
                true,
                {
                  fileName: "/Users/mbehring/Documents/Cursor/mittvibes/weatherapp/src/components/WeatherCard.tsx",
                  lineNumber: 165,
                  columnNumber: 6
                },
                this
              ),
              forecastSummary && /* @__PURE__ */ jsxDEV(
                Content,
                {
                  style: {
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                    gap: "0.75rem"
                  },
                  children: [
                    /* @__PURE__ */ jsxDEV(
                      StatTile,
                      {
                        label: `H\xF6chster Wert (${formatDate(forecastSummary.maxDay.date)})`,
                        value: `${forecastSummary.maxDay.maxTemp}\xB0C`,
                        emphasize: true
                      },
                      void 0,
                      false,
                      {
                        fileName: "/Users/mbehring/Documents/Cursor/mittvibes/weatherapp/src/components/WeatherCard.tsx",
                        lineNumber: 196,
                        columnNumber: 8
                      },
                      this
                    ),
                    /* @__PURE__ */ jsxDEV(
                      StatTile,
                      {
                        label: `Niedrigster Wert (${formatDate(forecastSummary.minDay.date)})`,
                        value: `${forecastSummary.minDay.minTemp}\xB0C`
                      },
                      void 0,
                      false,
                      {
                        fileName: "/Users/mbehring/Documents/Cursor/mittvibes/weatherapp/src/components/WeatherCard.tsx",
                        lineNumber: 201,
                        columnNumber: 8
                      },
                      this
                    )
                  ]
                },
                void 0,
                true,
                {
                  fileName: "/Users/mbehring/Documents/Cursor/mittvibes/weatherapp/src/components/WeatherCard.tsx",
                  lineNumber: 189,
                  columnNumber: 7
                },
                this
              )
            ]
          },
          void 0,
          true,
          {
            fileName: "/Users/mbehring/Documents/Cursor/mittvibes/weatherapp/src/components/WeatherCard.tsx",
            lineNumber: 156,
            columnNumber: 5
          },
          this
        )
      ]
    },
    void 0,
    true,
    {
      fileName: "/Users/mbehring/Documents/Cursor/mittvibes/weatherapp/src/components/WeatherCard.tsx",
      lineNumber: 122,
      columnNumber: 3
    },
    this
  );
}
const weatherCodeDescriptions = {
  0: "Klarer Himmel",
  1: "\xDCberwiegend klar",
  2: "Teilweise bew\xF6lkt",
  3: "Bew\xF6lkt",
  45: "Nebel",
  48: "Raureif-Nebel",
  51: "Leichter Niesel",
  53: "M\xE4\xDFiger Niesel",
  55: "Starker Niesel",
  61: "Leichter Regen",
  63: "M\xE4\xDFiger Regen",
  65: "Starker Regen",
  71: "Leichter Schneefall",
  73: "M\xE4\xDFiger Schneefall",
  75: "Starker Schneefall",
  95: "Gewitter",
  96: "Gewitter mit Hagel",
  99: "Heftiges Gewitter mit Hagel"
};
function RouteComponent() {
  var _a2, _b;
  var _a;
  const initialCityId = (_a2 = (_a = cities[0]) == null ? void 0 : _a.id) != null ? _a2 : "";
  const [selectedCityId, setSelectedCityId] = useState(initialCityId);
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
    refetch
  } = useQuery({
    queryKey: ["weather", selectedCityId],
    queryFn: () => getWeather({
      data: {
        cityId: selectedCityId
      }
    }),
    enabled: isClient && Boolean(selectedCityId)
  });
  const customWeatherMutation = useMutation({
    mutationFn: (address) => getWeatherByAddress({
      data: {
        address
      }
    })
  });
  const [activeWeatherSource, setActiveWeatherSource] = useState("city");
  const formattedTimestamp = useMemo(() => {
    if (!weatherData) {
      return "";
    }
    const timestamp = new Date(weatherData.weather.time);
    return new Intl.DateTimeFormat("de-DE", {
      dateStyle: "medium",
      timeStyle: "short"
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
  const handleSegmentChange = (valueOrEvent) => {
    var _a22, _b2;
    if (!valueOrEvent) {
      return;
    }
    if (typeof valueOrEvent === "string") {
      setSelectedCityId(valueOrEvent);
      setActiveWeatherSource("city");
      return;
    }
    const detailValue = typeof valueOrEvent.detail === "object" ? (_a22 = valueOrEvent.detail) == null ? void 0 : _a22.value : void 0;
    const targetValue = (_b2 = valueOrEvent.target) == null ? void 0 : _b2.value;
    const resolvedValue = detailValue != null ? detailValue : targetValue;
    if (resolvedValue) {
      setSelectedCityId(resolvedValue);
      setActiveWeatherSource("city");
    }
  };
  return /* @__PURE__ */ jsxDEV(Content, { children: [
    /* @__PURE__ */ jsxDEV(Heading, { children: "Aktuelle Wetter\xFCbersicht" }, void 0, false, {
      fileName: "/Users/mbehring/Documents/Cursor/mittvibes/weatherapp/src/routes/index.tsx?tsr-split=component",
      lineNumber: 109,
      columnNumber: 4
    }, this),
    /* @__PURE__ */ jsxDEV(Text, { children: "W\xE4hle eine Stadt aus, um die aktuellen Wetterdaten zu laden." }, void 0, false, {
      fileName: "/Users/mbehring/Documents/Cursor/mittvibes/weatherapp/src/routes/index.tsx?tsr-split=component",
      lineNumber: 110,
      columnNumber: 4
    }, this),
    /* @__PURE__ */ jsxDEV(Content, { children: [
      /* @__PURE__ */ jsxDEV(Heading, { level: 3, children: "Deine lokale Adresse" }, void 0, false, {
        fileName: "/Users/mbehring/Documents/Cursor/mittvibes/weatherapp/src/routes/index.tsx?tsr-split=component",
        lineNumber: 112,
        columnNumber: 5
      }, this),
      /* @__PURE__ */ jsxDEV(Text, { children: "Erg\xE4nze deine Adresse, falls du das Wetter f\xFCr einen anderen Ort im Blick behalten m\xF6chtest." }, void 0, false, {
        fileName: "/Users/mbehring/Documents/Cursor/mittvibes/weatherapp/src/routes/index.tsx?tsr-split=component",
        lineNumber: 113,
        columnNumber: 5
      }, this),
      /* @__PURE__ */ jsxDEV(Text, { children: "Adresse" }, void 0, false, {
        fileName: "/Users/mbehring/Documents/Cursor/mittvibes/weatherapp/src/routes/index.tsx?tsr-split=component",
        lineNumber: 117,
        columnNumber: 5
      }, this),
      /* @__PURE__ */ jsxDEV(TextField, { placeholder: "z. B. Musterstra\xDFe 12, 12345 Musterstadt", value: customAddress, onChange: (e) => {
        var _a3, _b3;
        var _a22, _b2;
        const value = typeof e === "string" ? e : (_b3 = (_a3 = (_a22 = e == null ? void 0 : e.target) == null ? void 0 : _a22.value) != null ? _a3 : (_b2 = e == null ? void 0 : e.detail) == null ? void 0 : _b2.value) != null ? _b3 : "";
        setCustomAddress(String(value || ""));
      } }, void 0, false, {
        fileName: "/Users/mbehring/Documents/Cursor/mittvibes/weatherapp/src/routes/index.tsx?tsr-split=component",
        lineNumber: 118,
        columnNumber: 5
      }, this),
      /* @__PURE__ */ jsxDEV(Button, { onPress: handleAddressSubmit, isDisabled: !customAddress.trim() || customWeatherMutation.isPending, children: customWeatherMutation.isPending ? "Adresse wird geladen \u2026" : "Wetter f\xFCr Adresse laden" }, void 0, false, {
        fileName: "/Users/mbehring/Documents/Cursor/mittvibes/weatherapp/src/routes/index.tsx?tsr-split=component",
        lineNumber: 122,
        columnNumber: 5
      }, this),
      /* @__PURE__ */ jsxDEV(Text, { children: customAddress ? `Eingegebene Adresse: ${customAddress}` : "Noch keine Adresse eingetragen." }, void 0, false, {
        fileName: "/Users/mbehring/Documents/Cursor/mittvibes/weatherapp/src/routes/index.tsx?tsr-split=component",
        lineNumber: 125,
        columnNumber: 5
      }, this),
      customWeatherMutation.error && /* @__PURE__ */ jsxDEV(Text, { children: [
        "Fehler:",
        " ",
        customWeatherMutation.error instanceof Error ? customWeatherMutation.error.message : "Unbekannter Fehler"
      ] }, void 0, true, {
        fileName: "/Users/mbehring/Documents/Cursor/mittvibes/weatherapp/src/routes/index.tsx?tsr-split=component",
        lineNumber: 128,
        columnNumber: 37
      }, this)
    ] }, void 0, true, {
      fileName: "/Users/mbehring/Documents/Cursor/mittvibes/weatherapp/src/routes/index.tsx?tsr-split=component",
      lineNumber: 111,
      columnNumber: 4
    }, this),
    /* @__PURE__ */ jsxDEV(Content, { children: [
      /* @__PURE__ */ jsxDEV(Heading, { level: 3, children: "Schnellauswahl" }, void 0, false, {
        fileName: "/Users/mbehring/Documents/Cursor/mittvibes/weatherapp/src/routes/index.tsx?tsr-split=component",
        lineNumber: 135,
        columnNumber: 5
      }, this),
      /* @__PURE__ */ jsxDEV(Text, { children: "Tippe auf eine Stadt, um sofort neue Messwerte zu laden." }, void 0, false, {
        fileName: "/Users/mbehring/Documents/Cursor/mittvibes/weatherapp/src/routes/index.tsx?tsr-split=component",
        lineNumber: 136,
        columnNumber: 5
      }, this),
      /* @__PURE__ */ jsxDEV(SegmentedControl, { "aria-label": "Stadt ausw\xE4hlen", value: selectedCityId, onChange: handleSegmentChange, children: cities.map((city) => /* @__PURE__ */ jsxDEV(Segment, { id: city.id, value: city.id, "aria-pressed": selectedCityId === city.id, onPress: () => {
        setSelectedCityId(city.id);
        setActiveWeatherSource("city");
      }, children: city.name }, city.id, false, {
        fileName: "/Users/mbehring/Documents/Cursor/mittvibes/weatherapp/src/routes/index.tsx?tsr-split=component",
        lineNumber: 138,
        columnNumber: 26
      }, this)) }, void 0, false, {
        fileName: "/Users/mbehring/Documents/Cursor/mittvibes/weatherapp/src/routes/index.tsx?tsr-split=component",
        lineNumber: 137,
        columnNumber: 5
      }, this)
    ] }, void 0, true, {
      fileName: "/Users/mbehring/Documents/Cursor/mittvibes/weatherapp/src/routes/index.tsx?tsr-split=component",
      lineNumber: 134,
      columnNumber: 4
    }, this),
    isLoading && /* @__PURE__ */ jsxDEV(Text, { children: "Wetterdaten werden geladen \u2026" }, void 0, false, {
      fileName: "/Users/mbehring/Documents/Cursor/mittvibes/weatherapp/src/routes/index.tsx?tsr-split=component",
      lineNumber: 147,
      columnNumber: 18
    }, this),
    error && /* @__PURE__ */ jsxDEV(Text, { children: [
      "Fehler: ",
      error instanceof Error ? error.message : "Unbekannter Fehler"
    ] }, void 0, true, {
      fileName: "/Users/mbehring/Documents/Cursor/mittvibes/weatherapp/src/routes/index.tsx?tsr-split=component",
      lineNumber: 149,
      columnNumber: 14
    }, this),
    weatherData && activeWeatherSource === "city" && /* @__PURE__ */ jsxDEV(WeatherCard, { title: weatherData.city.name, timestamp: formattedTimestamp, description: weatherDescription, temperature: weatherData.weather.temperature, windspeed: weatherData.weather.windspeed, weathercode: weatherData.weather.weathercode, funMessage: getFunMessage(weatherData.weather.weathercode, weatherData.weather.temperature), forecast: weatherData.forecast }, void 0, false, {
      fileName: "/Users/mbehring/Documents/Cursor/mittvibes/weatherapp/src/routes/index.tsx?tsr-split=component",
      lineNumber: 153,
      columnNumber: 54
    }, this),
    activeWeatherSource === "custom" && customWeatherMutation.data && /* @__PURE__ */ jsxDEV(WeatherCard, { title: `Adresse: ${customWeatherMutation.data.location.name}`, subtitle: customWeatherMutation.data.location.country, timestamp: new Intl.DateTimeFormat("de-DE", {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(new Date(customWeatherMutation.data.weather.time)), description: (_b = weatherCodeDescriptions[customWeatherMutation.data.weather.weathercode]) != null ? _b : `Wettercode ${customWeatherMutation.data.weather.weathercode}`, temperature: customWeatherMutation.data.weather.temperature, windspeed: customWeatherMutation.data.weather.windspeed, weathercode: customWeatherMutation.data.weather.weathercode, funMessage: getFunMessage(customWeatherMutation.data.weather.weathercode, customWeatherMutation.data.weather.temperature), forecast: customWeatherMutation.data.forecast }, void 0, false, {
      fileName: "/Users/mbehring/Documents/Cursor/mittvibes/weatherapp/src/routes/index.tsx?tsr-split=component",
      lineNumber: 155,
      columnNumber: 71
    }, this),
    /* @__PURE__ */ jsxDEV(Button, { onPress: () => refetch(), children: isFetching ? "Aktualisierung l\xE4uft \u2026" : "Wetter aktualisieren" }, void 0, false, {
      fileName: "/Users/mbehring/Documents/Cursor/mittvibes/weatherapp/src/routes/index.tsx?tsr-split=component",
      lineNumber: 160,
      columnNumber: 4
    }, this)
  ] }, void 0, true, {
    fileName: "/Users/mbehring/Documents/Cursor/mittvibes/weatherapp/src/routes/index.tsx?tsr-split=component",
    lineNumber: 108,
    columnNumber: 10
  }, this);
}
function getFunMessage(weathercode, temperature) {
  if (temperature <= 0) {
    return "Perfektes Wetter, um den K\xFChlschrank drau\xDFen stehen zu lassen.";
  }
  if (temperature >= 25) {
    return "Flip-Flops an, Ventilator an \u2013 dein Laptop schwitzt schon mit.";
  }
  if (weathercode >= 61 && weathercode <= 65) {
    return "Regen? Bonuspunkte, wenn du den Schirm als WLAN-Verst\xE4rker nutzt.";
  }
  if (weathercode === 2) {
    return "Teilweise bew\xF6lkt \u2013 wie dein Deployment, nur ohne Warnungen.";
  }
  return "Mittwald meint: Immer sch\xF6n wetterfest deployen!";
}
function describeWeatherCode(code) {
  var _a;
  return (_a = weatherCodeDescriptions[code]) != null ? _a : `Wettercode ${code}`;
}

export { RouteComponent as component };
//# sourceMappingURL=index-kPvcRalI.mjs.map
